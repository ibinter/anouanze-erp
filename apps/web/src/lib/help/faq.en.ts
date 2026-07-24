import type { CategorieFaq, FaqItem } from './types';
import { CATEGORIE_DEPUIS_LIBELLE_EN } from './faq-categories';
import { FAQ_EN_PART1 } from './faq.en.part1';
import { FAQ_EN_PART2 } from './faq.en.part2';
import { FAQ_EN_PART3 } from './faq.en.part3';

/**
 * FAQ anglaise = concaténation des trois lots traduits.
 *
 * Les lots portent un libellé de catégorie ANGLAIS (« General », « Support »…),
 * alors que `FaqItem.categorie` est un identifiant canonique FRANÇAIS sur lequel
 * reposent le filtrage et la correspondance entre les deux langues.
 * On normalise donc ici : le libellé anglais est reconverti en identifiant, et
 * la traduction d'affichage est faite par `libelleCategorieFaq()`.
 *
 * Un libellé inconnu est conservé tel quel plutôt que perdu — il resterait
 * visible dans l'interface, ce qui rend l'anomalie détectable.
 */
function normaliserCategorie(valeur: string): CategorieFaq {
  return CATEGORIE_DEPUIS_LIBELLE_EN[valeur] ?? (valeur as CategorieFaq);
}

export const FAQ_ITEMS_EN: FaqItem[] = [
  ...FAQ_EN_PART1,
  ...FAQ_EN_PART2,
  ...FAQ_EN_PART3,
].map((item) => ({
  ...item,
  categorie: normaliserCategorie(item.categorie as unknown as string),
}));
