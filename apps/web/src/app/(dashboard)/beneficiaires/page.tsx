'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Plus, Search, Users, UserCheck, FolderOpen } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';

interface Beneficiaire {
  id: string;
  code?: string;
  nom: string;
  prenom: string;
  genre: 'M' | 'F';
  telephone?: string;
  _count?: { projets: number };
  dateEnregistrement?: string;
  createdAt?: string;
}

export default function BeneficiairesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nom: '', prenom: '', genre: 'F', telephone: '' });
  const [error, setError] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const createBeneficiaire = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/beneficiaires', {
        nom: data.nom,
        prenom: data.prenom,
        genre: data.genre,
        telephone: data.telephone || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaires'] });
      setModalOpen(false);
      setForm({ nom: '', prenom: '', genre: 'F', telephone: '' });
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['beneficiaires', page, search],
    queryFn: async () => {
      const { data } = await api.get('/beneficiaires', {
        params: { page, limit, search: search || undefined },
      });
      return data;
    },
  });

  const beneficiaires: Beneficiaire[] = data?.data ?? data ?? [];
  const total = data?.meta?.total ?? beneficiaires.length;
  const totalFemmes = beneficiaires.filter((b) => b.genre === 'F').length;

  const columns: Column<Beneficiaire>[] = [
    {
      key: 'code', header: 'Code', width: '100px',
      render: (r) => <span className="font-mono text-xs text-neutral-500">{(r as any).code ?? '—'}</span>,
    },
    {
      key: 'nom', header: 'Nom complet',
      render: (r) => <span className="font-medium text-neutral-800">{r.prenom} {r.nom}</span>,
    },
    {
      key: 'genre', header: 'Genre', width: '80px',
      render: (r) => (
        <span className={`badge ${r.genre === 'F' ? 'badge-warning' : 'badge-neutral'}`}>{r.genre === 'F' ? 'Femme' : 'Homme'}</span>
      ),
    },
    {
      key: 'telephone', header: 'Téléphone',
      render: (r) => <span>{(r as any).telephone ?? '—'}</span>,
    },
    {
      key: '_count', header: 'Projets', width: '90px',
      render: (r) => {
        const nb = (r as any)._count?.projets ?? 0;
        return <span className="badge badge-success">{nb} projet{nb > 1 ? 's' : ''}</span>;
      },
    },
    {
      key: 'dateEnregistrement', header: 'Enregistrement', width: '130px',
      render: (r) => formatDate((r as any).dateEnregistrement ?? (r as any).createdAt),
    },
    {
      key: 'actions', header: 'Actions', width: '100px',
      render: () => (
        <div className="flex items-center gap-2">
          <button className="text-xs text-primary-600 hover:underline font-medium">Voir</button>
          <button className="text-xs text-neutral-500 hover:underline">Modifier</button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Bénéficiaires</h1>
          <p className="text-sm text-neutral-500 mt-1">Registre des bénéficiaires de l&apos;organisation</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Nouveau bénéficiaire
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total bénéficiaires</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : total}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Femmes</p>
            <p className="text-xl font-bold text-green-600">{isLoading ? '—' : totalFemmes}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <FolderOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Page courante</p>
            <p className="text-xl font-bold text-blue-600">{isLoading ? '—' : beneficiaires.length}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Rechercher un bénéficiaire…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input pl-9 w-full"
        />
      </div>

      <DataTable
        columns={columns as Column<Beneficiaire & Record<string, unknown>>[]}
        data={beneficiaires as (Beneficiaire & Record<string, unknown>)[]}
        isLoading={isLoading}
      />

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nouveau bénéficiaire"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={createBeneficiaire.isPending || !form.nom || !form.prenom}
              onClick={() => createBeneficiaire.mutate(form)}
            >
              {createBeneficiaire.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Prénom</label>
              <input type="text" className="input w-full" placeholder="Prénom" value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="label">Nom</label>
              <input type="text" className="input w-full" placeholder="Nom de famille" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Genre</label>
            <select className="input w-full" value={form.genre} onChange={(e) => setForm((p) => ({ ...p, genre: e.target.value }))}>
              <option value="F">Femme</option>
              <option value="M">Homme</option>
            </select>
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input type="tel" className="input w-full" placeholder="+225 07 …" value={form.telephone} onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
