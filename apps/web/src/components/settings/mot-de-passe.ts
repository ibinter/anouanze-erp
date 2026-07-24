/**
 * Indicateur de robustesse — miroir de la règle appliquée par l'API
 * (apps/api/src/modules/auth/politique-mot-de-passe.ts).
 *
 * ⚠️ La validation qui fait foi reste **serveur** : ce module ne sert qu'à
 * guider la saisie et ne doit jamais être considéré comme un contrôle.
 */

export const LONGUEUR_MINIMALE_PAR_DEFAUT = 12;

export function classesUtilisees(valeur: string): number {
  let n = 0;
  if (/[a-z]/.test(valeur)) n++;
  if (/[A-Z]/.test(valeur)) n++;
  if (/[0-9]/.test(valeur)) n++;
  if (/[^A-Za-z0-9]/.test(valeur)) n++;
  return n;
}

const SEQUENCES = ['abcdefghijklmnopqrstuvwxyz', 'azertyuiopqsdfghjklmwxcvbn', '01234567890'];

export function contientSequence(valeur: string): boolean {
  const v = valeur.toLowerCase();
  return SEQUENCES.some((sequence) => {
    for (let i = 0; i + 4 <= sequence.length; i++) {
      const morceau = sequence.slice(i, i + 4);
      const inverse = morceau.split('').reverse().join('');
      if (v.includes(morceau) || v.includes(inverse)) return true;
    }
    return false;
  });
}

/** Score 0–4, identique au calcul serveur. */
export function scoreMotDePasse(
  valeur: string,
  longueurMinimale = LONGUEUR_MINIMALE_PAR_DEFAUT,
): number {
  if (!valeur) return 0;
  let score = 0;
  if (valeur.length >= longueurMinimale) score++;
  if (valeur.length >= 16) score++;
  const classes = classesUtilisees(valeur);
  if (classes >= 3) score++;
  if (classes === 4) score++;
  if (contientSequence(valeur)) score = Math.max(0, score - 1);
  return Math.min(4, score);
}

export const COULEURS_ROBUSTESSE = [
  'bg-neutral-200',
  'bg-red-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-emerald-600',
];
