import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Configuration Vitest — apps/web (section 42 du cahier des charges).
 *
 * Environnement `node` : toute la logique testée (toNum, pdf-engine, aide, SARA)
 * est PURE et ne touche ni au DOM ni à React. Pas besoin de jsdom, ce qui évite
 * une dépendance lourde et garde la suite rapide.
 *
 * L'alias `@/…` reproduit celui de tsconfig.json (paths) pour que les imports
 * absolus utilisés dans le code applicatif résolvent aussi sous Vitest.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/*.test.ts'],
    globals: false,
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
