import { cookies, headers } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';
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

/**
 * Domaines de traduction de l'espace interne, chacun dans son fichier.
 * Ce découpage permet de faire évoluer un module sans toucher aux autres
 * (et évite les conflits d'écriture quand plusieurs chantiers avancent
 * en parallèle). L'ordre n'a pas d'importance : les clés sont disjointes.
 */
const DOMAINES = ['shell', 'relations', 'finance', 'activites', 'outils'] as const;

async function chargerMessages(locale: Locale): Promise<AbstractIntlMessages> {
  const base = (await import(`../../messages/${locale}.json`)).default;

  const domaines = await Promise.all(
    DOMAINES.map(async (domaine) => {
      try {
        return (await import(`../../messages/${locale}/${domaine}.json`)).default;
      } catch {
        // Domaine pas encore traduit : on ignore silencieusement plutôt que
        // de casser le rendu de toute l'application.
        return {};
      }
    }),
  );

  return Object.assign({}, base, ...domaines);
}

export default getRequestConfig(async () => {
  const locale = resolveLocale();

  return {
    locale,
    messages: await chargerMessages(locale),
    timeZone: 'Africa/Abidjan',
    now: new Date(),
  };
});
