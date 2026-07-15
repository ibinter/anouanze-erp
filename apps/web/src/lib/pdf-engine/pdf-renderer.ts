/**
 * ============================================================================
 * MOTEUR DE RENDU PDF — IBIG SOFT (sections 17-19, 29, 32)
 * ----------------------------------------------------------------------------
 * Consomme un LayoutResult DÉJÀ calculé par le layout-engine et dessine le
 * document avec jsPDF. Ne recompose JAMAIS la pagination : rowsPerPage,
 * rowHeights et columnWidths sont respectés tels quels (anti-coupures §19).
 *
 * Unité : millimètres (le doc est créé par l'appelant en unit:'mm').
 * ============================================================================
 */
import type { jsPDF } from 'jspdf';
import type { DocumentExportDefinition, LayoutResult, ColumnDef, ColumnAlign } from './types';
import { cellText } from './layout-engine';
import { createMeasurer, TextMeasurer } from './text-measure';
import { COLUMN_RULES } from './column-rules';

// ─── Police injectable (police embarquée du module) ──────────────────────────
export interface FontHandle {
  family: string;
  apply(doc: jsPDF, opts?: { bold?: boolean }): void;
}

/**
 * Le LayoutResult ne transporte pas les données sources (par conception :
 * l'intégrité et le scoring ne travaillent que sur les métriques). Le rendu, lui,
 * a besoin des lignes. L'appelant les rattache donc au layout via ce type.
 * `withRows()` fournit ce rattachement de façon typée.
 */
export interface RenderableLayout extends LayoutResult {
  rows: Record<string, unknown>[];
}

/** Rattache les lignes sources au layout pour le rendu. */
export function withRows(layout: LayoutResult, rows: Record<string, unknown>[]): RenderableLayout {
  return { ...layout, rows };
}

// ─── Constantes visuelles (alignées sur le layout-engine) ────────────────────
type RGB = [number, number, number];

const CELL_PAD_X = 2;     // mm — identique au layout-engine
const CELL_PAD_Y = 1.6;   // mm
const MM_PER_PT = 0.3528; // 1 pt → mm
const LINE_FACTOR = 1.15; // interligne
const MAX_WRAP_LINES = 4; // plafond identique au calcul des hauteurs

const WHITE: RGB = [255, 255, 255];
const ALT_ROW: RGB = [240, 250, 244];   // #F0FAF4 lignes alternées
const BORDER: RGB = [214, 220, 216];    // filet léger
const BODY_INK: RGB = [33, 37, 41];     // texte principal
const META_INK: RGB = [236, 244, 239];  // texte clair sur bande couleur
const FOOTER_INK: RGB = [140, 148, 143];

const lineHeight = (fontSize: number): number => fontSize * MM_PER_PT * LINE_FACTOR;

// ─── Statuts : pastille colorée (jamais d'emoji, §22) ────────────────────────
interface PillTheme { bg: RGB; fg: RGB; }

function statusTheme(text: string): PillTheme {
  const t = text.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));
  if (has('actif', 'valid', 'payé', 'paye', 'approuv', 'terminé', 'termine', 'succès', 'succes', 'ok', 'oui', 'confirm', 'complet', 'signé', 'signe', 'présent', 'present'))
    return { bg: [222, 242, 229], fg: [20, 108, 67] };   // vert
  if (has('attente', 'en cours', 'brouillon', 'partiel', 'pending', 'traitement', 'soumis', 'à venir', 'a venir', 'planifi'))
    return { bg: [253, 240, 220], fg: [176, 108, 22] };  // ambre (accent orange)
  if (has('annul', 'rejet', 'refus', 'impay', 'échou', 'echou', 'expir', 'erreur', 'non', 'inactif', 'suspendu', 'bloqué', 'bloque', 'absent', 'supprim'))
    return { bg: [251, 230, 230], fg: [176, 44, 44] };   // rouge
  return { bg: [237, 240, 238], fg: [92, 100, 95] };     // neutre
}

