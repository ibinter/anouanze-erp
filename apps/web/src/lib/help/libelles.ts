import type {
  CategorieGuide,
  CategorieParcours,
  NiveauDifficulte,
  Ressource,
} from './types';

/**
 * Libellés d'affichage des unions « identifiant » du Centre d'aide.
 *
 * Même règle que pour les catégories de FAQ (`faq-categories.ts`) : les
 * littéraux FRANÇAIS de `types.ts` restent les IDENTIFIANTS stables — ils
 * portent le filtrage et le rapprochement entre les versions FR et EN.
 * Seul l'AFFICHAGE est traduit ici.
 *
 * Conséquence : dans un fichier `.en.ts`, `categorie`, `niveau` et `type`
 * conservent la valeur française ; c'est le rendu qui passe par ces
 * fonctions.
 */

export const LIBELLES_CATEGORIES_GUIDE: Record<CategorieGuide, { fr: string; en: string }> = {
  'Démarrage': { fr: 'Démarrage', en: 'Getting started' },
  'Relations': { fr: 'Relations', en: 'Relationships' },
  'Activités': { fr: 'Activités', en: 'Activities' },
  'Finance': { fr: 'Finance', en: 'Finance' },
  'Outils': { fr: 'Outils', en: 'Tools' },
  'Administration': { fr: 'Administration', en: 'Administration' },
};

export const LIBELLES_CATEGORIES_PARCOURS: Record<CategorieParcours, { fr: string; en: string }> = {
  'Démarrage': { fr: 'Démarrage', en: 'Getting started' },
  'Administration': { fr: 'Administration', en: 'Administration' },
  'Modules métier': { fr: 'Modules métier', en: 'Business modules' },
  'Finance': { fr: 'Finance', en: 'Finance' },
  'Rapports': { fr: 'Rapports', en: 'Reporting' },
  'Mobile': { fr: 'Mobile', en: 'Mobile' },
  'Sécurité': { fr: 'Sécurité', en: 'Security' },
};

export const LIBELLES_NIVEAUX: Record<NiveauDifficulte, { fr: string; en: string }> = {
  'Débutant': { fr: 'Débutant', en: 'Beginner' },
  'Intermédiaire': { fr: 'Intermédiaire', en: 'Intermediate' },
  'Avancé': { fr: 'Avancé', en: 'Advanced' },
};

export const LIBELLES_TYPES_RESSOURCE: Record<Ressource['type'], { fr: string; en: string }> = {
  'Guide en ligne': { fr: 'Guide en ligne', en: 'Online guide' },
  "Modèle d'import": { fr: "Modèle d'import", en: 'Import template' },
  'Page interne': { fr: 'Page interne', en: 'In-app page' },
  'À venir': { fr: 'À venir', en: 'Coming soon' },
};

const traduire = <T extends string>(
  table: Record<T, { fr: string; en: string }>,
  cle: T,
  locale: string,
): string => {
  const entree = table[cle];
  if (!entree) return cle;
  return locale === 'en' ? entree.en : entree.fr;
};

/** Libellé affichable d'une catégorie de guide dans la langue active. */
export const libelleCategorieGuide = (categorie: CategorieGuide, locale: string): string =>
  traduire(LIBELLES_CATEGORIES_GUIDE, categorie, locale);

/** Libellé affichable d'une catégorie de parcours dans la langue active. */
export const libelleCategorieParcours = (categorie: CategorieParcours, locale: string): string =>
  traduire(LIBELLES_CATEGORIES_PARCOURS, categorie, locale);

/** Libellé affichable d'un niveau de difficulté dans la langue active. */
export const libelleNiveau = (niveau: NiveauDifficulte, locale: string): string =>
  traduire(LIBELLES_NIVEAUX, niveau, locale);

/** Libellé affichable d'un type de ressource dans la langue active. */
export const libelleTypeRessource = (type: Ressource['type'], locale: string): string =>
  traduire(LIBELLES_TYPES_RESSOURCE, type, locale);
