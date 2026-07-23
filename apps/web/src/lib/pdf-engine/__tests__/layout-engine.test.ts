/**
 * ============================================================================
 * TESTS DU MOTEUR DE MISE EN PAGE (section 42 du cahier des charges)
 * ----------------------------------------------------------------------------
 * RUNNER : Vitest (`cd apps/web && npm test`). Le micro-harnais maison qui
 * imitait l'API Vitest a été remplacé par de vrais imports `vitest`.
 * jsPDF mesure les textes via ses métriques AFM intégrées — fonctionne en Node
 * pur, sans DOM ni canvas (environnement `node` dans vitest.config.ts).
 * ============================================================================
 */
import { describe, it, expect } from 'vitest';
import jsPDF from 'jspdf';
import {
  selectBestDocumentLayout,
  analyzeColumns,
  balanceLastPages,
  pageDimensions,
} from '../layout-engine';
import { createMeasurer } from '../text-measure';
import { COLUMN_RULES } from '../column-rules';
import { FONT_BOUNDS } from '../types';
import type { ColumnDef, ColumnType, DocumentExportDefinition } from '../types';
import { ANOUANZE_BRANDING } from '../export-definitions';

// ─────────────────────────────────────────────────────────────────────────────
// Fabriques de données de test (jeux paramétrés)
// ─────────────────────────────────────────────────────────────────────────────
const FIRST = ['Kouamé', "N'Guessan", 'Aya', 'Konan', 'Adjoua', 'Yao', 'Affoué', 'Brou'];
const LAST = ['Koffi', "N'Dri", 'Kouassi', 'Tanoh', "D'Aké", 'Gnagne', 'Assamoi'];
const LONG = [
  "Règlement de la cotisation annuelle des membres de l'association ANOUANZÊ",
  "Achat de fournitures de bureau et matériel informatique pour le siège",
  'Virement bancaire — subvention d’exploitation reçue du partenaire',
];

function valueFor(type: ColumnType, i: number): unknown {
  switch (type) {
    case 'id': return i + 1;
    case 'reference': return `M-${String(i + 1).padStart(4, '0')}`;
    case 'code': return `CPT-${100 + i}`;
    case 'short-code': return ['ACH', 'VTE', 'BQ', 'OD'][i % 4];
    case 'name': return LAST[i % LAST.length];
    case 'firstname': return FIRST[i % FIRST.length];
    case 'email': return `${FIRST[i % FIRST.length].toLowerCase()}.${LAST[i % LAST.length].toLowerCase()}@ibigsoft.com`;
    case 'phone': return `+225 07 ${10 + (i % 80)} ${20 + (i % 70)} ${30 + (i % 60)}`;
    case 'date': return new Date(2024, i % 12, (i % 27) + 1).toISOString();
    case 'datetime': return new Date(2024, i % 12, (i % 27) + 1, 9, 30).toISOString();
    case 'amount': return (i + 1) * 12500;
    case 'percent': return (i % 100);
    case 'status': return ['Actif', 'Suspendu', 'Radié'][i % 3];
    case 'boolean':
    case 'boolean-short': return i % 2 === 0;
    case 'short-description': return ['Cotisation', 'Don', 'Frais', 'Subvention'][i % 4];
    case 'long-description':
    case 'free-text': return LONG[i % LONG.length];
    case 'list': return 'Adhérent, Bénévole, Donateur';
    default: return `val-${i}`;
  }
}

function makeColumns(types: ColumnType[]): ColumnDef[] {
  return types.map((type, k) => ({
    key: `c${k}`,
    label: `${type} ${k}`,
    type,
  }));
}

function makeRows(columns: ColumnDef[], n: number): Record<string, unknown>[] {
  return Array.from({ length: n }, (_, i) => {
    const row: Record<string, unknown> = {};
    columns.forEach((c) => { row[c.key] = valueFor(c.type, i); });
    return row;
  });
}

