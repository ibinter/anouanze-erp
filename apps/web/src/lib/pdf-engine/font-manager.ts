/**
 * ============================================================================
 * GESTIONNAIRE DE POLICE UNICODE POUR jsPDF — ANOUANZÊ ERP / IBIG SOFT
 * ----------------------------------------------------------------------------
 * PROBLÈME RÉSOLU
 *   jsPDF utilise par défaut la police Helvetica en encodage WinAnsi (Latin-1).
 *   Cet encodage ne couvre PAS de nombreux glyphes Unicode : le "Ê" majuscule
 *   accentué peut passer, mais le symbole numéro « № », la ligature « œ » et
 *   surtout les emojis (🔴 ⚠ ✓) ressortent en caractères corrompus du type
 *   « Ø=Ý4 ». On embarque donc une vraie police TTF Unicode (DejaVu Sans),
 *   qui couvre le latin étendu, les accents français, l'euro « € », etc.
 *
 * USAGE
 *   import { registerUnicodeFont, sanitizeForPdf } from './font-manager';
 *
 *   const doc = new jsPDF({ unit: 'mm', format: 'a4' });
 *   const font = await registerUnicodeFont(doc);   // enregistre DejaVu (ou fallback)
 *
 *   font.apply(doc);                 // police normale
 *   doc.text(sanitizeForPdf('Priorité 🔴 élevée — coût 12 000 €'), 14, 20);
 *
 *   font.apply(doc, { bold: true }); // variante grasse
 *   doc.text('TOTAL', 14, 30);
 *
 * GARANTIES
 *   - registerUnicodeFont NE LÈVE JAMAIS d'exception : en cas d'échec de
 *     chargement de la police TTF, elle retourne proprement un FontHandle basé
 *     sur 'helvetica' (family = 'helvetica').
 *   - L'enregistrement est mémoïsé par instance jsPDF (WeakMap) : appeler la
 *     fonction plusieurs fois sur le même `doc` est sans surcoût.
 *   - sanitizeForPdf convertit les emojis courants en équivalents texte et
 *     supprime les code points non imprimables / hors du plan multilingue de
 *     base, SANS casser les accents français, « € », « № » ni « ’ ».
 * ============================================================================
 */

import type { jsPDF } from 'jspdf';
import {
  DEJAVU_SANS_REGULAR_BASE64,
  DEJAVU_SANS_BOLD_BASE64,
} from './fonts/dejavu-base64';

// ─── Contrat public ──────────────────────────────────────────────────────────

export interface FontHandle {
  /** Nom de famille enregistré dans jsPDF (ex. 'DejaVuSans' ou 'helvetica'). */
  family: string;
  /** Applique la police au document (setFont), variante grasse optionnelle. */
  apply(doc: jsPDF, opts?: { bold?: boolean }): void;
}

// ─── Constantes internes ─────────────────────────────────────────────────────

const UNICODE_FAMILY = 'DejaVuSans';
const FALLBACK_FAMILY = 'helvetica';
const VFS_REGULAR = 'DejaVuSans.ttf';
const VFS_BOLD = 'DejaVuSans-Bold.ttf';

/** Mémoïsation par instance jsPDF : évite de ré-embarquer la police. */
const registered = new WeakMap<object, FontHandle>();

/** Un base64 réel fait > 100 000 caractères ; un placeholder vide déclenche le fallback. */
function hasEmbeddedFontData(): boolean {
  return (
    typeof DEJAVU_SANS_REGULAR_BASE64 === 'string' &&
    DEJAVU_SANS_REGULAR_BASE64.length > 1024 &&
    typeof DEJAVU_SANS_BOLD_BASE64 === 'string' &&
    DEJAVU_SANS_BOLD_BASE64.length > 1024
  );
}

/**
 * FontHandle de repli : applique 'helvetica' proprement.
 * Utilisé quand la police Unicode ne peut pas être embarquée.
 */
function makeFallbackHandle(): FontHandle {
  return {
    family: FALLBACK_FAMILY,
    apply(doc: jsPDF, opts?: { bold?: boolean }): void {
      doc.setFont(FALLBACK_FAMILY, opts?.bold ? 'bold' : 'normal');
    },
  };
}

// ─── API principale ──────────────────────────────────────────────────────────

/**
 * Enregistre la police Unicode (DejaVu Sans regular + bold) dans le document
 * jsPDF fourni et renvoie un FontHandle permettant de l'appliquer.
 *
 * NE LÈVE JAMAIS : en cas d'échec, retourne un handle basé sur 'helvetica'.
 * Le résultat est mémoïsé par instance `doc`.
 */
