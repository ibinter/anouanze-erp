'use client';

import { useState } from 'react';
import { AlertTriangle, Info, CheckCircle, Bell, Check } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

type NotifType = 'alerte' | 'info' | 'succes' | 'rappel';

interface Notification {
  id: number;
  type: NotifType;
  titre: string;
  message: string;
  date: string;
  lue: boolean;
}

const ALL_NOTIFS: Notification[] = [
  { id: 1, type: 'alerte', titre: 'Budget dépassé', message: 'Le budget du projet Santé Communautaire a atteint 94% de consommation.', date: '2026-07-10', lue: false },
  { id: 2, type: 'rappel', titre: 'Rapport trimestriel Q2', message: 'Le rapport trimestriel Q2 est à soumettre avant le 15 juillet 2026.', date: '2026-07-10', lue: false },
  { id: 3, type: 'info', titre: 'Nouveau membre', message: 'Aminata Traoré a rejoint l\'organisation en tant que chargée de programme.', date: '2026-07-09', lue: false },
  { id: 4, type: 'succes', titre: 'Paiement reçu', message: 'Un don de 2 500 000 FCFA de la Fondation Orange a été enregistré.', date: '2026-07-09', lue: true },
  { id: 5, type: 'alerte', titre: 'Cotisations en retard', message: '3 membres ont des cotisations impayées depuis plus de 90 jours.', date: '2026-07-08', lue: true },
  { id: 6, type: 'info', titre: 'Mise à jour système', message: 'ANOUANZÊ ERP a été mis à jour vers la version 2.4.0.', date: '2026-07-07', lue: true },
  { id: 7, type: 'succes', titre: 'Audit validé', message: 'L\'audit interne du 1er semestre a été validé sans réserve.', date: '2026-07-06', lue: true },
  { id: 8, type: 'rappel', titre: 'Renouvellement agrément', message: 'L\'agrément ONG expire le 01/09/2026. Initier le renouvellement.', date: '2026-07-05', lue: true },
];

const typeConfig: Record<NotifType, { icon: typeof Bell; color: string; bg: string; dot: string }> = {
  alerte: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  succes: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  rappel: { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-400' },
};

const PAGE_SIZE = 5;

function groupByDate(notifs: Notification[]): Record<string, Notification[]> {
  return notifs.reduce<Record<string, Notification[]>>((acc, n) => {
    const key = new Date(n.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(ALL_NOTIFS);
  const [page, setPage] = useState(1);

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, lue: true })));
  }

  const paginated = notifs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const grouped = groupByDate(paginated);
  const unreadCount = notifs.filter((n) => !n.lue).length;

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Notifications</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <Check className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="space-y-2">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{date}</p>
            <div className="space-y-2">
              {items.map((n) => {
                const config = typeConfig[n.type];
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'card flex items-start gap-4 transition-colors',
                      !n.lue && 'bg-primary-50/40 border border-primary-100',
                    )}
                  >
                    <div className={cn('p-2 rounded-xl shrink-0', config.bg)}>
                      <Icon className={cn('w-4 h-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-800">{n.titre}</p>
                        {!n.lue && <span className={cn('w-2 h-2 rounded-full shrink-0', config.dot)} />}
                      </div>
                      <p className="text-sm text-neutral-500 mt-0.5">{n.message}</p>
                    </div>
                    {!n.lue && (
                      <button
                        onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, lue: true } : x))}
                        className="text-xs text-neutral-400 hover:text-neutral-600 shrink-0 whitespace-nowrap"
                      >
                        Marquer lu
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {notifs.length > PAGE_SIZE && (
        <Pagination total={notifs.length} page={page} limit={PAGE_SIZE} onChange={setPage} />
      )}
    </div>
  );
}
