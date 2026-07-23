import { RoleUtilisateur } from '@prisma/client';

/**
 * GROUPES DE RÔLES RÉUTILISABLES
 *
 * Ces constantes sont l'unique source des listes passées à `@Roles(...)`
 * dans les contrôleurs métier. Elles évitent de disperser des listes en dur
 * et permettent de faire évoluer la politique d'habilitation en un seul point.
 *
 * Rappel : `@Roles(...)` n'a d'effet que si `RolesGuard` est déclaré à côté de
 * `JwtAuthGuard` dans le `@UseGuards(...)` du contrôleur. Sans `@Roles`, le
 * garde laisse passer tout utilisateur authentifié.
 *
 * Invariant : SUPER_ADMIN, ADMIN_ORGANISATION et DIRECTEUR figurent dans
 * TOUS les groupes d'écriture — ils conservent l'accès complet.
 */

/** Administration technique / plateforme. */
export const ROLES_SUPER_ADMIN: RoleUtilisateur[] = [RoleUtilisateur.SUPER_ADMIN];

/** Administration de l'organisation (gestion des comptes, paramètres). */
export const ROLES_ADMINISTRATION: RoleUtilisateur[] = [
  RoleUtilisateur.SUPER_ADMIN,
  RoleUtilisateur.ADMIN_ORGANISATION,
];

/** Direction : accès total au métier. Base de tous les groupes d'écriture. */
export const ROLES_ADMIN: RoleUtilisateur[] = [
  RoleUtilisateur.SUPER_ADMIN,
  RoleUtilisateur.ADMIN_ORGANISATION,
  RoleUtilisateur.DIRECTEUR,
];

/** Écriture financière : comptabilité, trésorerie, budget, achats, immobilisations, dons. */
export const ROLES_ECRITURE_FINANCE: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.COMPTABLE,
];

/** Écriture RH : employés, paie, congés, volontaires. */
export const ROLES_ECRITURE_RH: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.CHARGE_RH,
];

/** Écriture programmatique : projets, activités, bénéficiaires, MEAL. */
export const ROLES_ECRITURE_PROJET: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.GESTIONNAIRE_PROJET,
];

/**
 * Écriture opérationnelle transverse : documents, événements, stocks,
 * communication interne. Ouverte aux trois métiers.
 */
export const ROLES_ECRITURE_OPERATIONNELLE: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.COMPTABLE,
  RoleUtilisateur.GESTIONNAIRE_PROJET,
  RoleUtilisateur.CHARGE_RH,
];

/** Écriture sur le fichier des membres et leurs cotisations. */
export const ROLES_ECRITURE_MEMBRES: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.CHARGE_RH,
  RoleUtilisateur.COMPTABLE,
];

/**
 * Lecture large : tous les rôles, y compris les rôles consultatifs
 * (LECTEUR, AUDITEUR, MEMBRE, DONATEUR, BAILLEUR).
 * Équivalent fonctionnel à « tout utilisateur authentifié », mais déclaré
 * explicitement pour que la matrice de permissions reste exacte.
 */
export const ROLES_LECTURE_LARGE: RoleUtilisateur[] = [
  RoleUtilisateur.SUPER_ADMIN,
  RoleUtilisateur.ADMIN_ORGANISATION,
  RoleUtilisateur.DIRECTEUR,
  RoleUtilisateur.COMPTABLE,
  RoleUtilisateur.GESTIONNAIRE_PROJET,
  RoleUtilisateur.CHARGE_RH,
  RoleUtilisateur.AUDITEUR,
  RoleUtilisateur.MEMBRE,
  RoleUtilisateur.DONATEUR,
  RoleUtilisateur.BAILLEUR,
  RoleUtilisateur.LECTEUR,
];

/**
 * Lecture des données RH nominatives (salaires, congés, contrats).
 * Volontairement plus étroite que la lecture large.
 */
export const ROLES_LECTURE_RH: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.CHARGE_RH,
  RoleUtilisateur.COMPTABLE,
  RoleUtilisateur.AUDITEUR,
];

/** Lecture du journal d'audit : direction, auditeur, comptable. */
export const ROLES_LECTURE_AUDIT: RoleUtilisateur[] = [
  ...ROLES_ADMIN,
  RoleUtilisateur.AUDITEUR,
  RoleUtilisateur.COMPTABLE,
];