// ─── Helpers couleur ─────────────────────────────────────────────────────────
const fill = (doc: jsPDF, c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
const ink = (doc: jsPDF, c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
const stroke = (doc: jsPDF, c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

function columnAlign(col: ColumnDef): ColumnAlign {
  return col.align ?? COLUMN_RULES[col.type].align;
}

function isNowrap(col: ColumnDef): boolean {
  return col.nowrap ?? COLUMN_RULES[col.type].nowrap;
}

/** Tronque avec ellipsis pour tenir dans maxW (mesure police du layout). */
function ellipsize(m: TextMeasurer, text: string, maxW: number, size: number, bold = false): string {
  if (maxW <= 0) return '';
  if (m.width(text, size, bold) <= maxW) return text;
  let s = text;
  while (s.length > 1 && m.width(s + '…', size, bold) > maxW) s = s.slice(0, -1);
  return s + '…';
}

// ─── Contexte de rendu partagé ───────────────────────────────────────────────
interface Ctx {
  doc: jsPDF;
  def: DocumentExportDefinition;
  layout: LayoutResult;
  font?: FontHandle;
  m: TextMeasurer;
  primary: RGB;
  accent: RGB;
  columns: ColumnDef[];
  colX: number[];         // bord gauche de chaque colonne (mm)
  widths: number[];
  tableW: number;
  headH: number;          // hauteur de la ligne d'en-tête de tableau
  pageCount: number;
  now: string;
}

/** Applique la police (embarquée si fournie, sinon helvetica). */
function useFont(ctx: Ctx, bold: boolean, size: number): void {
  if (ctx.font) ctx.font.apply(ctx.doc, { bold });
  else ctx.doc.setFont('helvetica', bold ? 'bold' : 'normal');
  ctx.doc.setFontSize(size);
}

/** Position X et alignement jsPDF selon l'alignement de colonne. */
function alignX(cx: number, w: number, align: ColumnAlign): { x: number; opt: 'left' | 'center' | 'right' } {
  if (align === 'right') return { x: cx + w - CELL_PAD_X, opt: 'right' };
  if (align === 'center') return { x: cx + w / 2, opt: 'center' };
  return { x: cx + CELL_PAD_X, opt: 'left' };
}

// ─── Header PREMIÈRE PAGE (§17A) ─────────────────────────────────────────────
function drawFirstHeader(ctx: Ctx): void {
  const { doc, def, layout } = ctx;
  const page = layout.candidate.page;
  const margins = layout.candidate.margins;
  const fonts = layout.candidate.fonts;
  const bandH = Math.max(24, margins.top - 4);

  // Bande couleur pleine largeur
  fill(doc, ctx.primary);
  doc.rect(0, 0, page.width, bandH, 'F');

  // Zone QR réservée en haut à droite (§32)
  let rightLimit = page.width - margins.right;
  if (def.qr) {
    const qs = Math.min(bandH - 8, 20);
    const qx = page.width - margins.right - qs;
    const qy = (bandH - qs) / 2;
    drawQrPlaceholder(ctx, qx, qy, qs);
    rightLimit = qx - 4;
  }

  // Logo (image embarquée) ou nom du logiciel en texte
  const branding = def.branding;
  const leftX = margins.left;
  let logoBottom = 7;
  const logoDrawn = branding.logoDataUrl
    ? tryDrawLogo(doc, branding.logoDataUrl, leftX, 5, bandH - 10)
    : false;
  if (logoDrawn) {
    logoBottom = bandH - 5;
  } else {
    // Nom logiciel : base blanche + accent coloré
    useFont(ctx, true, fonts.subtitle + 2);
    ink(doc, WHITE);
    const namePart = branding.softwareAccent && branding.softwareName.endsWith(branding.softwareAccent)
      ? branding.softwareName.slice(0, branding.softwareName.length - branding.softwareAccent.length).trimEnd()
      : branding.softwareName;
    doc.text(namePart, leftX, 7, { baseline: 'top' });
    if (branding.softwareAccent && namePart !== branding.softwareName) {
      const w = ctx.m.width(namePart + ' ', fonts.subtitle + 2, true);
      ink(doc, ctx.accent);
      doc.text(branding.softwareAccent, leftX + w, 7, { baseline: 'top' });
    }
    logoBottom = 7 + lineHeight(fonts.subtitle + 2);
  }

  // Titre + sous-titre (bloc gauche, sous le logo)
  let ty = logoBottom + 1.5;
  const titleMaxW = rightLimit - leftX;
  useFont(ctx, true, fonts.title);
  ink(doc, WHITE);
  doc.text(ellipsize(ctx.m, def.title, titleMaxW, fonts.title, true), leftX, ty, { baseline: 'top' });
  ty += lineHeight(fonts.title) + 0.5;
  if (def.subtitle) {
    useFont(ctx, false, fonts.subtitle);
    ink(doc, META_INK);
    doc.text(ellipsize(ctx.m, def.subtitle, titleMaxW, fonts.subtitle), leftX, ty, { baseline: 'top' });
  }

  // Bloc méta à droite (organisation / période / filtres / date) — aligné à droite
  const meta: string[] = [];
  if (def.organisation) meta.push(def.organisation);
  if (def.periode) meta.push(`Période : ${def.periode}`);
  if (def.filtersSummary) meta.push(def.filtersSummary);
  meta.push(`Généré le ${ctx.now}`);

  useFont(ctx, false, fonts.footer);
  ink(doc, META_INK);
  const step = lineHeight(fonts.footer) + 0.6;
  let my = 6;
  const metaMaxW = rightLimit - leftX - 40; // ne pas empiéter sur le titre
  for (const line of meta) {
    doc.text(ellipsize(ctx.m, line, Math.max(30, metaMaxW), fonts.footer), rightLimit, my, {
      baseline: 'top', align: 'right',
    });
    my += step;
  }
}

// ─── Header de CONTINUATION pages 2+ (§17B) — version compacte ───────────────
function drawContinuationHeader(ctx: Ctx, pageIndex: number): void {
  const { doc, def, layout } = ctx;
  const page = layout.candidate.page;
  const margins = layout.candidate.margins;
  const fonts = layout.candidate.fonts;
  const bandH = 13;

  fill(doc, ctx.primary);
  doc.rect(0, 0, page.width, bandH, 'F');

  // Petit logo / nom logiciel à gauche
  const leftX = margins.left;
  const cy = bandH / 2;
  useFont(ctx, true, fonts.subtitle);
  ink(doc, WHITE);
  doc.text(def.branding.softwareName, leftX, cy, { baseline: 'middle' });

  // Titre abrégé + « — Suite » au centre
  const suite = ctx.def.lang === 'en' ? ' — cont.' : ' — Suite';
  useFont(ctx, true, fonts.subtitle + 1);
  ink(doc, WHITE);
  const centerMax = page.width * 0.5;
  const titleTxt = ellipsize(ctx.m, def.title, centerMax, fonts.subtitle + 1, true) + suite;
  doc.text(titleTxt, page.width / 2, cy, { baseline: 'middle', align: 'center' });

  // Référence + pagination à droite
  useFont(ctx, false, fonts.footer);
  ink(doc, META_INK);
  const pageLbl = `Page ${pageIndex + 1} / ${ctx.pageCount}`;
  const ref = def.reference ? `${def.reference}   ` : '';
  doc.text(ref + pageLbl, page.width - margins.right, cy, { baseline: 'middle', align: 'right' });
}

// ─── En-tête de tableau répété (§18) ─────────────────────────────────────────
function drawTableHead(ctx: Ctx, top: number): void {
  const { doc, layout } = ctx;
  const fonts = layout.candidate.fonts;
  fill(doc, ctx.primary);
  doc.rect(ctx.colX[0], top, ctx.tableW, ctx.headH, 'F');

  useFont(ctx, true, fonts.tableHead);
  ink(doc, WHITE);
  const midY = top + ctx.headH / 2;
  ctx.columns.forEach((col, i) => {
    const w = ctx.widths[i];
    const label = col.abbrevLabel ?? col.label;
    const inner = w - CELL_PAD_X * 2;
    const txt = ellipsize(ctx.m, label, inner, fonts.tableHead, true);
    const { x, opt } = alignX(ctx.colX[i], w, columnAlign(col));
    doc.text(txt, x, midY, { baseline: 'middle', align: opt });
  });
}

// ─── Une ligne de données ────────────────────────────────────────────────────
function drawRow(ctx: Ctx, row: Record<string, unknown>, top: number, height: number, zebra: boolean): void {
  const { doc, layout } = ctx;
  const fonts = layout.candidate.fonts;

  if (zebra) {
    fill(doc, ALT_ROW);
    doc.rect(ctx.colX[0], top, ctx.tableW, height, 'F');
  }

  ctx.columns.forEach((col, i) => {
    const w = ctx.widths[i];
    const cx = ctx.colX[i];
    const align = columnAlign(col);
    const value = cellText(row, col);

    // Statut → pastille arrondie colorée
    if (col.type === 'status' && value && value !== '—') {
      drawStatusPill(ctx, value, cx, w, top, height, align);
      return;
    }

    const inner = w - CELL_PAD_X * 2;
    ink(doc, BODY_INK);
    useFont(ctx, false, fonts.body);

    if (isNowrap(col)) {
      // Une seule ligne, ellipsis, centrée verticalement
      const txt = ellipsize(ctx.m, value, inner, fonts.body);
      const { x, opt } = alignX(cx, w, align);
      doc.text(txt, x, top + height / 2, { baseline: 'middle', align: opt });
    } else {
      // Wrap multi-lignes (cohérent avec les hauteurs pré-calculées)
      let lines = ctx.m.wrap(value, inner, fonts.body);
      if (lines.length > MAX_WRAP_LINES) {
        lines = lines.slice(0, MAX_WRAP_LINES);
        lines[MAX_WRAP_LINES - 1] = ellipsize(ctx.m, lines[MAX_WRAP_LINES - 1] + '…', inner, fonts.body);
      }
      const lh = lineHeight(fonts.body);
      const { x, opt } = alignX(cx, w, align);
      if (lines.length === 1) {
        doc.text(lines[0], x, top + height / 2, { baseline: 'middle', align: opt });
      } else {
        let ly = top + CELL_PAD_Y;
        for (const line of lines) {
          doc.text(line, x, ly, { baseline: 'top', align: opt });
          ly += lh;
        }
      }
    }
  });

  // Filet horizontal bas de ligne
  stroke(doc, BORDER);
  doc.setLineWidth(0.1);
  doc.line(ctx.colX[0], top + height, ctx.colX[0] + ctx.tableW, top + height);
}

// ─── Pastille de statut ──────────────────────────────────────────────────────
function drawStatusPill(ctx: Ctx, text: string, cx: number, w: number, top: number, height: number, align: ColumnAlign): void {
  const { doc, layout } = ctx;
  const size = Math.min(layout.candidate.fonts.body, layout.candidate.fonts.tableHead);
  const theme = statusTheme(text);
  const inner = w - CELL_PAD_X * 2;
  const label = ellipsize(ctx.m, text, inner - 4, size);
  useFont(ctx, true, size);
  const textW = ctx.m.width(label, size, true);
  const padX = 2;
  const pillH = Math.min(height - 2, lineHeight(size) + 1.6);
  const pillW = Math.min(inner, textW + padX * 2);

  // position horizontale de la pilule selon alignement
  let px: number;
  if (align === 'right') px = cx + w - CELL_PAD_X - pillW;
  else if (align === 'center') px = cx + (w - pillW) / 2;
  else px = cx + CELL_PAD_X;
  const py = top + (height - pillH) / 2;

  fill(doc, theme.bg);
  doc.roundedRect(px, py, pillW, pillH, pillH / 2, pillH / 2, 'F');
  ink(doc, theme.fg);
  doc.text(label, px + pillW / 2, py + pillH / 2, { baseline: 'middle', align: 'center' });
}

// ─── Pied de page compact (§29) ──────────────────────────────────────────────
function drawFooter(ctx: Ctx, pageIndex: number): void {
  const { doc, def, layout } = ctx;
  const page = layout.candidate.page;
  const margins = layout.candidate.margins;
  const fonts = layout.candidate.fonts;
  const y = page.height - margins.bottom / 2 - 1;

  // Filet fin au-dessus du pied
  stroke(doc, BORDER);
  doc.setLineWidth(0.1);
  doc.line(margins.left, page.height - margins.bottom + 1, page.width - margins.right, page.height - margins.bottom + 1);

  useFont(ctx, false, fonts.footer);
  ink(doc, FOOTER_INK);

  // Gauche : URL + référence
  const leftParts: string[] = [];
  if (def.branding.footerUrl) leftParts.push(def.branding.footerUrl);
  if (def.reference) leftParts.push(def.reference);
  if (leftParts.length) doc.text(leftParts.join('  ·  '), margins.left, y, { baseline: 'middle' });

  // Centre : logiciel — société — Page X/Y
  const center = `${def.branding.softwareName} — ${def.branding.company} — Page ${pageIndex + 1} / ${ctx.pageCount}`;
  doc.text(center, page.width / 2, y, { baseline: 'middle', align: 'center' });

  // Droite : date
  doc.text(ctx.now, page.width - margins.right, y, { baseline: 'middle', align: 'right' });
}

// ─── QR : placeholder (zone réservée, taille contrôlée §32) ──────────────────
function drawQrPlaceholder(ctx: Ctx, x: number, y: number, size: number): void {
  const { doc, def } = ctx;
  fill(doc, WHITE);
  stroke(doc, [255, 255, 255]);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, size, size, 1.2, 1.2, 'F');

  // Motif de repères type QR (esthétique, non fonctionnel)
  fill(doc, ctx.primary);
  const m = size * 0.18;
  doc.rect(x + 2, y + 2, m, m, 'F');
  doc.rect(x + size - m - 2, y + 2, m, m, 'F');
  doc.rect(x + 2, y + size - m - 2, m, m, 'F');

  const code = def.qr?.shortCode;
  if (code) {
    useFont(ctx, true, 5.5);
    ink(ctx.doc, ctx.primary);
    doc.text(ellipsize(ctx.m, code, size - 2, 5.5, true), x + size / 2, y + size / 2 + 1, {
      baseline: 'middle', align: 'center',
    });
  }
}

/** Tente d'insérer le logo embarqué ; renvoie false si échec (fallback texte). */
function tryDrawLogo(doc: jsPDF, dataUrl: string, x: number, y: number, maxH: number): boolean {
  try {
    const rawFmt = /^data:image\/(png|jpe?g|webp)/i.exec(dataUrl)?.[1]?.toUpperCase();
    const format = rawFmt === 'JPG' || rawFmt === 'JPEG' ? 'JPEG' : rawFmt === 'WEBP' ? 'WEBP' : 'PNG';
    const props = doc.getImageProperties(dataUrl);
    const ratio = props.width && props.height ? props.width / props.height : 3;
    const w = Math.min(55, maxH * ratio);
    doc.addImage(dataUrl, format, x, y, w, maxH, undefined, 'FAST');
    return true;
  } catch {
    return false;
  }
}

// ─── API principale ──────────────────────────────────────────────────────────
export function renderDocument(
  doc: jsPDF,
  def: DocumentExportDefinition,
  layout: LayoutResult,
  font?: FontHandle,
): void {
  const cand = layout.candidate;
  const m = createMeasurer(doc);
  const fonts = cand.fonts;

  // Positions X cumulées des colonnes
  const widths = cand.columnWidths;
  const columns = cand.visibleColumns;
  const colX: number[] = [];
  let acc = cand.margins.left;
  for (let i = 0; i < columns.length; i++) { colX.push(acc); acc += widths[i] ?? 0; }
  const tableW = widths.reduce((a, b) => a + b, 0);

  const headH = lineHeight(fonts.tableHead) + CELL_PAD_Y * 2;

  const d = new Date();
  const loc = def.lang === 'en' ? 'en-GB' : 'fr-FR';
  const now = `${d.toLocaleDateString(loc)} ${d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' })}`;

  const ctx: Ctx = {
    doc, def, layout, font, m,
    primary: def.branding.primaryColor,
    accent: def.branding.accentColor,
    columns, colX, widths, tableW, headH,
    pageCount: cand.rowsPerPage.length,
    now,
  };

  // Lignes sources rattachées au layout (voir RenderableLayout / withRows).
  const rows: Record<string, unknown>[] = (layout as Partial<RenderableLayout>).rows ?? [];

  let rowIndex = 0;
  cand.rowsPerPage.forEach((count, pageIndex) => {
    if (pageIndex > 0) doc.addPage();

    // Header (première page complet / continuation compact)
    if (pageIndex === 0) drawFirstHeader(ctx);
    else drawContinuationHeader(ctx, pageIndex);

    // En-tête de tableau répété (§18)
    const tableTop = cand.margins.top;
    drawTableHead(ctx, tableTop);

    // Lignes (répartition fournie — jamais recomposée, §19)
    let y = tableTop + headH;
    for (let k = 0; k < count; k++) {
      const globalIdx = rowIndex;
      const h = cand.rowHeights[globalIdx] ?? headH;
      const data = rows[globalIdx] ?? {};
      drawRow(ctx, data, y, h, globalIdx % 2 === 1);
      y += h;
      rowIndex++;
    }

    // Bordure extérieure du tableau sur la page
    stroke(doc, BORDER);
    doc.setLineWidth(0.2);
    doc.rect(colX[0], tableTop, tableW, y - tableTop, 'S');

    drawFooter(ctx, pageIndex);
  });
}
