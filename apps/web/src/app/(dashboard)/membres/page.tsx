'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { Search, UserPlus, Users, UserCheck, UserX, X } from 'lucide-react';

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

interface MembreFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statutMembre: string;
  dateAdhesion: string;
  fonctions: string;
}

function NouveauMembreModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MembreFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    statutMembre: 'ACTIF',
    dateAdhesion: new Date().toISOString().split('T')[0],
    fonctions: '',
  });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/membres', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membres'] });
      onClose();
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Erreur lors de la création');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { setError('Le nom est obligatoire'); return; }
    setError('');
    mutation.mutate({
      nom: form.nom.trim(),
      prenom: form.prenom.trim() || undefined,
      email: form.email.trim() || undefined,
      telephone: form.telephone.trim() || undefined,
      statutMembre: form.statutMembre || undefined,
      dateAdhesion: form.dateAdhesion || undefined,
      fonctions: form.fonctions ? form.fonctions.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-800">Nouveau membre</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Nom *</label>
              <input
                className="input w-full"
                placeholder="Koné"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Prénom</label>
              <input
                className="input w-full"
                placeholder="Aminata"
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
            <input
              className="input w-full"
              type="email"
              placeholder="email@exemple.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Téléphone</label>
            <input
              className="input w-full"
              placeholder="+225 07 00 00 00"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Statut</label>
              <select
                className="input w-full"
                value={form.statutMembre}
                onChange={(e) => setForm({ ...form, statutMembre: e.target.value })}
              >
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Date d&apos;adhésion</label>
              <input
                className="input w-full"
                type="date"
                value={form.dateAdhesion}
                onChange={(e) => setForm({ ...form, dateAdhesion: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Fonctions (séparées par virgule)</label>
            <input
              className="input w-full"
              placeholder="Président, Trésorier…"
              value={form.fonctions}
              onChange={(e) => setForm({ ...form, fonctions: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement…' : 'Créer le membre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembresPage() {
  return <MembresTable />;
}

function MembresTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [showModal, setShowModal] = useState(false);
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
      {showModal && <NouveauMembreModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Membres</h1>
          <p className="text-sm text-neutral-500 mt-1">Gestion des membres de l&apos;organisation</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
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
