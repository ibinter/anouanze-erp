/**
 * Configuration i18n — ANOUANZÊ ERP (IBIG SOFT)
 *
 * Stratégie retenue : next-intl **sans routing par préfixe d'URL**.
 * La locale est déterminée par le cookie `NEXT_LOCALE` (posé par le
 * sélecteur de langue), avec repli sur l'en-tête `Accept-Language`,
 * puis sur le français.
 *
 * Conséquence : aucune route existante n'est modifiée
 * (`/login`, `/dashboard`, `/superadmin`, ... restent inchangées).
 */

export const locales = ['fr', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fr';

/** Nom du cookie mémorisant le choix de langue de l'utilisateur. */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

/** Durée de vie du cookie de langue : 1 an. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const localeLabels: Record<Locale, { label: string; flag: string }> = {
  fr: { label: 'Français', flag: '🇫🇷' },
  en: { label: 'English', flag: '🇬🇧' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}
