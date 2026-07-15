/**
 * Moteur central de sélection de mise en page (sections 3, 6, 8-10, 14-16, 33).
 * selectBestDocumentLayout() teste plusieurs candidats et renvoie le meilleur.
 */
import type { jsPDF } from 'jspdf';
import type {
  DocumentExportDefinition, ColumnDef, DocumentLayoutAnalysis, ColumnAnalysis,
  LayoutCandidate, LayoutResult, LayoutScoreBreakdown, PageDimensions, Margins,
  FontSizes, Orientation, PageFormatName,
} from './types';
import { WIDTH_UTIL_TARGET } from './types';
import { COLUMN_RULES, effectivePriority, PRIORITY_ORDER } from './column-rules';
import { createMeasurer, TextMeasurer } from './text-measure';

// Dimensions physiques (mm)
const PAGE_SIZES: Record<PageFormatName, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  a3: { w: 297, h: 420 },
  letter: { w: 215.9, h: 279.4 },
  legal: { w: 215.9, h: 355.6 },
};

export function pageDimensions(name: PageFormatName, orientation: Orientation): PageDimensions {
  const { w, h } = PAGE_SIZES[name];
  return {
    name, orientation,
    width: orientation === 'portrait' ? w : h,
    height: orientation === 'portrait' ? h : w,
  };
}

const MARGINS = {
  normalPortrait: { top: 34, right: 15, bottom: 14, left: 15 },
  compactPortrait: { top: 30, right: 10, bottom: 12, left: 10 },
  normalLandscape: { top: 32, right: 13, bottom: 12, left: 13 },
  compactLandscape: { top: 28, right: 9, bottom: 10, left: 9 },
} as const;

const CELL_PAD_X = 2;   // mm padding horizontal par cellule
const CELL_PAD_Y = 1.6; // mm padding vertical

// ─── Précomposition : analyse des colonnes (mesure réelle) ───────────────────
export function analyzeColumns(
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
  m: TextMeasurer,
  headFont: number,
  bodyFont: number,
): DocumentLayoutAnalysis {
  const sample = rows.slice(0, 400); // échantillon borné pour la mesure
  const columns: ColumnAnalysis[] = def.columns.map((col) => {
    const rule = COLUMN_RULES[col.type];
    const headerWidth = m.width(col.label, headFont, true) + CELL_PAD_X * 2;
    const values = sample.map((r) => cellText(r, col));
    const widths = values.map((v) => m.width(v, bodyFont) + CELL_PAD_X * 2);
    const charCounts = values.map((v) => v.length);
    const p90 = m.percentile(widths, 90);
    const p95 = m.percentile(widths, 95);
    const minMetier = col.minWidth ?? rule.min;
    const maxMetier = col.maxWidth ?? rule.max;
    const natural = Math.min(maxMetier, Math.max(headerWidth, p95, minMetier));
    return {
      def: col,
      headerWidth,
      avgCharCount: charCounts.length ? charCounts.reduce((a, b) => a + b, 0) / charCounts.length : 0,
      maxCharCount: charCounts.length ? Math.max(...charCounts) : 0,
      p90Width: p90,
      p95Width: p95,
      naturalWidth: natural,
      minWidth: Math.max(minMetier, Math.min(headerWidth, maxMetier)),
      maxWidth: maxMetier,
      flex: col.flex ?? rule.flex,
      hasLongWords: values.some((v) => v.split(/\s+/).some((w) => m.width(w, bodyFont) > minMetier)),
      wrappable: !(col.nowrap ?? rule.nowrap),
    };
  });

  return {
    rowCount: rows.length,
    columnCount: def.columns.length,
    columns,
    estimatedNaturalWidth: columns.reduce((s, c) => s + c.naturalWidth, 0),
    estimatedCompactWidth: columns.reduce((s, c) => s + c.minWidth, 0),
  };
}

export function cellText(row: Record<string, unknown>, col: ColumnDef): string {
  const raw = col.key.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as any)[k] : undefined), row);
  if (col.format) return col.format(raw, row) ?? '';
  if (raw === null || raw === undefined) return '—';
  return String(raw);
}

