import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const SKIP_ORG_CHECK_KEY = 'skipOrgCheck';

/**
 * Guard IDOR: vérifie que l'utilisateur accède uniquement aux ressources de sa propre organisation.
 * Les super-admins sont exemptés. Appliquer avec @UseGuards(OrganisationGuard).
 */
@Injectable()
export class OrganisationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_ORG_CHECK_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skip) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    // L'org dans le token doit correspondre à celle demandée dans les params/query/body
    const orgIdFromToken: string | undefined = user.organisationId;
    if (!orgIdFromToken) {
      throw new ForbiddenException('Organisation non définie dans le token');
    }

    // Vérifie dans params, query et body
    const requestedOrgId: string | undefined =
      req.params?.organisationId ??
      req.params?.orgId ??
      req.query?.organisationId ??
      req.body?.organisationId;

    if (requestedOrgId && requestedOrgId !== orgIdFromToken) {
      throw new ForbiddenException('Accès refusé à cette organisation');
    }

    return true;
  }
}
