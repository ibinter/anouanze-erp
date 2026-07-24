import type { CategorieFaq } from './types';

/**
 * Les catégories de FAQ servent d'IDENTIFIANT stable (littéraux français,
 * type `CategorieFaq`) : c'est sur elles que reposent le filtrage et le
 * rapprochement entre les versions FR et EN. Seul leur AFFICHAGE est traduit.
 *
 * Conséquence : ne jamais mettre un libellé anglais dans le champ `categorie`
 * d'un `FaqItem` — le type le refuserait, et le filtre casserait au changement
 * de langue.
 */
export const LIBELLES_CATEGORIES_FAQ: Record<CategorieFaq, { fr: string; en: string }> = {
  'Général': { fr: 'Général', en: 'General' },
  'Connexion & sécurité': { fr: 'Connexion & sécurité', en: 'Login & security' },
  'Utilisateurs & permissions': { fr: 'Utilisateurs & permissions', en: 'Users & permissions' },
  'Paramètres': { fr: 'Paramètres', en: 'Settings' },
  'Modules métier': { fr: 'Modules métier', en: 'Business modules' },
  'Imports & exports': { fr: 'Imports & exports', en: 'Imports & exports' },
  'Documents & impressions': { fr: 'Documents & impressions', en: 'Documents & printing' },
  'Abonnements & licences': { fr: 'Abonnements & licences', en: 'Subscriptions & licences' },
  'Sauvegarde & données': { fr: 'Sauvegarde & données', en: 'Backup & data' },
  'Assistant SARA': { fr: 'Assistant SARA', en: 'SARA assistant' },
  'Support': { fr: 'Support', en: 'Support' },
};

/** Libellé affichable d'une catégorie dans la langue active. */
export function libelleCategorieFaq(categorie: CategorieFaq, locale: string): string {
  const entree = LIBELLES_CATEGORIES_FAQ[categorie];
  if (!entree) return categorie;
  return locale === 'en' ? entree.en : entree.fr;
}

/** Correspondance libellé anglais → identifiant canonique (français). */
export const CATEGORIE_DEPUIS_LIBELLE_EN: Record<string, CategorieFaq> = Object.entries(
  LIBELLES_CATEGORIES_FAQ,
).reduce((acc, [cle, { en }]) => {
  acc[en] = cle as CategorieFaq;
  return acc;
}, {} as Record<string, CategorieFaq>);
