import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Coercition numérique sûre. Les Decimal Prisma arrivent en JSON sous forme
 * de CHAÎNES ("22000000") — les additionner avec `+` les concatène. Utiliser
 * toNum() dans tout reduce/somme de montants pour éviter la corruption.
 */
export function toNum(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const n = Number(value.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatMontant(montant: number | string | null | undefined, devise = 'XOF'): string {
  const locales: Record<string, string> = {
    XOF: 'fr-CI',
    XAF: 'fr-CM',
    EUR: 'fr-FR',
    USD: 'en-US',
  };

  return new Intl.NumberFormat(locales[devise] ?? 'fr-CI', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(toNum(montant));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-CI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}

export function initiales(nom: string, prenom?: string): string {
  const n = nom.charAt(0).toUpperCase();
  const p = prenom ? prenom.charAt(0).toUpperCase() : '';
  return n + p;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
