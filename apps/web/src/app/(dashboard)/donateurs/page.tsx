'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Plus, Heart, TrendingUp, Calendar, Eye, X, Coins } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SlideOver } from '@/components/ui/SlideOver';
import { Pagination } from '@/components/ui/Pagination';
import { formatMontant, formatDate, toNum } from '@/lib/utils';

interface Donateur {
  id: string;
  nom: string;
  prenom?: string;
  type: string;
  email: string;
  telephone: string;
  _count?: { dons: number };
  totalDons?: number;
}

interface Don {
  id: string;
  montant: number;
  type: string;
  dateDon: string;
  statut: string;
  numeroRecu?: string;
}

const TYPE_LABEL: Record<string, string> = {
  NUMERAIRE: 'Numéraire',
  EN_NATURE: 'En nature',
  COMPETENCES: 'Compétences',
  FONCIER: 'Foncier',
};

function NouveauDonateurModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ nom: '', prenom: '', type: 'PHYSIQUE', email: '', telephone: '', pays: 'CI' });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/donateurs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donateurs'] });
      queryClient.invalidateQueries({ queryKey: ['donateurs-stats'] });
      onClose();
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) { setError('Le nom est obligatoire'); return; }
    setError('');
    mutation.mutate({
      nom: form.nom.trim(),
      prenom: form.prenom.trim() || undefined,
      type: form.type,
      email: form.email.trim() || undefined,
      telephone: form.telephone.trim() || undefined,
      pays: form.pays || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-800">Nouveau donateur</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
            <select className="input w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="PHYSIQUE">Personne physique</option>
              <option value="MORAL">Personne morale / Organisation</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                {form.type === 'PHYSIQUE' ? 'Nom *' : 'Raison sociale *'}
              </label>
              <input className="input w-full" placeholder={form.type === 'PHYSIQUE' ? 'Koné' : 'ONG Partenaire'} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
            </div>
            {form.type === 'PHYSIQUE' && (
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Prénom</label>
                <input className="input w-full" placeholder="Aminata" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Email</label>
            <input className="input w-full" type="email" placeholder="email@exemple.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Téléphone</label>
              <input className="input w-full" placeholder="+225 07 00 00 00" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Pays</label>
              <input className="input w-full" placeholder="CI" value={form.pays} onChange={(e) => setForm({ ...form, pays: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement…' : 'Créer le donateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NouveauDonModal({ donateur, onClose }: { donateur: Donateur; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ type: 'NUMERAIRE', montant: '', dateDon: new Date().toISOString().split('T')[0], descriptionNature: '' });
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post(`/donateurs/${donateur.id}/dons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donateur-dons', donateur.id] });
      queryClient.invalidateQueries({ queryKey: ['donateurs'] });
      queryClient.invalidateQueries({ queryKey: ['donateurs-stats'] });
      onClose();
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur lors de l\'enregistrement'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.type === 'NUMERAIRE' && !form.montant) { setError('Le montant est obligatoire'); return; }
    setError('');
    mutation.mutate({
      type: form.type,
      montant: form.montant ? Number(form.montant) : undefined,
      dateDon: form.dateDon,
      descriptionNature: form.descriptionNature.trim() || undefined,
      statut: 'PAYE',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-800">Enregistrer un don</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-neutral-100 text-neutral-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-neutral-500">Donateur : <strong className="text-neutral-800">{donateur.prenom ? `${donateur.prenom} ` : ''}{donateur.nom}</strong></p>
          {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Type de don</label>
            <select className="input w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="NUMERAIRE">Numéraire</option>
              <option value="EN_NATURE">En nature</option>
              <option value="COMPETENCES">Compétences / Bénévolat</option>
              <option value="FONCIER">Foncier</option>
            </select>
          </div>

          {form.type === 'NUMERAIRE' ? (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Montant (XOF) *</label>
              <input className="input w-full" type="number" min="0" placeholder="100000" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
              <input className="input w-full" placeholder="Ex: 50 sacs de ciment 50kg" value={form.descriptionNature} onChange={(e) => setForm({ ...form, descriptionNature: e.target.value })} />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Date du don</label>
            <input className="input w-full" type="date" value={form.dateDon} onChange={(e) => setForm({ ...form, dateDon: e.target.value })} required />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enregistrement…' : 'Enregistrer le don'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DonateursPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Donateur | null>(null);
  const [showNewDonateur, setShowNewDonateur] = useState(false);
  const [donForModal, setDonForModal] = useState<Donateur | null>(null);
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
    { key: 'nom', header: 'Nom / Raison sociale', render: (r) => <span className="font-medium text-neutral-800">{r.prenom ? `${r.prenom} ` : ''}{r.nom}</span> },
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
      render: (r) => <span className="font-mono font-semibold">{formatMontant(toNum((r as any).totalDons))}</span>,
    },
    {
      key: 'actions', header: 'Actions', width: '220px',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/donateurs/${r.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-primary-600 hover:underline font-medium"
          >
            Voir la fiche
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setSelected(r); }}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:underline font-medium"
          >
            <Eye className="w-3 h-3" /> Historique
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDonForModal(r); }}
            className="flex items-center gap-1 text-xs text-accent-400 hover:underline font-medium"
          >
            <Plus className="w-3 h-3" /> Don
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {showNewDonateur && <NouveauDonateurModal onClose={() => setShowNewDonateur(false)} />}
      {donForModal && <NouveauDonModal donateur={donForModal} onClose={() => setDonForModal(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Donateurs</h1>
          <p className="text-sm text-neutral-500 mt-1">Suivi des donateurs et contributions</p>
        </div>
        <button onClick={() => setShowNewDonateur(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouveau donateur
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total donateurs</p>
            <p className="text-xl font-bold text-neutral-800">{isLoading ? '—' : (statsData?.totalDonateurs ?? total)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Nombre de dons</p>
            <p className="text-xl font-bold text-neutral-800">{statsData?.totalDons ?? '—'}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total collecté</p>
            <p className="text-lg font-bold text-neutral-800">{statsData?.montantTotal != null ? formatMontant(toNum(statsData.montantTotal)) : '—'}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Collecté ce mois</p>
            <p className="text-lg font-bold text-green-600">{statsData?.montantCeMois != null ? formatMontant(toNum(statsData.montantCeMois)) : '—'}</p>
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
        onRowClick={(r) => router.push(`/donateurs/${(r as Donateur).id}`)}
      />

      {total > limit && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <SlideOver
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Dons — ${selected.prenom ? selected.prenom + ' ' : ''}${selected.nom}` : ''}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-700">{(selected as any)._count?.dons ?? dons.length} don(s)</p>
                <p className="text-xs text-neutral-500">Total : <span className="font-mono font-semibold text-primary-700">{formatMontant(dons.reduce((s, d) => s + toNum(d.montant), 0))}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/donateurs/${selected.id}`} className="btn-secondary text-xs py-1.5 px-3">
                  Fiche complète
                </Link>
                <button
                  onClick={() => { setDonForModal(selected); setSelected(null); }}
                  className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Nouveau don
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {donsLoading && <p className="text-sm text-neutral-400 text-center py-4">Chargement…</p>}
              {!donsLoading && dons.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-4">Aucun don enregistré.</p>
              )}
              {dons.map((don) => (
                <div key={don.id} className="border border-neutral-100 rounded-lg p-3 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className="font-semibold text-neutral-800">
                      {don.montant ? formatMontant(don.montant) : TYPE_LABEL[don.type] ?? don.type}
                    </span>
                    <span className="badge badge-neutral text-xs">{TYPE_LABEL[don.type] ?? don.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{formatDate(don.dateDon)}</span>
                    {don.numeroRecu && <span className="font-mono">{don.numeroRecu}</span>}
                  </div>
                  <div>
                    {don.statut === 'PAYE'
                      ? <span className="badge badge-success text-xs">Reçu</span>
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