// ─── Distribution d'espace (sections 8-9) ────────────────────────────────────
function distributeWidths(cols: ColumnAnalysis[], usable: number): number[] {
  // 1. part des largeurs mini
  const widths = cols.map((c) => c.minWidth);
  let total = widths.reduce((a, b) => a + b, 0);

  // 2. distribuer l'espace restant proportionnellement au flex (borné par max)
  let remaining = usable - total;
  if (remaining > 0) {
    for (let guard = 0; guard < 6 && remaining > 0.5; guard++) {
      const growable = cols.map((c, i) => (widths[i] < c.maxWidth ? c.flex : 0));
      const flexSum = growable.reduce((a, b) => a + b, 0);
      if (flexSum <= 0) break;
      let distributed = 0;
      cols.forEach((c, i) => {
        if (growable[i] <= 0) return;
        const add = Math.min((remaining * growable[i]) / flexSum, c.maxWidth - widths[i]);
        widths[i] += add;
        distributed += add;
      });
      remaining -= distributed;
      if (distributed < 0.5) break;
    }
  } else if (remaining < 0) {
    // 3. compression douce des colonnes wrappables au-dessus de leur mini
    let over = -remaining;
    for (let guard = 0; guard < 6 && over > 0.5; guard++) {
      const shrinkable = cols.map((c, i) => (c.wrappable && widths[i] > c.minWidth ? widths[i] - c.minWidth : 0));
      const shrinkSum = shrinkable.reduce((a, b) => a + b, 0);
      if (shrinkSum <= 0) break;
      let removed = 0;
      cols.forEach((_, i) => {
        if (shrinkable[i] <= 0) return;
        const cut = Math.min((over * shrinkable[i]) / shrinkSum, shrinkable[i]);
        widths[i] -= cut;
        removed += cut;
      });
      over -= removed;
    }
  }
  return widths;
}

// ─── Hauteurs de lignes réelles (section 13) ─────────────────────────────────
function computeRowHeights(
  cols: ColumnAnalysis[], widths: number[], rows: Record<string, unknown>[],
  m: TextMeasurer, bodyFont: number,
): number[] {
  const lineH = bodyFont * 0.3528 * 1.15; // pt→mm * interligne
  const minH = lineH + CELL_PAD_Y * 2;
  return rows.map((row) => {
    let maxLines = 1;
    cols.forEach((c, i) => {
      if (!c.wrappable) return;
      const txt = cellText(row, c.def);
      const lines = m.wrap(txt, widths[i] - CELL_PAD_X * 2, bodyFont);
      if (lines.length > maxLines) maxLines = Math.min(lines.length, 4);
    });
    return Math.max(minH, maxLines * lineH + CELL_PAD_Y * 2);
  });
}

// ─── Pagination équilibrée (sections 14-16) ──────────────────────────────────
function paginate(rowHeights: number[], usableHeight: number, contHeaderH: number): number[] {
  const pages: number[] = [];
  let i = 0;
  while (i < rowHeights.length) {
    const avail = pages.length === 0 ? usableHeight : usableHeight + 0; // 1re page a déjà le grand header retiré via usableHeight
    let h = 0, count = 0;
    while (i < rowHeights.length && h + rowHeights[i] <= avail) {
      h += rowHeights[i]; i++; count++;
    }
    if (count === 0) { count = 1; i++; } // garde-fou ligne géante
    pages.push(count);
  }
  return balanceLastPages(pages, rowHeights, usableHeight);
}

export function balanceLastPages(pages: number[], rowHeights: number[], usableHeight: number): number[] {
  if (pages.length < 2) return pages;
  const last = pages[pages.length - 1];
  const capacity = Math.max(1, Math.round(usableHeight / (avg(rowHeights) || 1)));
  // dernière page < 20% de capacité → rééquilibrer avec l'avant-dernière
  if (last / capacity < 0.2) {
    const merged = pages[pages.length - 2] + last;
    const half = Math.ceil(merged / 2);
    pages[pages.length - 2] = half;
    pages[pages.length - 1] = merged - half;
  }
  return pages;
}

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

// ─── Génération d'un candidat ────────────────────────────────────────────────
function buildCandidate(
  def: DocumentExportDefinition, rows: Record<string, unknown>[], m: TextMeasurer,
  page: PageDimensions, margins: Margins, fonts: FontSizes, firstHeaderH: number, contHeaderH: number,
): LayoutCandidate {
  const analysis = analyzeColumns(def, rows, m, fonts.tableHead, fonts.body);
  const usableW = page.width - margins.left - margins.right;
  const widths = distributeWidths(analysis.columns, usableW);
  const rowHeights = computeRowHeights(analysis.columns, widths, rows, m, fonts.body);
  const usableH = page.height - margins.top - margins.bottom - firstHeaderH;
  const rowsPerPage = paginate(rowHeights, usableH, contHeaderH);
  return {
    page, margins, fonts,
    columnWidths: widths,
    visibleColumns: def.columns,
    annexColumns: [],
    rowHeights,
    rowsPerPage,
    pageCount: rowsPerPage.length,
    render: 'table',
  };
}

