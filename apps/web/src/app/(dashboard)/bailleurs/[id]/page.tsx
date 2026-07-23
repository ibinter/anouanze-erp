'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatMontant, toNum, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { exportDocument, ANOUANZE_BRANDING, formatDateFR, formatFCFA } from '@/lib/pdf-engine';
import type { DocumentExportDefinition } from '@/lib/pdf-engine';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  FileText,
  Building2,
  Wallet,
  CheckCircle2,
  Globe,
  Building,
} from 'lucide-react';

interface Decaissement {
  id: string;
  montant: number | string;
  devise?: string;
  dateReception: string;
  reference?: string | null;
  notes?: string | null;
}

interface Convention {
  id: string;
  reference: string;
  titre: string;
  montantTotal: number | string;
  devise?: string;
  dateSignature?: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  conditions?: string | null;
  projetId?: string | null;
}

interface Bailleur {
  id: string;
  nom: string;
  sigle?: string | null;
  type?: string | null;
  pays?: string | null;
  siteWeb?: string | null;
  contactNom?: string | null;
  contactEmail?: string | null;
  contactTel?: string | null;
  notes?: string | null;
  createdAt?: string;
  conventions?: Convention[];
}

const TYPE_COLORS: Record<string, string> = {
  MULTILATERAL: 'badge-success',
  BILATERAL: 'badge',
  FONDATION: 'badge-warning',
  PRIVE: 'badge-neutral',
};

const BAILLEUR_TYPES = ['MULTILATERAL', 'BILATERAL', 'FONDATION', 'PRIVE'];

