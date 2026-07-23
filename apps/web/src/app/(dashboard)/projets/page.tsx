'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatMontant, toNum, cn } from '@/lib/utils';
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

/** Valeurs d'énumération de l'API : jamais traduites, seuls leurs libellés le sont. */
const STATUT_VALUES = ['BROUILLON', 'SOUMIS', 'APPROUVE', 'EN_COURS', 'SUSPENDU', 'CLOTURE', 'ANNULE'] as const;
const SECTEUR_VALUES = ['education', 'sante', 'agriculture', 'eau', 'environnement'] as const;

const STATUT_CLS: Record<string, string> = {
  BROUILLON: 'badge badge-neutral',
  SOUMIS: 'badge',
  APPROUVE: 'badge badge-neutral',
  EN_COURS: 'badge badge-success',
  SUSPENDU: 'badge badge-warning',
  CLOTURE: 'badge badge-neutral',
  ANNULE: 'badge badge-error',
};

function StatutBadge({ statut }: { statut: string }) {
  const t = useTranslations('activites.projets');
  const cls = STATUT_CLS[statut] ?? 'badge badge-neutral';
  const label = (STATUT_VALUES as readonly string[]).includes(statut)
    ? t(`statuts.${statut}` as never)
    : statut;
  return <span className={cls}>{label}</span>;
}

function ProjetCard({
  projet,
  onOpen,
  onApercu,
}: {
  projet: Projet;
  onOpen: () => void;
  onApercu: () => void;
}) {
  const t = useTranslations('activites.projets');
  const budgetPrev = toNum(projet.budgetPrevisionnel ?? projet.budgetTotal ?? projet.budget);
  const budgetReal = toNum(projet.budgetRealise ?? projet.depenses);
  const pct = budgetPrev > 0
    ? Math.min(100, Math.round((budgetReal / budgetPrev) * 100))
    : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      className="card-hover rounded-2xl p-5 flex flex-col gap-4 text-left w-full cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary-600/30"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-neutral-800 leading-snug group-hover:text-primary-700 transition-colors">{projet.nom}</h3>
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
          <span>{t('carte.budgetRealise')}</span>
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

      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 group-hover:gap-3 transition-all">
          {t('carte.voirFiche')}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onApercu(); }}
          className="text-xs text-neutral-500 hover:text-neutral-700 hover:underline"
        >
          {t('carte.apercuRapide')}
        </button>
      </div>
    </div>
  );
}

