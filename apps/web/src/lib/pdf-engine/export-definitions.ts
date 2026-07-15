/**
 * ============================================================================
 * FABRIQUES DE DÉFINITIONS D'EXPORT — ANOUANZÊ ERP (IBIG SOFT)
 * ----------------------------------------------------------------------------
 * Chaque module métier expose une fabrique typée qui produit une
 * `DocumentExportDefinition` prête à passer au moteur (`exportDocument`).
 * Le branding est partagé et centralisé ici (une seule source de vérité).
 *
 * Les colonnes sont calquées sur les vrais exports actuels des pages :
 *   - membres/page.tsx        → numero, nom, prenom, email, telephone,
 *                               statutMembre, dateAdhesion
 *   - budget/page.tsx         → budget, exercice, statut, categorie,
 *                               prevu, realise, ecart
 *   - comptabilite/page.tsx   → date, journal, libelle, debit, credit, statut
 *   - tresorerie/page.tsx     → date, libelle, debit, credit, rapproche,
 *                               soldeApres
 * ============================================================================
 */
import type {
  DocumentExportDefinition,
  DocumentBranding,
  ColumnDef,
} from './types';

// ─── Branding partagé ────────────────────────────────────────────────────────
export const ANOUANZE_BRANDING: DocumentBranding = {
  softwareName: 'ANOUANZÊ',
  softwareAccent: 'ERP',
  company: 'IBIG SARL',
  primaryColor: [20, 108, 67], // #146C43
  accentColor: [242, 140, 37], // #F28C25
  footerUrl: 'ibigsoft.com',
};

// ─── Helpers de formatage métier ─────────────────────────────────────────────
/** Format monétaire FCFA (XOF), séparateurs français, sans décimales. */
export function formatFCFA(raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return '—';
  const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  if (Number.isNaN(n)) return '—';
  return `${new Intl.NumberFormat('fr-CI', { maximumFractionDigits: 0 }).format(n)} FCFA`;
}

/** Format date localisé fr-CI (jj/mm/aaaa). Tolère string/Date/number. */
export function formatDateFR(raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return '—';
  const d = raw instanceof Date ? raw : new Date(raw as string | number);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('fr-CI');
}

/** Format booléen court (Oui / Non) — rapprochement, actif, etc. */
export function formatBoolShort(raw: unknown): string {
  if (raw === null || raw === undefined || raw === '') return '—';
  if (typeof raw === 'boolean') return raw ? 'Oui' : 'Non';
  const s = String(raw).trim().toLowerCase();
  if (['true', '1', 'oui', 'yes', 'o'].includes(s)) return 'Oui';
  if (['false', '0', 'non', 'no', 'n'].includes(s)) return 'Non';
  return String(raw);
}

// Options communes acceptées par toutes les fabriques.
export interface ExportDefOptions {
  organisation?: string;
  periode?: string;
  filtersSummary?: string;
}

function base(
  opts: ExportDefOptions,
  extra: Omit<DocumentExportDefinition, 'branding' | 'organisation' | 'periode' | 'filtersSummary'>,
): DocumentExportDefinition {
  return {
    ...extra,
    organisation: opts.organisation,
    periode: opts.periode,
    filtersSummary: opts.filtersSummary,
    branding: ANOUANZE_BRANDING,
    lang: 'fr',
  };
}

