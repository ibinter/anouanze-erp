'use client';

import { useState } from 'react';
import { Building2, Plus, TrendingDown, Wallet } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { cn, toNum, formatMontant, formatDate } from '@/lib/utils';

type StatutImmo = 'EN_SERVICE' | 'CEDE' | 'REBUTE';

/** Objet renvoyé par GET /immobilisations — les Decimal Prisma arrivent en chaînes. */
interface Immobilisation {
  id: string;
  reference: string;
  designation: string;
  categorie: string;
  dateAcquisition: string;
  valeurAcquisition: number | string;
  dureeVie?: number | null;
  tauxAmortissement?: number | string | null;
  valeurResiduelle?: number | string | null;
  localisation?: string | null;
  statut: string;
  amortissementsCumules?: number | string;
  valeurNette?: number | string;
}

interface ImmobilisationsResponse {
  data: Immobilisation[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface ImmobilisationsStats {
  total: number;
  enService: number;
  valeurBrute: number | string;
  valeurNette: number | string;
  amortissementsCumules: number | string;
  amortissementsMois: number | string;
}

const STATUT_STYLES: Record<string, string> = {
  EN_SERVICE: 'badge badge-success',
  CEDE: 'badge badge-warning',
  REBUTE: 'badge badge-error',
};

const STATUT_LABELS: Record<string, string> = {
  EN_SERVICE: 'En service',
  CEDE: 'Cédé',
  REBUTE: 'Rebuté',
};

const CATEGORIES = [
  { value: 'INFORMATIQUE', label: 'Matériel informatique', style: 'badge bg-blue-100 text-blue-700' },
  { value: 'MOBILIER', label: 'Mobilier', style: 'badge badge-neutral' },
  { value: 'VEHICULE', label: 'Véhicule', style: 'badge bg-purple-100 text-purple-700' },
  { value: 'MATERIEL', label: 'Équipement', style: 'badge badge-warning' },
  { value: 'BATIMENT', label: 'Bâtiment', style: 'badge bg-teal-100 text-teal-700' },
  { value: 'TERRAIN', label: 'Terrain', style: 'badge bg-green-100 text-green-700' },
];

function categorieLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function categorieStyle(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.style ?? 'badge badge-neutral';
}

function statutLabel(value: string): string {
  return STATUT_LABELS[value] ?? value;
}

function statutStyle(value: string): string {
  return STATUT_STYLES[value] ?? 'badge badge-neutral';
}

/** Taux annuel effectif : taux explicite sinon déduit de la durée de vie (en mois). */
function tauxAnnuel(immo: Immobilisation): number {
  const taux = toNum(immo.tauxAmortissement);
  if (taux > 0) return taux;
  const duree = toNum(immo.dureeVie);
  if (duree > 0) return (1 / (duree / 12)) * 100;
  return 0;
}

/** L'API calcule déjà la VNC ; on retombe sur un calcul local si le champ manque. */
function valeurNette(immo: Immobilisation): number {
  if (immo.valeurNette !== undefined && immo.valeurNette !== null) return toNum(immo.valeurNette);
  const va = toNum(immo.valeurAcquisition);
  return Math.max(0, va - va * (pctAmorti(immo) / 100));
}

function pctAmorti(immo: Immobilisation): number {
  const va = toNum(immo.valeurAcquisition);
  if (immo.amortissementsCumules !== undefined && va > 0) {
    return Math.min(100, Math.round((toNum(immo.amortissementsCumules) / va) * 100));
  }
  const debut = new Date(immo.dateAcquisition);
  const annees = (Date.now() - debut.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.min(100, Math.max(0, Math.round(annees * tauxAnnuel(immo))));
}

const FORM_INIT = {
  reference: '',
  designation: '',
  categorie: 'INFORMATIQUE',
  dateAcquisition: '',
  valeurAcquisition: 0,
  tauxAmortissement: 20,
};

export default function ImmobilisationsPage() {
  const qc = useQueryClient();
  const [modalNv, setModalNv] = useState(false);
  const [detail, setDetail] = useState<Immobilisation | null>(null);
  const [form, setForm] = useState(FORM_INIT);
  const [erreur, setErreur] = useState<string | null>(null);

  const { data: liste, isLoading } = useQuery<ImmobilisationsResponse>({
    queryKey: ['immobilisations'],
    queryFn: async () => {
      const { data } = await api.get('/immobilisations', { params: { limit: 100 } });
      return data;
    },
    staleTime: 60 * 1000,
  });

  const { data: stats } = useQuery<ImmobilisationsStats>({
    queryKey: ['immobilisations', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/immobilisations/stats');
      return data;
    },
    staleTime: 60 * 1000,
  });

  const creer = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/immobilisations', payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['immobilisations'] });
      setModalNv(false);
      setForm(FORM_INIT);
      setErreur(null);
    },
    onError: (e: Error) => setErreur(e.message),
  });