function ProjetDetail({ projet }: { projet: Projet }) {
  const t = useTranslations('activites.projets');
  const budgetPrev = toNum(projet.budgetPrevisionnel ?? projet.budgetTotal ?? projet.budget);
  const budgetReal = toNum(projet.budgetRealise ?? projet.depenses);
  const reste = budgetPrev - budgetReal;
  const pct = budgetPrev > 0 ? Math.min(100, Math.round((budgetReal / budgetPrev) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <StatutBadge statut={projet.statut} />
        {(projet.dateDebut || projet.dateFin) && (
          <span className="text-xs text-neutral-500">
            {projet.dateDebut ? formatDate(projet.dateDebut) : '—'} → {projet.dateFin ? formatDate(projet.dateFin) : '—'}
          </span>
        )}
      </div>

      {projet.description && (
        <p className="text-sm text-neutral-600 leading-relaxed">{projet.description}</p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">{t('apercu.budgetPrevisionnel')}</p>
          <p className="text-sm font-bold text-neutral-800 mt-0.5">{formatMontant(budgetPrev)}</p>
        </div>
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">{t('apercu.budgetRealise')}</p>
          <p className="text-sm font-bold text-accent-500 mt-0.5">{formatMontant(budgetReal)}</p>
        </div>
        <div className="rounded-xl bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">{t('apercu.resteDisponible')}</p>
          <p className={cn('text-sm font-bold mt-0.5', reste >= 0 ? 'text-primary-600' : 'text-red-600')}>{formatMontant(reste)}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>{t('apercu.tauxExecution')}</span>
          <span className="font-medium text-neutral-700">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-accent-400' : 'bg-primary-600')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {(projet.secteurs ?? []).length > 0 && (
        <div>
          <p className="text-xs text-neutral-500 mb-1.5">{t('apercu.secteurs')}</p>
          <div className="flex flex-wrap gap-1.5">
            {(projet.secteurs ?? []).map((s) => (
              <span key={s} className="badge badge-neutral text-xs">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PROJET_INIT = { nom: '', description: '', statut: 'EN_COURS' as string, dateDebut: '', dateFin: '', budgetTotal: '' };

export default function ProjetsPage() {
  const t = useTranslations('activites.projets');
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [secteur, setSecteur] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
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
    onError: (err: any) => setError(err?.response?.data?.message ?? t('erreur')),
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
  const budgetTotal = projets.reduce((s, p) => s + toNum(p.budgetPrevisionnel ?? p.budgetTotal ?? p.budget), 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{t('titre')}</h1>
          <p className="text-sm text-neutral-500 mt-1">{t('sousTitre')}</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <FolderOpen className="w-4 h-4" />
          {t('nouveau')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <TrendingUp className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.enCours')}</p>
            <p className="text-xl font-bold text-primary-600">{isLoading ? '—' : enCours}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.termines')}</p>
            <p className="text-xl font-bold text-green-600">{isLoading ? '—' : termines}</p>
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs text-neutral-500">{t('stats.budgetTotal')}</p>
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
            placeholder={t('recherche')}
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
          <option value="">{t('filtres.tousStatuts')}</option>
          {STATUT_VALUES.map((s) => (
            <option key={s} value={s}>{t(`statuts.${s}` as never)}</option>
          ))}
        </select>
        <select
          value={secteur}
          onChange={(e) => setSecteur(e.target.value)}
          className="input w-full sm:w-52"
        >
          <option value="">{t('filtres.tousSecteurs')}</option>
          {SECTEUR_VALUES.map((s) => (
            <option key={s} value={s}>{t(`secteurs.${s}` as never)}</option>
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
          <p className="font-medium">{t('vide')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projets.map((projet) => (
            <ProjetCard
              key={projet.id}
              projet={projet}
              onOpen={() => router.push(`/projets/${projet.id}`)}
              onApercu={() => setSelectedProjet(projet)}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t('modal.titre')}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>{t('modal.annuler')}</button>
            <button
              className="btn-primary"
              disabled={createProjet.isPending || !form.nom}
              onClick={() => createProjet.mutate(form)}
            >
              {createProjet.isPending ? t('modal.creation') : t('modal.creer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="label">{t('modal.nom')}</label>
            <input type="text" className="input w-full" placeholder={t('modal.nomPlaceholder')} value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
          </div>
          <div>
            <label className="label">{t('modal.description')}</label>
            <textarea className="input w-full min-h-[80px] resize-none" placeholder={t('modal.descriptionPlaceholder')} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('modal.statut')}</label>
              <select className="input w-full" value={form.statut} onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}>
                {STATUT_VALUES.map((s) => <option key={s} value={s}>{t(`statuts.${s}` as never)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('modal.budget')}</label>
              <input type="number" className="input w-full" placeholder="0" value={form.budgetTotal} onChange={(e) => setForm((p) => ({ ...p, budgetTotal: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.dateDebut')}</label>
              <input type="date" className="input w-full" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.dateFin')}</label>
              <input type="date" className="input w-full" value={form.dateFin} onChange={(e) => setForm((p) => ({ ...p, dateFin: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={selectedProjet !== null}
        onOpenChange={(open) => { if (!open) setSelectedProjet(null); }}
        title={selectedProjet?.nom ?? t('apercu.titreParDefaut')}
        size="lg"
        footer={
          selectedProjet ? (
            <Link href={`/projets/${selectedProjet.id}`} className="btn-primary">
              {t('apercu.ouvrirFiche')}
            </Link>
          ) : undefined
        }
      >
        {selectedProjet && <ProjetDetail projet={selectedProjet} />}
      </Modal>
    </div>
  );
}
