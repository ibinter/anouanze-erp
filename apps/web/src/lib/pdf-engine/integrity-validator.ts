/**
 * ============================================================================
 * VALIDATEUR D'INTÉGRITÉ POST-COMPOSITION — IBIG SOFT (sections 34-35)
 * ----------------------------------------------------------------------------
 * Analyse un LayoutResult APRÈS calcul et produit un IntegrityReport lisible.
 * Pilote la re-composition automatique via pickNextCandidate().
 *
 * Fonctions PURES : aucune dépendance npm, aucun I/O, aucun effet de bord.
 * ============================================================================
 */
import type {
  DocumentExportDefinition,
  ColumnDef,
  LayoutResult,
  IntegrityReport,
  PageIntegrity,
} from './types';
import { FONT_BOUNDS, MIN_PAGE_FILL, WIDTH_UTIL_TARGET } from './types';

// ─── Seuils (sections 34-35) ─────────────────────────────────────────────────
const MIN_LAST_PAGE_ROWS = 3;          // dernière page « presque vide » si < 3 lignes
const HEADER_MAX_RATIO = 0.25;         // header > 25 % de la hauteur de page → trop grand
const WIDTH_UTIL_MIN = WIDTH_UTIL_TARGET.min < 0.75 ? WIDTH_UTIL_TARGET.min : 0.75; // occupation largeur mini tolérée

// ─── Interligne (aligné sur layout-engine : pt→mm * 1.15) ────────────────────
const PT_TO_MM = 0.3528;
const LINE_FACTOR = 1.15;

// ─── Accès direct à une cellule (miroir de cellText, sans dépendance) ────────
function readCell(row: Record<string, unknown>, col: ColumnDef): string {
  const raw = col.key
    .split('.')
    .reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), row);
  if (col.format) return col.format(raw, row) ?? '';
  if (raw === null || raw === undefined) return '';
  return String(raw);
}

/**
 * Détecte la présence de caractères susceptibles de casser le rendu Helvetica :
 *  - U+FFClaude (zone de remplacement Unicode) → décodage déjà échoué ;
 *  - séquences d'octets Latin-1 typiques d'un double encodage UTF-8 (Ã©, Ã¨, â€¦) ;
 *  - emojis / symboles hors du plan de base (surrogates, U+1F000+, etc.).
 * Renvoie true dès qu'un risque est repéré.
 */
export function detectCorruptedChars(
  rows: Record<string, unknown>[],
  def: DocumentExportDefinition,
): boolean {
  // Zone de remplacement + surrogates isolés.
  const replacementOrSurrogate = /[�\uD800-\uDFFF]/;
  // Emojis / symboles supplémentaires (plan astral) : \u{1F000}+ et pictos courants.
  const emojiOrAstral = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️\u{1F1E6}-\u{1F1FF}]/u;
  // Signatures de double encodage UTF-8 → Latin-1 (mojibake).
  const mojibake = /Ã[\x80-\xBF]|Â[\x80-\xBF]|â€[\x00-\xFF]| Â|ï»¿|Ã©|Ã¨|Ã |Ã§|Ã´|Ãª/;

  const scan = (txt: string): boolean =>
    replacementOrSurrogate.test(txt) || emojiOrAstral.test(txt) || mojibake.test(txt);

  const sample = rows.slice(0, 500); // échantillon borné
  for (const row of sample) {
    for (const col of def.columns) {
      if (scan(readCell(row, col))) return true;
    }
    // Certains champs texte libres du header peuvent aussi porter le risque.
  }
  // Titres / sous-titres du document lui-même.
  for (const s of [def.title, def.subtitle, def.organisation, def.periode, def.filtersSummary]) {
    if (s && scan(String(s))) return true;
  }
  return false;
}

/**
 * Valide un LayoutResult calculé et renvoie un rapport d'intégrité complet.
 * N'exécute aucune génération : travaille uniquement sur les métriques du layout.
 */
