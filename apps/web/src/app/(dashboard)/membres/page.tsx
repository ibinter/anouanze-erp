'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Search, UserPlus, Users, UserCheck, UserX } from 'lucide-react';

interface Membre {
  id: string;
  numero: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statutMembre: 'ACTIF' | 'INACTIF' | 'SUSPENDU';
  dateAdhesion: string;
}

interface MembresResponse {
  data: Membre[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

function StatutBadge({ statut }: { statut: Membre['statutMembre'] }) {
  if (statut === 'ACTIF') return <span className="badge badge-success">Actif</span>;
  if (statut === 'INACTIF') return <span className="badge badge-neutral">Inactif</span>;
  return <span className="badge badge-warning">Suspendu</span>;
}

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'ACTIF', label: 'Actif' },
  { value: 'INACTIF', label: 'Inactif' },
  { value: 'SUSPENDU', label: 'Suspendu' },
];

export default function MembresPage() {
  return <MembresTable />;
}

function MembresTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const limit = 10;

  const { data, isLoading } = useQuery<MembresResponse>({
    queryKey: ['membres', page, search, statut],
    queryFn: async () => {
      const { data } = await api.get('/membres', {
        params: { page, limit, search: search || undefined, statut: statut || undefined },
      });
      return data;
    },
  });

  const membres = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalActifs = membres.filter((m) => m.statutMembre === 'ACTIF').length;
  const totalInactifs = membres.filter((m) => m.statutMembre !== 'ACTIF').length;

  const columns: Column<Membre>[] = [
    { key: 'numero', header: 'N°', width: '90px' },
    {
      key: 'nom',
      header: 'Nom complet',
      render: (row) => (
        <span className="font-medium text-neutral-800">
          {row.prenom} {row.nom}
        </span>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'telephone', header: 'Téléphone' },
    {
      key: 'statutMembre',
      header: 'Statut',
      width: '110px',
      render: (row) => <StatutBadge statut={(row as any).statutMembre} />,
    },
    {
      key: 'dateAdhesion',
      header: 'Adhésion',
      width: '110px',
      render: (row) => formatDate(row.dateAdhesion),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '130px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button className="text-xs text-primary-600 hover:underline font-medium">Voir</button>
          <button className="text-xs text-neutral-500 hover:underline">Modifier</button>
          <button className="text-xs text-red-500 hover:underline">Supprimer</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Membres</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestion des membres de l&apos;organisation</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Nouveau membre
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total membres</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : total}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Actifs</p>
            <p className="text-xl font-bold text-green-600">{isLoading ? '—' : totalActifs}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neutral-100">
            <UserX className="w-5 h-5 text-neutral-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Inactifs / Suspendus</p>
            <p className="text-xl font-bold text-neutral-600">{isLoading ? '—' : totalInactifs}</p>
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
          value={statut}
          onChange={(e) => { setStatut(e.target.value); setPage(1); }}
          className="input w-full sm:w-48"
        >
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <DataTable<Membre & Record<string, unknown>>
        columns={columns as Column<Membre & Record<string, unknown>>[]}
        data={membres as (Membre & Record<string, unknown>)[]}
        isLoading={isLoading}
      />

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}
    </div>
  );
}
