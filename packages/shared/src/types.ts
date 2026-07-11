// ============================================================
// ANOUANZÊ ERP — Types partagés (web + api + mobile)
// ============================================================

export type Devise = 'XOF' | 'XAF' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'CHF' | 'GHS' | 'NGN' | 'KES';

export type TypeOrganisation =
  | 'ASSOCIATION'
  | 'ONG_NATIONALE'
  | 'ONG_INTERNATIONALE'
  | 'FONDATION'
  | 'COOPERATIVE'
  | 'MUTUELLE'
  | 'CONFESSIONNELLE'
  | 'RESEAU_FEDERATION'
  | 'COMMUNAUTAIRE'
  | 'PROGRAMME_DEVELOPPEMENT';

export type RoleUtilisateur =
  | 'SUPER_ADMIN'
  | 'ADMIN_ORGANISATION'
  | 'DIRECTEUR'
  | 'COMPTABLE'
  | 'GESTIONNAIRE_PROJET'
  | 'CHARGÉ_RH'
  | 'AUDITEUR'
  | 'MEMBRE'
  | 'DONATEUR'
  | 'BAILLEUR'
  | 'LECTEUR';

export type StatutMembre = 'ACTIF' | 'INACTIF' | 'SUSPENDU' | 'HONNEUR' | 'FONDATEUR';
export type StatutProjet = 'BROUILLON' | 'SOUMIS' | 'APPROUVE' | 'EN_COURS' | 'SUSPENDU' | 'CLOTURE' | 'ANNULE';
export type StatutPaiement = 'EN_ATTENTE' | 'PAYE' | 'PARTIEL' | 'EN_RETARD' | 'ANNULE';

// Réponse API paginée
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Réponse API standard
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Paramètres de pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Entité de base
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Organisation
export interface Organisation extends BaseEntity {
  slug: string;
  nom: string;
  sigle?: string;
  type: TypeOrganisation;
  dateCreation?: string;
  email?: string;
  telephone?: string;
  siteWeb?: string;
  logo?: string;
  couleurPrimaire: string;
  couleurSecondaire: string;
  paysPrincipal?: string;
  deviseDefaut: Devise;
  actif: boolean;
}

// Utilisateur
export interface Utilisateur extends BaseEntity {
  email: string;
  nom: string;
  prenom: string;
  avatar?: string;
  langue: string;
  actif: boolean;
  emailVerifie: boolean;
  deuxFacteurs: boolean;
  dernierLogin?: string;
}

// Membre
export interface Membre extends BaseEntity {
  organisationId: string;
  numero?: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  email?: string;
  statutMembre: StatutMembre;
  dateAdhesion: string;
  dateExpiration?: string;
  fonctions: string[];
}

// Projet
export interface Projet extends BaseEntity {
  organisationId: string;
  code?: string;
  nom: string;
  description?: string;
  statut: StatutProjet;
  dateDebut?: string;
  dateFin?: string;
  budgetTotal?: number;
  devise: Devise;
  secteurs: string[];
}

// Don
export interface Don extends BaseEntity {
  donateurId: string;
  type: 'NUMERAIRE' | 'EN_NATURE' | 'COMPETENCES' | 'FONCIER';
  montant?: number;
  devise: Devise;
  dateDon: string;
  statut: StatutPaiement;
  projetId?: string;
  recu: boolean;
  numeroRecu?: string;
}

// Session utilisateur (next-auth)
export interface UserSession {
  id: string;
  email: string;
  name: string;
  image?: string;
  organisationId: string;
  role: RoleUtilisateur;
  accessToken: string;
}