function InfoLigne({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-neutral-50 last:border-0">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-800 break-words">{value ?? <span className="text-neutral-400">—</span>}</span>
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
  const t = useTranslations('relations.bailleurDetail');
  const tc = useTranslations('relations.commun');
  return (
    <div className="p-4 sm:p-6">
      <div className="card max-w-lg mx-auto text-center py-14 space-y-4">
        <Building className="w-12 h-12 mx-auto text-neutral-300 stroke-1" />
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">{t('introuvableTitre')}</h2>
          <p className="text-sm text-neutral-500 mt-1">{message}</p>
        </div>
        <Link href="/bailleurs" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {tc('retourListe')}
        </Link>
      </div>
    </div>
  );
}

function ConventionCard({ convention }: { convention: Convention }) {
  const t = useTranslations('relations.bailleurDetail');
  const [open, setOpen] = useState(false);

  const { data: decaissements, isLoading } = useQuery<Decaissement[]>({
    queryKey: ['convention-decaissements', convention.id],
    queryFn: async () => {
      const { data } = await api.get(`/bailleurs/conventions/${convention.id}/decaissements`);
      return data;
    },
    enabled: open,
    retry: false,
  });

  const montant = toNum(convention.montantTotal);
  const decaisse = (decaissements ?? []).reduce((s, d) => s + toNum(d.montant), 0);
  const taux = montant > 0 && decaissements ? Math.round((decaisse / montant) * 100) : 0;

  return (
    <div className="border border-neutral-100 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-neutral-400">{convention.reference}</p>
          <p className="font-semibold text-neutral-800 mt-0.5">{convention.titre}</p>
          <p className="text-xs text-neutral-400 mt-1">
            {convention.dateDebut ? formatDate(convention.dateDebut) : '—'} → {convention.dateFin ? formatDate(convention.dateFin) : '—'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="badge badge-neutral text-xs">{convention.statut}</span>
          <p className="font-mono font-semibold text-neutral-800 mt-1">{formatMontant(montant)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline"
      >
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        {open ? t('conventions.masquerDecaissements') : t('conventions.voirDecaissements')}
      </button>

      {open && (
        <div className="space-y-2 pt-1">
          {isLoading && <p className="text-xs text-neutral-400">{t('conventions.chargementDecaissements')}</p>}
          {!isLoading && (decaissements ?? []).length === 0 && (
            <p className="text-xs text-neutral-400">{t('conventions.aucunDecaissement')}</p>
          )}
          {(decaissements ?? []).map((d) => (
            <div key={d.id} className="flex items-center justify-between text-xs bg-neutral-50 rounded-lg px-3 py-2">
              <span className="text-neutral-600">
                {formatDate(d.dateReception)}
                {d.reference ? ` · ${d.reference}` : ''}
              </span>
              <span className="font-mono font-semibold text-neutral-800">{formatMontant(toNum(d.montant))}</span>
            </div>
          ))}
          {(decaissements ?? []).length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500">{t('conventions.tauxDecaissement')}</span>
                <span className={cn('font-medium', taux >= 80 ? 'text-green-600' : taux >= 40 ? 'text-orange-500' : 'text-neutral-600')}>
                  {taux}%
                </span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', taux >= 80 ? 'bg-green-500' : taux >= 40 ? 'bg-orange-400' : 'bg-primary-600')}
                  style={{ width: `${Math.min(100, taux)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">{formatMontant(decaisse)} / {formatMontant(montant)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const EDIT_INIT = { nom: '', sigle: '', type: 'BILATERAL', pays: '', contactNom: '', contactEmail: '', contactTel: '', siteWeb: '' };

export default function BailleurDetailPage() {
  const t = useTranslations('relations.bailleurDetail');
  const tc = useTranslations('relations.commun');
  const locale = useLocale() as 'fr' | 'en';
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EDIT_INIT);
  const [editError, setEditError] = useState('');
  const [exporting, setExporting] = useState(false);

  /** Libellé d'affichage d'un type ; la valeur enum reste celle de l'API. */
  const typeLabel = (type: string) => (BAILLEUR_TYPES.includes(type) ? t(`types.${type}`) : type);

  const { data: bailleur, isLoading, isError, error } = useQuery<Bailleur>({
    queryKey: ['bailleur', id],
    queryFn: async () => {
      const { data } = await api.get(`/bailleurs/${id}`);
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  const updateBailleur = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put(`/bailleurs/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bailleur', id] });
      queryClient.invalidateQueries({ queryKey: ['bailleurs'] });
      setEditOpen(false);
      setEditError('');
    },
    onError: (err: unknown) => setEditError(err instanceof Error ? err.message : tc('erreurModification')),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !bailleur) {
    const message = error instanceof Error ? error.message : t('introuvableMessage');
    return <IntrouvableCard message={message} />;
  }

  const conventions = bailleur.conventions ?? [];
  const montantEngage = conventions.reduce((s, c) => s + toNum(c.montantTotal), 0);
  const conventionsActives = conventions.filter((c) => c.statut === 'ACTIVE').length;
  const now = Date.now();
  const conventionsEnCours = conventions.filter(
    (c) => c.dateFin && new Date(c.dateFin).getTime() >= now,
  ).length;

  const openEdit = () => {
    setForm({
      nom: bailleur.nom ?? '',
      sigle: bailleur.sigle ?? '',
      type: bailleur.type ?? 'BILATERAL',
      pays: bailleur.pays ?? '',
      contactNom: bailleur.contactNom ?? '',
      contactEmail: bailleur.contactEmail ?? '',
      contactTel: bailleur.contactTel ?? '',
      siteWeb: bailleur.siteWeb ?? '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const def: DocumentExportDefinition = {
        title: t('export.titre', { nom: bailleur.nom }),
        subtitle: bailleur.sigle ?? t('export.sousTitreDefaut'),
        documentType: 'record',
        branding: ANOUANZE_BRANDING,
        lang: locale,
        filtersSummary: t('export.resume', { count: conventions.length, montant: formatMontant(montantEngage) }),
        columns: [
          { key: 'reference', label: t('export.colReference'), type: 'reference', priority: 'essential', nowrap: true },
          { key: 'titre', label: t('export.colTitre'), type: 'name', priority: 'essential' },
          { key: 'montantTotal', label: t('export.colMontant'), type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
          { key: 'statut', label: t('export.colStatut'), type: 'status', priority: 'important', nowrap: true },
          { key: 'dateSignature', label: t('export.colSignature'), type: 'date', priority: 'secondary', nowrap: true, format: formatDateFR },
          { key: 'dateDebut', label: t('export.colDebut'), type: 'date', priority: 'important', nowrap: true, format: formatDateFR },
          { key: 'dateFin', label: t('export.colFin'), type: 'date', priority: 'important', nowrap: true, format: formatDateFR },
        ],
      };
      await exportDocument(def, conventions as unknown as Record<string, unknown>[], 'pdf');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/dashboard" className="hover:text-primary-600">{tc('tableauDeBord')}</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/bailleurs" className="hover:text-primary-600">{t('filAriane')}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700 font-medium truncate">{bailleur.nom}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
            aria-label={tc('retour')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 leading-tight">{bailleur.nom}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {bailleur.sigle && <span className="text-xs font-mono text-neutral-400">{bailleur.sigle}</span>}
              {bailleur.type && <span className={`badge ${TYPE_COLORS[bailleur.type] ?? 'badge-neutral'}`}>{typeLabel(bailleur.type)}</span>}
              {bailleur.pays && (
                <span className="inline-flex items-center gap-1 text-xs text-neutral-500">
                  <Globe className="w-3 h-3" /> {bailleur.pays}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            {exporting ? tc('exportEnCours') : tc('exporter')}
          </button>
          <button onClick={openEdit} className="btn-primary flex items-center gap-2 text-sm">
            <Pencil className="w-4 h-4" /> {tc('modifier')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.montantEngage')}</p>
            <p className="text-lg font-bold text-neutral-800">{formatMontant(montantEngage)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.conventions')}</p>
            <p className="text-lg font-bold text-neutral-800">{conventions.length}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.conventionsActives')}</p>
            <p className="text-lg font-bold text-neutral-800">{conventionsActives}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.nonEchues')}</p>
            <p className="text-lg font-bold text-neutral-800">{conventionsEnCours}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-1">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">{t('infos.titre')}</h2>
          <InfoLigne label={t('infos.type')} value={bailleur.type ? typeLabel(bailleur.type) : null} />
          <InfoLigne label={t('infos.pays')} value={bailleur.pays} />
          <InfoLigne
            label={t('infos.siteWeb')}
            value={bailleur.siteWeb ? (
              <a href={bailleur.siteWeb} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                {bailleur.siteWeb}
              </a>
            ) : null}
          />
          <InfoLigne label={t('infos.contact')} value={bailleur.contactNom} />
          <InfoLigne label={t('infos.contactEmail')} value={bailleur.contactEmail} />
          <InfoLigne label={t('infos.contactTel')} value={bailleur.contactTel} />
          <InfoLigne label={t('infos.enregistreLe')} value={bailleur.createdAt ? formatDate(bailleur.createdAt) : null} />
          <InfoLigne label={t('infos.notes')} value={bailleur.notes} />
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">{t('conventions.titre')}</h2>
            <span className="badge badge-neutral">{conventions.length}</span>
          </div>
          {conventions.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">{t('conventions.vide')}</p>
          ) : (
            <div className="space-y-3">
              {conventions.map((c) => <ConventionCard key={c.id} convention={c} />)}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t('modal.titre')}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditOpen(false)}>{tc('annuler')}</button>
            <button
              className="btn-primary"
              disabled={updateBailleur.isPending || !form.nom}
              onClick={() =>
                updateBailleur.mutate({
                  nom: form.nom,
                  sigle: form.sigle || undefined,
                  type: form.type || undefined,
                  pays: form.pays || undefined,
                  contactNom: form.contactNom || undefined,
                  contactEmail: form.contactEmail || undefined,
                  contactTel: form.contactTel || undefined,
                  siteWeb: form.siteWeb || undefined,
                })
              }
            >
              {updateBailleur.isPending ? tc('enregistrementEnCours') : tc('enregistrer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{editError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">{t('modal.nom')}</label>
              <input className="input w-full" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.sigle')}</label>
              <input className="input w-full" value={form.sigle} onChange={(e) => setForm((p) => ({ ...p, sigle: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.type')}</label>
              <select className="input w-full" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                {BAILLEUR_TYPES.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('modal.pays')}</label>
              <input className="input w-full" value={form.pays} onChange={(e) => setForm((p) => ({ ...p, pays: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.siteWeb')}</label>
              <input className="input w-full" value={form.siteWeb} onChange={(e) => setForm((p) => ({ ...p, siteWeb: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.contactNom')}</label>
              <input className="input w-full" value={form.contactNom} onChange={(e) => setForm((p) => ({ ...p, contactNom: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modal.contactTel')}</label>
              <input className="input w-full" value={form.contactTel} onChange={(e) => setForm((p) => ({ ...p, contactTel: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">{t('modal.contactEmail')}</label>
              <input className="input w-full" type="email" value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
