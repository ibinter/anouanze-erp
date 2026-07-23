import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale, locales, LOCALE_COOKIE, type Locale } from './config';

/**
 * Détecte la langue préférée depuis l'en-tête `Accept-Language`.
 * Repli sur `defaultLocale` (français) si aucune correspondance.
 */
function detectFromHeaders(): Locale {
  try {
    const accept = headers().get('accept-language');
    if (!accept) return defaultLocale;

    const ranked = accept
      .split(',')
      .map((part) => {
        const [tag, ...params] = part.trim().split(';');
        const q = params.find((p) => p.trim().startsWith('q='));
        return {
          tag: tag.trim().toLowerCase(),
          q: q ? Number.parseFloat(q.split('=')[1]) || 0 : 1,
        };
      })
      .sort((a, b) => b.q - a.q);

    for (const { tag } of ranked) {
      const base = tag.split('-')[0];
      const match = locales.find((l) => l === base);
      if (match) return match;
    }
  } catch {
    /* headers() indisponible (rendu statique) → repli */
  }
  return defaultLocale;
}

/** Locale effective de la requête : cookie > Accept-Language > français. */
export function resolveLocale(): Locale {
  try {
    const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
    if (isLocale(cookieLocale)) return cookieLocale;
  } catch {
    /* cookies() indisponible → repli */
  }
  return detectFromHeaders();
}

export default getRequestConfig(async () => {
  const locale = resolveLocale();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Africa/Abidjan',
    now: new Date(),
  };
});
