'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatMontant, toNum, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { exportDocument, ANOUANZE_BRANDING, formatDateFR, formatFCFA } from '@/lib/pdf-engine';
import type { DocumentExportDefinition } from '@/lib/pdf-engine';
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  FileText,
  Wallet,
  Users,
  ListChecks,
  Percent,
  FolderX,
} from 'lucide-react';

interface Activite {
  id: string;
  nom: string;
  description?: string | null;
  statut: string;
  dateDebut?: string | null;
  dateFin?: string | null;
  lieu?: string | null;
  budget?: number | string | null;
}

interface ProjetBeneficiaire {
  projetId: string;
  beneficiaireId: string;
  dateEntree?: string;
  dateSortie?: string | null;
  statut?: string;
  services?: string[];
  beneficiaire?: {
    id: string;
    code?: string | null;
    nom: string;
    prenom?: string | null;
    genre?: string | null;
    telephone?: string | null;
  };
}

interface BudgetProjet {
  id: string;
  nom: string;
  exercice: number;
  statut: string;
  dateApprobation?: string | null;
}

interface Projet {
  id: string;
  code?: string | null;
  nom: string;
  description?: string | null;
  type?: string;
  statut: string;
  dateDebut?: string | null;
  dateFin?: string | null;
  budgetTotal?: number | string | null;
  devise?: string;
  zones?: string[];
  secteurs?: string[];
  objectifs?: string | null;
  createdAt?: string;
  activites?: Activite[];
  beneficiaires?: ProjetBeneficiaire[];
  budgets?: BudgetProjet[];
}

const STATUT_MAP: Record<string, { label: string; cls: string }> = {
  BROUILLON: { label: 'Brouillon', cls: 'badge badge-neutral' },
  SOUMIS: { label: 'Soumis', cls: 'badge' },
  APPROUVE: { label: 'Approuvé', cls: 'badge badge-neutral' },
  EN_COURS: { label: 'En cours', cls: 'badge badge-success' },
  SUSPENDU: { label: 'Suspendu', cls: 'badge badge-warning' },
  CLOTURE: { label: 'Clôturé', cls: 'badge badge-neutral' },
  ANNULE: { label: 'Annulé', cls: 'badge badge-error' },
};

const STATUTS_EDIT = ['BROUILLON', 'SOUMIS', 'APPROUVE', 'EN_COURS', 'SUSPENDU', 'CLOTURE', 'ANNULE'];

function InfoLigne({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-neutral-50 last:border-0">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-800">{value ?? <span className="text-neutral-400">—</span>}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="h-4 w-64 rounded bg-neutral-100 animate-pulse" />
      <div className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-72 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="h-72 rounded-2xl bg-neutral-100 animate-pulse lg:col-span-2" />
      </div>
    </div>
  );
}

function IntrouvableCard({ message }: { message: string }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="card max-w-lg mx-auto text-center py-14 space-y-4">
        <FolderX className="w-12 h-12 mx-auto text-neutral-300 stroke-1" />
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">Projet introuvable</h2>
          <p className="text-sm text-neutral-500 mt-1">{message}</p>
        </div>
        <Link href="/projets" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </Link>
      </div>
    </div>
  );
}

const EDIT_INIT = { nom: '', description: '', statut: 'EN_COURS', dateDebut: '', dateFin: '', budgetTotal: '' };

