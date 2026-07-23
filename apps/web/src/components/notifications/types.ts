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

/** Pastille / bordure par type de notification. */
export const TYPE_STYLES: Record<string, { dot: string; border: string; label: string }> = {
  ALERTE: { dot: 'bg-red-500', border: 'border-l-red-400', label: 'Alerte' },
  AVERTISSEMENT: { dot: 'bg-orange-500', border: 'border-l-orange-400', label: 'Avertissement' },
  RAPPEL: { dot: 'bg-amber-500', border: 'border-l-amber-400', label: 'Rappel' },
  SUCCES: { dot: 'bg-emerald-500', border: 'border-l-emerald-400', label: 'Succès' },
  INFO: { dot: 'bg-sky-500', border: 'border-l-sky-400', label: 'Information' },
};

export function styleType(type: string) {
  return TYPE_STYLES[type] ?? { dot: 'bg-neutral-400', border: 'border-l-neutral-300', label: 'Notification' };
}

/** « il y a 3 min », « il y a 2 j »… */
export function tempsRelatif(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Math.max(0, Date.now() - d);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
