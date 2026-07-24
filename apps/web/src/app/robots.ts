import type { MetadataRoute } from 'next';
import { absoluteUrl, DISALLOWED_PREFIXES, SITE_URL } from '@/lib/seo';

/**
 * `/robots.txt`.
 *
 * Ouvert sur les pages marketing et légales, fermé sur tout l'espace
 * authentifié (dashboard, superadmin, écrans métier), sur `/api/` et sur la
 * page de repli hors-ligne de la PWA.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...DISALLOWED_PREFIXES],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
