import { RoleUtilisateur } from '@prisma/client';

/**
 * MATRICE RÔLE × PERMISSIONS — SOURCE DE VÉRITÉ
 *
 * Ce fichier ne décrit PAS ce que les rôles « devraient » pouvoir faire :
 * il reflète exactement ce que l'API applique aujourd'hui.
 *
 * Deux mécanismes existent dans le code :
 *  1. `JwtAuthGuard` (apps/api/src/modules/auth/guards/jwt-auth.guard.ts)
 *     — posé sur TOUS les contrôleurs métier. Il exige un jeton valide,
 *       sans distinction de rôle.
 *  2. `RolesGuard` + `@Roles(...)`
 *     (apps/api/src/common/guards/roles.guard.ts,
 *      apps/api/src/common/decorators/roles.decorator.ts)
 *     — restriction réelle par rôle. À ce jour il n'est déclaré que sur les
 *       routes d'administration des membres de l'organisation
 *       (utilisateurs.controller.ts).
 *
 * Toute règle listée ici avec `applique: false` est donc une zone où l'API
 * n'impose aucune restriction de rôle : la donnée reste cloisonnée par
 * organisation (organisationId du jeton) mais tout membre authentifié y accède.
 * Ne pas afficher ces lignes comme des restrictions actives côté interface.
 */

export interface RegleMatrice {
  domaine: string;
  action: string;
  /** Chemin réel exposé par le contrôleur */
  endpoint: string;
  /** null => aucun rôle exigé (tout membre authentifié de l'organisation) */
  rolesAutorises: RoleUtilisateur[] | null;
  /** true => une restriction @Roles est réellement déclarée dans le code */
  applique: boolean;
  source: string;
}

export const ROLES_ADMINISTRATION: RoleUtilisateur[] = [
  RoleUtilisateur.SUPER_ADMIN,
  RoleUtilisateur.ADMIN_ORGANISATION,
];

/** Libellés d'affichage — purement nominatifs, aucun droit implicite. */
export const LIBELLES_ROLES: Record<RoleUtilisateur, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN_ORGANISATION: "Administrateur de l'organisation",
  DIRECTEUR: 'Directeur',
  COMPTABLE: 'Comptable',
  GESTIONNAIRE_PROJET: 'Gestionnaire de projet',
  CHARGE_RH: 'Chargé RH',
  AUDITEUR: 'Auditeur',
  MEMBRE: 'Membre',
  DONATEUR: 'Donateur',
  BAILLEUR: 'Bailleur',
  LECTEUR: 'Lecteur',
};

const DOMAINES_SANS_RESTRICTION: { domaine: string; endpoint: string }[] = [
  { domaine: 'Membres', endpoint: '/api/v1/membres' },
  { domaine: 'Donateurs & dons', endpoint: '/api/v1/donateurs' },
  { domaine: 'Bailleurs', endpoint: '/api/v1/bailleurs' },
  { domaine: 'Bénéficiaires', endpoint: '/api/v1/beneficiaires' },
  { domaine: 'Projets', endpoint: '/api/v1/projets' },
  { domaine: 'Budget', endpoint: '/api/v1/budget' },
  { domaine: 'Comptabilité', endpoint: '/api/v1/comptabilite' },
  { domaine: 'Trésorerie', endpoint: '/api/v1/tresorerie' },
  { domaine: 'Achats', endpoint: '/api/v1/achats' },
  { domaine: 'Stocks', endpoint: '/api/v1/stocks' },
  { domaine: 'Immobilisations', endpoint: '/api/v1/immobilisations' },
  { domaine: 'Ressources humaines', endpoint: '/api/v1/rh' },
  { domaine: 'Documents', endpoint: '/api/v1/documents' },
  { domaine: 'Événements', endpoint: '/api/v1/evenements' },
  { domaine: 'Gouvernance', endpoint: '/api/v1/gouvernance' },
  { domaine: 'MEAL / Suivi-évaluation', endpoint: '/api/v1/meal' },
  { domaine: 'Reporting', endpoint: '/api/v1/reporting' },
  { domaine: 'Journal d’audit', endpoint: '/api/v1/audit' },
  { domaine: 'Import de données', endpoint: '/api/v1/import' },
  { domaine: 'Assistant IA (SARA)', endpoint: '/api/v1/ia' },
  { domaine: 'Paiements', endpoint: '/api/v1/paiements' },
  { domaine: 'Organisation', endpoint: '/api/v1/organisations/:id' },
];

export const REGLES_MATRICE: RegleMatrice[] = [
  {
    domaine: 'Utilisateurs & sécurité',
    action: "Lister les membres de l'organisation",
    endpoint: 'GET /api/v1/utilisateurs/organisation/membres',
    rolesAutorises: ROLES_ADMINISTRATION,
    applique: true,
    source: '@Roles(SUPER_ADMIN, ADMIN_ORGANISATION) + RolesGuard',
  },
  {
    domaine: 'Utilisateurs & sécurité',
    action: "Inviter un utilisateur dans l'organisation",
    endpoint: 'POST /api/v1/utilisateurs/organisation/inviter',
    rolesAutorises: ROLES_ADMINISTRATION,
    applique: true,
    source: '@Roles(SUPER_ADMIN, ADMIN_ORGANISATION) + RolesGuard',
  },
  {
    domaine: 'Utilisateurs & sécurité',
    action: "Modifier le rôle d'un membre",
    endpoint: 'PATCH /api/v1/utilisateurs/organisation/membres/:id/role',
    rolesAutorises: ROLES_ADMINISTRATION,
    applique: true,
    source: '@Roles(SUPER_ADMIN, ADMIN_ORGANISATION) + RolesGuard',
  },
  {
    domaine: 'Utilisateurs & sécurité',
    action: 'Activer / désactiver un compte',
    endpoint: 'PATCH /api/v1/utilisateurs/organisation/membres/:id/statut',
    rolesAutorises: ROLES_ADMINISTRATION,
    applique: true,
    source: '@Roles(SUPER_ADMIN, ADMIN_ORGANISATION) + RolesGuard',
  },
  {
    domaine: 'Utilisateurs & sécurité',
    action: 'Attribuer le rôle SUPER_ADMIN',
    endpoint: 'PATCH /api/v1/utilisateurs/organisation/membres/:id/role',
    rolesAutorises: [RoleUtilisateur.SUPER_ADMIN],
    applique: true,
    source: 'Contrôle explicite dans UtilisateursService.changerRoleDansOrganisation',
  },
  ...DOMAINES_SANS_RESTRICTION.map<RegleMatrice>(({ domaine, endpoint }) => ({
    domaine,
    action: 'Consulter et modifier',
    endpoint,
    rolesAutorises: null,
    applique: false,
    source: 'JwtAuthGuard seul — cloisonnement par organisationId, aucun rôle exigé',
  })),
];

export function construireMatricePermissions() {
  return {
    roles: (Object.keys(LIBELLES_ROLES) as RoleUtilisateur[]).map((code) => ({
      code,
      libelle: LIBELLES_ROLES[code],
      administrateur: ROLES_ADMINISTRATION.includes(code),
    })),
    regles: REGLES_MATRICE,
    resume: {
      reglesAppliquees: REGLES_MATRICE.filter((r) => r.applique).length,
      reglesNonAppliquees: REGLES_MATRICE.filter((r) => !r.applique).length,
      avertissement:
        "En dehors de l'administration des membres, aucune restriction par rôle n'est encore déclarée dans l'API : tout membre authentifié accède aux données de son organisation. Les lignes non appliquées sont affichées à titre informatif.",
    },
  };
}