export async function registerUnicodeFont(doc: jsPDF): Promise<FontHandle> {
  const cached = registered.get(doc);
  if (cached) return cached;

  // Aucune donnée de police embarquée → fallback propre.
  if (!hasEmbeddedFontData()) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[pdf-engine] Police Unicode absente (dejavu-base64 vide) — repli sur Helvetica.',
      );
    }
    const fallback = makeFallbackHandle();
    registered.set(doc, fallback);
    return fallback;
  }

  try {
    // Regular : VFS + déclaration police.
    doc.addFileToVFS(VFS_REGULAR, DEJAVU_SANS_REGULAR_BASE64);
    doc.addFont(VFS_REGULAR, UNICODE_FAMILY, 'normal');

    // Bold : VFS + déclaration police.
    doc.addFileToVFS(VFS_BOLD, DEJAVU_SANS_BOLD_BASE64);
    doc.addFont(VFS_BOLD, UNICODE_FAMILY, 'bold');

    // Vérifie que jsPDF a bien enregistré la famille avant de la promettre.
    const fontList = doc.getFontList();
    if (!fontList || !fontList[UNICODE_FAMILY]) {
      throw new Error('DejaVuSans non listée après addFont');
    }

    const handle: FontHandle = {
      family: UNICODE_FAMILY,
      apply(target: jsPDF, opts?: { bold?: boolean }): void {
        target.setFont(UNICODE_FAMILY, opts?.bold ? 'bold' : 'normal');
      },
    };
    registered.set(doc, handle);
    return handle;
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn(
        '[pdf-engine] Échec embarquement DejaVu Sans — repli sur Helvetica.',
        err,
      );
    }
    const fallback = makeFallbackHandle();
    registered.set(doc, fallback);
    return fallback;
  }
}

// ─── Assainissement de texte ─────────────────────────────────────────────────

/**
 * Table de correspondance emoji / symbole → texte.
 * Les clés multi-code-points sont d'abord normalisées (retrait des sélecteurs
 * de variation et jointeurs de largeur nulle) avant application.
 * L'ordre n'a pas d'importance : les remplacements sont littéraux (split/join).
 */
const EMOJI_MAP: ReadonlyArray<readonly [string, string]> = [
  // Urgence / criticité
  ['🔴', 'Urgent'],
  ['🟥', 'Urgent'],
  ['❗', 'Urgent'],
  ['❕', 'Urgent'],
  ['‼', 'Urgent'],
  // Attention / alerte
  ['⚠', 'Attention'],
  ['🚨', 'Attention'],
  ['🔶', 'Attention'],
  // Positif / validé
  ['🟢', 'Oui'],
  ['🟩', 'Oui'],
  ['✅', 'Oui'],
  ['✔', 'Oui'],
  ['✓', 'Oui'],
  ['☑', 'Oui'],
  ['👍', 'Oui'],
  // Négatif / rejeté
  ['❌', 'Non'],
  ['✖', 'Non'],
  ['✗', 'Non'],
  ['✘', 'Non'],
  ['🚫', 'Non'],
  ['👎', 'Non'],
  // Niveaux intermédiaires
  ['🟠', 'Moyen'],
  ['🟧', 'Moyen'],
  ['🟡', 'Moyen'],
  ['🟨', 'Moyen'],
  // Information
  ['🔵', 'Info'],
  ['🟦', 'Info'],
  ['ℹ', 'Info'],
  // Divers courants
  ['⭐', '*'],
  ['🌟', '*'],
  ['•', '-'],
  ['📌', '-'],
  ['➡', '->'],
  ['→', '->'],
  ['⬅', '<-'],
  ['←', '<-'],
];

/**
 * Assainit un texte destiné au PDF :
 *   1. retire les sélecteurs de variation (U+FE0F), jointeurs (U+200D) et
 *      modificateurs de teinte, pour normaliser les séquences emoji ;
 *   2. remplace les emojis/symboles courants par un équivalent texte ;
 *   3. supprime les code points hors du plan multilingue de base (astral :
 *      la plupart des emojis résiduels) et les caractères de contrôle non
 *      imprimables, en conservant tabulation / saut de ligne.
 *
 * Préserve les accents français, « € », « № », « œ », l'apostrophe « ’ », etc.
 */
export function sanitizeForPdf(text: string): string {
  if (text === null || text === undefined) return '';
  let out = String(text);

  // 1. Normalisation des séquences emoji.
  // U+FE0F/U+FE0E = sélecteurs de variation ; U+200D = zero-width joiner ;
  // U+1F3FB..U+1F3FF = modificateurs de teinte de peau.
  out = out.replace(/[️︎‍]|[\u{1F3FB}-\u{1F3FF}]/gu, '');

  // 2. Remplacements littéraux emoji → texte.
  for (const [emoji, replacement] of EMOJI_MAP) {
    if (out.indexOf(emoji) !== -1) {
      out = out.split(emoji).join(replacement);
    }
  }

  // 3. Filtrage code point par code point (for..of itère par code point).
  let result = '';
  for (const ch of out) {
    const cp = ch.codePointAt(0);
    if (cp === undefined) continue;

    // Conserver tabulation, saut de ligne et retour chariot.
    if (cp === 0x09 || cp === 0x0a || cp === 0x0d) {
      result += ch;
      continue;
    }
    // Retirer les contrôles C0/C1 et DEL.
    if (cp < 0x20 || (cp >= 0x7f && cp <= 0x9f)) continue;
    // Retirer le plan astral (emojis résiduels, symboles hors BMP).
    if (cp > 0xffff) continue;

    result += ch;
  }

  return result;
}
