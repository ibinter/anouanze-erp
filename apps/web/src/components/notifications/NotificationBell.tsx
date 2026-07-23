'use client';

import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationsApercu, useNotificationsActions } from './useNotifications';
import { styleType, tempsRelatif } from './types';

interface NotificationBellProps {
  /** Classe additionnelle appliquée au bouton. */
  className?: string;
}

/**
 * Cloche de notifications du header : compteur de non-lues + panneau déroulant.
 * Rafraîchissement périodique via React Query (pas de WebSocket).
 */
export function NotificationBell({ className = '' }: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useNotificationsApercu();
  const { marquerLue, marquerToutesLues } = useNotificationsActions();

  const notifications = data?.data ?? [];
  const nonLues = data?.nonLues ?? 0;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const ouvrir = (id: string, lue: boolean, lien?: string | null) => {
    if (!lue) marquerLue.mutate(id);
    setOpen(false);
    if (lien) router.push(lien);
  };

  const badge = nonLues > 99 ? '99+' : String(nonLues);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={nonLues > 0 ? `Notifications (${nonLues} non lues)` : 'Notifications'}
        aria-expanded={open}
        className={`relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors ${className}`}
      >
        <Bell className="w-5 h-5" />
        {nonLues > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-accent-400 text-[10px] font-bold text-white leading-none shadow">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-700">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Notifications{nonLues > 0 ? ` (${nonLues})` : ''}
            </p>
            {nonLues > 0 && (
              <button
                type="button"
                onClick={() => marquerToutesLues.mutate()}
                disabled={marquerToutesLues.isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-sm text-neutral-400 px-4">
                Impossible de charger les notifications pour le moment.
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-400 px-4">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Aucune notification
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {notifications.map((n) => {
                  const st = styleType(n.type);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => ouvrir(n.id, n.lue, n.lien)}
                        className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors ${
                          n.lue ? '' : 'bg-primary-50/40 dark:bg-primary-900/10'
                        }`}
                      >
                        <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} aria-hidden="true" />
                        <span className="flex-1 min-w-0">
                          <span
                            className={`block text-sm truncate ${
                              n.lue
                                ? 'text-neutral-700 dark:text-neutral-200'
                                : 'font-semibold text-neutral-900 dark:text-white'
                            }`}
                          >
                            {n.titre}
                          </span>
                          <span className="block text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                            {n.message}
                          </span>
                          <span className="block text-[11px] text-neutral-400 mt-1">
                            {tempsRelatif(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => { setOpen(false); router.push('/notifications'); }}
              className="w-full px-4 py-2.5 text-sm font-medium text-primary-600 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors"
            >
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