export default function ProjetDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EDIT_INIT);
  const [editError, setEditError] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data: projet, isLoading, isError, error } = useQuery<Projet>({
    queryKey: ['projet', id],
    queryFn: async () => {
      const { data } = await api.get(`/projets/${id}`);
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  const updateProjet = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.patch(`/projets/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projet', id] });
      queryClient.invalidateQueries({ queryKey: ['projets'] });
      setEditOpen(false);
      setEditError('');
    },
    onError: (err: unknown) => setEditError(err instanceof Error ? err.message : 'Erreur lors de la modification'),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !projet) {
    const message = error instanceof Error ? error.message : 'Ce projet n’existe pas ou ne fait pas partie de votre organisation.';
    return <IntrouvableCard message={message} />;
  }

  const activites = projet.activites ?? [];
  const beneficiaires = projet.beneficiaires ?? [];
  const budgets = projet.budgets ?? [];

  const budgetPrev = toNum(projet.budgetTotal);
  const budgetActivites = activites.reduce((s, a) => s + toNum(a.budget), 0);
  const resteDisponible = budgetPrev - budgetActivites;
  const pct = budgetPrev > 0 ? Math.min(100, Math.round((budgetActivites / budgetPrev) * 100)) : 0;
  const activitesTerminees = activites.filter((a) => a.statut === 'TERMINEE' || a.statut === 'CLOTUREE').length;

  const statut = STATUT_MAP[projet.statut] ?? { label: projet.statut, cls: 'badge badge-neutral' };

  const openEdit = () => {
    setForm({
      nom: projet.nom ?? '',
      description: projet.description ?? '',
      statut: projet.statut ?? 'EN_COURS',
      dateDebut: projet.dateDebut ? projet.dateDebut.slice(0, 10) : '',
      dateFin: projet.dateFin ? projet.dateFin.slice(0, 10) : '',
      budgetTotal: projet.budgetTotal != null ? String(toNum(projet.budgetTotal)) : '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const def: DocumentExportDefinition = {
        title: `Fiche projet — ${projet.nom}`,
        subtitle: projet.code ? `Code ${projet.code}` : 'Suivi des activités',
        documentType: 'project',
        branding: ANOUANZE_BRANDING,
        lang: 'fr',
        filtersSummary: `Statut : ${statut.label} — Budget : ${formatMontant(budgetPrev)} — Activités : ${activites.length} — Bénéficiaires : ${beneficiaires.length}`,
        columns: [
          { key: 'nom', label: 'Activité', type: 'name', priority: 'essential' },
          { key: 'statut', label: 'Statut', type: 'status', priority: 'essential', nowrap: true },
          { key: 'lieu', label: 'Lieu', type: 'short-description', priority: 'important' },
          { key: 'dateDebut', label: 'Début', type: 'date', priority: 'important', nowrap: true, format: formatDateFR },
          { key: 'dateFin', label: 'Fin', type: 'date', priority: 'important', nowrap: true, format: formatDateFR },
          { key: 'budget', label: 'Budget', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
        ],
      };
      await exportDocument(def, activites as unknown as Record<string, unknown>[], 'pdf');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/dashboard" className="hover:text-primary-600">Tableau de bord</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/projets" className="hover:text-primary-600">Projets</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700 font-medium truncate">{projet.nom}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 mt-1"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 leading-tight">{projet.nom}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {projet.code && <span className="text-xs font-mono text-neutral-400">{projet.code}</span>}
              <span className={statut.cls}>{statut.label}</span>
              {(projet.dateDebut || projet.dateFin) && (
                <span className="text-xs text-neutral-500">
                  {projet.dateDebut ? formatDate(projet.dateDebut) : '—'} → {projet.dateFin ? formatDate(projet.dateFin) : '—'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            {exporting ? 'Export…' : 'Exporter'}
          </button>
          <button onClick={openEdit} className="btn-primary flex items-center gap-2 text-sm">
            <Pencil className="w-4 h-4" /> Modifier
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Budget total</p>
            <p className="text-lg font-bold text-neutral-800">{formatMontant(budgetPrev)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <Percent className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Budget alloué aux activités</p>
            <p className="text-lg font-bold text-accent-500">{formatMontant(budgetActivites)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <ListChecks className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Activités</p>
            <p className="text-lg font-bold text-neutral-800">{activitesTerminees} / {activites.length}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Bénéficiaires</p>
            <p className="text-lg font-bold text-neutral-800">{beneficiaires.length}</p>
          </div>
        </div>
      </div>

      {/* Exécution budgétaire */}
      <div className="card space-y-2">
        <div className="flex justify-between text-xs text-neutral-500">
          <span>Taux d&apos;allocation budgétaire</span>
          <span className="font-medium text-neutral-700">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-accent-400' : 'bg-primary-600')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-400">
          <span>{formatMontant(budgetActivites)} alloués</span>
          <span className={cn(resteDisponible >= 0 ? 'text-primary-600' : 'text-red-600', 'font-medium')}>
            Reste : {formatMontant(resteDisponible)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-1">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Informations</h2>
          <InfoLigne label="Type" value={projet.type} />
          <InfoLigne label="Devise" value={projet.devise} />
          <InfoLigne label="Date de début" value={projet.dateDebut ? formatDate(projet.dateDebut) : null} />
          <InfoLigne label="Date de fin" value={projet.dateFin ? formatDate(projet.dateFin) : null} />
          <InfoLigne label="Description" value={projet.description} />
          <InfoLigne label="Objectifs" value={projet.objectifs} />
          <InfoLigne
            label="Secteurs"
            value={(projet.secteurs ?? []).length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {(projet.secteurs ?? []).map((s) => <span key={s} className="badge badge-neutral text-xs">{s}</span>)}
              </span>
            ) : null}
          />
          <InfoLigne
            label="Zones d'intervention"
            value={(projet.zones ?? []).length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {(projet.zones ?? []).map((z) => <span key={z} className="badge badge-neutral text-xs">{z}</span>)}
              </span>
            ) : null}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Activités */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-700">Activités</h2>
              <span className="badge badge-neutral">{activites.length}</span>
            </div>
            {activites.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">Aucune activité enregistrée.</p>
            ) : (
              <div className="space-y-2">
                {activites.map((a) => (
                  <div key={a.id} className="border border-neutral-100 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-800 truncate">{a.nom}</p>
                        {a.description && <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{a.description}</p>}
                        <p className="text-xs text-neutral-400 mt-1">
                          {a.dateDebut ? formatDate(a.dateDebut) : '—'} → {a.dateFin ? formatDate(a.dateFin) : '—'}
                          {a.lieu ? ` · ${a.lieu}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="badge badge-neutral text-xs">{a.statut}</span>
                        <p className="text-sm font-mono font-semibold text-neutral-800 mt-1">{formatMontant(toNum(a.budget))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budgets rattachés */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-700">Budgets rattachés</h2>
              <span className="badge badge-neutral">{budgets.length}</span>
            </div>
            {budgets.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Aucun budget rattaché à ce projet.</p>
            ) : (
              <div className="space-y-2">
                {budgets.map((b) => (
                  <div key={b.id} className="flex items-center justify-between border border-neutral-100 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-neutral-800">{b.nom}</p>
                      <p className="text-xs text-neutral-400">Exercice {b.exercice}</p>
                    </div>
                    <span className="badge badge-neutral text-xs">{b.statut}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bénéficiaires */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-neutral-700">Bénéficiaires</h2>
              <span className="badge badge-neutral">{beneficiaires.length}</span>
            </div>
            {beneficiaires.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">Aucun bénéficiaire rattaché.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Bénéficiaire</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Entrée</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaires.map((pb) => (
                      <tr key={pb.beneficiaireId} className="border-b border-neutral-50">
                        <td className="px-3 py-2.5 font-medium text-neutral-800">
                          {pb.beneficiaire
                            ? `${pb.beneficiaire.prenom ? pb.beneficiaire.prenom + ' ' : ''}${pb.beneficiaire.nom}`
                            : pb.beneficiaireId}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-600">{pb.dateEntree ? formatDate(pb.dateEntree) : '—'}</td>
                        <td className="px-3 py-2.5"><span className="badge badge-neutral text-xs">{pb.statut ?? '—'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Modifier le projet"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditOpen(false)}>Annuler</button>
            <button
              className="btn-primary"
              disabled={updateProjet.isPending || !form.nom}
              onClick={() =>
                updateProjet.mutate({
                  nom: form.nom,
                  description: form.description || undefined,
                  statut: form.statut || undefined,
                  dateDebut: form.dateDebut || undefined,
                  dateFin: form.dateFin || undefined,
                  budgetTotal: form.budgetTotal ? Number(form.budgetTotal) : undefined,
                })
              }
            >
              {updateProjet.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{editError}</p>}
          <div>
            <label className="label">Nom du projet *</label>
            <input className="input w-full" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input w-full min-h-[80px] resize-none" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Statut</label>
              <select className="input w-full" value={form.statut} onChange={(e) => setForm((p) => ({ ...p, statut: e.target.value }))}>
                {STATUTS_EDIT.map((s) => <option key={s} value={s}>{STATUT_MAP[s]?.label ?? s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Budget total (XOF)</label>
              <input type="number" className="input w-full" value={form.budgetTotal} onChange={(e) => setForm((p) => ({ ...p, budgetTotal: e.target.value }))} />
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
