import { RoleUtilisateur } from '@prisma/client';
import {
  ROLES_ADMIN,
  ROLES_ADMINISTRATION as GROUPE_ADMINISTRATION,
  ROLES_ECRITURE_FINANCE,
  ROLES_ECRITURE_MEMBRES,
  ROLES_ECRITURE_OPERATIONNELLE,
  ROLES_ECRITURE_PROJET,
  ROLES_ECRITURE_RH,
  ROLES_LECTURE_AUDIT,
  ROLES_LECTURE_LARGE,
  ROLES_LECTURE_RH,
  ROLES_SUPER_ADMIN,
} from '../../common/constants/roles-groupes';

/**
 * MATRICE RÔLE × PERMISSIONS — SOURCE DE VÉRITÉ
 *
 * Ce fichier ne décrit PAS ce que les rôles « devraient » pouvoir faire :
 * il reflète exactement ce que l'API applique aujourd'hui.
 *
 * Deux mécanismes sont en place :
 *  1. `JwtAuthGuard` (apps/api/src/modules/auth/guards/jwt-auth.guard.ts)
 *     — posé sur TOUS les contrôleurs métier, exige un jeton valide.
 *  2. `RolesGuard` + `@Roles(...)`
 *     (apps/api/src/common/guards/roles.guard.ts,
 *      apps/api/src/common/decorators/roles.decorator.ts)
 *     — désormais déclaré sur l'ensemble des contrôleurs métier. Les listes de
 *       rôles proviennent de `apps/api/src/common/constants/roles-groupes.ts`.
 *
 * Convention appliquée dans les contrôleurs : un `@Roles(...)` de niveau classe
 * fixe le régime de lecture par défaut, et chaque route d'écriture le remplace
 * par un groupe plus étroit (`getAllAndOverride` : le handler l'emporte).
 *
 * Une ligne `applique: false` signifierait qu'aucune restriction de rôle n'est
 * déclarée pour ce périmètre. Il n'en reste aucune.
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

/** Rôles habilités à administrer les membres de l'organisation. */
export const ROLES_ADMINISTRATION: RoleUtilisateur[] = GROUPE_ADMINISTRATION;

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

interface DomaineMetier {
  domaine: string;
  endpoint: string;
  /** Rôles autorisés en consultation (GET) */
  lecture: RoleUtilisateur[];
  /** Rôles autorisés en création / modification / suppression */
  ecriture: RoleUtilisateur[] | null;
  /** Groupe de constantes utilisé, pour traçabilité */
  groupeEcriture: string;
  groupeLecture: string;
}

const DOMAINES_METIER: DomaineMetier[] = [
  {
    domaine: 'Comptabilité',
    endpoint: '/api/v1/comptabilite',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE',
  },
  {
    domaine: 'Trésorerie',
    endpoint: '/api/v1/tresorerie',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE',
  },
  {
    domaine: 'Budget',
    endpoint: '/api/v1/budgets',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE (approbation : ROLES_ADMIN)',
  },
  {
    domaine: 'Achats',
    endpoint: '/api/v1/achats',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE (validation commande : ROLES_ADMIN)',
  },
  {
    domaine: 'Immobilisations',
    endpoint: '/api/v1/immobilisations',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE',
  },
  {
    domaine: 'Donateurs & dons',
    endpoint: '/api/v1/donateurs',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE',
  },
  {
    domaine: 'Bailleurs & conventions',
    endpoint: '/api/v1/bailleurs',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE',
  },
  {
    domaine: 'Paiements',
    endpoint: '/api/v1/paiements',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_FINANCE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_FINANCE (webhooks prestataires : routes publiques)',
  },
  {
    domaine: 'Ressources humaines',
    endpoint: '/api/v1/rh',
    lecture: ROLES_LECTURE_RH,
    ecriture: ROLES_ECRITURE_RH,
    groupeLecture: 'ROLES_LECTURE_RH (stats et volontaires : ROLES_LECTURE_LARGE)',
    groupeEcriture: 'ROLES_ECRITURE_RH',
  },
  {
    domaine: 'Projets & activités',
    endpoint: '/api/v1/projets',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_PROJET,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_PROJET (suppression : ROLES_ADMIN)',
  },
  {
    domaine: 'Bénéficiaires',
    endpoint: '/api/v1/beneficiaires',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_PROJET,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_PROJET',
  },
  {
    domaine: 'MEAL / Suivi-évaluation',
    endpoint: '/api/v1/meal/projets/:projetId',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_PROJET,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_PROJET',
  },
  {
    domaine: 'Membres & cotisations',
    endpoint: '/api/v1/membres',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_MEMBRES,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture:
      'ROLES_ECRITURE_MEMBRES (suppression : ROLES_ADMIN ; cotisations : ROLES_ECRITURE_FINANCE)',
  },
  {
    domaine: 'Documents',
    endpoint: '/api/v1/documents',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_OPERATIONNELLE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_OPERATIONNELLE (suppression : ROLES_ADMIN)',
  },
  {
    domaine: 'Stocks',
    endpoint: '/api/v1/stocks',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_OPERATIONNELLE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_OPERATIONNELLE',
  },
  {
    domaine: 'Événements',
    endpoint: '/api/v1/evenements',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_OPERATIONNELLE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture:
      'ROLES_ECRITURE_OPERATIONNELLE (suppression : ROLES_ADMIN ; auto-inscription ouverte à tous)',
  },
  {
    domaine: 'Communication',
    endpoint: '/api/v1/communication',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_OPERATIONNELLE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_OPERATIONNELLE',
  },
  {
    domaine: 'Notifications',
    endpoint: '/api/v1/notifications',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_OPERATIONNELLE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ECRITURE_OPERATIONNELLE (diffusion à toute l’organisation)',
  },
  {
    domaine: 'Gouvernance',
    endpoint: '/api/v1/gouvernance',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ADMIN,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_ADMIN',
  },
  {
    domaine: 'Import de données',
    endpoint: '/api/v1/import',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_MEMBRES,
    groupeLecture: 'ROLES_LECTURE_LARGE (modèles Excel)',
    groupeEcriture:
      'ROLES_ECRITURE_MEMBRES (import donateurs : ROLES_ECRITURE_FINANCE)',
  },
  {
    domaine: 'Assistant IA (SARA)',
    endpoint: '/api/v1/ia',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_ECRITURE_OPERATIONNELLE,
    groupeLecture: 'ROLES_LECTURE_LARGE (analyses, chat, traduction)',
    groupeEcriture:
      'ROLES_ECRITURE_OPERATIONNELLE (rapport narratif) — budget prévisionnel : ROLES_ECRITURE_FINANCE',
  },
  {
    domaine: 'Support & tickets',
    endpoint: '/api/v1/tickets',
    lecture: ROLES_LECTURE_LARGE,
    ecriture: ROLES_LECTURE_LARGE,
    groupeLecture: 'ROLES_LECTURE_LARGE',
    groupeEcriture: 'ROLES_LECTURE_LARGE (chacun ouvre et suit ses propres tickets)',
  },
];

