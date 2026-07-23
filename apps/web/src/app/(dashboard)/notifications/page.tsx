'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw, SlidersHorizontal, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useNotificationsListe,
  useNotificationsActions,
  useNotificationsPreferences,
  NOTIF_REFETCH_MS,
} from '@/components/notifications/useNotifications';
import { styleType, tempsRelatif } from '@/components/notifications/types';

type Filtre = 'all' | 'non-lues';

export default function NotificationsPage() {
  const router = useRouter();
  const [filtre, setFiltre] = useState<Filtre>('all');
  const [prefsOuvertes, setPrefsOuvertes] = useState(false);

  const { data, isLoading, isFetching, refetch } = useNotificationsListe({
    lue: filtre === 'non-lues' ? false : undefined,
    limit: 50,
  });
  const { marquerLue, marquerToutesLues, supprimer } = useNotificationsActions();
  const { data: prefs } = useNotificationsPreferences();

  const notifications = data?.data ?? [];
  const nonLues = data?.meta?.nonLues ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est à jour'}
            <span className="text-neutral-400"> · actualisation automatique toutes les {Math.round(NOTIF_REFETCH_MS / 1000)} s</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            title="Actualiser"
            className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setPrefsOuvertes((o) => !o)}
            className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 px-3 py-2 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700"
          >
            <SlidersHorizontal className="w-4 h-4" /> Préférences
          </button>
          {nonLues > 0 && (
            <button
              onClick={() => marquerToutesLues.mutate()}
              disabled={marquerToutesLues.isPending}
              className="flex items-center gap-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 px-3 py-2 rounded-lg text-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-60"
            >
              <CheckCheck className="w-4 h-4" /> Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* Préférences */}
      {prefsOuvertes && (
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Préférences de notification
            </h2>
            <span className="text-[11px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">
              Bientôt disponible
            </span>
          </div>
          <p className="text-sm text-neutral-500 mb-4">
            {prefs?.message ??
              'La personnalisation des préférences de notification sera disponible prochainement.'}
          </p>
          <ul className="space-y-2">
            {(prefs?.canaux ?? [
              { cle: 'interne', libelle: "Notifications dans l'application", actif: true, modifiable: false },
              { cle: 'email', libelle: 'Notifications par email', actif: true, modifiable: false },
            ]).map((c) => (
              <li
                key={c.cle}
                className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-700/40"
              >
                <span className="text-neutral-700 dark:text-neutral-200">{c.libelle}</span>
                <span className="text-xs text-neutral-400">
                  {c.actif ? 'Activé' : 'Désactivé'}{!c.modifiable && ' · non modifiable'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-2">
        {(['all', 'non-lues'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltre(f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              filtre === f
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
            }`}
          >
            {f === 'all' ? 'Toutes' : `Non lues${nonLues > 0 ? ` (${nonLues})` : ''}`}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-neutral-100 dark:bg-neutral-700 rounded w-1/3 mb-2" />
                <div className="h-3 bg-neutral-100 dark:bg-neutral-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-neutral-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune notification</p>
            <p className="text-sm mt-1">
              {filtre === 'non-lues'
                ? 'Tout est à jour !'
                : "Vous n'avez pas encore reçu de notifications."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {notifications.map((n) => {
              const st = styleType(n.type);
              return (
                <div
                  key={n.id}
                  className={`p-4 flex items-start gap-4 border-l-4 transition-colors ${st.border} ${
                    n.lue ? '' : 'bg-primary-50/40 dark:bg-primary-900/10'
                  }`}
                >
                  <span className={`mt-2 w-2.5 h-2.5 rounded-full flex-shrink-0 ${st.dot}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${
                          n.lue
                            ? 'text-neutral-700 dark:text-neutral-200'
                            : 'text-neutral-900 dark:text-white font-semibold'
                        }`}
                      >
                        {n.titre}
                      </p>
                      <span className="text-xs text-neutral-400 whitespace-nowrap">
                        {tempsRelatif(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{n.message}</p>
                    {n.lien && (
                      <button
                        onClick={() => {
                          if (!n.lue) marquerLue.mutate(n.id);
                          router.push(n.lien as string);
                        }}
                        className="text-xs text-primary-600 hover:underline mt-1 block"
                      >
                        Voir le détail →
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.lue && (
                      <button
                        onClick={() => marquerLue.mutate(n.id)}
                        title="Marquer comme lue"
                        className="p-1.5 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => supprimer.mutate(n.id)}
                      title="Supprimer"
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
