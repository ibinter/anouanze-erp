'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

/** Les 7 catégories de l'espace Paramètres (section 9.6 du cahier des charges). */
export type CategorieId =
  | 'organisation'
  | 'utilisateurs'
  | 'documents'
  | 'notifications'
  | 'integrations'
  | 'donnees'
  | 'abonnement';

export interface Categorie {
  id: CategorieId;
  lettre: string;
  titre: string;
  resume: string;
  /** Termes indexés pour la recherche dans les paramètres. */
  motsCles: string[];
}

/** Ordre et lettre de chaque catégorie ; libellés dans shell.json. */
export const CATEGORIES_META: { id: CategorieId; lettre: string }[] = [
  { id: 'organisation', lettre: 'A' },
  { id: 'utilisateurs', lettre: 'B' },
  { id: 'documents', lettre: 'C' },
  { id: 'notifications', lettre: 'D' },
  { id: 'integrations', lettre: 'E' },
  { id: 'donnees', lettre: 'F' },
  { id: 'abonnement', lettre: 'G' },
];

/** Catégories traduites dans la locale active (à utiliser côté client). */
export function useCategories(): Categorie[] {
  const t = useTranslations('shell.parametres.categories');
  return useMemo(
    () =>
      CATEGORIES_META.map((meta) => ({
        ...meta,
        titre: t(`${meta.id}.titre`),
        resume: t(`${meta.id}.resume`),
        motsCles: (t.raw(`${meta.id}.motsCles`) as string[]) ?? [],
      })),
    [t],
  );
}

function normaliser(v: string) {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Recherche dans les paramètres : renvoie les catégories correspondant à la requête. */
export function filtrerCategories(requete: string, categories: Categorie[]): Categorie[] {
  const q = normaliser(requete.trim());
  if (!q) return categories;
  return categories.filter((c) =>
    [c.titre, c.resume, ...c.motsCles].some((champ) => normaliser(champ).includes(q)),
  );
}
