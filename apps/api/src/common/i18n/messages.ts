/**
 * Catalogue de traduction des messages d'erreur de l'API.
 *
 * Les services existants lèvent des exceptions avec des messages français
 * codés en dur. Plutôt que de modifier des dizaines de services, la traduction
 * est faite à la frontière HTTP (voir `common/filters/http-exception.filter.ts`).
 *
 * Deux mécanismes :
 *  1. `EXACT_MESSAGES` : table `clé normalisée -> { fr, en }` pour les messages fixes.
 *  2. `MESSAGE_PATTERNS` : expressions régulières pour les messages contenant des
 *     valeurs dynamiques (identifiants, montants, références...).
 *
 * Si un message n'est reconnu par aucun des deux, il est renvoyé tel quel.
 */

export type Locale = 'fr' | 'en';

export const SUPPORTED_LOCALES: readonly Locale[] = ['fr', 'en'];
export const DEFAULT_LOCALE: Locale = 'fr';

export interface TranslatedMessage {
  fr: string;
  en: string;
}

/**
 * Normalise une chaîne pour servir de clé de recherche :
 * minuscules, sans accents, sans ponctuation de fin, espaces compactés.
 * Tolère les variantes de guillemets, d'apostrophes et d'espaces insécables.
 */
export function normalizeKey(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents
    .replace(/[‘’ʼ]/g, "'") // apostrophes typographiques
    .replace(/[“”«»]/g, '"') // guillemets
    .replace(/[  ]/g, ' ') // espaces insecables
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!;:,\s]+$/g, '');
}

/* -------------------------------------------------------------------------- */
/*  Noms d'entités (utilisés par les motifs dynamiques)                        */
/* -------------------------------------------------------------------------- */

/** Traduction des noms d'entités métier apparaissant dans « X <id> introuvable ». */
const ENTITY_NOUNS: Record<string, string> = {
  utilisateur: 'User',
  membre: 'Member',
  organisation: 'Organization',
  projet: 'Project',
  beneficiaire: 'Beneficiary',
  employe: 'Employee',
  conge: 'Leave request',
  'fiche de paie': 'Payslip',
  compte: 'Account',
  'compte parent': 'Parent account',
  journal: 'Journal',
  ecriture: 'Journal entry',
  mouvement: 'Transaction',
  transaction: 'Transaction',
  stock: 'Stock item',
  immobilisation: 'Fixed asset',
  document: 'Document',
  donateur: 'Donor',
  don: 'Donation',
  bailleur: 'Funder',
  convention: 'Agreement',
  budget: 'Budget',
  evenement: 'Event',
  inscription: 'Registration',
  fournisseur: 'Supplier',
  commande: 'Purchase order',
  indicateur: 'Indicator',
  prospect: 'Prospect',
  ticket: 'Ticket',
  facture: 'Invoice',
  paiement: 'Payment',
  rapport: 'Report',
  notification: 'Notification',
  tache: 'Task',
  activite: 'Activity',
};

function translateEntity(nounFr: string): string {
  const key = normalizeKey(nounFr);
  return ENTITY_NOUNS[key] ?? nounFr;
}

/* -------------------------------------------------------------------------- */
/*  1. Messages exacts                                                         */
/* -------------------------------------------------------------------------- */

