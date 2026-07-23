/**
 * ============================================================================
 * TESTS DU VALIDATEUR D'INTÉGRITÉ POST-COMPOSITION (sections 34-35, 42)
 * ----------------------------------------------------------------------------
 * Fonctions 100 % pures : aucune génération PDF réelle, uniquement des
 * métriques de layout. Ces tests complètent la couverture du moteur de mise
 * en page (layout-engine.test.ts).
 * ============================================================================
 */
import { describe, it, expect } from 'vitest';
import jsPDF from 'jspdf';
import { detectCorruptedChars, validateLayout, pickNextCandidate } from '../integrity-validator';
import { selectBestDocumentLayout, cellText } from '../layout-engine';
import { createMeasurer } from '../text-measure';
import { abbreviate, effectivePriority, COLUMN_RULES, PRIORITY_ORDER } from '../column-rules';
import { ANOUANZE_BRANDING } from '../export-definitions';
import type { ColumnDef, DocumentExportDefinition, LayoutResult } from '../types';

const COLUMNS: ColumnDef[] = [
  { key: 'ref', label: 'Référence', type: 'reference' },
  { key: 'nom', label: 'Nom', type: 'name' },
  { key: 'montant', label: 'Montant', type: 'amount' },
  { key: 'date', label: 'Date', type: 'date' },
];

function makeDef(over: Partial<DocumentExportDefinition> = {}): DocumentExportDefinition {
  return {
    title: 'Liste des cotisations',
    documentType: 'data-list',
    columns: COLUMNS,
    branding: ANOUANZE_BRANDING,
    lang: 'fr',
    ...over,
  };
}

function makeRows(n: number, over: Record<string, unknown> = {}) {
  return Array.from({ length: n }, (_, i) => ({
    ref: `M-${String(i + 1).padStart(4, '0')}`,
    nom: ['Kouassi', "N'Dri", 'Aya', 'Konan'][i % 4],
    montant: (i + 1) * 25000,
    date: new Date(2026, i % 12, (i % 27) + 1).toISOString(),
    ...over,
  }));
}

function layoutFor(n: number, def = makeDef()): LayoutResult {
  return selectBestDocumentLayout(new jsPDF({ unit: 'mm', format: 'a4' }), def, makeRows(n));
}

// ─── detectCorruptedChars ────────────────────────────────────────────────────
describe('detectCorruptedChars', () => {
  it('ne signale rien sur du français accentué normal', () => {
    expect(detectCorruptedChars(makeRows(30), makeDef())).toBe(false);
  });

  it('accepte apostrophes typographiques et caractères ivoiriens', () => {
    const rows = makeRows(5, { nom: "N'Guessan d’Aké — Affoué" });
    expect(detectCorruptedChars(rows, makeDef())).toBe(false);
  });

  it('détecte le caractère de remplacement Unicode', () => {
    expect(detectCorruptedChars(makeRows(3, { nom: 'Kou�assi' }), makeDef())).toBe(true);
  });

  it('détecte le mojibake (double encodage UTF-8 → Latin-1)', () => {
    expect(detectCorruptedChars(makeRows(3, { nom: 'CotisationÃ©' }), makeDef())).toBe(true);
  });

  it('détecte un emoji (hors plan de base, non rendu par Helvetica)', () => {
    expect(detectCorruptedChars(makeRows(3, { nom: 'Membre 🎉' }), makeDef())).toBe(true);
  });

  it('analyse aussi le titre et le sous-titre du document', () => {
    expect(detectCorruptedChars(makeRows(3), makeDef({ title: 'Rapport�' }))).toBe(true);
    expect(detectCorruptedChars(makeRows(3), makeDef({ subtitle: 'Exercice�' }))).toBe(true);
  });

  it('ne plante pas sur un jeu de lignes vide', () => {
    expect(detectCorruptedChars([], makeDef())).toBe(false);
  });
});

