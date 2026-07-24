/**
 * TOTP (RFC 6238) — implémentation minimale basée sur `node:crypto`.
 *
 * Aucune dépendance externe n'est ajoutée : ni `otplib` ni `speakeasy` ne sont
 * présents dans le package.json de l'API, et l'algorithme tient en quelques
 * dizaines de lignes (HMAC-SHA1 + troncature dynamique, RFC 4226 §5.3).
 *
 * Paramètres retenus — ceux attendus par défaut par Google Authenticator,
 * Microsoft Authenticator, Authy, FreeOTP, Aegis… :
 *   algorithme SHA1 · 6 chiffres · pas de 30 secondes.
 */
import * as crypto from 'crypto';

export const TOTP_ALGORITHME = 'SHA1';
export const TOTP_CHIFFRES = 6;
export const TOTP_PERIODE = 30;
/** Tolérance : ±1 pas de 30 s, soit une fenêtre totale de 90 s (dérive d'horloge). */
export const TOTP_FENETRE = 1;

const ALPHABET_BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Encode un buffer en base32 (RFC 4648, sans remplissage). */
export function encoderBase32(buffer: Buffer): string {
  let bits = 0;
  let valeur = 0;
  let sortie = '';
  for (const octet of buffer) {
    valeur = (valeur << 8) | octet;
    bits += 8;
    while (bits >= 5) {
      sortie += ALPHABET_BASE32[(valeur >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    sortie += ALPHABET_BASE32[(valeur << (5 - bits)) & 31];
  }
  return sortie;
}

/** Décode une chaîne base32 (tolère espaces, minuscules et remplissage `=`). */
export function decoderBase32(secret: string): Buffer {
  const propre = secret.replace(/[\s=]/g, '').toUpperCase();
  let bits = 0;
  let valeur = 0;
  const octets: number[] = [];
  for (const caractere of propre) {
    const index = ALPHABET_BASE32.indexOf(caractere);
    if (index === -1) {
      throw new Error('Secret TOTP invalide (caractère hors alphabet base32)');
    }
    valeur = (valeur << 5) | index;
    bits += 5;
    if (bits >= 8) {
      octets.push((valeur >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(octets);
}

/** Génère un secret partagé aléatoire (160 bits → 32 caractères base32). */
export function genererSecretTotp(): string {
  return encoderBase32(crypto.randomBytes(20));
}

/** HOTP (RFC 4226) — code à `chiffres` positions pour un compteur donné. */
export function genererHotp(secret: string, compteur: number, chiffres = TOTP_CHIFFRES): string {
  const cle = decoderBase32(secret);
  const bloc = Buffer.alloc(8);
  bloc.writeUInt32BE(Math.floor(compteur / 0x100000000), 0);
  bloc.writeUInt32BE(compteur >>> 0, 4);

  const empreinte = crypto.createHmac('sha1', cle).update(bloc).digest();
  const decalage = empreinte[empreinte.length - 1] & 0x0f;
  const binaire =
    ((empreinte[decalage] & 0x7f) << 24) |
    ((empreinte[decalage + 1] & 0xff) << 16) |
    ((empreinte[decalage + 2] & 0xff) << 8) |
    (empreinte[decalage + 3] & 0xff);

  return (binaire % 10 ** chiffres).toString().padStart(chiffres, '0');
}

/** TOTP (RFC 6238) — code valable pour l'instant `dateMs`. */
export function genererTotp(secret: string, dateMs: number = Date.now()): string {
  return genererHotp(secret, Math.floor(dateMs / 1000 / TOTP_PERIODE));
}

/** Comparaison à temps constant de deux codes. */
function comparaisonConstante(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/**
 * Vérifie un code TOTP sur une fenêtre de ±`fenetre` pas de 30 s.
 * Renvoie le décalage validé (0 = pas courant) ou `null` si le code est faux.
 */
export function verifierTotp(
  secret: string,
  code: string,
  dateMs: number = Date.now(),
  fenetre = TOTP_FENETRE,
): number | null {
  const propre = (code ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(propre)) return null;

  const compteur = Math.floor(dateMs / 1000 / TOTP_PERIODE);
  for (let decalage = -fenetre; decalage <= fenetre; decalage++) {
    if (comparaisonConstante(genererHotp(secret, compteur + decalage), propre)) {
      return decalage;
    }
  }
  return null;
}

/** URL `otpauth://` à encoder dans un QR code (format Key Uri de Google Authenticator). */
export function construireOtpauthUrl(params: {
  secret: string;
  compte: string;
  emetteur: string;
}): string {
  const emetteur = encodeURIComponent(params.emetteur);
  const label = `${emetteur}:${encodeURIComponent(params.compte)}`;
  const requete = new URLSearchParams({
    secret: params.secret,
    issuer: params.emetteur,
    algorithm: TOTP_ALGORITHME,
    digits: String(TOTP_CHIFFRES),
    period: String(TOTP_PERIODE),
  });
  return `otpauth://totp/${label}?${requete.toString()}`;
}

/** Secret présenté par groupes de 4 caractères (saisie manuelle dans l'app). */
export function formaterSecretLisible(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}