const RAW_MESSAGES: TranslatedMessage[] = [
  /* --- Authentification / autorisation --- */
  { fr: 'Identifiants invalides', en: 'Invalid credentials' },
  { fr: 'Accès refusé', en: 'Access denied' },
  { fr: 'Accès refusé à cette organisation', en: 'Access denied to this organization' },
  { fr: 'Organisation non définie dans le token', en: 'Organization not defined in the token' },
  { fr: 'Un compte avec cet email existe déjà', en: 'An account with this email already exists' },
  { fr: 'Refresh token invalide', en: 'Invalid refresh token' },
  { fr: 'Refresh token invalide ou expiré', en: 'Invalid or expired refresh token' },
  { fr: 'Lien de réinitialisation invalide ou expiré', en: 'Invalid or expired reset link' },
  { fr: 'Token invalide', en: 'Invalid token' },
  { fr: 'Token expiré', en: 'Expired token' },
  { fr: 'Session expirée', en: 'Session expired' },
  { fr: 'Compte désactivé', en: 'Account deactivated' },
  { fr: 'Non authentifié', en: 'Not authenticated' },

  /* --- Utilisateurs --- */
  { fr: 'Ancien mot de passe incorrect', en: 'Current password is incorrect' },
  { fr: 'Mot de passe incorrect', en: 'Incorrect password' },
  {
    fr: 'Aucune organisation associée à ce compte',
    en: 'No organization is associated with this account',
  },
  {
    fr: 'Vous ne pouvez pas désactiver votre propre compte',
    en: 'You cannot deactivate your own account',
  },
  {
    fr: 'Vous ne pouvez pas modifier votre propre rôle. Demandez à un autre administrateur.',
    en: 'You cannot change your own role. Ask another administrator.',
  },
  {
    fr: 'Cet utilisateur ne fait pas partie de votre organisation',
    en: 'This user does not belong to your organization',
  },
  {
    fr: 'Cet utilisateur fait déjà partie de votre organisation',
    en: 'This user already belongs to your organization',
  },
  {
    fr: "L'organisation doit conserver au moins un administrateur actif",
    en: 'The organization must keep at least one active administrator',
  },
  {
    fr: 'Seul un super administrateur peut attribuer ou retirer le rôle SUPER_ADMIN',
    en: 'Only a super administrator can grant or revoke the SUPER_ADMIN role',
  },
  {
    fr: 'Seul un super administrateur peut attribuer le rôle SUPER_ADMIN',
    en: 'Only a super administrator can grant the SUPER_ADMIN role',
  },
  {
    fr: 'Seul un super administrateur peut désactiver un compte super administrateur',
    en: 'Only a super administrator can deactivate a super administrator account',
  },
  { fr: 'Organisation introuvable', en: 'Organization not found' },

  /* --- Événements --- */
  {
    fr: "Les inscriptions ne sont pas ouvertes pour cet événement",
    en: 'Registrations are not open for this event',
  },
  {
    fr: "La capacité maximale de cet événement est atteinte",
    en: 'This event has reached its maximum capacity',
  },
  { fr: 'Inscription introuvable', en: 'Registration not found' },

  /* --- Budget --- */
  { fr: 'Un budget approuvé ne peut pas être modifié', en: 'An approved budget cannot be modified' },
  { fr: 'Ce budget est déjà approuvé', en: 'This budget is already approved' },

  /* --- Comptabilité --- */
  { fr: 'Une écriture doit avoir au moins 2 lignes', en: 'A journal entry must have at least 2 lines' },
  { fr: 'Cette écriture est déjà validée', en: 'This journal entry is already posted' },
  {
    fr: 'Un plan comptable existe déjà pour cette organisation',
    en: 'A chart of accounts already exists for this organization',
  },
  { fr: 'Compte parent introuvable', en: 'Parent account not found' },

  /* --- Trésorerie --- */
  {
    fr: 'Un mouvement doit avoir un débit ou un crédit',
    en: 'A transaction must have either a debit or a credit',
  },
  { fr: 'Ce mouvement est déjà rapproché', en: 'This transaction is already reconciled' },

  /* --- Achats --- */
  {
    fr: 'Seules les commandes en brouillon peuvent être validées',
    en: 'Only draft purchase orders can be approved',
  },
  {
    fr: "La commande doit être validée avant d'être réceptionnée",
    en: 'The purchase order must be approved before it can be received',
  },

  /* --- RH --- */
  { fr: 'Cette fiche de paie est déjà validée', en: 'This payslip is already approved' },
  { fr: 'Ce congé ne peut plus être approuvé', en: 'This leave request can no longer be approved' },
  { fr: 'Ce congé ne peut plus être rejeté', en: 'This leave request can no longer be rejected' },

  /* --- Immobilisations --- */
  { fr: 'Cette immobilisation a déjà été cédée', en: 'This fixed asset has already been disposed of' },

  /* --- Documents / stockage --- */
  { fr: 'Aucun fichier fourni', en: 'No file provided' },
  { fr: "Échec de l'upload", en: 'Upload failed' },
  { fr: 'Échec de la suppression', en: 'Deletion failed' },
  { fr: 'Échec envoi email', en: 'Email delivery failed' },

  /* --- Divers --- */
  { fr: 'Ticket non trouvé', en: 'Ticket not found' },
  { fr: 'Prospect introuvable', en: 'Prospect not found' },
  { fr: 'Ressource introuvable', en: 'Resource not found' },
  { fr: 'Opération non autorisée', en: 'Operation not allowed' },
  { fr: 'Requête invalide', en: 'Invalid request' },
  {
    fr: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
    en: 'An internal error occurred. Please try again later.',
  },

  /* --- Messages personnalisés des DTO (class-validator) --- */
  { fr: 'Email invalide', en: 'Invalid email address' },
  { fr: 'Rôle inconnu', en: 'Unknown role' },
  { fr: 'Statut de prospect inconnu', en: 'Unknown prospect status' },
  { fr: 'Canal inconnu (EMAIL ou APPLICATION)', en: 'Unknown channel (EMAIL or APPLICATION)' },

  /* --- Messages par défaut de NestJS (anglais -> français) --- */
  { fr: 'Non autorisé', en: 'Unauthorized' },
  { fr: 'Ressource interdite', en: 'Forbidden resource' },
  { fr: 'Introuvable', en: 'Not Found' },
  { fr: 'Requête incorrecte', en: 'Bad Request' },
  { fr: 'Conflit', en: 'Conflict' },
  { fr: 'Erreur interne du serveur', en: 'Internal server error' },
  { fr: 'Trop de requêtes', en: 'ThrottlerException: Too Many Requests' },
  { fr: 'Entité non traitable', en: 'Unprocessable Entity' },
  { fr: 'Fichier trop volumineux', en: 'File too large' },
  { fr: 'Type de fichier non autorisé', en: 'Unexpected field' },
];

