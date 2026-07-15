/**
 * ============================================================================
 * FAÇADE PUBLIQUE DU MOTEUR D'EXPORT UNIVERSEL — IBIG SOFT
 * ----------------------------------------------------------------------------
 * Point d'entrée unique pour tous les modules :
 *     await exportDocument(def, rows, 'pdf' | 'xlsx' | 'csv');
 *
 * Le moteur décide seul : format, orientation, marges, largeurs, police,
 * hauteurs, pagination, en-têtes 1re page / continuation. Il valide le rendu
 * et re-compose automatiquement si une page est mal remplie (sections 33-35).
 * ============================================================================
 */
import type { DocumentExportDefinition } from './types';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv';

export interface ExportResult {
  format: ExportFormat;
  pageCount?: number;
  chosenLayout?: string;      // ex. "a4 / landscape"
  anomalies?: string[];       // anomalies résiduelles signalées
}

// Ré-exports pour les consommateurs
export * from './types';
export {
  ANOUANZE_BRANDING, formatFCFA, formatDateFR, formatBoolShort,
  membresExportDef, budgetExportDef, comptabiliteExportDef, tresorerieExportDef,
} from './export-definitions';

/**
 * Génère et télécharge un document dans le format demandé.
 * @returns métadonnées du rendu (layout choisi, nb de pages, anomalies).
 */
export async function exportDocument(
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
  format: ExportFormat = 'pdf',
): Promise<ExportResult> {
  if (format === 'xlsx') {
    const { exportDefinitionToXLSX } = await import('./xlsx-engine');
    await exportDefinitionToXLSX(def, rows);
    return { format };
  }
  if (format === 'csv') {
    const { exportDefinitionToCSV } = await import('./csv-engine');
    exportDefinitionToCSV(def, rows);
    return { format };
  }
  return exportPdf(def, rows);
}

async function exportPdf(
  def: DocumentExportDefinition,
  rows: Record<string, unknown>[],
): Promise<ExportResult> {
  const jsPDF = (await import('jspdf')).default;
  const { rankDocumentLayouts } = await import('./layout-engine');
  const { renderDocument, withRows } = await import('./pdf-renderer');
  const { validateLayout } = await import('./integrity-validator');

  // Doc sonde (mesure de texte) — mêmes métriques helvetica que le moteur
  const probe = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const ranked = rankDocumentLayouts(probe, def, rows);

  // Re-composition : on prend le 1er candidat valide, sinon le mieux classé (section 34)
  let chosen = ranked[0];
  for (const candidate of ranked) {
    const report = validateLayout(def, candidate);
    if (report.ok) { chosen = candidate; break; }
  }
  const finalReport = validateLayout(def, chosen);

  // Police Unicode embarquée (import dynamique ~2 Mo, hors bundle principal)
  let font: any = undefined;
  const { name: fmt, orientation } = chosen.candidate.page;
  const doc = new jsPDF({ orientation, unit: 'mm', format: fmt });
  try {
    const { registerUnicodeFont } = await import('./font-manager');
    font = await registerUnicodeFont(doc);
  } catch {
    font = undefined; // fallback helvetica géré par le renderer
  }

  renderDocument(doc, def, withRows(chosen, rows), font);

  const filename = `${slug(def.title)}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);

  return {
    format: 'pdf',
    pageCount: chosen.candidate.pageCount,
    chosenLayout: `${fmt} / ${orientation}`,
    anomalies: finalReport.ok ? [] : finalReport.anomalies,
  };
}

function slug(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'export';
}