// ─── Membres (registre d'adhérents) ──────────────────────────────────────────
export function membresExportDef(opts: ExportDefOptions = {}): DocumentExportDefinition {
  const columns: ColumnDef[] = [
    { key: 'numero', label: 'N°', type: 'reference', priority: 'essential', nowrap: true },
    { key: 'nom', label: 'Nom', type: 'name', priority: 'essential' },
    { key: 'prenom', label: 'Prénom', type: 'firstname', priority: 'essential' },
    { key: 'email', label: 'Email', type: 'email', priority: 'important' },
    { key: 'telephone', label: 'Téléphone', type: 'phone', priority: 'important', nowrap: true, abbrevLabel: 'Tél.' },
    { key: 'statutMembre', label: 'Statut', type: 'status', priority: 'essential', nowrap: true },
    {
      key: 'dateAdhesion',
      label: "Date d'adhésion",
      type: 'date',
      priority: 'important',
      nowrap: true,
      abbrevLabel: 'Adhésion',
      format: formatDateFR,
    },
  ];
  return base(opts, {
    title: 'Liste des membres',
    subtitle: 'Registre des adhérents',
    documentType: 'membership',
    columns,
  });
}

// ─── Budget (rapport analytique prévu / réalisé / écart) ─────────────────────
export function budgetExportDef(opts: ExportDefOptions = {}): DocumentExportDefinition {
  const columns: ColumnDef[] = [
    { key: 'budget', label: 'Budget', type: 'name', priority: 'essential' },
    { key: 'exercice', label: 'Exercice', type: 'short-code', priority: 'important', nowrap: true },
    { key: 'statut', label: 'Statut', type: 'status', priority: 'important', nowrap: true },
    { key: 'categorie', label: 'Catégorie', type: 'short-description', priority: 'secondary' },
    { key: 'prevu', label: 'Prévu', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
    { key: 'realise', label: 'Réalisé', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
    { key: 'ecart', label: 'Écart', type: 'amount', priority: 'important', nowrap: true, format: formatFCFA },
  ];
  return base(opts, {
    title: 'Suivi budgétaire',
    subtitle: 'Prévu / Réalisé / Écart',
    documentType: 'analytic-report',
    columns,
  });
}

// ─── Comptabilité (journal des écritures) ────────────────────────────────────
export function comptabiliteExportDef(opts: ExportDefOptions = {}): DocumentExportDefinition {
  const columns: ColumnDef[] = [
    { key: 'date', label: 'Date', type: 'date', priority: 'essential', nowrap: true, format: formatDateFR },
    { key: 'journal', label: 'Journal', type: 'short-code', priority: 'important', nowrap: true },
    { key: 'libelle', label: 'Libellé', type: 'long-description', priority: 'essential' },
    { key: 'debit', label: 'Débit', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
    { key: 'credit', label: 'Crédit', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
    { key: 'statut', label: 'Statut', type: 'status', priority: 'secondary', nowrap: true },
  ];
  return base(opts, {
    title: 'Journal comptable',
    subtitle: 'Écritures comptables',
    documentType: 'financial-statement',
    columns,
  });
}

// ─── Trésorerie (mouvements de compte) ───────────────────────────────────────
export function tresorerieExportDef(opts: ExportDefOptions = {}): DocumentExportDefinition {
  const columns: ColumnDef[] = [
    { key: 'date', label: 'Date', type: 'date', priority: 'essential', nowrap: true, format: formatDateFR },
    { key: 'libelle', label: 'Libellé', type: 'long-description', priority: 'essential' },
    { key: 'debit', label: 'Débit', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
    { key: 'credit', label: 'Crédit', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
    { key: 'rapproche', label: 'Rapproché', type: 'boolean-short', priority: 'secondary', nowrap: true, format: formatBoolShort },
    { key: 'soldeApres', label: 'Solde après', type: 'amount', priority: 'important', nowrap: true, abbrevLabel: 'Solde', format: formatFCFA },
  ];
  return base(opts, {
    title: 'Mouvements de trésorerie',
    subtitle: 'Journal de banque',
    documentType: 'financial-statement',
    columns,
  });
}

/** Index pratique pour une résolution dynamique par clé de module. */
export const EXPORT_DEFINITIONS = {
  membres: membresExportDef,
  budget: budgetExportDef,
  comptabilite: comptabiliteExportDef,
  tresorerie: tresorerieExportDef,
} as const;

export type ExportModuleKey = keyof typeof EXPORT_DEFINITIONS;