function makeDef(columns: ColumnDef[]): DocumentExportDefinition {
  return {
    title: 'Rapport de test',
    documentType: 'data-list',
    columns,
    branding: ANOUANZE_BRANDING,
    lang: 'fr',
  };
}

function newDoc(): jsPDF {
  return new jsPDF({ unit: 'mm', format: 'a4' });
}

const ROW_COUNTS = [1, 5, 10, 12, 25, 50, 500];
const COL_SETS: Record<string, ColumnType[]> = {
  '4-cols-courtes': ['reference', 'name', 'status', 'date'],
  '8-cols-mixtes': ['reference', 'name', 'firstname', 'email', 'phone', 'status', 'date', 'amount'],
  '15-cols-larges': [
    'reference', 'name', 'firstname', 'email', 'phone', 'date', 'datetime',
    'amount', 'amount', 'percent', 'status', 'code', 'long-description', 'list', 'short-description',
  ],
};

// Ensemble « large » à dominante non-wrappable : le moteur ne peut pas compresser
// ces colonnes, il doit donc basculer en paysage.
const WIDE_NOWRAP: ColumnType[] = [
  'reference', 'name', 'firstname', 'email', 'phone', 'status',
  'date', 'amount', 'short-description', 'amount', 'date', 'status',
];

// ─────────────────────────────────────────────────────────────────────────────
// Invariants transverses (tous les jeux de données)
// ─────────────────────────────────────────────────────────────────────────────
describe('Invariants de mise en page (tous jeux)', () => {
  for (const [setName, types] of Object.entries(COL_SETS)) {
    for (const n of ROW_COUNTS) {
      const columns = makeColumns(types);
      const def = makeDef(columns);
      const rows = makeRows(columns, n);

      it(`[${setName} × ${n} lignes] aucune largeur < min du type`, () => {
        const { candidate } = selectBestDocumentLayout(newDoc(), def, rows);
        candidate.columnWidths.forEach((w, i) => {
          const rule = COLUMN_RULES[columns[i].type];
          // tolérance 0.5 mm (arrondis de distribution/compression)
          expect(w).toBeGreaterThanOrEqual(rule.min - 0.5);
        });
      });

      it(`[${setName} × ${n} lignes] somme largeurs ≤ largeur utile (si compact tient)`, () => {
        const { candidate, analysis } = selectBestDocumentLayout(newDoc(), def, rows);
        const usableW = candidate.page.width - candidate.margins.left - candidate.margins.right;
        const total = candidate.columnWidths.reduce((a, b) => a + b, 0);
        // Le moteur ne garantit le non-débordement que si la somme des largeurs
        // mini (compact) tient dans la page choisie. Au-delà, le passage des
        // colonnes en annexe n'est pas encore implémenté → débordement toléré.
        if (analysis.estimatedCompactWidth <= usableW) {
          expect(total).toBeLessThanOrEqual(usableW + 1); // tolérance 1 mm
        }
      });

      it(`[${setName} × ${n} lignes] police body ≥ plancher lisibilité`, () => {
        const { candidate } = selectBestDocumentLayout(newDoc(), def, rows);
        expect(candidate.fonts.body).toBeGreaterThanOrEqual(FONT_BOUNDS.body.min);
        expect(candidate.fonts.body).toBeGreaterThanOrEqual(7.5);
      });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Occupation de la largeur
// ─────────────────────────────────────────────────────────────────────────────
describe('Occupation de la largeur utile', () => {
  it('≥ 0.85 dès qu’il y a assez de contenu (8 colonnes × 50 lignes)', () => {
    const columns = makeColumns(COL_SETS['8-cols-mixtes']);
    const def = makeDef(columns);
    const rows = makeRows(columns, 50);
    const { score } = selectBestDocumentLayout(newDoc(), def, rows);
    expect(score.widthUtilization).toBeGreaterThanOrEqual(0.85);
  });

  it('≥ 0.85 pour 15 colonnes larges × 100 lignes', () => {
    const columns = makeColumns(COL_SETS['15-cols-larges']);
    const def = makeDef(columns);
    const rows = makeRows(columns, 100);
    const { score } = selectBestDocumentLayout(newDoc(), def, rows);
    expect(score.widthUtilization).toBeGreaterThanOrEqual(0.85);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Orientation pilotée par le contenu
// ─────────────────────────────────────────────────────────────────────────────
describe('Orientation choisie par le contenu', () => {
  it('4 colonnes courtes → portrait', () => {
    const columns = makeColumns(COL_SETS['4-cols-courtes']);
    const def = makeDef(columns);
    const rows = makeRows(columns, 30);
    const { candidate } = selectBestDocumentLayout(newDoc(), def, rows);
    expect(candidate.page.orientation).toBe('portrait');
  });

  it('12 colonnes larges non-wrappables → paysage', () => {
    const columns = makeColumns(WIDE_NOWRAP);
    const def = makeDef(columns);
    const rows = makeRows(columns, 40);
    const { candidate } = selectBestDocumentLayout(newDoc(), def, rows);
    expect(candidate.page.orientation).toBe('landscape');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pagination : pas de dernière page quasi vide (fonction pure exportée)
// ─────────────────────────────────────────────────────────────────────────────
describe('Équilibrage de la dernière page', () => {
  it('une dernière page à 1 ligne (< 20% capacité) est rééquilibrée', () => {
    // 41 lignes de 6 mm sur une page utile de 240 mm → ~40 par page, 1 orpheline.
    const heights = Array.from({ length: 41 }, () => 6);
    const balanced = balanceLastPages([40, 1], heights, 240);
    const last = balanced[balanced.length - 1];
    // la ligne orpheline a été fusionnée puis répartie : dernière page ≥ 3 lignes.
    expect(last).toBeGreaterThanOrEqual(3);
  });

  it('une pagination déjà équilibrée est laissée intacte', () => {
    const heights = Array.from({ length: 60 }, () => 6);
    const balanced = balanceLastPages([30, 30], heights, 240);
    expect(balanced[0]).toBe(30);
    expect(balanced[1]).toBe(30);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Valeurs courtes / longues / accents / apostrophes (robustesse mesure)
// ─────────────────────────────────────────────────────────────────────────────
describe('Robustesse : accents, apostrophes, contenus longs', () => {
  it('analyse sans crash et largeurs positives (accents & apostrophes)', () => {
    const columns = makeColumns(['name', 'firstname', 'long-description', 'amount']);
    const def = makeDef(columns);
    const rows = makeRows(columns, 12); // contient Kouamé, N'Guessan, d’Ivoire…
    const m = createMeasurer(newDoc());
    const analysis = analyzeColumns(def, rows, m, 9, 8.5);
    expect(analysis.columnCount).toBe(4);
    analysis.columns.forEach((c) => {
      expect(c.naturalWidth).toBeGreaterThan(0);
      expect(c.minWidth).toBeGreaterThanOrEqual(COLUMN_RULES[c.def.type].min - 0.001);
    });
  });

  it('un seul enregistrement produit une page unique', () => {
    const columns = makeColumns(COL_SETS['4-cols-courtes']);
    const def = makeDef(columns);
    const { candidate } = selectBestDocumentLayout(newDoc(), def, makeRows(columns, 1));
    expect(candidate.pageCount).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Dimensions de page (fonction pure)
// ─────────────────────────────────────────────────────────────────────────────
describe('pageDimensions', () => {
  it('A4 portrait = 210 × 297', () => {
    const p = pageDimensions('a4', 'portrait');
    expect(p.width).toBe(210);
    expect(p.height).toBe(297);
  });
  it('A4 paysage inverse largeur/hauteur', () => {
    const p = pageDimensions('a4', 'landscape');
    expect(p.width).toBe(297);
    expect(p.height).toBe(210);
  });
});

