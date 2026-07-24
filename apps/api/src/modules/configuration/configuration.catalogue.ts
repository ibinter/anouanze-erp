import { CategorieConfiguration } from '@prisma/client';

/**
 * Catalogue des clés d'intégration gérables depuis l'interface d'administration.
 *
 * Seules les clés listées ici peuvent être écrites via l'API : c'est le
 * garde-fou qui empêche un SUPER_ADMIN d'injecter n'importe quelle variable
 * (DATABASE_URL, JWT_SECRET…) dans la base.
 */

export interface CleConfiguration {
  /** Nom de la clé — identique au nom de la variable d'environnement de repli. */
  cle: string;
  categorie: CategorieConfiguration;
  /** Si vrai : valeur chiffrée en base et jamais renvoyée en clair. */
  secret: boolean;
  /** Libellé explicatif affiché dans l'interface. */
  description: string;
  /** Valeurs autorisées, quand la clé est une énumération. */
  valeursAutorisees?: string[];
  /** Exemple non sensible affiché en aide à la saisie. */
  exemple?: string;
}

export const CATALOGUE_CONFIGURATION: readonly CleConfiguration[] = [
  // ─── Paiements — CinetPay ───────────────────────────────────────────
  {
    cle: 'CINETPAY_API_KEY',
    categorie: CategorieConfiguration.PAIEMENT,
    secret: true,
    description: "Clé d'API du compte marchand CinetPay (tableau de bord CinetPay › Intégrations).",
  },
  {
    cle: 'CINETPAY_SITE_ID',
    categorie: CategorieConfiguration.PAIEMENT,
    secret: false,
    description: 'Identifiant numérique du site marchand CinetPay.',
    exemple: '5875495',
  },
  {
    cle: 'CINETPAY_SECRET_KEY',
    categorie: CategorieConfiguration.PAIEMENT,
    secret: true,
    description: 'Clé secrète servant à vérifier la signature HMAC des webhooks CinetPay.',
  },
  {
    cle: 'CINETPAY_NOTIFY_URL',
    categorie: CategorieConfiguration.PAIEMENT,
    secret: false,
    description: 'URL publique appelée par CinetPay pour notifier le résultat du paiement.',
    exemple: 'https://api.exemple.com/api/v1/paiements/webhook/cinetpay',
  },
  {
    cle: 'CINETPAY_RETURN_URL',
    categorie: CategorieConfiguration.PAIEMENT,
    secret: false,
    description: "URL de retour de l'utilisateur après le paiement.",
    exemple: 'https://app.exemple.com/paiements',
  },
  {
    cle: 'CINETPAY_MODE',
    categorie: CategorieConfiguration.PAIEMENT,
    secret: false,
    description: 'Mode d’exploitation : PRODUCTION (par défaut) ou TEST (journalisation verbeuse).',
    valeursAutorisees: ['PRODUCTION', 'TEST'],
  },

  // ─── Messagerie — SMTP ──────────────────────────────────────────────
  {
    cle: 'SMTP_HOST',
    categorie: CategorieConfiguration.EMAIL,
    secret: false,
    description: "Serveur SMTP sortant. Tant qu'il est vide, aucun email n'est envoyé.",
    exemple: 'smtp.exemple.com',
  },
  {
    cle: 'SMTP_PORT',
    categorie: CategorieConfiguration.EMAIL,
    secret: false,
    description: 'Port SMTP : 587 (STARTTLS), 465 (TLS implicite) ou 25.',
    exemple: '587',
  },
  {
    cle: 'SMTP_SECURE',
    categorie: CategorieConfiguration.EMAIL,
    secret: false,
    description: 'true pour une connexion TLS implicite (port 465), false sinon.',
    valeursAutorisees: ['true', 'false'],
  },
  {
    cle: 'SMTP_USER',
    categorie: CategorieConfiguration.EMAIL,
    secret: false,
    description: "Identifiant d'authentification SMTP. Laisser vide pour un relais local sans auth.",
  },
  {
    cle: 'SMTP_PASSWORD',
    categorie: CategorieConfiguration.EMAIL,
    secret: true,
    description: "Mot de passe ou jeton d'application du compte SMTP.",
  },
  {
    cle: 'EMAIL_FROM',
    categorie: CategorieConfiguration.EMAIL,
    secret: false,
    description: 'Expéditeur affiché sur les emails sortants.',
    exemple: 'ANOUANZÊ ERP <no-reply@exemple.com>',
  },

  // ─── Intelligence artificielle — assistante SARA ────────────────────
  {
    cle: 'SARA_PROVIDER',
    categorie: CategorieConfiguration.IA,
    secret: false,
    description: "Fournisseur d'IA utilisé par l'assistante SARA.",
    valeursAutorisees: ['groq', 'openai', 'anthropic', 'mistral'],
  },
  {
    cle: 'GROQ_API_KEY',
    categorie: CategorieConfiguration.IA,
    secret: true,
    description: "Clé d'API Groq (console.groq.com).",
  },
  {
    cle: 'OPENAI_API_KEY',
    categorie: CategorieConfiguration.IA,
    secret: true,
    description: "Clé d'API OpenAI (platform.openai.com).",
  },
  {
    cle: 'ANTHROPIC_API_KEY',
    categorie: CategorieConfiguration.IA,
    secret: true,
    description: "Clé d'API Anthropic (console.anthropic.com).",
  },
  {
    cle: 'MISTRAL_API_KEY',
    categorie: CategorieConfiguration.IA,
    secret: true,
    description: "Clé d'API Mistral AI (console.mistral.ai).",
  },
] as const;

const INDEX_CATALOGUE = new Map<string, CleConfiguration>(
  CATALOGUE_CONFIGURATION.map((entree) => [entree.cle, entree]),
);

/** Renvoie la définition d'une clé, ou `undefined` si elle n'est pas gérable. */
export function trouverCle(cle: string): CleConfiguration | undefined {
  return INDEX_CATALOGUE.get(cle?.trim()?.toUpperCase() ?? '');
}

/** Toutes les clés d'une catégorie, dans l'ordre du catalogue. */
export function clesParCategorie(categorie: CategorieConfiguration): CleConfiguration[] {
  return CATALOGUE_CONFIGURATION.filter((entree) => entree.categorie === categorie);
}

/** Vrai si la clé est déclarée comme secrète dans le catalogue. */
export function estCleSecrete(cle: string): boolean {
  return trouverCle(cle)?.secret === true;
}
