/**
 * Mesure réelle des textes via la police du PDF (section 4).
 * S'appuie sur jsPDF.getTextWidth (retourne des mm à la taille de police courante).
 * Un cache évite de re-mesurer les valeurs répétées.
 */
import type { jsPDF } from 'jspdf';

export interface TextMeasurer {
  /** Largeur d'une chaîne (mm) à une taille de police donnée. */
  width(text: string, fontSize: number, bold?: boolean): number;
  /** Découpe un texte en lignes tenant dans maxWidth (respecte les mots). */
  wrap(text: string, maxWidth: number, fontSize: number, bold?: boolean): string[];
  /** Percentile p (0..100) d'un ensemble de largeurs. */
  percentile(widths: number[], p: number): number;
}

export function createMeasurer(doc: jsPDF, fontName = 'helvetica'): TextMeasurer {
  const cache = new Map<string, number>();

  function width(text: string, fontSize: number, bold = false): number {
    const key = `${bold ? 'B' : 'N'}|${fontSize}|${text}`;
    const hit = cache.get(key);
    if (hit !== undefined) return hit;
    doc.setFont(fontName, bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    // getTextWidth renvoie déjà des mm quand l'unité du doc est 'mm'
    const w = doc.getTextWidth(text || '');
    cache.set(key, w);
    return w;
  }

  function wrap(text: string, maxWidth: number, fontSize: number, bold = false): string[] {
    const value = text ?? '';
    if (!value) return [''];
    if (width(value, fontSize, bold) <= maxWidth) return [value];

    const words = value.split(/\s+/);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (width(candidate, fontSize, bold) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // mot plus long que la colonne : coupe contrôlée par caractère avec ellipsis
        if (width(word, fontSize, bold) > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (width(chunk + ch + '…', fontSize, bold) > maxWidth && chunk) {
              lines.push(chunk + '-');
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          current = chunk;
        } else {
          current = word;
        }
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function percentile(widths: number[], p: number): number {
    if (widths.length === 0) return 0;
    const sorted = [...widths].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
    return sorted[idx];
  }

  return { width, wrap, percentile };
}