export function validateLayout(
  def: DocumentExportDefinition,
  layout: LayoutResult,
): IntegrityReport {
  const c = layout.candidate;
  const anomalies: string[] = [];

  // ── Géométrie de page ──────────────────────────────────────────────────────
  const usableW = c.page.width - c.margins.left - c.margins.right;
  const usableH = c.page.height - c.margins.top - c.margins.bottom;
  const rowLineMin = c.fonts.body * PT_TO_MM * LINE_FACTOR; // repère indicatif

  // ── Remplissage page par page ──────────────────────────────────────────────
  const pages: PageIntegrity[] = [];
  let cursor = 0;
  c.rowsPerPage.forEach((n, pi) => {
    let height = 0;
    for (let k = 0; k < n; k++) {
      height += c.rowHeights[cursor + k] ?? rowLineMin;
    }
    cursor += n;
    const fillRatio = usableH > 0 ? Math.min(1, height / usableH) : 0;
    const overflow = height > usableH + 0.5;
    pages.push({ pageIndex: pi, fillRatio, rowCount: n, overflow });

    if (fillRatio < MIN_PAGE_FILL) {
      anomalies.push(
        `Page ${pi + 1} sous-remplie : occupation ${(fillRatio * 100).toFixed(0)} % ` +
          `(seuil minimal ${(MIN_PAGE_FILL * 100).toFixed(0)} %).`,
      );
    }
    if (overflow) {
      anomalies.push(
        `Page ${pi + 1} en débordement : contenu ${height.toFixed(1)} mm > zone utile ${usableH.toFixed(1)} mm.`,
      );
    }
  });

  const hasClippedContent = pages.some((p) => p.overflow);

  // ── Dernière page presque vide (uniquement si multi-pages) ─────────────────
  const pageCount = c.pageCount;
  const lastRows = c.rowsPerPage[c.rowsPerPage.length - 1] ?? 0;
  const hasNearlyEmptyLastPage = pageCount > 1 && lastRows < MIN_LAST_PAGE_ROWS;
  if (hasNearlyEmptyLastPage) {
    anomalies.push(
      `Dernière page quasi vide : ${lastRows} ligne(s) seulement ` +
        `(minimum recommandé ${MIN_LAST_PAGE_ROWS} sur un document de ${pageCount} pages).`,
    );
  }

  // ── Occupation de largeur ──────────────────────────────────────────────────
  const tableW = c.columnWidths.reduce((a, b) => a + b, 0);
  const widthUtilization = usableW > 0 ? Math.min(1, tableW / usableW) : 0;
  if (widthUtilization < WIDTH_UTIL_MIN) {
    anomalies.push(
      `Occupation de largeur insuffisante : ${(widthUtilization * 100).toFixed(0)} % ` +
        `(seuil minimal ${(WIDTH_UTIL_MIN * 100).toFixed(0)} %).`,
    );
  }

  // ── Police du corps sous le minimum lisible ────────────────────────────────
  const fontBelowMinimum = c.fonts.body < FONT_BOUNDS.body.min;
  if (fontBelowMinimum) {
    anomalies.push(
      `Police du corps trop petite : ${c.fonts.body} pt ` +
        `(minimum lisible ${FONT_BOUNDS.body.min} pt).`,
    );
  }

  // ── Header trop grand (estimé via la marge haute réservée au header) ───────
  const headerRatio = c.page.height > 0 ? c.margins.top / c.page.height : 0;
  const headerTooTall = headerRatio > HEADER_MAX_RATIO;
  if (headerTooTall) {
    anomalies.push(
      `En-tête trop volumineux : ${(headerRatio * 100).toFixed(0)} % de la hauteur de page ` +
        `(maximum ${(HEADER_MAX_RATIO * 100).toFixed(0)} %).`,
    );
  }

  // ── Caractères corrompus ───────────────────────────────────────────────────
  // Sans lignes source ici, on s'appuie sur les libellés du document ;
  // la façade peut compléter en appelant detectCorruptedChars sur les rows.
  const hasCorruptedChars = [def.title, def.subtitle].some(
    (s) => s !== undefined && /[�\uD800-\uDFFF]/.test(String(s)),
  );
  if (hasCorruptedChars) {
    anomalies.push('Caractères corrompus détectés (encodage ou glyphes non imprimables).');
  }

  return {
    ok: anomalies.length === 0,
    pages,
    widthUtilization,
    hasNearlyEmptyLastPage,
    hasClippedContent,
    hasCorruptedChars,
    fontBelowMinimum,
    headerTooTall,
    anomalies,
  };
}

/**
 * Logique de décision de re-composition : renvoie l'index du candidat suivant
 * à essayer, ou null si la liste est épuisée. Fonction pure.
 *
 * @param current          index du candidat courant (0-based)
 * @param totalCandidates  nombre total de candidats disponibles
 */
export function pickNextCandidate(current: number, totalCandidates: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(totalCandidates)) return null;
  if (totalCandidates <= 0) return null;
  const next = Math.floor(current) + 1;
  if (next < 0 || next >= totalCandidates) return null;
  return next;
}
