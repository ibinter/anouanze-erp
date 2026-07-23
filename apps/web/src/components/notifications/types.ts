export type TypeNotification = 'ALERTE' | 'INFO' | 'SUCCES' | 'RAPPEL' | 'AVERTISSEMENT';

export interface NotificationItem {
  id: string;
  titre: string;
  message: string;
  type: TypeNotification | string;
  lue: boolean;
  lien?: string | null;
  createdAt: string;
}

export interface PreferencesNotification {
  disponible: boolean;
  message: string;
  canaux: Array<{ cle: string; libelle: string; actif: boolean; modifiable: boolean }>;
}

/** Pastille / bordure par type de notification (purement visuel, non traduit). */
export const TYPE_STYLES: Record<string, { dot: string; border: string }> = {
  ALERTE: { dot: 'bg-red-500', border: 'border-l-red-400' },
  AVERTISSEMENT: { dot: 'bg-orange-500', border: 'border-l-orange-400' },
  RAPPEL: { dot: 'bg-amber-500', border: 'border-l-amber-400' },
  SUCCES: { dot: 'bg-emerald-500', border: 'border-l-emerald-400' },
  INFO: { dot: 'bg-sky-500', border: 'border-l-sky-400' },
};

export function styleType(type: string) {
  return TYPE_STYLES[type] ?? { dot: 'bg-neutral-400', border: 'border-l-neutral-300' };
}

/** Traducteur attendu par `tempsRelatif` (namespace `shell.notifications.temps`). */
type TraducteurTemps = (cle: string, valeurs?: Record<string, string | number>) => string;

/**
 * « il y a 3 min », « il y a 2 j »… Les libellés viennent de
 * `shell.notifications.temps.*` ; la date longue suit la locale active.
 */
export function tempsRelatif(iso: string, t: TraducteurTemps, locale = 'fr'): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Math.max(0, Date.now() - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('instant');
  if (min < 60) return t('minutes', { n: min });
  const h = Math.floor(min / 60);
  if (h < 24) return t('heures', { n: h });
  const j = Math.floor(h / 24);
  if (j < 7) return t('jours', { n: j });
  return new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'short' });
}
