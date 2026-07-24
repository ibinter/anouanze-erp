/**
 * Politique de mot de passe — appliquée **côté serveur**, seul endroit qui compte.
 *
 * Utilisée par :
 *   - AuthService.register        (création de compte)
 *   - AuthService.resetPassword   (réinitialisation par lien email)
 *   - UtilisateursService.changerMotDePasse (changement depuis le profil)
 *
 * La règle est volontairement codée en dur : aucune table ne permet aujourd'hui
 * de stocker une politique paramétrable par organisation. L'interface affiche
 * exactement ces valeurs (endpoint GET /auth/politique-mot-de-passe) plutôt que
 * des règles inventées.
 */

export const POLITIQUE_MOT_DE_PASSE = {
  longueurMinimale: 12,
  longueurMaximale: 128,
  /** Nombre minimal de classes de caractères parmi : minuscules, majuscules, chiffres, symboles. */
  classesRequises: 3,
  interditMotsCourants: true,
  interditRepetitions: true,
  interditSequences: true,
  interditDonneesPersonnelles: true,
} as const;

/**
 * Mots de passe les plus courants (fuites publiques) et déclinaisons locales.
 * Liste volontairement courte et embarquée : pas de dépendance, pas de fichier
 * de 100 000 lignes à charger en mémoire au démarrage de l'API.
 */
const MOTS_DE_PASSE_COURANTS = new Set([
  'password', 'passw0rd', 'password1', 'password123', 'motdepasse', 'motdepasse1',
  'motdepasse123', 'azerty', 'azertyuiop', 'qwerty', 'qwertyuiop', 'qwerty123',
  '123456', '1234567', '12345678', '123456789', '1234567890', '111111', '000000',
  'iloveyou', 'admin', 'admin123', 'administrateur', 'root', 'toor', 'welcome',
  'welcome1', 'bienvenue', 'bienvenue1', 'letmein', 'monkey', 'dragon', 'sunshine',
  'princess', 'football', 'baseball', 'superman', 'batman', 'trustno1', 'starwars',
  'abc123', 'abcd1234', 'a1b2c3d4', 'changeme', 'changeme123', 'secret', 'secret123',
  'soleil', 'bonjour', 'coucou', 'chouchou', 'doudou', 'nounours', 'marseille',
  'abidjan', 'cotedivoire', 'anouanze', 'anouanzeerp', 'espoirafrique', 'ibigsoft',
  'organisation', 'association', 'utilisateur', 'test1234', 'temp1234', 'qwerty1234',
]);

const SEQUENCES = [
  'abcdefghijklmnopqrstuvwxyz',
  'azertyuiopqsdfghjklmwxcvbn',
  'qwertyuiopasdfghjklzxcvbnm',
  '01234567890',
];

export interface ResultatPolitique {
  valide: boolean;
  /** Messages d'erreur, en français, prêts à être affichés. */
  erreurs: string[];
  /** Score indicatif 0–4 (identique à celui affiché côté client). */
  score: number;
}

function classesUtilisees(valeur: string): number {
  let n = 0;
  if (/[a-z]/.test(valeur)) n++;
  if (/[A-Z]/.test(valeur)) n++;
  if (/[0-9]/.test(valeur)) n++;
  if (/[^A-Za-z0-9]/.test(valeur)) n++;
  return n;
}

const DIACRITIQUES = /[̀-ͯ]/g;

