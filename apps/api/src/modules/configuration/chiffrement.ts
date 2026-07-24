import { Logger } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

/**
 * Chiffrement au repos des valeurs de configuration sensibles.
 *
 * Algorithme : AES-256-GCM. La clé est dérivée de la variable d'environnement
 * `CONFIG_ENCRYPTION_KEY` via scrypt (sel fixe applicatif — la clé maîtresse est
 * le secret, pas le sel). Un IV aléatoire de 12 octets est tiré pour chaque
 * valeur et le tag d'authentification est conservé.
 *
 * Format stocké : `v1:<iv base64>:<tag base64>:<chiffré base64>`
 *
 * ⚠️ DÉGRADATION HONNÊTE : si `CONFIG_ENCRYPTION_KEY` est absente, l'application
 * démarre et fonctionne normalement (les valeurs NON secrètes restent lisibles
 * et modifiables) ; seule l'écriture d'un secret est refusée avec un message
 * explicite. Aucun crash au démarrage, jamais.
 */

const PREFIXE_VERSION = 'v1';
const ALGO = 'aes-256-gcm';
const LONGUEUR_IV = 12;
const LONGUEUR_TAG = 16;
const SEL = 'anouanze-erp-configuration-v1';

const logger = new Logger('ChiffrementConfiguration');

/** Message unique réutilisé par le service et le contrôleur. */
export const MESSAGE_CHIFFREMENT_NON_CONFIGURE =
  "Chiffrement non configuré : la variable d'environnement CONFIG_ENCRYPTION_KEY est absente. " +
  'Impossible d’enregistrer une valeur secrète tant qu’elle n’est pas définie sur le serveur.';

/** Erreur levée lorsqu'on tente de chiffrer sans clé maîtresse. */
export class ChiffrementNonConfigureError extends Error {
  constructor(message: string = MESSAGE_CHIFFREMENT_NON_CONFIGURE) {
    super(message);
    this.name = 'ChiffrementNonConfigureError';
  }
}

/** Clé dérivée mise en cache : scrypt est volontairement coûteux. */
let cleDerivee: Buffer | null = null;
let cleSource: string | null = null;

function lireCleMaitre(): string {
  const brut = process.env.CONFIG_ENCRYPTION_KEY;
  return typeof brut === 'string' ? brut.trim() : '';
}

/** Vrai si `CONFIG_ENCRYPTION_KEY` est renseignée : le chiffrement est possible. */
export function chiffrementDisponible(): boolean {
  return lireCleMaitre().length > 0;
}

function obtenirCle(): Buffer {
  const source = lireCleMaitre();
  if (!source) throw new ChiffrementNonConfigureError();
  if (cleDerivee && cleSource === source) return cleDerivee;
  cleDerivee = scryptSync(source, SEL, 32);
  cleSource = source;
  return cleDerivee;
}

/** Vrai si la chaîne a le format d'une valeur chiffrée par cette unité. */
export function estChiffre(valeur: string | null | undefined): boolean {
  return typeof valeur === 'string' && valeur.startsWith(`${PREFIXE_VERSION}:`);
}

/**
 * Chiffre une valeur en clair.
 * @throws {ChiffrementNonConfigureError} si `CONFIG_ENCRYPTION_KEY` est absente.
 */
export function chiffrer(valeurEnClair: string): string {
  const cle = obtenirCle();
  const iv = randomBytes(LONGUEUR_IV);
  const cipher = createCipheriv(ALGO, cle, iv);
  const chiffre = Buffer.concat([cipher.update(valeurEnClair, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    PREFIXE_VERSION,
    iv.toString('base64'),
    tag.toString('base64'),
    chiffre.toString('base64'),
  ].join(':');
}

/**
 * Déchiffre une valeur stockée.
 *
 * Ne lève JAMAIS : une valeur corrompue, tronquée, chiffrée avec une autre clé
 * ou dont le tag ne correspond pas est journalisée puis ignorée (`undefined`).
 * Une valeur qui n'est pas au format `v1:` est renvoyée telle quelle (héritage
 * d'une écriture antérieure au chiffrement).
 */
export function dechiffrer(valeurStockee: string | null | undefined, cle?: string): string | undefined {
  if (valeurStockee === null || valeurStockee === undefined) return undefined;
  if (!estChiffre(valeurStockee)) return valeurStockee;

  const etiquette = cle ? ` (clé « ${cle} »)` : '';
  try {
    const morceaux = valeurStockee.split(':');
    if (morceaux.length !== 4) {
      logger.warn(`Valeur de configuration illisible${etiquette} : format inattendu, valeur ignorée.`);
      return undefined;
    }
    const [, ivB64, tagB64, chiffreB64] = morceaux;
    const iv = Buffer.from(ivB64, 'base64');
    const tag = Buffer.from(tagB64, 'base64');
    if (iv.length !== LONGUEUR_IV || tag.length !== LONGUEUR_TAG) {
      logger.warn(`Valeur de configuration illisible${etiquette} : IV/tag invalides, valeur ignorée.`);
      return undefined;
    }
    const decipher = createDecipheriv(ALGO, obtenirCle(), iv);
    decipher.setAuthTag(tag);
    const clair = Buffer.concat([
      decipher.update(Buffer.from(chiffreB64, 'base64')),
      decipher.final(),
    ]);
    return clair.toString('utf8');
  } catch (erreur) {
    const message = erreur instanceof Error ? erreur.message : String(erreur);
    logger.warn(
      `Déchiffrement impossible${etiquette} : ${message}. ` +
        "Valeur ignorée — repli sur la variable d'environnement si elle existe.",
    );
    return undefined;
  }
}

/** Masque d'affichage — jamais la valeur, seulement une trace de longueur. */
export function masquer(valeurEnClair: string | undefined): string {
  if (!valeurEnClair) return '';
  return '•'.repeat(Math.min(valeurEnClair.length, 12));
}
