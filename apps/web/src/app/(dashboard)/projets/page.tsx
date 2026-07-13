'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatMontant, cn } from '@/lib/utils';
import { Search, FolderOpen, CheckCircle2, TrendingUp, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface Projet {
  id: string;
  nom: string;
  description?: string;
  statut: string;
  dateDebut?: string;
  dateFin?: string;
  budgetPrevisionnel?: number;
  budgetRealise?: number;
  budgetTotal?: number;
  secteurs?: string[];
  budget?: number;
  depenses?: number;
}

interface ProjetsResponse {
  data: Projet[];
  total: number;
}

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS', label: 'Soumis' },
  { value: 'APPROUVE', label: 'Approuvé' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'SUSPENDU', label: 'Suspendu' },
  { value: 'CLOTURE', label: 'Clôturé' },
  { value: 'ANNULE', label: 'Annulé' },
];

const SECTEURS = [
  { value: '', label: 'Tous les secteurs' },
  { value: 'education', label: 'Éducation' },
  { value: 'sante', label: 'Santé' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'eau', label: 'Eau & Assainissement' },
  { value: 'environnement', label: 'Environnement' },
];

const STATUT_MAP: Record<string, { label: string; cls: string }> = {
  BROUILLON: { label: 'Brouillon', cls: 'badge badge-neutral' },
  SOUMIS: { label: 'Soumis', cls: 'badge' },
  APPROUVE: { label: 'Approuvé', cls: 'badge badge-neutral' },
  EN_COURS: { label: 'En cours', cls: 'badge badge-success' },
  SUSPENDU: { label: 'Suspendu', cls: 'badge badge-warning' },
  CLOTURE: { label: 'Clôturé', cls: 'badge badge-neutral' },
  ANNULE: { label: 'Annulé', cls: 'badge badge-error' },
};

function StatutBadge({ statut }: { statut: string }) {
  const entry = STATUT_MAP[statut] ?? { label: statut, cls: 'badge badge-neutral' };
  return <span className={entry.cls}>{entry.label}</span>;
}

function ProjetCard({ projet }: { projet: Projet }) {
  const budgetPrev = projet.budgetPrevisionnel ?? projet.budgetTotal ?? projet.budget ?? 0;
  const budgetReal = projet.budgetRealise ?? projet.depenses ?? 0;
  const pct = budgetPrev > 0
    ? Math.min(100, Math.round((budgetReal / budgetPrev) * 100))
    : 0;

  return (
    <div className="card flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-800 leading-snug">{projet.nom}</h3>
        <StatutBadge statut={projet.statut} />
      </div>

      {projet.description && (
        <p className="text-sm text-neutral-500 line-clamp-2">{projet.description}</p>
      )}

      {(projet.dateDebut || projet.dateFin) && (
        <div className="flex gap-2 text-xs text-neutral-500">
          <span>{projet.dateDebut ? formatDate(projet.dateDebut) : '—'}</span>
          <span>→</span>
          <span>{projet.dateFin ? formatDate(projet.dateFin) : '—'}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Budget réalisé</span>
          <span className="font-medium text-neutral-700">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-accent-400' : 'bg-primary-600',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-400">
          <span>{formatMontant(budgetReal)}</span>
          <span>{formatMontant(budgetPrev)}</span>
        </div>
      </div>

      {(projet.secteurs ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {(projet.secteurs ?? []).map((s) => (
            <span key={s} className="badge badge-neutral text-xs">{s}</span>
          ))}
        </div>
      )}

      <button className="btn-secondary flex items-center justify-center gap-2 mt-auto">
        Voir détails
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const PROJET_INIT = { nom: '', description: '', statut: 'EN_COURS' as string, dateDebut: '', dateFin: '', budgetTotal: '' };

export default function ProjetsPage() {
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [secteur, setSecteur] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(PROJET_INIT);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createProjet = useMutation({
    mutationFn: (data: typeof PROJET_INIT) =>
      api.post('/projets', {
        nom: data.nom,
        description: data.description || undefined,
        statut: data.statut || undefined,
        dateDebut: data.dateDebut || undefined,
        dateFin: data.dateFin || undefined,
        budgetTotal: data.budgetTotal ? Number(data.budgetTotal) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] });
      setModalOpen(false);
      setForm(PROJET_INIT);
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erreur'),
  });

  const { data, isLoading } = useQuery<ProjetsResponse>({
    queryKey: ['projets', search, statut, secteur],
    queryFn: async () => {
      const { data } = await api.get('/projets', {
        params: {
          search: search || undefined,
          statut: statut || undefined,
          secteur: secteur || undefined,
        },
      });
      return data;
    },
  });

  const projets = data?.data ?? [];
  const enCours = projets.filter((p) => p.statut === 'EN_COURS').length;
  const termines = projets.filter((p) => p.statut === 'CLOTURE').length;
  const budgetTotal = projets.reduce((s, p) => s + (p.budgetPrevisionnel ?? p.budgetTotal ?? p.budget ?? 0), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Projets &amp; Programmes</h1>
          <p className="text-sm text-neutral-500 mt-1">Suivi des projets de l&apos;organisation</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <FolderOpen className="w-4 h-4" />
          Nouveau projet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">En cours</p>
            <p className="text-xl font-bold text-primary-600">{isLoading ? '—' : enCours}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Terminés</p>
            <p className="text-xl font-bold text-green-600">{isLoading ? '—' : termines}</p>
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs text-neutral-500">Budget total prévisionnel</p>
          <p className="text-xl font-bold text-accent-400">
            {isLoading ? '—' : formatMontant(budgetTotal)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Rechercher un projet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 w-full"
          />
        </div>
        <select
          value={statut}
          onChange={(e) => setStatut(e.target.value)}
          className="input w-full sm:w-44"
        >
          {STATUTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={secteur}
          onChange={(e) => setSecteur(e.target.value)}
          className="input w-full sm:w-52"
        >
          {SECTEURS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 rounded bg-neutral-100 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : projets.length === 0 ? (
        <div className="py-20 text-center text-neutral-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 stroke-1" />
          <p className="font-medium">Aucun projet trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projets.map((projet) => (
            <ProjetCard key={projet.id} projet={projet} />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Nouveau projet"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={createProjet.isPending || !form.nom}
              onClick={() => createProjet.mutate(form)}
            >
              {createProjet.isPending ? 'Création…' : 'Créer le projet'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">Nom du projet *</label>
            <input type="text" className="input w-full" placeholder="Titre du projet" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input w-full min-h-[80px] resize-none" placeholder="Objectifs et description…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Statut</label>
              <select className="input w-full" value={form.statut} onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}>
                {STATUTS.filter((s) => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Budget prévisionnel (XOF)</label>
              <input type="number" className="input w-full" placeholder="0" value={form.budgetTotal} onChange={(e) => setForm((p) => ({ ...p, budgetTotal: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date de début</label>
              <input type="date" className="input w-full" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} />
            </div>
            <div>
              <label className="label">Date de fin</label>
              <input type="date" className="input w-full" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
