'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Plus, Heart, TrendingUp, Calendar, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SlideOver } from '@/components/ui/SlideOver';
import { Pagination } from '@/components/ui/Pagination';
import { formatMontant, formatDate } from '@/lib/utils';

interface Donateur {
  id: string;
  nom: string;
  type: string;
  email: string;
  telephone: string;
  _count?: { dons: number };
  totalDons?: number;
}

interface Don {
  id: string;
  montant: number;
  typePaiement: string;
  dateDon: string;
  statut: string;
  numeroRecu?: string;
}

const TYPE_DON_COLOR: Record<string, string> = {
  VIREMENT: 'badge-success',
  ESPECES: 'badge-neutral',
  CHEQUE: 'badge',
  MOBILE_MONEY: 'badge-warning',
};

export default function DonateursPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Donateur | null>(null);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['donateurs', page, search, typeFilter],
    queryFn: async () => {
      const { data } = await api.get('/donateurs', {
        params: { page, limit, search: search || undefined },
      });
      return data;
    },
  });

  const { data: donsData, isLoading: donsLoading } = useQuery({
    queryKey: ['donateur-dons', selected?.id],
    queryFn: async () => {
      const { data } = await api.get(`/donateurs/${selected!.id}/dons`);
      return data;
    },
    enabled: !!selected?.id,
  });

  const { data: statsData } = useQuery({
    queryKey: ['donateurs-stats'],
    queryFn: async () => {
      const { data } = await api.get('/donateurs/stats');
      return data;
    },
  });

  const donateurs: Donateur[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const dons: Don[] = donsData?.data ?? donsData ?? [];

  const columns: Column<Donateur>[] = [
    { key: 'nom', header: 'Nom / Raison sociale', render: (r) => <span className="font-medium text-neutral-800">{r.nom}</span> },
    {
      key: 'type', header: 'Type', width: '100px',
      render: (r) => <span className={`badge ${r.type === 'PHYSIQUE' ? 'badge-neutral' : 'badge'}`}>{r.type === 'PHYSIQUE' ? 'Physique' : 'Moral'}</span>,
    },
    { key: 'email', header: 'Email' },
    { key: 'telephone', header: 'Téléphone' },
    {
      key: '_count', header: 'Dons', width: '70px',
      render: (r) => <span className="badge badge-neutral">{(r as any)._count?.dons ?? 0}</span>,
    },
    {
      key: 'totalDons', header: 'Montant total',
      render: (r) => <span className="font-mono font-semibold">{formatMontant((r as any).totalDons ?? 0)}</span>,
    },
    {
      key: 'actions', header: 'Actions', width: '160px',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelected(r)}
            className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium"
          >
            <Eye className="w-3 h-3" /> Historique
          </button>
          <button className="flex items-center gap-1 text-xs text-accent-400 hover:underline font-medium">
            <Plus className="w-3 h-3" /> Don
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Donateurs</h1>
          <p className="text-sm text-neutral-500 mt-1">Suivi des donateurs et contributions</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau donateur
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Heart className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total donateurs</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : total}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total dons</p>
            <p className="text-xl font-bold text-neutral-800">{statsData?.totalDons ?? '—'}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Montant ce mois</p>
            <p className="text-lg font-bold text-green-600">{statsData?.montantMois != null ? formatMontant(statsData.montantMois) : '—'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 w-full"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="input w-full sm:w-48"
        >
          <option value="">Tous les types</option>
          <option value="PHYSIQUE">Personne physique</option>
          <option value="MORAL">Personne morale</option>
        </select>
      </div>

      <DataTable
        columns={columns as Column<Donateur & Record<string, unknown>>[]}
        data={donateurs as (Donateur & Record<string, unknown>)[]}
        isLoading={isLoading}
      />

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Dons — ${selected.nom}` : ''}
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
              <div>
                <span className={`badge ${selected.type === 'PHYSIQUE' ? 'badge-neutral' : 'badge'}`}>{selected.type === 'PHYSIQUE' ? 'Physique' : 'Moral'}</span>
                <p className="text-sm text-neutral-500 mt-1">{selected.email}</p>
                <p className="text-sm text-neutral-500">{selected.telephone}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-700">{(selected as any)._count?.dons ?? 0} don(s)</p>
              <button className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Nouveau don
              </button>
            </div>
            <div className="space-y-3">
              {donsLoading && <p className="text-sm text-neutral-400 text-center py-4">Chargement…</p>}
              {!donsLoading && dons.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">Aucun don enregistré.</p>
              )}
              {dons.map((don) => (
                <div key={don.id} className="border border-neutral-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-800">{formatMontant(don.montant)}</span>
                    <span className={`badge ${TYPE_DON_COLOR[don.typePaiement] ?? 'badge-neutral'}`}>{don.typePaiement}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{formatDate(don.dateDon)}</span>
                    {don.numeroRecu && <span className="font-mono">{don.numeroRecu}</span>}
                  </div>
                  <div>
                    {don.statut === 'RECU'
                      ? <span className="badge badge-success text-xs">Reçu émis</span>
                      : <span className="badge badge-warning text-xs">En attente</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