/** Index de recherche : clé normalisée (fr ET en) -> traduction. */
export const EXACT_MESSAGES: Record<string, TranslatedMessage> = (() => {
  const index: Record<string, TranslatedMessage> = {};
  for (const entry of RAW_MESSAGES) {
    index[normalizeKey(entry.fr)] = entry;
    const enKey = normalizeKey(entry.en);
    if (!(enKey in index)) index[enKey] = entry;
  }
  return index;
})();

/* -------------------------------------------------------------------------- */
/*  2. Motifs dynamiques                                                       */
/* -------------------------------------------------------------------------- */

interface MessagePattern {
  test: RegExp;
  fr: (m: RegExpMatchArray) => string;
  en: (m: RegExpMatchArray) => string;
}

const MESSAGE_PATTERNS: MessagePattern[] = [
  /* « Membre 42 introuvable », « Organisation "slug" introuvable », « Compte parent introuvable » */
  {
    test: /^(.+?)\s+(?:«\s*)?["“”']?([^"“”']*?)["“”']?\s*(?:»\s*)?(?:introuvable|non trouvée?|non trouvé)\s*\.?$/i,
    fr: (m) => `${m[1]}${m[2] ? ` ${m[2]}` : ''} introuvable`,
    en: (m) => `${translateEntity(m[1])}${m[2] ? ` ${m[2]}` : ''} not found`,
  },
  /* « Membre introuvable » (sans identifiant) */
  {
    test: /^(.+?)\s+(?:introuvable|non trouvée?|non trouvé)\s*\.?$/i,
    fr: (m) => `${m[1]} introuvable`,
    en: (m) => `${translateEntity(m[1])} not found`,
  },
  /* « La référence de convention ABC existe déjà » */
  {
    test: /^La référence de convention\s+(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `La référence de convention ${m[1]} existe déjà`,
    en: (m) => `Agreement reference ${m[1]} already exists`,
  },
  /* « La référence ABC est déjà utilisée » */
  {
    test: /^La référence\s+(.+?)\s+(?:est déjà utilisée|existe déjà)\s*\.?$/i,
    fr: (m) => `La référence ${m[1]} est déjà utilisée`,
    en: (m) => `Reference ${m[1]} is already in use`,
  },
  /* « Le numéro de membre M-001 existe déjà » */
  {
    test: /^Le numéro de membre\s+(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `Le numéro de membre ${m[1]} existe déjà`,
    en: (m) => `Member number ${m[1]} already exists`,
  },
  /* « Le matricule E-001 existe déjà » */
  {
    test: /^Le matricule\s+(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `Le matricule ${m[1]} existe déjà`,
    en: (m) => `Employee number ${m[1]} already exists`,
  },
  /* « Le compte 601000 existe déjà » */
  {
    test: /^Le compte\s+(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `Le compte ${m[1]} existe déjà`,
    en: (m) => `Account ${m[1]} already exists`,
  },
  /* « Le journal ACH existe déjà » */
  {
    test: /^Le journal\s+(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `Le journal ${m[1]} existe déjà`,
    en: (m) => `Journal ${m[1]} already exists`,
  },
  /* « Une fiche de paie pour la période 2026-01 existe déjà » */
  {
    test: /^Une fiche de paie pour la période\s+(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `Une fiche de paie pour la période ${m[1]} existe déjà`,
    en: (m) => `A payslip already exists for period ${m[1]}`,
  },
  /* Fallback générique « ... existe déjà » */
  {
    test: /^(.+?)\s+existe déjà\s*\.?$/i,
    fr: (m) => `${m[1]} existe déjà`,
    en: (m) => `${m[1]} already exists`,
  },
  /* « Rôle requis : ADMIN, TRESORIER » */
  {
    test: /^Rôle requis\s*:\s*(.+?)\s*\.?$/i,
    fr: (m) => `Rôle requis : ${m[1]}`,
    en: (m) => `Required role: ${m[1]}`,
  },
  /* « L'écriture est déséquilibrée : débit=100, crédit=90 » */
  {
    test: /^L['’]écriture est déséquilibrée\s*:\s*débit\s*=\s*(.+?)\s*,\s*crédit\s*=\s*(.+?)\s*\.?$/i,
    fr: (m) => `L'écriture est déséquilibrée : débit=${m[1]}, crédit=${m[2]}`,
    en: (m) => `The journal entry is unbalanced: debit=${m[1]}, credit=${m[2]}`,
  },
  /* « Stock insuffisant. Disponible: 3, demandé: 10 » */
  {
    test: /^Stock insuffisant\.?\s*Disponible\s*:\s*(.+?)\s*,\s*demandé\s*:\s*(.+?)\s*\.?$/i,
    fr: (m) => `Stock insuffisant. Disponible : ${m[1]}, demandé : ${m[2]}`,
    en: (m) => `Insufficient stock. Available: ${m[1]}, requested: ${m[2]}`,
  },

  /* ---- Messages par défaut de class-validator (anglais -> français) ---- */
  {
    test: /^property (.+?) should not exist$/i,
    fr: (m) => `La propriété ${m[1]} n'est pas autorisée`,
    en: (m) => `property ${m[1]} should not exist`,
  },
  {
    test: /^(.+?) should not be empty$/i,
    fr: (m) => `Le champ ${m[1]} est obligatoire`,
    en: (m) => `${m[1]} should not be empty`,
  },
  {
    test: /^(.+?) must be a string$/i,
    fr: (m) => `Le champ ${m[1]} doit être une chaîne de caractères`,
    en: (m) => `${m[1]} must be a string`,
  },
  {
    test: /^(.+?) must be a number conforming to the specified constraints$/i,
    fr: (m) => `Le champ ${m[1]} doit être un nombre valide`,
    en: (m) => `${m[1]} must be a number conforming to the specified constraints`,
  },
  {
    test: /^(.+?) must be an integer number$/i,
    fr: (m) => `Le champ ${m[1]} doit être un nombre entier`,
    en: (m) => `${m[1]} must be an integer number`,
  },
  {
    test: /^(.+?) must be a positive number$/i,
    fr: (m) => `Le champ ${m[1]} doit être un nombre positif`,
    en: (m) => `${m[1]} must be a positive number`,
  },
  {
    test: /^(.+?) must be a boolean value$/i,
    fr: (m) => `Le champ ${m[1]} doit être un booléen`,
    en: (m) => `${m[1]} must be a boolean value`,
  },
  {
    test: /^(.+?) must be an email$/i,
    fr: (m) => `Le champ ${m[1]} doit être une adresse email valide`,
    en: (m) => `${m[1]} must be an email`,
  },
  {
    test: /^(.+?) must be a valid ISO 8601 date string$/i,
    fr: (m) => `Le champ ${m[1]} doit être une date valide (format ISO 8601)`,
    en: (m) => `${m[1]} must be a valid ISO 8601 date string`,
  },
  {
    test: /^(.+?) must be a Date instance$/i,
    fr: (m) => `Le champ ${m[1]} doit être une date valide`,
    en: (m) => `${m[1]} must be a Date instance`,
  },
  {
    test: /^(.+?) must be an array$/i,
    fr: (m) => `Le champ ${m[1]} doit être une liste`,
    en: (m) => `${m[1]} must be an array`,
  },
  {
    test: /^(.+?) must be an object$/i,
    fr: (m) => `Le champ ${m[1]} doit être un objet`,
    en: (m) => `${m[1]} must be an object`,
  },
  {
    test: /^(.+?) must be a UUID$/i,
    fr: (m) => `Le champ ${m[1]} doit être un identifiant UUID valide`,
    en: (m) => `${m[1]} must be a UUID`,
  },
  {
    test: /^(.+?) must not be less than (.+?)$/i,
    fr: (m) => `Le champ ${m[1]} ne doit pas être inférieur à ${m[2]}`,
    en: (m) => `${m[1]} must not be less than ${m[2]}`,
  },
  {
    test: /^(.+?) must not be greater than (.+?)$/i,
    fr: (m) => `Le champ ${m[1]} ne doit pas être supérieur à ${m[2]}`,
    en: (m) => `${m[1]} must not be greater than ${m[2]}`,
  },
  {
    test: /^(.+?) must be longer than or equal to (.+?) characters$/i,
    fr: (m) => `Le champ ${m[1]} doit contenir au moins ${m[2]} caractères`,
    en: (m) => `${m[1]} must be longer than or equal to ${m[2]} characters`,
  },
  {
    test: /^(.+?) must be shorter than or equal to (.+?) characters$/i,
    fr: (m) => `Le champ ${m[1]} ne doit pas dépasser ${m[2]} caractères`,
    en: (m) => `${m[1]} must be shorter than or equal to ${m[2]} characters`,
  },
  {
    test: /^(.+?) must be one of the following values: (.+?)$/i,
    fr: (m) => `Le champ ${m[1]} doit avoir l'une des valeurs suivantes : ${m[2]}`,
    en: (m) => `${m[1]} must be one of the following values: ${m[2]}`,
  },
  {
    test: /^each value in (.+?) must be (.+?)$/i,
    fr: (m) => `Chaque valeur de ${m[1]} doit être ${m[2]}`,
    en: (m) => `each value in ${m[1]} must be ${m[2]}`,
  },
];

/* -------------------------------------------------------------------------- */
/*  API publique                                                               */
/* -------------------------------------------------------------------------- */

/** Message générique renvoyé pour toute erreur serveur (aucun détail technique). */
export const GENERIC_ERROR_KEY = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';

/**
 * Traduit un message unique. Renvoie le message d'origine s'il est inconnu.
 */
export function translateMessage(message: string, locale: Locale): string {
  if (typeof message !== 'string' || message.trim() === '') return message;

  const exact = EXACT_MESSAGES[normalizeKey(message)];
  if (exact) return exact[locale];

  for (const pattern of MESSAGE_PATTERNS) {
    const match = message.match(pattern.test);
    if (match) return pattern[locale](match);
  }

  // Inconnu : on renvoie le message tel quel (jamais vide, jamais une clé technique).
  return message;
}

/**
 * Traduit un message ou un tableau de messages (class-validator renvoie un tableau).
 */
export function translateMessages<T extends string | string[] | unknown>(
  message: T,
  locale: Locale,
): T {
  if (typeof message === 'string') {
    return translateMessage(message, locale) as T;
  }
  if (Array.isArray(message)) {
    return message.map((m) =>
      typeof m === 'string' ? translateMessage(m, locale) : m,
    ) as unknown as T;
  }
  return message;
}

/**
 * Détermine la locale à partir de l'en-tête `Accept-Language`.
 * Repli sur `fr` si l'en-tête est absent, vide ou non supporté.
 *
 * Exemples : "en-US,en;q=0.9,fr;q=0.8" -> en ; "fr-FR" -> fr ; "*" -> fr.
 */
export function resolveLocale(acceptLanguage?: string | string[]): Locale {
  const header = Array.isArray(acceptLanguage) ? acceptLanguage[0] : acceptLanguage;
  if (!header || typeof header !== 'string') return DEFAULT_LOCALE;

  const candidates = header
    .split(',')
    .map((part) => {
      const [tagRaw, ...params] = part.trim().split(';');
      const tag = tagRaw.trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag, q } of candidates) {
    if (q <= 0) continue;
    const base = tag.split('-')[0] as Locale;
    if (SUPPORTED_LOCALES.includes(base)) return base;
  }

  return DEFAULT_LOCALE;
}