// ─── validateLayout ──────────────────────────────────────────────────────────
describe('validateLayout', () => {
  it('produit un rapport complet et cohérent', () => {
    const layout = layoutFor(120);
    const rapport = validateLayout(makeDef(), layout);
    expect(rapport.pages.length).toBe(layout.candidate.pageCount);
    expect(rapport.widthUtilization).toBeGreaterThan(0);
    expect(rapport.widthUtilization).toBeLessThanOrEqual(1);
    expect(Array.isArray(rapport.anomalies)).toBe(true);
    expect(rapport.ok).toBe(rapport.anomalies.length === 0);
  });

  it('indexe les pages dans l’ordre et somme toutes les lignes', () => {
    const layout = layoutFor(90);
    const rapport = validateLayout(makeDef(), layout);
    rapport.pages.forEach((p, i) => expect(p.pageIndex).toBe(i));
    const total = rapport.pages.reduce((s, p) => s + p.rowCount, 0);
    expect(total).toBe(90);
  });

  it('ne signale pas de débordement sur un layout choisi par le moteur', () => {
    const rapport = validateLayout(makeDef(), layoutFor(200));
    expect(rapport.hasClippedContent).toBe(false);
  });

  it('ne signale pas de dernière page quasi vide sur un document mono-page', () => {
    const rapport = validateLayout(makeDef(), layoutFor(5));
    expect(rapport.hasNearlyEmptyLastPage).toBe(false);
  });

  it('signale une police en dessous du plancher de lisibilité', () => {
    const layout = layoutFor(40);
    const casse: LayoutResult = {
      ...layout,
      candidate: { ...layout.candidate, fonts: { ...layout.candidate.fonts, body: 4 } },
    };
    const rapport = validateLayout(makeDef(), casse);
    expect(rapport.fontBelowMinimum).toBe(true);
    expect(rapport.ok).toBe(false);
    expect(rapport.anomalies.join(' ')).toContain('Police du corps trop petite');
  });

  it('signale un en-tête occupant plus de 25 % de la hauteur de page', () => {
    const layout = layoutFor(40);
    const casse: LayoutResult = {
      ...layout,
      candidate: { ...layout.candidate, margins: { ...layout.candidate.margins, top: 200 } },
    };
    expect(validateLayout(makeDef(), casse).headerTooTall).toBe(true);
  });

  it('signale des caractères corrompus dans le titre', () => {
    const rapport = validateLayout(makeDef({ title: 'Bilan�' }), layoutFor(40));
    expect(rapport.hasCorruptedChars).toBe(true);
  });
});

// ─── pickNextCandidate ───────────────────────────────────────────────────────
describe('pickNextCandidate', () => {
  it('avance d’un cran tant qu’il reste des candidats', () => {
    expect(pickNextCandidate(0, 5)).toBe(1);
    expect(pickNextCandidate(3, 5)).toBe(4);
  });

  it('renvoie null une fois la liste épuisée', () => {
    expect(pickNextCandidate(4, 5)).toBe(null);
    expect(pickNextCandidate(99, 5)).toBe(null);
  });

  it('renvoie null pour une liste vide ou des entrées non finies', () => {
    expect(pickNextCandidate(0, 0)).toBe(null);
    expect(pickNextCandidate(Number.NaN, 5)).toBe(null);
    expect(pickNextCandidate(0, Number.POSITIVE_INFINITY)).toBe(null);
  });
});

// ─── cellText ────────────────────────────────────────────────────────────────
describe('cellText', () => {
  const col: ColumnDef = { key: 'montant', label: 'Montant', type: 'amount' };

  it('convertit une valeur simple en chaîne', () => {
    expect(cellText({ montant: 25000 }, col)).toBe('25000');
  });

  it('remplace null / undefined / clé absente par un tiret cadratin', () => {
    expect(cellText({ montant: null }, col)).toBe('—');
    expect(cellText({ montant: undefined }, col)).toBe('—');
    expect(cellText({}, col)).toBe('—');
  });

  it('résout un chemin imbriqué « a.b »', () => {
    const nested: ColumnDef = { key: 'membre.nom', label: 'Nom', type: 'name' };
    expect(cellText({ membre: { nom: 'Kouassi' } }, nested)).toBe('Kouassi');
    expect(cellText({ membre: null }, nested)).toBe('—');
  });

  it('applique le formateur personnalisé et tolère son retour vide', () => {
    const fmt: ColumnDef = { key: 'montant', label: 'M', type: 'amount', format: (v) => `${v} F` };
    expect(cellText({ montant: 100 }, fmt)).toBe('100 F');
    const vide: ColumnDef = { key: 'montant', label: 'M', type: 'amount', format: () => null as never };
    expect(cellText({ montant: 100 }, vide)).toBe('');
  });
});

