export * from './types';
export * from './guide';
export * from './faq';
export * from './cas-pratiques';
export * from './academie';
export * from './faq-categories';

import { GUIDE_MODULES } from './guide';
import { FAQ_ITEMS } from './faq';
import { FAQ_ITEMS_EN } from './faq.en';
import { CAS_PRATIQUES } from './cas-pratiques';

/**
 * FAQ dans la langue demandée.
 * Le guide, les cas pratiques et l'académie ne sont pas encore traduits :
 * ils restent en français quelle que soit la langue (repli assumé et visible,
 * plutôt qu'un contenu vide).
 */
export function getFaqItems(locale?: string) {
  return locale === 'en' ? FAQ_ITEMS_EN : FAQ_ITEMS;
}

export type TypeResultat = 'guide' | 'faq' | 'cas';

export interface ResultatRecherche {
  type: TypeResultat;
  id: string;
  titre: string;
  extrait: string;
  categorie: string;
}

const normaliser = (valeur: string): string =>
  valeur
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/**
 * Recherche plein texte simple sur le guide, la FAQ et les cas pratiques.
 * La FAQ est cherchée dans la langue active ; guide et cas pratiques restent
 * en français tant qu'ils ne sont pas traduits.
 */
export function rechercherAide(requete: string, locale?: string): ResultatRecherche[] {
  const terme = normaliser(requete.trim());
  if (terme.length < 2) return [];
  const faqItems = getFaqItems(locale);

  const resultats: ResultatRecherche[] = [];

  for (const mod of GUIDE_MODULES) {
    const corpus = normaliser(
      [
        mod.titre,
        mod.objectif,
        mod.utilisateurs.join(' '),
        mod.prerequis.join(' '),
        mod.conseils.join(' '),
        mod.permissions.join(' '),
        mod.procedure.map((e) => `${e.titre} ${e.detail} ${e.chemin ?? ''}`).join(' '),
        mod.erreurs.map((e) => `${e.probleme} ${e.cause} ${e.solution}`).join(' '),
      ].join(' '),
    );
    if (corpus.includes(terme)) {
      resultats.push({ type: 'guide', id: mod.id, titre: mod.titre, extrait: mod.objectif, categorie: mod.categorie });
    }
  }

  for (const faq of faqItems) {
    const corpus = normaliser(`${faq.question} ${faq.reponse} ${faq.motsCles.join(' ')}`);
    if (corpus.includes(terme)) {
      resultats.push({ type: 'faq', id: faq.id, titre: faq.question, extrait: faq.reponse, categorie: faq.categorie });
    }
  }

  for (const cas of CAS_PRATIQUES) {
    const corpus = normaliser(
      [
        cas.titre,
        cas.contexte,
        cas.objectif,
        cas.modules.join(' '),
        cas.etapes.map((e) => `${e.titre} ${e.detail}`).join(' '),
        cas.resultatAttendu.join(' '),
      ].join(' '),
    );
    if (corpus.includes(terme)) {
      resultats.push({ type: 'cas', id: cas.id, titre: cas.titre, extrait: cas.objectif, categorie: `${cas.niveau} · ${cas.dureeMinutes} min` });
    }
  }

  return resultats;
}
