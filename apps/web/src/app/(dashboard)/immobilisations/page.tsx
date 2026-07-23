'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

const STATUT_IDS = ['EN_SERVICE', 'CEDE', 'REBUTE'];

const CATEGORIES = [
  { value: 'INFORMATIQUE', style: 'badge bg-blue-100 text-blue-700' },
  { value: 'MOBILIER', style: 'badge badge-neutral' },
  { value: 'VEHICULE', style: 'badge bg-purple-100 text-purple-700' },
  { value: 'MATERIEL', style: 'badge badge-warning' },
  { value: 'BATIMENT', style: 'badge bg-teal-100 text-teal-700' },
  { value: 'TERRAIN', style: 'badge bg-green-100 text-green-700' },
];

/** Taux d'amortissement proposés à la saisie (taux annuel → durée en années). */
const TAUX_OPTIONS = [
  { taux: 10, annees: 10 },
  { taux: 20, annees: 5 },
  { taux: 25, annees: 4 },
  { taux: 33, annees: 3 },
  { taux: 50, annees: 2 },
];

function categorieStyle(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.style ?? 'badge badge-neutral';
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
  const t = useTranslations('finance.immobilisations');
  const tc = useTranslations('finance.common');
  const qc = useQueryClient();

  const categorieLabel = (value: string) =>
    CATEGORIES.some((c) => c.value === value) ? t(`categories.${value}`) : value;
  const statutLabel = (value: string) =>
    STATUT_IDS.includes(value) ? t(`statuts.${value}`) : value;

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
    { key: 'reference', header: t('colonnes.reference'), render: (r) => <span className="font-mono text-xs text-neutral-500">{r.reference}</span> },
    { key: 'designation', header: t('colonnes.designation'), render: (r) => <span className="font-semibold text-neutral-800 text-sm">{r.designation}</span> },
    { key: 'categorie', header: t('colonnes.categorie'), render: (r) => <span className={categorieStyle(r.categorie)}>{categorieLabel(r.categorie)}</span> },
    { key: 'dateAcquisition', header: t('colonnes.acquisition'), render: (r) => <span className="text-xs text-neutral-500">{formatDate(r.dateAcquisition)}</span> },
    { key: 'valeurAcquisition', header: t('colonnes.valeurAcq'), render: (r) => <span className="text-xs">{formatMontant(toNum(r.valeurAcquisition))}</span> },
    {
      key: 'valeurNette', header: t('colonnes.valeurNette'), render: (r) => (
        <span className="font-semibold text-primary-600 text-sm">{formatMontant(valeurNette(r))}</span>
      )
    },
    { key: 'tauxAmortissement', header: t('colonnes.taux'), render: (r) => <span className="text-xs text-neutral-500">{Math.round(tauxAnnuel(r))}%</span> },
    {
      key: 'progression', header: t('colonnes.amorti'), render: (r) => {
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
      key: 'statut', header: t('colonnes.statut'), render: (r) => (
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
            <h1 className="text-xl font-bold text-neutral-800">{t('title')}</h1>
            <p className="text-sm text-neutral-500">{t('subtitle')}</p>
          </div>
        </div>
        <button onClick={() => { setErreur(null); setModalNv(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('actions.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard titre={t('kpi.total')} valeur={total} icone={<Building2 className="w-5 h-5" />} couleur="blue" description={t('kpi.totalDesc', { count: enService })} />
        <StatCard titre={t('kpi.valeurAcquisition')} valeur={formatMontant(vaTotal)} icone={<Wallet className="w-5 h-5" />} couleur="purple" description={t('kpi.valeurAcquisitionDesc')} />
        <StatCard titre={t('kpi.valeurNette')} valeur={formatMontant(vnTotal)} icone={<Building2 className="w-5 h-5" />} couleur="green" description={t('kpi.valeurNetteDesc')} />
        <StatCard titre={t('kpi.amortissementsMois')} valeur={formatMontant(amortMois)} icone={<TrendingDown className="w-5 h-5" />} couleur="orange" description={t('kpi.amortissementsMoisDesc')} />
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
        title={t('modal.title')}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalNv(false)}>{tc('cancel')}</button>
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
              {creer.isPending ? tc('saving') : tc('save')}
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
              <label className="label">{t('modal.reference')}</label>
              <input className="input" placeholder={t('modal.referencePlaceholder')} value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="label">{t('modal.categorie')}</label>
              <select className="input" value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value }))}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{categorieLabel(c.value)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="label">{t('modal.designation')}</label>
            <input className="input" placeholder={t('modal.designationPlaceholder')} value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">{t('modal.dateAcquisition')}</label>
              <input type="date" className="input" value={form.dateAcquisition} onChange={(e) => setForm((f) => ({ ...f, dateAcquisition: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="label">{t('modal.valeurAcquisition')}</label>
              <input type="number" className="input" min={0} value={form.valeurAcquisition} onChange={(e) => setForm((f) => ({ ...f, valeurAcquisition: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="label">{t('modal.taux')}</label>
            <select className="input" value={form.tauxAmortissement} onChange={(e) => setForm((f) => ({ ...f, tauxAmortissement: Number(e.target.value) }))}>
              {TAUX_OPTIONS.map((o) => (
                <option key={o.taux} value={o.taux}>
                  {t('modal.tauxOption', { taux: String(o.taux), annees: o.annees })}
                </option>
              ))}
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
                <p className="text-xs text-neutral-500">{t('detail.dateAcquisition')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatDate(detail.dateAcquisition)}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.taux')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{Math.round(tauxAnnuel(detail))}%</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.valeurAcquisition')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatMontant(toNum(detail.valeurAcquisition))}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.amortissement')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{pctAmorti(detail)}%</p>
              </div>
            </div>
            {detail.localisation && (
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.localisation')}</p>
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
              <span className="text-sm font-medium text-primary-700">{t('detail.valeurNette')}</span>
              <span className="text-lg font-bold text-primary-700">{formatMontant(valeurNette(detail))}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
