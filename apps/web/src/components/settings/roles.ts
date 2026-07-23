/**
 * Les 11 rôles de l'enum Prisma `RoleUtilisateur`
 * (apps/api/prisma/schema.prisma). Ordre = du plus large au plus restreint.
 * Les descriptions sont des libellés d'usage : elles ne créent aucun droit,
 * les droits réellement appliqués sont exposés par
 * GET /utilisateurs/organisation/matrice-permissions.
 */
export const ROLES = [
  'SUPER_ADMIN',
  'ADMIN_ORGANISATION',
  'DIRECTEUR',
  'COMPTABLE',
  'GESTIONNAIRE_PROJET',
  'CHARGE_RH',
  'AUDITEUR',
  'MEMBRE',
  'DONATEUR',
  'BAILLEUR',
  'LECTEUR',
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
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

export const ROLE_BADGES: Record<Role, string> = {
  SUPER_ADMIN: 'badge bg-red-100 text-red-700',
  ADMIN_ORGANISATION: 'badge bg-red-50 text-red-600',
  DIRECTEUR: 'badge bg-purple-100 text-purple-700',
  COMPTABLE: 'badge bg-emerald-100 text-emerald-700',
  GESTIONNAIRE_PROJET: 'badge bg-teal-100 text-teal-700',
  CHARGE_RH: 'badge bg-blue-100 text-blue-700',
  AUDITEUR: 'badge bg-amber-100 text-amber-700',
  MEMBRE: 'badge bg-neutral-100 text-neutral-600',
  DONATEUR: 'badge bg-orange-100 text-orange-700',
  BAILLEUR: 'badge bg-indigo-100 text-indigo-700',
  LECTEUR: 'badge bg-neutral-100 text-neutral-500',
};

/** Rôles habilités à administrer les membres (miroir de ROLES_ADMINISTRATION côté API). */
export const ROLES_ADMINISTRATION: Role[] = ['SUPER_ADMIN', 'ADMIN_ORGANISATION'];

export function estRoleConnu(valeur?: string | null): valeur is Role {
  return !!valeur && (ROLES as readonly string[]).includes(valeur);
}

export function libelleRole(valeur?: string | null): string {
  return estRoleConnu(valeur) ? ROLE_LABELS[valeur] : (valeur ?? '—');
}

export function badgeRole(valeur?: string | null): string {
  return estRoleConnu(valeur) ? ROLE_BADGES[valeur] : 'badge badge-neutral';
}