// ─── text-measure ────────────────────────────────────────────────────────────
describe('createMeasurer', () => {
  const m = createMeasurer(new jsPDF({ unit: 'mm', format: 'a4' }));

  it('mesure une largeur strictement positive et croissante', () => {
    expect(m.width('A', 9)).toBeGreaterThan(0);
    expect(m.width('AAAA', 9)).toBeGreaterThan(m.width('AA', 9));
  });

  it('renvoie 0 pour une chaîne vide', () => {
    expect(m.width('', 9)).toBe(0);
  });

  it('une police plus grande produit une largeur plus grande', () => {
    expect(m.width('ANOUANZÊ', 14)).toBeGreaterThan(m.width('ANOUANZÊ', 8));
  });

  it('wrap : un texte court tient sur une seule ligne', () => {
    expect(m.wrap('Cotisation', 60, 9)).toEqual(['Cotisation']);
  });

  it('wrap : un texte long est découpé en plusieurs lignes', () => {
    const lignes = m.wrap(
      "Règlement de la cotisation annuelle des membres de l'association ANOUANZÊ",
      30,
      8.5,
    );
    expect(lignes.length).toBeGreaterThan(1);
    for (const l of lignes) expect(l.length).toBeGreaterThan(0);
  });

  it('wrap : un mot plus long que la colonne est coupé, pas perdu', () => {
    const lignes = m.wrap('Anticonstitutionnellementement', 12, 8.5);
    expect(lignes.length).toBeGreaterThan(1);
  });

  it('wrap : chaîne vide → une ligne vide', () => {
    expect(m.wrap('', 30, 9)).toEqual(['']);
  });

  it('percentile : bornes et valeurs médianes', () => {
    const v = [10, 20, 30, 40, 50];
    expect(m.percentile([], 90)).toBe(0);
    expect(m.percentile(v, 100)).toBe(50);
    expect(m.percentile(v, 0)).toBe(10);
    expect(m.percentile(v, 50)).toBeGreaterThanOrEqual(20);
    expect(m.percentile(v, 50)).toBeLessThanOrEqual(30);
  });

  it('percentile : ne modifie pas le tableau source', () => {
    const v = [50, 10, 30];
    m.percentile(v, 90);
    expect(v).toEqual([50, 10, 30]);
  });
});

// ─── column-rules ────────────────────────────────────────────────────────────
describe('column-rules', () => {
  it('chaque règle a min < max et un flex positif', () => {
    for (const [type, r] of Object.entries(COLUMN_RULES)) {
      expect(r.min, type).toBeGreaterThan(0);
      expect(r.max, type).toBeGreaterThan(r.min);
      expect(r.flex, type).toBeGreaterThan(0);
    }
  });

  it('abbreviate remplace les libellés connus, insensible à la casse', () => {
    expect(abbreviate('Téléphone')).toBe('Tél.');
    expect(abbreviate('  QUANTITÉ  ')).toBe('Qté');
  });

  it('abbreviate laisse intact un libellé inconnu', () => {
    expect(abbreviate('Solde disponible')).toBe('Solde disponible');
  });

  it('effectivePriority : override module > défaut du type', () => {
    expect(effectivePriority('optional', 'name')).toBe('optional');
    expect(effectivePriority(undefined, 'name')).toBe(COLUMN_RULES.name.defaultPriority);
  });

  it('l’ordre de sacrifice va du moins au plus essentiel', () => {
    expect(PRIORITY_ORDER[0]).toBe('optional');
    expect(PRIORITY_ORDER[PRIORITY_ORDER.length - 1]).toBe('essential');
  });
});