  const immobilisations = liste?.data ?? [];

  // KPI : on privilégie l'agrégat serveur, sinon on recalcule sur la page courante.
  const total = stats?.total ?? immobilisations.length;
  const enService =
    stats?.enService ?? immobilisations.filter((i) => i.statut === 'EN_SERVICE').length;
  const vaTotal =
    stats !== undefined
      ? toNum(stats.valeurBrute)
      : immobilisations.reduce((s, i) => s + toNum(i.valeurAcquisition), 0);
  const vnTotal =
    stats !== undefined
      ? toNum(stats.valeurNette)
      : immobilisations.reduce((s, i) => s + valeurNette(i), 0);
  const amortMois =
    stats !== undefined
      ? toNum(stats.amortissementsMois)
      : immobilisations
          .filter((i) => i.statut === 'EN_SERVICE')
          .reduce((s, i) => s + (toNum(i.valeurAcquisition) * tauxAnnuel(i)) / 100 / 12, 0);

  const columns: Column<Immobilisation>[] = [
    { key: 'reference', header: 'Référence', render: (r) => <span className="font-mono text-xs text-neutral-500">{r.reference}</span> },
    { key: 'designation', header: 'Désignation', render: (r) => <span className="font-semibold text-neutral-800 text-sm">{r.designation}</span> },
    { key: 'categorie', header: 'Catégorie', render: (r) => <span className={categorieStyle(r.categorie)}>{categorieLabel(r.categorie)}</span> },
    { key: 'dateAcquisition', header: 'Acquisition', render: (r) => <span className="text-xs text-neutral-500">{formatDate(r.dateAcquisition)}</span> },
    { key: 'valeurAcquisition', header: 'Valeur acq.', render: (r) => <span className="text-xs">{formatMontant(toNum(r.valeurAcquisition))}</span> },
    {
      key: 'valeurNette', header: 'Valeur nette', render: (r) => (
        <span className="font-semibold text-primary-600 text-sm">{formatMontant(valeurNette(r))}</span>
      )
    },
    { key: 'tauxAmortissement', header: 'Taux', render: (r) => <span className="text-xs text-neutral-500">{Math.round(tauxAnnuel(r))}%</span> },
    {
      key: 'progression', header: 'Amorti', render: (r) => {
        const pct = pctAmorti(r);
        return (
          <div className="space-y-1 min-w-[80px]">
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', pct >= 100 ? 'bg-neutral-400' : 'bg-accent-400')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400">{pct}%</p>
          </div>
        );
      }
    },
    {
      key: 'statut', header: 'Statut', render: (r) => (
        <span className={statutStyle(r.statut)}>{statutLabel(r.statut)}</span>
      )
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Immobilisations</h1>
            <p className="text-sm text-neutral-500">Patrimoine et amortissements</p>
          </div>
        </div>
        <button onClick={() => { setErreur(null); setModalNv(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle immobilisation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard titre="Total immobilisations" valeur={total} icone={<Building2 className="w-5 h-5" />} couleur="blue" description={`${enService} en service`} />
        <StatCard titre="Valeur d'acquisition" valeur={formatMontant(vaTotal)} icone={<Wallet className="w-5 h-5" />} couleur="purple" description="Brut, tous statuts" />
        <StatCard titre="Valeur nette comptable" valeur={formatMontant(vnTotal)} icone={<Building2 className="w-5 h-5" />} couleur="green" description="Après amortissements" />
        <StatCard titre="Amortissements ce mois" valeur={formatMontant(amortMois)} icone={<TrendingDown className="w-5 h-5" />} couleur="orange" description="Dotation mensuelle" />
      </div>

      <DataTable
        columns={columns}
        data={immobilisations as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        onRowClick={(r) => setDetail(r as Immobilisation)}
      />

      <Modal
        open={modalNv}
        onOpenChange={(o) => { setModalNv(o); if (!o) setErreur(null); }}
        title="Nouvelle immobilisation"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalNv(false)}>Annuler</button>
            <button
              className="btn-primary"
              disabled={creer.isPending || !form.reference || !form.designation || !form.dateAcquisition || form.valeurAcquisition <= 0}
              onClick={() =>
                creer.mutate({
                  reference: form.reference,
                  designation: form.designation,
                  categorie: form.categorie,
                  dateAcquisition: new Date(form.dateAcquisition).toISOString(),
                  valeurAcquisition: form.valeurAcquisition,
                  tauxAmortissement: form.tauxAmortissement,
                })
              }
            >
              {creer.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {erreur && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{erreur}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">Référence</label>
              <input className="input" placeholder="IMM-XXX" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="label">Catégorie</label>
              <select className="input" value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="label">Désignation</label>
            <input className="input" placeholder="Description de l'immobilisation" value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">Date d'acquisition</label>
              <input type="date" className="input" value={form.dateAcquisition} onChange={(e) => setForm((f) => ({ ...f, dateAcquisition: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="label">Valeur d'acquisition (FCFA)</label>
              <input type="number" className="input" min={0} value={form.valeurAcquisition} onChange={(e) => setForm((f) => ({ ...f, valeurAcquisition: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="label">Taux d'amortissement (%)</label>
            <select className="input" value={form.tauxAmortissement} onChange={(e) => setForm((f) => ({ ...f, tauxAmortissement: Number(e.target.value) }))}>
              <option value={10}>10% — 10 ans</option>
              <option value={20}>20% — 5 ans</option>
              <option value={25}>25% — 4 ans</option>
              <option value={33}>33% — 3 ans</option>
              <option value={50}>50% — 2 ans</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.designation ?? ''}
        description={detail?.reference}
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={categorieStyle(detail.categorie)}>{categorieLabel(detail.categorie)}</span>
              <span className={statutStyle(detail.statut)}>{statutLabel(detail.statut)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Date d'acquisition</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatDate(detail.dateAcquisition)}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Taux d'amortissement</p>
                <p className="mt-1 font-semibold text-neutral-800">{Math.round(tauxAnnuel(detail))}%</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Valeur d'acquisition</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatMontant(toNum(detail.valeurAcquisition))}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Amortissement</p>
                <p className="mt-1 font-semibold text-neutral-800">{pctAmorti(detail)}%</p>
              </div>
            </div>
            {detail.localisation && (
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Localisation</p>
                <p className="mt-1 font-semibold text-neutral-800">{detail.localisation}</p>
              </div>
            )}
            <div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', pctAmorti(detail) >= 100 ? 'bg-neutral-400' : 'bg-accent-400')}
                  style={{ width: `${pctAmorti(detail)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">Valeur nette comptable</span>
              <span className="text-lg font-bold text-primary-700">{formatMontant(valeurNette(detail))}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
