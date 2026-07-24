import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_ROUTES } from '@/lib/seo';

/**
 * Plan du site — exposé sur `/sitemap.xml`.
 *
 * Les routes proviennent de `PUBLIC_ROUTES` (`src/lib/seo.ts`), qui recopie
 * exactement l'arborescence publique de `src/app/`. Aucune URL n'est inventée
 * et l'espace authentifié en est absent (voir `robots.ts`).
 *
 * Note i18n : l'internationalisation se fait par cookie `NEXT_LOCALE`, sans
 * préfixe d'URL — il n'existe donc **pas** de variante `/en/...` à déclarer
 * en `alternates`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority,
  }));
}
