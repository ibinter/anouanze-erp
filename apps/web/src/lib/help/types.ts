/**
 * Types partagés du Centre d'aide ANOUANZÊ ERP.
 * Contenu statique typé — aucune donnée n'est stockée en base.
 */

export type NiveauDifficulte = 'Débutant' | 'Intermédiaire' | 'Avancé';

/** Une étape numérotée d'une procédure. */
export interface EtapeProcedure {
  titre: string;
  detail: string;
  /** Chemin de navigation dans l'ERP, ex. « Membres › Nouveau membre ». */
  chemin?: string;
}

/** Erreur fréquente + résolution. */
export interface ErreurFrequente {
  probleme: string;
  cause: string;
  solution: string;
}

/** Guide utilisateur d'un module métier. */
export interface GuideModule {
  id: string;
  titre: string;
  /** Route interne de l'ERP correspondant au module. */
  href: string;
  categorie: CategorieGuide;
  objectif: string;
  utilisateurs: string[];
  prerequis: string[];
  procedure: EtapeProcedure[];
  erreurs: ErreurFrequente[];
  conseils: string[];
  permissions: string[];
}

export type CategorieGuide =
  | 'Démarrage'
  | 'Relations'
  | 'Activités'
  | 'Finance'
  | 'Outils'
  | 'Administration';

export type CategorieFaq =
  | 'Général'
  | 'Connexion & sécurité'
  | 'Utilisateurs & permissions'
  | 'Paramètres'
  | 'Modules métier'
  | 'Imports & exports'
  | 'Documents & impressions'
  | 'Abonnements & licences'
  | 'Sauvegarde & données'
  | 'Assistant SARA'
  | 'Support';

export interface FaqItem {
  id: string;
  question: string;
  reponse: string;
  categorie: CategorieFaq;
  motsCles: string[];
}

export interface CasPratique {
  id: string;
  titre: string;
  contexte: string;
  objectif: string;
  niveau: NiveauDifficulte;
  dureeMinutes: number;
  modules: string[];
  etapes: EtapeProcedure[];
  resultatAttendu: string[];
  erreursPossibles: ErreurFrequente[];
}

export type CategorieParcours =
  | 'Démarrage'
  | 'Administration'
  | 'Modules métier'
  | 'Finance'
  | 'Rapports'
  | 'Mobile'
  | 'Sécurité';

export interface Lecon {
  id: string;
  titre: string;
  resume: string;
  dureeMinutes: number;
  niveau: NiveauDifficulte;
  /**
   * Aucune vidéo n'est encore produite : `disponible` reste `false`
   * tant que le contenu réel n'est pas publié par IBIG SOFT.
   */
  disponible: boolean;
  /** Lien interne vers la partie de l'ERP ou du guide concernée. */
  lienInterne?: string;
  objectifs: string[];
}

export interface Parcours {
  id: string;
  categorie: CategorieParcours;
  titre: string;
  description: string;
  niveau: NiveauDifficulte;
  lecons: Lecon[];
}

export interface Ressource {
  id: string;
  titre: string;
  description: string;
  /** Type de ressource ; les ressources « interne » pointent vers une page de l'ERP. */
  type: 'Guide en ligne' | 'Modèle d\'import' | 'Page interne' | 'À venir';
  href?: string;
  disponible: boolean;
}
