/**
 * Constantes SEO partagées par `layout.tsx`, `page.tsx`, `sitemap.ts`,
 * `robots.ts` et `opengraph-image.tsx`.
 *
 * Rien ici ne doit être inventé : toutes les valeurs sont vérifiables
 * (routes réellement présentes dans `src/app/`, coordonnées publiées sur le
 * site, identité de l'éditeur).
 */

/**
 * URL canonique du site.
 *
 * Surchargeable par `NEXT_PUBLIC_SITE_URL` (préproduction, domaine de test).
 * On n'utilise volontairement pas `NEXT_PUBLIC_APP_URL`, qui vaut
 * `http://localhost:3099` en développement : une balise canonique pointant
 * vers localhost serait bien pire que pas de canonique du tout.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://anouanze.ibigsoft.com'
).replace(/\/$/, '');

export const SITE_NAME = 'ANOUANZÊ ERP';

/**
 * En-tête posé par `src/middleware.ts` pour transmettre le chemin demandé aux
 * composants serveur (Next n'expose pas le pathname dans un layout).
 * Sert à n'émettre le balisage FAQPage que sur la landing.
 */
export const PATHNAME_HEADER = 'x-anouanze-pathname';

/** Éditeur du logiciel. */
export const PUBLISHER = {
  name: 'IBIG SOFT',
  legalName: 'Intermark Business International Group',
  url: 'https://ibigsoft.com',
  /** Numéro affiché publiquement sur la landing (bouton WhatsApp). */
  phone: '+2250555059901',
  country: 'CI',
} as const;

/** Couleurs de marque. */
export const BRAND = {
  primary: '#146C43',
  accent: '#F28C25',
  dark: '#0B2D1E',
} as const;

/**
 * Routes publiques indexables — miroir exact de `src/app/`.
 *
 * `changeFrequency` et `priority` sont indicatifs : la landing bouge, les
 * pages légales très peu.
 */
export const PUBLIC_ROUTES: ReadonlyArray<{
  path: string;
  priority: number;
  changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
}> = [
  // Landing
  { path: '/', priority: 1, changeFrequency: 'weekly' },

  // Conversion
  { path: '/demo', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/login', priority: 0.4, changeFrequency: 'yearly' },

  // Les 18 pages légales et contractuelles
  { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/traitement-donnees', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cookies', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cgu', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/conditions-commerciales', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/conditions-essai', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/conditions-sara', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/licence', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/propriete-intellectuelle', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/protection-marque', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/limitation-responsabilite-ia', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/politique-remboursement', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/politique-resiliation', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/politique-sauvegarde', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/politique-support', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/gestion-compte', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/reclamations', priority: 0.3, changeFrequency: 'yearly' },
];

/**
 * Préfixes interdits aux robots : tout l'espace authentifié, l'API interne et
 * la page de repli hors-ligne de la PWA (sans intérêt pour l'indexation).
 * La liste reprend celle de `src/middleware.ts`.
 */
export const DISALLOWED_PREFIXES: readonly string[] = [
  '/api/',
  '/dashboard',
  '/superadmin',
  '/offline',
  '/profil',
  '/parametres',
  '/notifications',
  '/mot-de-passe-oublie',
  '/reinitialiser-mot-de-passe',
  '/membres',
  '/projets',
  '/comptabilite',
  '/tresorerie',
  '/budget',
  '/rh',
  '/donateurs',
  '/bailleurs',
  '/stocks',
  '/achats',
  '/documents',
  '/evenements',
  '/reporting',
  '/gouvernance',
  '/beneficiaires',
  '/immobilisations',
  '/audit',
  '/ia',
  '/meal',
  '/tickets',
  '/import',
  '/paiements',
  '/aide',
  '/academie',
];

/** URL absolue à partir d'un chemin relatif. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
