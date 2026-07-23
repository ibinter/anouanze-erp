/**
 * ============================================================================
 * TESTS DU CENTRE D'AIDE — recherche plein texte (section 42)
 * ----------------------------------------------------------------------------
 * `rechercherAide()` balaie le guide, la FAQ et les cas pratiques. Les tests
 * portent sur le CONTRAT de la fonction (seuil de longueur, normalisation,
 * absence de bruit) et non sur un décompte figé de résultats, afin de ne pas
 * casser à chaque enrichissement du contenu éditorial.
 * ============================================================================
 */
import { describe, it, expect } from 'vitest';
import { rechercherAide } from '../index';
import { GUIDE_MODULES } from '../guide';
import { FAQ_ITEMS } from '../faq';
import { CAS_PRATIQUES } from '../cas-pratiques';

describe('rechercherAide — garde-fous d’entrée', () => {
  it('renvoie un tableau vide pour une requête vide ou blanche', () => {
    expect(rechercherAide('')).toEqual([]);
    expect(rechercherAide('    ')).toEqual([]);
  });

  it('renvoie un tableau vide en dessous de 2 caractères significatifs', () => {
    expect(rechercherAide('a')).toEqual([]);
    expect(rechercherAide(' m ')).toEqual([]);
  });

  it('accepte une requête de 2 caractères', () => {
    expect(Array.isArray(rechercherAide('rh'))).toBe(true);
  });
});

describe('rechercherAide — pertinence', () => {
  it('trouve des résultats sur un terme métier central', () => {
    const res = rechercherAide('cotisation');
    expect(res.length).toBeGreaterThan(0);
  });

  it('est insensible à la casse', () => {
    const bas = rechercherAide('membre');
    const haut = rechercherAide('MEMBRE');
    expect(haut.map((r) => r.id)).toEqual(bas.map((r) => r.id));
  });

  it('est insensible aux accents (adhésion ≡ adhesion)', () => {
    const avec = rechercherAide('adhésion');
    const sans = rechercherAide('adhesion');
    expect(sans.length).toBeGreaterThan(0);
    expect(avec.map((r) => r.id)).toEqual(sans.map((r) => r.id));
  });

  it('ignore les espaces de bordure', () => {
    expect(rechercherAide('  comptabilite  ').map((r) => r.id)).toEqual(
      rechercherAide('comptabilite').map((r) => r.id),
    );
  });

  it('cherche aussi dans les mots-clés de la FAQ (non affichés)', () => {
    // « reinitialiser » n'apparaît que dans motsCles de sec-1.
    const res = rechercherAide('reinitialiser');
    expect(res.some((r) => r.type === 'faq')).toBe(true);
  });
});

describe('rechercherAide — silence sur les requêtes hors-sujet', () => {
  it('ne remonte rien pour une chaîne absurde', () => {
    expect(rechercherAide('zzzqwxyplok')).toEqual([]);
    expect(rechercherAide('recette de foutou banane martienne')).toEqual([]);
  });

  it('ne remonte rien pour un terme sans rapport avec l’ERP', () => {
    expect(rechercherAide('cryptomonnaie')).toEqual([]);
  });
});

describe('rechercherAide — forme des résultats', () => {
  const res = rechercherAide('membre');

  it('chaque résultat expose id, titre, extrait, catégorie et type valide', () => {
    expect(res.length).toBeGreaterThan(0);
    for (const r of res) {
      expect(['guide', 'faq', 'cas']).toContain(r.type);
      expect(typeof r.id).toBe('string');
      expect(r.id.length).toBeGreaterThan(0);
      expect(typeof r.titre).toBe('string');
      expect(r.titre.length).toBeGreaterThan(0);
      expect(typeof r.extrait).toBe('string');
      expect(typeof r.categorie).toBe('string');
    }
  });

  it('les résultats sont ordonnés guide → faq → cas', () => {
    const ordre = { guide: 0, faq: 1, cas: 2 } as const;
    const rangs = res.map((r) => ordre[r.type]);
    expect(rangs).toEqual([...rangs].sort((a, b) => a - b));
  });

  it('chaque id de résultat existe bien dans le corpus source', () => {
    const ids = new Set<string>([
      ...GUIDE_MODULES.map((m) => m.id),
      ...FAQ_ITEMS.map((f) => f.id),
      ...CAS_PRATIQUES.map((c) => c.id),
    ]);
    for (const r of res) expect(ids.has(r.id)).toBe(true);
  });
});

describe('intégrité du corpus d’aide', () => {
  it('aucun identifiant dupliqué dans le guide, la FAQ ou les cas', () => {
    const check = (ids: string[]) => expect(new Set(ids).size).toBe(ids.length);
    check(GUIDE_MODULES.map((m) => m.id));
    check(FAQ_ITEMS.map((f) => f.id));
    check(CAS_PRATIQUES.map((c) => c.id));
  });

  it('chaque module du guide a un objectif, une procédure et une route', () => {
    for (const m of GUIDE_MODULES) {
      expect(m.objectif.length).toBeGreaterThan(0);
      expect(m.procedure.length).toBeGreaterThan(0);
      expect(m.href.startsWith('/')).toBe(true);
    }
  });

  it('chaque entrée FAQ a une question et une réponse non vides', () => {
    for (const f of FAQ_ITEMS) {
      expect(f.question.trim().length).toBeGreaterThan(0);
      expect(f.reponse.trim().length).toBeGreaterThan(0);
    }
  });
});
