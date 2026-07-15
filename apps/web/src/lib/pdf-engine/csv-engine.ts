/**
 * ============================================================================
 * MOTEUR D'EXPORT CSV ROBUSTE (section 41) — IBIG SOFT
 * ----------------------------------------------------------------------------
 * - UTF-8 avec BOM (compatibilité Excel FR/accents) ;
 * - protection anti-injection de formule (CSV injection / OWASP) :
 *     toute valeur commençant par  =  +  -  @  (ou TAB / CR) est préfixée
 *     d'une apostrophe pour neutraliser l'exécution dans Excel/Sheets/Calc ;
 * - échappement RFC 4180 (guillemets doublés, champ entre guillemets si besoin) ;
 * - séparateur paramétrable (défaut « ; » pour Excel FR) ;
 * - téléchargement navigateur (Blob + lien), nom de fichier daté.
 * ============================================================================
 */
import type { DocumentExportDefinition, ColumnDef, ColumnType } from './types';
import { cellText } from './layout-engine';

const NUMERIC_TYPES: ReadonlySet<ColumnType> = new Set<ColumnType>(['amount', 'percent']);

/** Caractères déclencheurs d'injection de formule en tête de cellule. */
const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Neutralise l'injection de formule : si la valeur commence par un caractère
 * dangereux, on la préfixe d'une apostrophe. Excel/Sheets/LibreOffice traitent
 * alors la cellule comme du texte au lieu d'évaluer la formule.
 * Exemple : `=1+2`  →  `'=1+2`  ;  `-5`  →  `'-5`  ;  `@SUM(...)` → `'@SUM(...)`.
 */
export function sanitizeAgainstFormulaInjection(value: string): string {
  if (value.length === 0) return value;
  const first = value.charAt(0);
  if (FORMULA_TRIGGERS.includes(first)) {
    return `'${value}`;
  }
  return value;
}

/**
 * Échappement RFC 4180 d'un champ + protection anti-injection.
 * Le champ est mis entre guillemets s'il contient le séparateur, un guillemet,
 * un saut de ligne ou un retour chariot ; les guillemets internes sont doublés.
 */
function escapeField(value: string, separator: string): string {
  const safe = sanitizeAgainstFormulaInjection(value);
  const mustQuote =
    safe.includes(separator) ||
    safe.includes('"') ||
    safe.includes('\n') ||
    safe.includes('\r');
  if (!mustQuote) return safe;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Valeur affichée d'une cellule (montants/pourcentages en texte brut). */
function displayValue(row: Record<string, unknown>, col: ColumnDef): string {
  if (NUMERIC_TYPES.has(col.type)) {
    const raw = col.key
      .split('.')
      .reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), row);
    if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  }
  const txt = cellText(row, col);
  return txt === '—' ? '' : txt;
}

export function exportDefinitionToCSV(
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
  opts?: { separator?: string },
): void {
  const separator = opts?.separator ?? ';';
  const cols = def.columns;
  const eol = '\r\n'; // RFC 4180

  const lines: string[] = [];

  // En-tête de colonnes.
  lines.push(cols.map((c) => escapeField(c.label, separator)).join(separator));

  // Données.
  for (const row of rows) {
    lines.push(cols.map((c) => escapeField(displayValue(row, c), separator)).join(separator));
  }

  const BOM = '﻿'; // UTF-8 BOM → Excel détecte l'UTF-8 et les accents
  const content = BOM + lines.join(eol) + eol;

  const now = new Date();
  const slug = (def.title || 'export')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  const filename = `${slug || 'export'}_${now.toISOString().slice(0, 10)}.csv`;

  triggerDownload(content, filename);
}

/** Déclenche le téléchargement du CSV côté navigateur. */
function triggerDownload(content: string, filename: string): void {
  if (typeof document === 'undefined') return; // garde-fou SSR
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