// ─── Scoring (section 33) ────────────────────────────────────────────────────
function scoreCandidate(c: LayoutCandidate, a: DocumentLayoutAnalysis): LayoutScoreBreakdown {
  const usableW = c.page.width - c.margins.left - c.margins.right;
  const tableW = c.columnWidths.reduce((x, y) => x + y, 0);
  const widthUtil = Math.min(1, tableW / usableW);
  const usableH = c.page.height - c.margins.top - c.margins.bottom;
  const fills = c.rowsPerPage.map((n, pi) => {
    let h = 0, start = c.rowsPerPage.slice(0, pi).reduce((x, y) => x + y, 0);
    for (let k = 0; k < n; k++) h += c.rowHeights[start + k] ?? 0;
    return Math.min(1, h / usableH);
  });
  const pageFill = avg(fills);
  const lastFill = fills[fills.length - 1] ?? 1;
  const wrapCount = c.rowHeights.filter((h) => h > (c.fonts.body * 0.3528 * 1.15 + CELL_PAD_Y * 2) * 1.5).length;
  const excessiveWrapping = wrapCount / Math.max(1, c.rowHeights.length);
  const readability = Math.min(1, c.fonts.body / 9);
  const nearlyEmptyLast = c.pageCount > 1 && lastFill < 0.2 ? 1 : 0;
  const total =
    30 * readability +
    25 * widthUtil +
    20 * pageFill -
    15 * excessiveWrapping -
    20 * nearlyEmptyLast -
    (widthUtil < 0.6 ? 15 : 0);
  return {
    readability, widthUtilization: widthUtil, pageFillRatio: pageFill,
    excessiveWrapping, nearlyEmptyLastPage: nearlyEmptyLast,
    clippedContent: 0, unreadableFont: c.fonts.body < 7.5 ? 1 : 0,
    corruptedCharacters: 0, total,
  };
}

// ─── Sélecteur principal ─────────────────────────────────────────────────────
export interface CandidateSpec {
  format: PageFormatName;
  orientation: Orientation;
  margins: Margins;
  fonts: FontSizes;
  firstHeaderH: number;
  contHeaderH: number;
}

const BASE_FONTS: FontSizes = { title: 16, subtitle: 9.5, tableHead: 9, body: 8.5, footer: 7 };
const COMPACT_FONTS: FontSizes = { title: 15, subtitle: 9, tableHead: 8, body: 7.8, footer: 6.5 };

export function defaultCandidates(): CandidateSpec[] {
  return [
    { format: 'a4', orientation: 'portrait',  margins: MARGINS.normalPortrait,   fonts: BASE_FONTS,    firstHeaderH: 8, contHeaderH: 0 },
    { format: 'a4', orientation: 'portrait',  margins: MARGINS.compactPortrait,  fonts: COMPACT_FONTS, firstHeaderH: 6, contHeaderH: 0 },
    { format: 'a4', orientation: 'landscape', margins: MARGINS.normalLandscape,  fonts: BASE_FONTS,    firstHeaderH: 8, contHeaderH: 0 },
    { format: 'a4', orientation: 'landscape', margins: MARGINS.compactLandscape, fonts: COMPACT_FONTS, firstHeaderH: 6, contHeaderH: 0 },
    { format: 'a3', orientation: 'landscape', margins: MARGINS.normalLandscape,  fonts: BASE_FONTS,    firstHeaderH: 8, contHeaderH: 0 },
  ];
}

/** Classe TOUS les candidats du meilleur au moins bon (pour la re-composition). */
export function rankDocumentLayouts(
  doc: jsPDF,
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
): LayoutResult[] {
  const m = createMeasurer(doc);
  let specs = defaultCandidates();

  // respect d'une préférence explicite (section 37) sans casser l'auto
  if (def.preferredOrientation && def.preferredOrientation !== 'auto') {
    specs = specs.filter((s) => s.orientation === def.preferredOrientation);
  }
  if (def.preferredFormat && def.preferredFormat !== 'auto') {
    specs = specs.filter((s) => s.format === def.preferredFormat);
  }
  if (specs.length === 0) specs = defaultCandidates();

  const results: LayoutResult[] = specs.map((spec) => {
    const page = pageDimensions(spec.format, spec.orientation);
    const cand = buildCandidate(def, rows, m, page, spec.margins, spec.fonts, spec.firstHeaderH, spec.contHeaderH);
    const analysis = analyzeColumns(def, rows, m, spec.fonts.tableHead, spec.fonts.body);
    const score = scoreCandidate(cand, analysis);
    return { candidate: cand, analysis, score };
  });

  return results.sort((a, b) => b.score.total - a.score.total);
}

export function selectBestDocumentLayout(
  doc: jsPDF,
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
): LayoutResult {
  return rankDocumentLayouts(doc, def, rows)[0];
}