export const REGLES_MATRICE: RegleMatrice[] = [
  // ─── Administration des membres de l'organisation ───
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
    rolesAutorises: ROLES_SUPER_ADMIN,
    applique: true,
    source: 'Contrôle explicite dans UtilisateursService.changerRoleDansOrganisation',
  },

  // ─── Cycle de vie des organisations ───
  {
    domaine: 'Organisation',
    action: 'Consulter son organisation',
    endpoint: 'GET /api/v1/organisations/:id',
    rolesAutorises: ROLES_LECTURE_LARGE,
    applique: true,
    source: '@Roles(...ROLES_LECTURE_LARGE) + RolesGuard',
  },
  {
    domaine: 'Organisation',
    action: 'Modifier les paramètres de son organisation',
    endpoint: 'PATCH /api/v1/organisations/:id',
    rolesAutorises: ROLES_ADMINISTRATION,
    applique: true,
    source: '@Roles(...ROLES_ADMINISTRATION) + RolesGuard',
  },
  {
    domaine: 'Organisation',
    action: 'Lister, créer ou supprimer des organisations (console plateforme)',
    endpoint: 'GET|POST|DELETE /api/v1/organisations',
    rolesAutorises: ROLES_SUPER_ADMIN,
    applique: true,
    source: '@Roles(...ROLES_SUPER_ADMIN) + RolesGuard',
  },

  // ─── Journal d'audit ───
  {
    domaine: "Journal d'audit",
    action: 'Consulter le journal et ses statistiques',
    endpoint: 'GET /api/v1/audit',
    rolesAutorises: ROLES_LECTURE_AUDIT,
    applique: true,
    source: '@Roles(...ROLES_LECTURE_AUDIT) + RolesGuard',
  },

  // ─── Reporting (exclusivement consultatif) ───
  {
    domaine: 'Reporting',
    action: 'Consulter et exporter les rapports',
    endpoint: 'GET /api/v1/reporting',
    rolesAutorises: ROLES_LECTURE_LARGE,
    applique: true,
    source: '@Roles(...ROLES_LECTURE_LARGE) + RolesGuard',
  },

  // ─── Domaines métier : lecture / écriture séparées ───
  ...DOMAINES_METIER.flatMap<RegleMatrice>((d) => [
    {
      domaine: d.domaine,
      action: 'Consulter',
      endpoint: `GET ${d.endpoint}`,
      rolesAutorises: d.lecture,
      applique: true,
      source: `@Roles(...${d.groupeLecture}) + RolesGuard`,
    },
    {
      domaine: d.domaine,
      action: 'Créer, modifier, supprimer',
      endpoint: `POST|PUT|PATCH|DELETE ${d.endpoint}`,
      rolesAutorises: d.ecriture,
      applique: true,
      source: `@Roles(...${d.groupeEcriture}) + RolesGuard`,
    },
  ]),
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
        "Toutes les règles listées sont réellement appliquées par l'API : chaque contrôleur métier déclare RolesGuard et un @Roles(...). Les rôles consultatifs (LECTEUR, AUDITEUR, MEMBRE, DONATEUR, BAILLEUR) conservent la lecture mais n'ont plus aucun droit d'écriture. SUPER_ADMIN, ADMIN_ORGANISATION et DIRECTEUR conservent l'accès complet.",
    },
  };
}
