/**
 * ============================================================================
 * MOTEUR D'EXPORT XLSX ADAPTATIF (section 41) — IBIG SOFT
 * ----------------------------------------------------------------------------
 * Consomme une DocumentExportDefinition (même contrat que le moteur PDF) et
 * produit un classeur Excel :
 *   - largeurs de colonnes automatiques et bornées (jamais minuscule/démesuré) ;
 *   - retour à la ligne (wrapText) uniquement sur les colonnes « longues » ;
 *   - ligne d'en-tête stylée (vert #146C43, texte blanc, gras), figée ;
 *   - AutoFilter sur la plage d'en-tête ;
 *   - lignes d'information (titre / organisation / période / date) en tête ;
 *   - ligne TOTAL pour les colonnes montant / pourcentage ;
 *   - réglages d'impression (marges, orientation, fit-to-width, ligne d'en-tête
 *     répétée à l'impression).
 * La lib `xlsx` (SheetJS) est chargée dynamiquement — aucune dépendance ajoutée.
 * ============================================================================
 */
import type { DocumentExportDefinition, ColumnDef, ColumnType } from './types';
import { COLUMN_RULES } from './column-rules';
import { cellText } from './layout-engine';

// ─── Paramétrage largeurs (mm → caractères) ──────────────────────────────────
// Un caractère ~ 1.85 mm à la police corps (~9 pt). Bornes absolues : 8..45.
const MM_PER_CHAR = 1.85;
const ABS_MIN_WCH = 8;
const ABS_MAX_WCH = 45;
const WCH_PADDING = 2; // marge de respiration ajoutée à la largeur de contenu

const mmToChar = (mm: number): number => mm / MM_PER_CHAR;

// Types dont le contenu long justifie le retour à la ligne dans la cellule.
const WRAP_TYPES: ReadonlySet<ColumnType> = new Set<ColumnType>([
  'long-description',
  'free-text',
  'list',
]);

// Types numériques agrégés dans la ligne TOTAL et conservés en nombre.
const NUMERIC_TYPES: ReadonlySet<ColumnType> = new Set<ColumnType>([
  'amount',
  'percent',
]);

/** Percentile p (0..100) d'un tableau de nombres (interpolation basse). */
function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

/** Valeur brute d'une cellule via le chemin `a.b.c`. */
function rawValue(row: Record<string, unknown>, col: ColumnDef): unknown {
  return col.key
    .split('.')
    .reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), row);
}

