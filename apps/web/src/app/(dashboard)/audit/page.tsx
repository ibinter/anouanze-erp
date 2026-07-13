'use client';

import { useState } from 'react';
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

const ACTION_STYLES: Record<string, { badge: string; label: string }> = {
  CREATE: { badge: 'badge badge-success', label: 'Créé' },
  UPDATE: { badge: 'badge bg-blue-100 text-blue-700', label: 'Modifié' },
  DELETE: { badge: 'badge badge-error', label: 'Supprimé' },
  LOGIN: { badge: 'badge badge-neutral', label: 'Connexion' },
};

export default function AuditPage() {
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
      key: 'createdAt', header: 'Date / Heure',
      render: (r) => <span className="font-mono text-xs text-neutral-600">{new Date(r.createdAt).toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'utilisateur', header: 'Utilisateur',
      render: (r) => <span className="font-medium text-neutral-800">{getUserLabel(r)}</span>,
    },
    {
      key: 'action', header: 'Action',
      render: (r) => {
        const s = ACTION_STYLES[r.action] ?? { badge: 'badge badge-neutral', label: r.action };
        return <span className={s.badge}>{s.label}</span>;
      },
    },
    { key: 'ressource', header: 'Ressource' },
    {
      key: 'details', header: 'Détails',
      render: (r) => <span className="text-neutral-600 text-xs">{r.details ?? '—'}</span>,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <button onClick={() => setLogDetail(r)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
          <Eye className="w-3.5 h-3.5" />
          Voir
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
          <h1 className="text-xl font-bold text-neutral-800">Audit & Traçabilité</h1>
          <p className="text-sm text-neutral-500">Journal des actions utilisateurs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titre="Actions ce mois" valeur={statsData?.totalActions ?? total} icone={<Activity className="w-5 h-5" />} couleur="blue" />
        <StatCard titre="Utilisateurs actifs" valeur={statsData?.utilisateursActifs ?? '—'} icone={<Users className="w-5 h-5" />} couleur="green" />
        <StatCard titre="Actions critiques" valeur={statsData?.suppressions ?? '—'} icone={<AlertTriangle className="w-5 h-5" />} couleur="red" description="Suppressions" />
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="label">Date début</label>
            <input type="date" className="input" value={dateDebut} onChange={(e) => { setDateDebut(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-1">
            <label className="label">Date fin</label>
            <input type="date" className="input" value={dateFin} onChange={(e) => { setDateFin(e.target.value); setPage(1); }} />
          </div>
          <div className="space-y-1">
            <label className="label">Action</label>
            <select className="input" value={filtreAction} onChange={(e) => { setFiltreAction(e.target.value); setPage(1); }}>
              <option value="">Toutes</option>
              <option value="CREATE">Créé</option>
              <option value="UPDATE">Modifié</option>
              <option value="DELETE">Supprimé</option>
              <option value="LOGIN">Connexion</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">Ressource</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Membre, Projet…"
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
        title="Détail de l'action"
        description={logDetail?.details}
        size="lg"
      >
        {logDetail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="label">Date / Heure</span><p className="font-mono mt-1">{new Date(logDetail.createdAt).toLocaleString('fr-FR')}</p></div>
              <div><span className="label">Utilisateur</span><p className="font-medium mt-1">{getUserLabel(logDetail)}</p></div>
              <div>
                <span className="label">Action</span>
                <p className="mt-1">
                  <span className={(ACTION_STYLES[logDetail.action] ?? { badge: 'badge' }).badge}>
                    {(ACTION_STYLES[logDetail.action] ?? { label: logDetail.action }).label}
                  </span>
                </p>
              </div>
              <div><span className="label">Ressource</span><p className="mt-1">{logDetail.ressource}</p></div>
            </div>
            {logDetail.avant && (
              <div>
                <p className="label mb-1">État avant</p>
                <pre className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs overflow-x-auto text-red-800">
                  {JSON.stringify(logDetail.avant, null, 2)}
                </pre>
              </div>
            )}
            {logDetail.apres && (
              <div>
                <p className="label mb-1">État après</p>
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
