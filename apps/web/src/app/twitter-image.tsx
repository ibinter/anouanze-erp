/**
 * Twitter Card : même visuel que l'Open Graph (format 1200×630, compatible
 * `summary_large_image`). Réexport pour éviter toute divergence.
 */
export { default, alt, size, contentType } from './opengraph-image';

/** Même raison que pour l'Open Graph : génération à la demande, pas au build. */
export const dynamic = 'force-dynamic';
