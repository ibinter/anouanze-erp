import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';

const METHOD_ACTION_MAP: Record<string, string> = {
  POST: 'CREATE',
  PATCH: 'UPDATE',
  PUT: 'UPDATE',
  DELETE: 'DELETE',
};

function ressourceFromUrl(url: string): string {
  const parts = url.replace(/^\/api\/v1\//, '').split('/').filter(Boolean);
  return parts[0] ?? 'unknown';
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method: string = req.method as string;
    const action = METHOD_ACTION_MAP[method];

    if (!action) return next.handle();

    const ressource = ressourceFromUrl(req.url as string);
    const utilisateurId: string | undefined = req.user?.id;
    const organisationId: string | undefined = req.user?.organisationId;
    const ipAdresse: string | undefined =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip;
    const userAgent: string | undefined = req.headers['user-agent'] as string;

    return next.handle().pipe(
      tap(() => {
        this.auditService
          .log({
            organisationId,
            utilisateurId,
            action,
            ressource,
            ipAdresse,
            userAgent,
          })
          .catch(() => undefined);
      }),
    );
  }
}
