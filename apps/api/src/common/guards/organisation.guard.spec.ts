/**
 * ============================================================================
 * TESTS DE SÉCURITÉ MULTI-TENANT — OrganisationGuard (IDOR, section 42)
 * ----------------------------------------------------------------------------
 * Exigence : un utilisateur de l'organisation A ne doit JAMAIS accéder aux
 * données de l'organisation B, quel que soit l'endroit où l'identifiant
 * d'organisation est passé (params, query ou body).
 * ============================================================================
 */
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganisationGuard, SKIP_ORG_CHECK_KEY } from './organisation.guard';

const ORG_A = 'org-aaaa-1111';
const ORG_B = 'org-bbbb-2222';

interface FakeRequest {
  user?: { organisationId?: string; role?: string } | null;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
}

function makeCtx(req: FakeRequest): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
  } as unknown as ExecutionContext;
}

/** Reflector renvoyant toujours la même valeur pour SKIP_ORG_CHECK_KEY. */
function makeReflector(skip: boolean | undefined = undefined): Reflector {
  return {
    getAllAndOverride: (key: string) => (key === SKIP_ORG_CHECK_KEY ? skip : undefined),
  } as unknown as Reflector;
}

describe('OrganisationGuard — cloisonnement multi-tenant', () => {
  let guard: OrganisationGuard;

  beforeEach(() => {
    guard = new OrganisationGuard(makeReflector());
  });

  describe('accès refusé à une autre organisation (IDOR)', () => {
    it('refuse un organisationId différent dans les params', () => {
      const ctx = makeCtx({
        user: { organisationId: ORG_A, role: 'ADMIN' },
        params: { organisationId: ORG_B },
      });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow('Accès refusé à cette organisation');
    });

    it('refuse un orgId différent dans les params (alias court)', () => {
      const ctx = makeCtx({ user: { organisationId: ORG_A }, params: { orgId: ORG_B } });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('refuse un organisationId différent dans la query', () => {
      const ctx = makeCtx({ user: { organisationId: ORG_A }, query: { organisationId: ORG_B } });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('refuse un organisationId différent dans le body', () => {
      const ctx = makeCtx({ user: { organisationId: ORG_A }, body: { organisationId: ORG_B } });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('refuse même pour un rôle privilégié non SUPER_ADMIN', () => {
      for (const role of ['ADMIN', 'DIRECTEUR', 'COMPTABLE', 'TRESORIER', 'admin']) {
        const ctx = makeCtx({
          user: { organisationId: ORG_A, role },
          params: { organisationId: ORG_B },
        });
        expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      }
    });

    it('la casse compte : un identifiant d’org en majuscules est un autre tenant', () => {
      const ctx = makeCtx({
        user: { organisationId: ORG_A },
        params: { organisationId: ORG_A.toUpperCase() },
      });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('les params priment : un body « propre » ne blanchit pas un param étranger', () => {
      const ctx = makeCtx({
        user: { organisationId: ORG_A },
        params: { organisationId: ORG_B },
        body: { organisationId: ORG_A },
      });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  describe('accès autorisé à sa propre organisation', () => {
    it('autorise le même organisationId en params / query / body', () => {
      expect(guard.canActivate(makeCtx({ user: { organisationId: ORG_A }, params: { organisationId: ORG_A } }))).toBe(true);
      expect(guard.canActivate(makeCtx({ user: { organisationId: ORG_A }, query: { organisationId: ORG_A } }))).toBe(true);
      expect(guard.canActivate(makeCtx({ user: { organisationId: ORG_A }, body: { organisationId: ORG_A } }))).toBe(true);
    });

    it('autorise une requête sans organisationId explicite (filtrage côté service)', () => {
      expect(guard.canActivate(makeCtx({ user: { organisationId: ORG_A } }))).toBe(true);
      expect(guard.canActivate(makeCtx({ user: { organisationId: ORG_A }, params: { id: 'membre-1' } }))).toBe(true);
    });
  });

  describe('super-admin', () => {
    it('un SUPER_ADMIN accède à n’importe quelle organisation', () => {
      const ctx = makeCtx({
        user: { organisationId: ORG_A, role: 'SUPER_ADMIN' },
        params: { organisationId: ORG_B },
      });
      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('un SUPER_ADMIN sans organisationId passe quand même', () => {
      const ctx = makeCtx({ user: { role: 'SUPER_ADMIN' }, params: { organisationId: ORG_B } });
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('utilisateur absent ou token incomplet', () => {
    it('refuse une requête non authentifiée (aucun user)', () => {
      expect(guard.canActivate(makeCtx({}))).toBe(false);
      expect(guard.canActivate(makeCtx({ user: null }))).toBe(false);
    });

    it('refuse un token sans organisationId', () => {
      const ctx = makeCtx({ user: { role: 'ADMIN' }, params: { organisationId: ORG_B } });
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(ctx)).toThrow('Organisation non définie dans le token');
    });

    it('refuse un token dont l’organisationId est vide', () => {
      const ctx = makeCtx({ user: { organisationId: '' }, params: { organisationId: ORG_A } });
      expect(() => guard.canActivate(ctx)).toThrow('Organisation non définie dans le token');
    });
  });

  describe('@SkipOrgCheck (routes publiques / transverses)', () => {
    it('laisse passer sans aucune vérification quand le flag est posé', () => {
      const ouvert = new OrganisationGuard(makeReflector(true));
      const ctx = makeCtx({ user: { organisationId: ORG_A }, params: { organisationId: ORG_B } });
      expect(ouvert.canActivate(ctx)).toBe(true);
    });

    it('la clé de métadonnée est stable (utilisée par le décorateur)', () => {
      expect(SKIP_ORG_CHECK_KEY).toBe('skipOrgCheck');
    });
  });
});
