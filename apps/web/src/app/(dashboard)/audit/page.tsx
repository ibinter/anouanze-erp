'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShieldCheck, Activity, AlertTriangle, Users, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';

type Action = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

interface LogEntry {
  id: string;
  createdAt: string;
  utilisateur?: { nom?: string; prenom?: string; email?: string };
  action: Action;
  ressource: string;
  details?: string;
  avant?: Record<string, unknown>;
  apres?: Record<string, unknown>;
}

/** Classes de badge par valeur d'énumération API (valeurs jamais traduites). */
const ACTION_BADGE: Record<string, string> = {
  CREATE: 'badge badge-success',
  UPDATE: 'badge bg-blue-100 text-blue-700',
  DELETE: 'badge badge-error',
  LOGIN: 'badge badge-neutral',
};

export default function AuditPage() {
  const t = useTranslations('outils.audit');
  const locale = useLocale();
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR';
  const actionLabel = (a: string) => (ACTION_BADGE[a] ? (t(`actions.${a}` as never) as string) : a);
  const [page, setPage] = useState(1);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [filtreAction, setFiltreAction] = useState('');
  const [filtreRessource, setFiltreRessource] = useState('');
  const [logDetail, setLogDetail] = useState<LogEntry | null>(null);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, filtreAction, filtreRessource, dateDebut, dateFin],
    queryFn: async () => {
      const { data } = await api.get('/audit', {
        params: {
          page,
          limit,
          action: filtreAction || undefined,
          ressource: filtreRessource || undefined,
          dateDebut: dateDebut || undefined,
          dateFin: dateFin || undefined,
        },
      });
      return data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['audit-stats'],
    queryFn: async () => {
      const { data } = await api.get('/audit/stats');
      return data;
    },
  });

  const logs: LogEntry[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  function getUserLabel(log: LogEntry) {
    if (log.utilisateur) {
      const { nom, prenom, email } = log.utilisateur;
      if (nom || prenom) return `${prenom ?? ''} ${nom ?? ''}`.trim();
      return email ?? '—';
    }
    return '—';
  }

  const columns: Column<LogEntry>[] = [
    {
      key: 'createdAt', header: t('colDateHeure'),
      render: (r) => <span className="font-mono text-xs text-neutral-600">{new Date(r.createdAt).toLocaleString(dateLocale)}</span>,
    },
    {
      key: 'utilisateur', header: t('colUtilisateur'),
      render: (r) => <span className="font-medium text-neutral-800">{getUserLabel(r)}</span>,
    },
    {
      key: 'action', header: t('colAction'),
      render: (r) => (
        <span className={ACTION_BADGE[r.action] ?? 'badge badge-neutral'}>{actionLabel(r.action)}</span>
      ),
    },
    { key: 'ressource', header: t('colRessource') },
    {
      key: 'details', header: t('colDetails'),
      render: (r) => <span className="text-neutral-600 text-xs">{r.details ?? '—'}</span>,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <button onClick={() => setLogDetail(r)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
          <Eye className="w-3.5 h-3.5" />
          {t('voir')}
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">{t('titre')}</h1>
          <p className="text-sm text-neutral-500">{t('sousTitre')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titre={t('stats.actionsMois')} valeur={statsData?.totalActions ?? total} icone={<Activity className="w-5 h-5" />} couleur="blue" />
        <StatCard titre={t('stats.utilisateursActifs')} valeur={statsData?.utilisateursActifs ?? '—'} icone={<Users className="w-5 h-5" />} couleur="green" />
        <StatCard titre={t('stats.actionsCritiques')} valeur={statsData?.suppressions ?? '—'} icone={<AlertTriangle className="w-5 h-5" />} couleur="red" description={t('stats.suppressions')} />
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="label">{t('filtres.dateDebut')}</label>
            <input type="date" className="input" value={dateDebut} onChange={(e) => { setDateDebut(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-1">
            <label className="label">{t('filtres.dateFin')}</label>
            <input type="date" className="input" value={dateFin} onChange={(e) => { setDateFin(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-1">
            <label className="label">{t('filtres.action')}</label>
            <select className="input" value={filtreAction} onChange={(e) => { setFiltreAction(e.target.value); setPage(1); }}>
              <option value="">{t('filtres.toutes')}</option>
              <option value="CREATE">{t('actions.CREATE')}</option>
              <option value="UPDATE">{t('actions.UPDATE')}</option>
              <option value="DELETE">{t('actions.DELETE')}</option>
              <option value="LOGIN">{t('actions.LOGIN')}</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">{t('filtres.ressource')}</label>
            <input
              type="text"
              className="input"
              placeholder={t('filtres.ressourcePlaceholder')}
              value={filtreRessource}
              onChange={(e) => { setFiltreRessource(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={logs as unknown as Record<string, unknown>[]} isLoading={isLoading} />

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <Modal
        open={!!logDetail}
        onOpenChange={(o) => !o && setLogDetail(null)}
        title={t('detail.titre')}
        description={logDetail?.details}
        size="lg"
      >
        {logDetail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="label">{t('detail.dateHeure')}</span><p className="font-mono mt-1">{new Date(logDetail.createdAt).toLocaleString(dateLocale)}</p></div>
              <div><span className="label">{t('detail.utilisateur')}</span><p className="font-medium mt-1">{getUserLabel(logDetail)}</p></div>
              <div>
                <span className="label">{t('detail.action')}</span>
                <p className="mt-1">
                  <span className={ACTION_BADGE[logDetail.action] ?? 'badge'}>
                    {actionLabel(logDetail.action)}
                  </span>
                </p>
              </div>
              <div><span className="label">{t('detail.ressource')}</span><p className="mt-1">{logDetail.ressource}</p></div>
            </div>
            {logDetail.avant && (
              <div>
                <p className="label mb-1">{t('detail.etatAvant')}</p>
                <pre className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs overflow-x-auto text-red-800">
                  {JSON.stringify(logDetail.avant, null, 2)}
                </pre>
              </div>
            )}
            {logDetail.apres && (
              <div>
                <p className="label mb-1">{t('detail.etatApres')}</p>
                <pre className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs overflow-x-auto text-green-800">
                  {JSON.stringify(logDetail.apres, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