/** Nombre exploitable pour une colonne numérique, sinon null. */
function numericValue(row: Record<string, unknown>, col: ColumnDef): number | null {
  const raw = rawValue(row, col);
  if (raw === null || raw === undefined || raw === '') return null;
  const num = typeof raw === 'number' ? raw : Number(String(raw).replace(/[\s ']/g, '').replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

/**
 * Largeur `wch` d'une colonne :
 *   contenu = max(longueur libellé, p90 des longueurs de valeurs) + padding,
 *   borné par [minChars(type), maxChars(type)] puis par les bornes absolues.
 */
function columnWidth(col: ColumnDef, values: string[]): number {
  const rule = COLUMN_RULES[col.type];
  const minChars = Math.max(ABS_MIN_WCH, Math.round(mmToChar(col.minWidth ?? rule.min)));
  const maxChars = Math.min(ABS_MAX_WCH, Math.round(mmToChar(col.maxWidth ?? rule.max)));
  const p90 = percentile(values.map((v) => v.length), 90);
  const content = Math.max(col.label.length, p90) + WCH_PADDING;
  const lo = Math.min(minChars, maxChars);
  const hi = Math.max(minChars, maxChars);
  return Math.max(ABS_MIN_WCH, Math.min(hi, Math.max(lo, content)));
}

/** Alignement horizontal Excel déduit du type / override colonne. */
function excelAlign(col: ColumnDef): 'left' | 'center' | 'right' {
  return col.align ?? COLUMN_RULES[col.type].align;
}

export async function exportDefinitionToXLSX(
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
): Promise<void> {
  const XLSX = await import('xlsx');
  const cols = def.columns;
  const now = new Date();

  // ── 1. Lignes d'information (identiques à l'ancien export) ─────────────────
  const infoRows: string[][] = [];
  infoRows.push([def.title]);
  if (def.subtitle) infoRows.push([def.subtitle]);
  if (def.organisation) infoRows.push([`Organisation : ${def.organisation}`]);
  if (def.periode) infoRows.push([`Période : ${def.periode}`]);
  if (def.filtersSummary) infoRows.push([`Filtres : ${def.filtersSummary}`]);
  infoRows.push([
    `Généré le ${now.toLocaleDateString('fr-CI')} à ${now.toLocaleTimeString('fr-CI')}`,
  ]);
  infoRows.push([]); // séparateur

  const headerRowIdx = infoRows.length; // index 0-based de la ligne d'en-tête
  const firstDataRowIdx = headerRowIdx + 1;

  // ── 2. Construction de la matrice (AOA) ────────────────────────────────────
  // Valeurs texte par colonne (pour le calcul de largeur).
  const valuesByCol: string[][] = cols.map((c) => rows.map((r) => cellText(r, c)));

  const aoa: (string | number)[][] = [];
  for (const info of infoRows) aoa.push(info);
  aoa.push(cols.map((c) => c.label));

  rows.forEach((row) => {
    aoa.push(
      cols.map((col) => {
        if (NUMERIC_TYPES.has(col.type)) {
          const n = numericValue(row, col);
          if (n !== null) return n; // conservé en nombre pour les formats Excel
        }
        return cellText(row, col);
      }),
    );
  });

  // ── 3. Ligne TOTAL (colonnes montant / pourcentage) ────────────────────────
  const hasNumeric = cols.some((c) => NUMERIC_TYPES.has(c.type));
  let totalRowIdx = -1;
  if (hasNumeric && rows.length > 0) {
    const totalRow: (string | number)[] = cols.map((col, i) => {
      if (i === 0) return 'TOTAL';
      if (col.type === 'amount') {
        return rows.reduce((s, r) => s + (numericValue(r, col) ?? 0), 0);
      }
      if (col.type === 'percent') {
        // moyenne des pourcentages présents
        const nums = rows.map((r) => numericValue(r, col)).filter((n): n is number => n !== null);
        return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : '';
      }
      return '';
    });
    totalRowIdx = aoa.length;
    aoa.push(totalRow);
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // ── 4. Largeurs & wrap par colonne ─────────────────────────────────────────
  ws['!cols'] = cols.map((col, i) => ({
    wch: columnWidth(col, valuesByCol[i]),
    // Excel ne stocke pas wrap au niveau colonne : on l'applique par cellule
    // ci-dessous. On expose néanmoins le flag pour information/outils tiers.
  }));

  const encode = XLSX.utils.encode_cell;
  const wrapCols = cols.map((c) => WRAP_TYPES.has(c.type));
  const lastRowIdx = aoa.length - 1;

  // ── 5. Style en-tête (vert, blanc, gras, centré) ───────────────────────────
  for (let c = 0; c < cols.length; c++) {
    const ref = encode({ r: headerRowIdx, c });
    const cell = (ws as Record<string, unknown>)[ref] as { s?: unknown } | undefined;
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 11 },
        fill: { patternType: 'solid', fgColor: { rgb: 'FF146C43' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
          bottom: { style: 'thin', color: { rgb: 'FF0E5233' } },
        },
      };
    }
  }

  // ── 6. Style corps : alignement par type + wrap sur colonnes longues ───────
  for (let c = 0; c < cols.length; c++) {
    const align = excelAlign(cols[c]);
    const wrap = wrapCols[c];
    for (let r = firstDataRowIdx; r <= lastRowIdx; r++) {
      const ref = encode({ r, c });
      const cell = (ws as Record<string, unknown>)[ref] as { s?: unknown; z?: string; t?: string } | undefined;
      if (!cell) continue;
      const isTotal = r === totalRowIdx;
      cell.s = {
        font: isTotal ? { bold: true } : undefined,
        alignment: { horizontal: align, vertical: 'top', wrapText: wrap },
      };
      // Formats numériques : montants et pourcentages restent des nombres.
      if (cols[c].type === 'amount' && cell.t === 'n') cell.z = '#,##0';
      if (cols[c].type === 'percent' && cell.t === 'n') cell.z = '0.0"%"';
    }
  }

  // ── 7. Style lignes d'information (titre en gras) ──────────────────────────
  const titleRef = encode({ r: 0, c: 0 });
  const titleCell = (ws as Record<string, unknown>)[titleRef] as { s?: unknown } | undefined;
  if (titleCell) {
    titleCell.s = { font: { bold: true, sz: 14, color: { rgb: 'FF146C43' } } };
  }

  // ── 8. Volets figés : en-tête (+ lignes d'info) toujours visible ───────────
  const wsAny = ws as Record<string, unknown>;
  wsAny['!freeze'] = { xSplit: 0, ySplit: firstDataRowIdx };
  wsAny['!views'] = [
    {
      state: 'frozen',
      xSplit: 0,
      ySplit: firstDataRowIdx,
      topLeftCell: encode({ r: firstDataRowIdx, c: 0 }),
    },
  ];

  // ── 9. AutoFilter sur la plage d'en-tête → dernière ligne de données ───────
  const filterEnd = totalRowIdx >= 0 ? totalRowIdx - 1 : lastRowIdx;
  ws['!autofilter'] = {
    ref: `${encode({ r: headerRowIdx, c: 0 })}:${encode({
      r: Math.max(headerRowIdx, filterEnd),
      c: cols.length - 1,
    })}`,
  };

  // ── 10. Réglages d'impression ──────────────────────────────────────────────
  wsAny['!margins'] = {
    left: 0.5,
    right: 0.5,
    top: 0.6,
    bottom: 0.6,
    header: 0.3,
    footer: 0.3,
  };
  // Orientation paysage si beaucoup de colonnes, fit-to-width sur 1 page large.
  const landscape = cols.length > 6;
  wsAny['!pageSetup'] = {
    orientation: landscape ? 'landscape' : 'portrait',
    scale: 100,
    fitToWidth: 1,
    fitToHeight: 0,
    paperSize: 9, // A4
  };
  wsAny['!sheetPr'] = { pageSetUpPr: { fitToPage: true } };
  // Répétition de la ligne d'en-tête à l'impression (print titles).
  wsAny['!printHeader'] = [headerRowIdx + 1, headerRowIdx + 1];

  // ── 11. Écriture du fichier ────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const sheetName = (def.title || 'Données').slice(0, 31).replace(/[\\/?*[\]:]/g, ' ');
  XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Données');

  const slug = (def.title || 'export')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const filename = `${slug || 'export'}_${now.toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, filename, { bookType: 'xlsx', cellStyles: true });
}
