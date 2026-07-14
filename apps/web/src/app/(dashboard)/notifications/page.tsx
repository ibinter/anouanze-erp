'use client';

import { useState } from 'react';
import { Bell, CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  lue: boolean;
  lien?: string;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  ALERTE: '🔴',
  INFO: '🔵',
  SUCCES: '🟢',
  RAPPEL: '🟡',
  AVERTISSEMENT: '🟠',
};

const TYPE_COLORS: Record<string, string> = {
  ALERTE: 'border-l-red-400',
  INFO: 'border-l-blue-400',
  SUCCES: 'border-l-green-400',
  RAPPEL: 'border-l-yellow-400',
  AVERTISSEMENT: 'border-l-orange-400',
};

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [filtreLue, setFiltreLue] = useState<'all' | 'non-lues'>('all');

  const { data, isLoading, refetch } = useQuery<{ data: Notification[]; meta: { nonLues: number } }>({
    queryKey: ['notifications', filtreLue],
    queryFn: () => api.get('/notifications', { params: { lue: filtreLue === 'non-lues' ? false : undefined, limit: 50 } }).then((r: any) => r.data),
  });

  const marquerLue = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/lue`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const marquerToutesLues = useMutation({
    mutationFn: () => api.patch('/notifications/marquer-toutes-lues'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const supprimer = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data ?? [];
  const nonLues = data?.meta?.nonLues ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {nonLues > 0 && <p className="text-sm text-gray-500 mt-1">{nonLues} non lue{nonLues > 1 ? 's' : ''}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-gray-700">
            <RefreshCw className="w-4 h-4" />
          </button>
          {nonLues > 0 && (
            <button onClick={() => marquerToutesLues.mutate()} disabled={marquerToutesLues.isPending} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60">
              <CheckCheck className="w-4 h-4" /> Tout marquer lu
            </button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {(['all', 'non-lues'] as const).map(f => (
          <button key={f} onClick={() => setFiltreLue(f)} className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${filtreLue === f ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {f === 'all' ? 'Toutes' : 'Non lues'}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune notification</p>
            <p className="text-sm mt-1">{filtreLue === 'non-lues' ? 'Tout est à jour !' : "Vous n'avez pas encore reçu de notifications."}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div key={n.id} className={`p-4 flex items-start gap-4 border-l-4 transition-colors ${TYPE_COLORS[n.type] ?? 'border-l-gray-300'} ${n.lue ? 'bg-white' : 'bg-blue-50/30'}`}>
                <span className="text-xl mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.lue ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>{n.titre}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' } as any)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  {n.lien && <a href={n.lien} className="text-xs text-primary hover:underline mt-1 block">Voir le détail →</a>}
                </div>
                <div className="flex items-center gap-1">
                  {!n.lue && (
                    <button onClick={() => marquerLue.mutate(n.id)} title="Marquer comme lue" className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100">
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => supprimer.mutate(n.id)} title="Supprimer" className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
