import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMontant(montant: number, devise = 'XOF'): string {
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
  }).format(montant);
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
