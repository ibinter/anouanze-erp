export * from './types';
export * from './guide';
export * from './faq';
export * from './cas-pratiques';
export * from './academie';
export * from './faq-categories';
export * from './libelles';

import { GUIDE_MODULES } from './guide';
import { GUIDE_MODULES_EN } from './guide.en';
import { FAQ_ITEMS } from './faq';
import { FAQ_ITEMS_EN } from './faq.en';
import { CAS_PRATIQUES } from './cas-pratiques';
import { CAS_PRATIQUES_EN } from './cas-pratiques.en';
import { PARCOURS, RESSOURCES } from './academie';
import { PARCOURS_EN, RESSOURCES_EN } from './academie.en';
import { libelleCategorieFaq } from './faq-categories';
import { libelleCategorieGuide, libelleNiveau } from './libelles';

/**
 * Sélecteurs par locale.
 *
 * Tous suivent le même contrat que `getFaqItems` : la version anglaise si la
 * locale est `en`, sinon la version française. Le français fait donc office de
 * repli pour toute autre langue.
 *
 * Les versions EN reprennent les mêmes `id` et le même ordre que les versions
 * FR, et conservent les catégories/niveaux comme identifiants canoniques
 * français — seul l'affichage est traduit (`libelles.ts`, `faq-categories.ts`).
 * Conséquence pratique : filtres, ancres de recherche et progression de
 * l'Académie (stockée par id de leçon) survivent au changement de langue.
 */
export function getFaqItems(locale?: string) {
  return locale === 'en' ? FAQ_ITEMS_EN : FAQ_ITEMS;
}

export function getGuideModules(locale?: string) {
  return locale === 'en' ? GUIDE_MODULES_EN : GUIDE_MODULES;
}

export function getCasPratiques(locale?: string) {
  return locale === 'en' ? CAS_PRATIQUES_EN : CAS_PRATIQUES;
}

export function getParcours(locale?: string) {
  return locale === 'en' ? PARCOURS_EN : PARCOURS;
}

export function getRessources(locale?: string) {
  return locale === 'en' ? RESSOURCES_EN : RESSOURCES;
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
 * Recherche plein texte simple sur le guide, la FAQ et les cas pratiques,
 * dans la langue active pour les trois contenus.
 *
 * Le champ `categorie` du résultat est destiné à l'affichage : il est déjà
 * traduit ici, les identifiants canoniques restant internes aux données.
 */
export function rechercherAide(requete: string, locale?: string): ResultatRecherche[] {
  const terme = normaliser(requete.trim());
  if (terme.length < 2) return [];
  const langue = locale ?? 'fr';
  const guideModules = getGuideModules(locale);
  const faqItems = getFaqItems(locale);
  const casPratiques = getCasPratiques(locale);

  const resultats: ResultatRecherche[] = [];

  for (const mod of guideModules) {
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
      resultats.push({ type: 'guide', id: mod.id, titre: mod.titre, extrait: mod.objectif, categorie: libelleCategorieGuide(mod.categorie, langue) });
    }
  }

  for (const faq of faqItems) {
    const corpus = normaliser(`${faq.question} ${faq.reponse} ${faq.motsCles.join(' ')}`);
    if (corpus.includes(terme)) {
      resultats.push({ type: 'faq', id: faq.id, titre: faq.question, extrait: faq.reponse, categorie: libelleCategorieFaq(faq.categorie, langue) });
    }
  }

  for (const cas of casPratiques) {
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
      resultats.push({ type: 'cas', id: cas.id, titre: cas.titre, extrait: cas.objectif, categorie: `${libelleNiveau(cas.niveau, langue)} · ${cas.dureeMinutes} min` });
    }
  }

  return resultats;
}