function normaliser(valeur: string): string {
  return valeur
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITIQUES, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Détecte 4 caractères consécutifs issus d'une séquence clavier/alphabet (ex. « abcd », « 1234 »). */
function contientSequence(valeur: string): boolean {
  const v = valeur.toLowerCase();
  for (const sequence of SEQUENCES) {
    for (let i = 0; i + 4 <= sequence.length; i++) {
      const morceau = sequence.slice(i, i + 4);
      const inverse = morceau.split('').reverse().join('');
      if (v.includes(morceau) || v.includes(inverse)) return true;
    }
  }
  return false;
}

/** Score indicatif 0–4 — même calcul côté serveur et côté client. */
export function scoreMotDePasse(valeur: string): number {
  if (!valeur) return 0;
  let score = 0;
  if (valeur.length >= POLITIQUE_MOT_DE_PASSE.longueurMinimale) score++;
  if (valeur.length >= 16) score++;
  const classes = classesUtilisees(valeur);
  if (classes >= 3) score++;
  if (classes === 4) score++;
  if (MOTS_DE_PASSE_COURANTS.has(normaliser(valeur))) return 0;
  if (contientSequence(valeur)) score = Math.max(0, score - 1);
  return Math.min(4, score);
}

/**
 * Valide un mot de passe. `contexte` permet de rejeter un mot de passe qui
 * reprend l'email, le nom ou le prénom de l'utilisateur.
 */
export function validerMotDePasse(
  valeur: string,
  contexte: { email?: string | null; nom?: string | null; prenom?: string | null } = {},
): ResultatPolitique {
  const erreurs: string[] = [];
  const mdp = valeur ?? '';

  if (mdp.length < POLITIQUE_MOT_DE_PASSE.longueurMinimale) {
    erreurs.push(
      `Le mot de passe doit contenir au moins ${POLITIQUE_MOT_DE_PASSE.longueurMinimale} caractères.`,
    );
  }
  if (mdp.length > POLITIQUE_MOT_DE_PASSE.longueurMaximale) {
    erreurs.push(
      `Le mot de passe ne doit pas dépasser ${POLITIQUE_MOT_DE_PASSE.longueurMaximale} caractères.`,
    );
  }
  if (classesUtilisees(mdp) < POLITIQUE_MOT_DE_PASSE.classesRequises) {
    erreurs.push(
      'Le mot de passe doit combiner au moins 3 types de caractères parmi : minuscules, majuscules, chiffres et symboles.',
    );
  }

  const normalise = normaliser(mdp);
  if (normalise && MOTS_DE_PASSE_COURANTS.has(normalise)) {
    erreurs.push('Ce mot de passe figure parmi les plus utilisés au monde : choisissez-en un autre.');
  }
  if (/(.)\1{3,}/.test(mdp)) {
    erreurs.push('Le mot de passe ne doit pas répéter 4 fois le même caractère.');
  }
  if (contientSequence(mdp)) {
    erreurs.push('Le mot de passe ne doit pas contenir de suite évidente (« abcd », « 1234 », « azer »…).');
  }

  const fragments = [
    contexte.email?.split('@')[0],
    contexte.nom,
    contexte.prenom,
  ]
    .map((f) => (f ? normaliser(f) : ''))
    .filter((f) => f.length >= 4);

  if (normalise && fragments.some((f) => normalise.includes(f))) {
    erreurs.push('Le mot de passe ne doit pas reprendre votre nom, prénom ou adresse email.');
  }

  return { valide: erreurs.length === 0, erreurs, score: scoreMotDePasse(mdp) };
}

/** Description lisible de la politique — exposée telle quelle par l'API à l'interface. */
export function decrirePolitique() {
  return {
    longueurMinimale: POLITIQUE_MOT_DE_PASSE.longueurMinimale,
    longueurMaximale: POLITIQUE_MOT_DE_PASSE.longueurMaximale,
    classesRequises: POLITIQUE_MOT_DE_PASSE.classesRequises,
    regles: [
      `Au moins ${POLITIQUE_MOT_DE_PASSE.longueurMinimale} caractères`,
      'Au moins 3 types de caractères parmi minuscules, majuscules, chiffres et symboles',
      'Pas de mot de passe figurant dans les listes de fuites les plus courantes',
      'Pas de suite évidente (abcd, 1234, azer) ni de caractère répété 4 fois',
      'Pas de reprise du nom, du prénom ou de l’adresse email',
    ],
    /** Ce qui n'est PAS implémenté — affiché honnêtement dans l'interface. */
    nonImplemente: [
      'Expiration périodique du mot de passe',
      'Historique des anciens mots de passe',
      'Politique paramétrable par organisation',
    ],
    hachage: 'bcrypt, coût 12',
  };
}
