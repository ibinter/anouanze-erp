/**
 * ============================================================================
 * MOTEUR UNIVERSEL DE COMPOSITION DOCUMENTAIRE ADAPTATIVE — IBIG SOFT
 * ----------------------------------------------------------------------------
 * Contrat partagé : tous les modules fournissent une DocumentExportDefinition,
 * le moteur décide format / orientation / marges / largeurs / police /
 * pagination. Unité canonique interne : millimètres (mm), alignée sur jsPDF.
 * ============================================================================
 */

// ─── Types de données de colonne ────────────────────────────────────────────
export type ColumnType =
  | 'id'
  | 'reference'
  | 'name'
  | 'firstname'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'amount'
  | 'percent'
  | 'status'
  | 'code'
  | 'short-code'
  | 'boolean'
  | 'boolean-short'
  | 'short-description'
  | 'long-description'
  | 'list'
  | 'free-text';

export type ColumnPriority = 'essential' | 'important' | 'secondary' | 'optional';

export type ColumnAlign = 'left' | 'center' | 'right';

// ─── Définition d'une colonne (fournie par le module métier) ─────────────────
export interface ColumnDef {
  key: string;                 // chemin d'accès (supporte "a.b.c")
  label: string;               // libellé affiché (header)
  type: ColumnType;
  priority?: ColumnPriority;   // défaut déduit du type
  align?: ColumnAlign;         // défaut déduit du type
  nowrap?: boolean;            // dates / montants / réf courtes → true recommandé
  abbrevLabel?: string;        // header abrégé validé si l'espace manque
  format?: (raw: unknown, row: Record<string, unknown>) => string; // formatage métier
  minWidth?: number;           // override mm
  maxWidth?: number;           // override mm
  flex?: number;               // override poids de distribution
}

// ─── Définition d'un export (l'unique entrée fournie par les modules) ────────
export type DocumentFamily =
  | 'data-list'          // liste simple
  | 'detailed-list'      // liste détaillée
  | 'analytic-report'
  | 'registry'
  | 'invoice'
  | 'receipt'
  | 'record'             // fiche individuelle
  | 'financial-statement'
  | 'contract'
  | 'medical'
  | 'membership'
  | 'project';

export interface DocumentBranding {
  softwareName: string;        // "ANOUANZÊ ERP"
  softwareAccent?: string;     // "ERP"
  company: string;             // "IBIG SARL"
  primaryColor: [number, number, number];   // RGB
  accentColor: [number, number, number];
  logoDataUrl?: string;        // logo embarqué (data URI), optionnel
  footerUrl?: string;          // "ibigsoft.com"
  confidentiality?: string;
}

export interface DocumentExportDefinition {
  title: string;
  subtitle?: string;
  documentType: DocumentFamily;
  columns: ColumnDef[];
  organisation?: string;
  periode?: string;
  filtersSummary?: string;     // résumé des filtres appliqués
  reference?: string;          // réf du rapport (header de continuation)
  branding: DocumentBranding;
  lang?: 'fr' | 'en';
  preferredFormat?: PageFormatName | 'auto';
  preferredOrientation?: Orientation | 'auto';
  density?: 'auto' | 'compact' | 'comfortable';
  qr?: { url: string; shortCode?: string };
}

// ─── Formats & orientation ───────────────────────────────────────────────────
export type Orientation = 'portrait' | 'landscape';
export type PageFormatName = 'a4' | 'a3' | 'letter' | 'legal';

export interface PageDimensions {
  name: PageFormatName;
  orientation: Orientation;
  width: number;   // mm
  height: number;  // mm
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ─── Analyse de précomposition (section 3 du cahier des charges) ─────────────
export interface ColumnAnalysis {
  def: ColumnDef;
  headerWidth: number;      // largeur mesurée du libellé (mm) à la police header
  avgCharCount: number;
  maxCharCount: number;
  p90Width: number;         // percentile 90 des largeurs de valeurs (mm)
  p95Width: number;
  naturalWidth: number;     // largeur idéale sans wrap (mm)
  minWidth: number;         // largeur mini métier appliquée (mm)
  maxWidth: number;         // largeur maxi (mm)
  flex: number;             // poids de distribution de l'espace libre
  hasLongWords: boolean;
  wrappable: boolean;
}

export interface DocumentLayoutAnalysis {
  rowCount: number;
  columnCount: number;
  columns: ColumnAnalysis[];
  estimatedNaturalWidth: number;   // somme des naturalWidth
  estimatedCompactWidth: number;   // somme des minWidth
}

// ─── Candidat de mise en page & résultat ─────────────────────────────────────
export interface FontSizes {
  title: number;
  subtitle: number;
  tableHead: number;
  body: number;
  footer: number;
}

export interface LayoutCandidate {
  page: PageDimensions;
  margins: Margins;
  fonts: FontSizes;
  columnWidths: number[];    // mm, aligné sur definition.columns visibles
  visibleColumns: ColumnDef[];
  annexColumns: ColumnDef[]; // colonnes déplacées en annexe (jamais supprimées)
  rowHeights: number[];      // hauteur réelle par ligne (mm)
  rowsPerPage: number[];     // répartition équilibrée des lignes par page
  pageCount: number;
  render: 'table' | 'cards'; // stratégie de rendu
}

export interface LayoutScoreBreakdown {
  readability: number;
  widthUtilization: number;   // 0..1
  pageFillRatio: number;      // 0..1 moyen
  excessiveWrapping: number;
  nearlyEmptyLastPage: number;
  clippedContent: number;
  unreadableFont: number;
  corruptedCharacters: number;
  total: number;
}

export interface LayoutResult {
  candidate: LayoutCandidate;
  analysis: DocumentLayoutAnalysis;
  score: LayoutScoreBreakdown;
}

// ─── Validation post-génération (sections 34-35) ─────────────────────────────
export interface PageIntegrity {
  pageIndex: number;
  fillRatio: number;
  rowCount: number;
  overflow: boolean;
}

export interface IntegrityReport {
  ok: boolean;
  pages: PageIntegrity[];
  widthUtilization: number;
  hasNearlyEmptyLastPage: boolean;
  hasClippedContent: boolean;
  hasCorruptedChars: boolean;
  fontBelowMinimum: boolean;
  headerTooTall: boolean;
  anomalies: string[];        // messages lisibles
}

// ─── Contraintes de police (section 12) ──────────────────────────────────────
export const FONT_BOUNDS = {
  title: { min: 15, max: 22 },
  subtitle: { min: 9, max: 12 },
  tableHead: { min: 7.5, max: 10 },
  body: { min: 7.5, max: 10.5 },
  footer: { min: 6.5, max: 8 },
} as const;

// ─── Objectifs d'occupation (section 8) ──────────────────────────────────────
export const WIDTH_UTIL_TARGET = { min: 0.88, max: 1.0 } as const;
export const MIN_PAGE_FILL = 0.3 as const;
