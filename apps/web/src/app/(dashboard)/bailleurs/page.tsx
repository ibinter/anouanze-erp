'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Globe } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { formatMontant } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Bailleur {
  id: string;
  nom: string;
  sigle?: string;
  type: string;
  pays?: string;
  _count?: { conventions: number };
}

interface Convention {
  id: string;
  reference: string;
  titre: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  montantDecaisse: number;
}

const TYPE_COLORS: Record<string, string> = {
  MULTILATERAL: 'badge-success',
  BILATERAL: 'badge',
  FONDATION: 'badge-warning',
  PRIVE: 'badge-neutral',
};

export default function BailleursPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Bailleur | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['bailleurs', search],
    queryFn: async () => {
      const { data } = await api.get('/bailleurs', {
        params: { search: search || undefined, limit: 50 },
      });
      return data;
    },
  });

  const { data: conventionsData, isLoading: convLoading } = useQuery({
    queryKey: ['bailleur-conventions', selected?.id],
    queryFn: async () => {
      const { data } = await api.get(`/bailleurs/${selected!.id}/conventions`);
      return data;
    },
    enabled: !!selected?.id,
  });

  const bailleurs: Bailleur[] = data?.data ?? [];
  const conventions: Convention[] = conventionsData ?? [];

  const columns: Column<Bailleur>[] = [
    {
      key: 'nom', header: 'Bailleur',
      render: (r) => (
        <div>
          <p className="font-medium text-neutral-800">{r.nom}</p>
          {r.sigle && <p className="text-xs text-neutral-400">{r.sigle}</p>}
        </div>
      ),
    },
    {
      key: 'type', header: 'Type', width: '120px',
      render: (r) => <span className={`badge ${TYPE_COLORS[r.type] ?? 'badge-neutral'}`}>{r.type}</span>,
    },
    {
      key: 'pays', header: 'Pays/Région', width: '130px',
      render: (r) => r.pays ? (
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-600">{r.pays}</span>
        </div>
      ) : <span className="text-neutral-400">—</span>,
    },
    {
      key: '_count', header: 'Conventions', width: '110px',
      render: (r) => <span className="badge badge-neutral">{(r as any)._count?.conventions ?? 0}</span>,
    },
    {
      key: 'actions', header: '', width: '100px',
      render: (r) => (
        <button
          onClick={() => setSelected(selected?.id === r.id ? null : r)}
          className={cn('text-xs font-medium', selected?.id === r.id ? 'text-accent-400' : 'text-primary-600 hover:underline')}
        >
          {selected?.id === r.id ? 'Masquer' : 'Conventions'}
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Bailleurs de fonds</h1>
        <p className="text-sm text-neutral-500 mt-1">Partenaires financiers et conventions de financement</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Rechercher un bailleur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9 w-full"
        />
      </div>

      <DataTable
        columns={columns as Column<Bailleur & Record<string, unknown>>[]}
        data={bailleurs as (Bailleur & Record<string, unknown>)[]}
        isLoading={isLoading}
      />

      {selected && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-neutral-700">
            Conventions — {selected.nom}
            <span className="ml-2 badge badge-neutral">{conventions.length}</span>
          </h2>
          {convLoading && <p className="text-sm text-neutral-400">Chargement des conventions…</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {conventions.map((conv) => {
              const tauxDecaissement = conv.montant > 0 ? Math.round((conv.montantDecaisse / conv.montant) * 100) : 0;
              return (
                <div key={conv.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-mono text-neutral-400">{conv.reference}</p>
                      <p className="font-semibold text-neutral-800 mt-0.5">{conv.titre}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Montant</span>
                    <span className="font-mono font-semibold text-neutral-800">{formatMontant(conv.montant)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{conv.dateDebut?.slice(0, 7).replace('-', '/')}</span>
                    <span>→</span>
                    <span>{conv.dateFin?.slice(0, 7).replace('-', '/')}</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-500">Décaissé</span>
                      <span className={cn('font-medium', tauxDecaissement >= 80 ? 'text-green-600' : tauxDecaissement >= 40 ? 'text-orange-500' : 'text-neutral-600')}>
                        {tauxDecaissement}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', tauxDecaissement >= 80 ? 'bg-green-500' : tauxDecaissement >= 40 ? 'bg-orange-400' : 'bg-primary-600')}
                        style={{ width: `${tauxDecaissement}%` }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">{formatMontant(conv.montantDecaisse)} / {formatMontant(conv.montant)}</p>
                  </div>
                </div>
              );
            })}
            {!convLoading && conventions.length === 0 && (
              <p className="text-sm text-neutral-400 col-span-2 text-center py-4">Aucune convention enregistrée.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
