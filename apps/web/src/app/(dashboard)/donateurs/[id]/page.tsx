'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatMontant, toNum, initiales } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { exportDocument, ANOUANZE_BRANDING, formatDateFR, formatFCFA } from '@/lib/pdf-engine';
import type { DocumentExportDefinition } from '@/lib/pdf-engine';
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  FileText,
  Coins,
  Heart,
  Calendar,
  TrendingUp,
  UserX,
  Plus,
} from 'lucide-react';

interface Don {
  id: string;
  type: string;
  montant?: number | string | null;
  devise?: string;
  descriptionNature?: string | null;
  valeurEstimee?: number | string | null;
  dateDon: string;
  statut: string;
  recu?: boolean;
  numeroRecu?: string | null;
  notes?: string | null;
}

interface Donateur {
  id: string;
  type: string;
  nom: string;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  pays?: string | null;
  notes?: string | null;
  anonymous?: boolean;
  adresse?: unknown;
  createdAt?: string;
  dons?: Don[];
}

/** Enum API → clé de libellé (les valeurs envoyées à l'API restent inchangées). */
const TYPE_DON_KEY: Record<string, string> = {
  NUMERAIRE: 'numeraire',
  EN_NATURE: 'enNature',
  COMPETENCES: 'competences',
  FONCIER: 'foncier',
};

const STATUT_PAIEMENT_KEY: Record<string, string> = {
  PAYE: 'paye',
  EN_ATTENTE: 'enAttente',
  PARTIEL: 'partiel',
  ANNULE: 'annule',
};

const STATUT_PAIEMENT_CLS: Record<string, string> = {
  PAYE: 'badge badge-success',
  EN_ATTENTE: 'badge badge-warning',
  PARTIEL: 'badge badge-warning',
  ANNULE: 'badge badge-error',
};

function adresseToText(adresse: unknown): string | null {
  if (!adresse) return null;
  if (typeof adresse === 'string') return adresse;
  if (typeof adresse === 'object') {
    const parts = Object.values(adresse as Record<string, unknown>)
      .filter((v): v is string | number => typeof v === 'string' || typeof v === 'number')
      .map(String)
      .filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }
  return null;
}

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
  const t = useTranslations('relations.donateurDetail');
  const tc = useTranslations('relations.commun');
  return (
    <div className="p-4 sm:p-6">
      <div className="card max-w-lg mx-auto text-center py-14 space-y-4">
        <UserX className="w-12 h-12 mx-auto text-neutral-300 stroke-1" />
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">{t('introuvableTitre')}</h2>
          <p className="text-sm text-neutral-500 mt-1">{message}</p>
        </div>
        <Link href="/donateurs" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {tc('retourListe')}
        </Link>
      </div>
    </div>
  );
}

const EDIT_INIT = { nom: '', prenom: '', type: 'PHYSIQUE', email: '', telephone: '', pays: '' };
const DON_INIT = { type: 'NUMERAIRE', montant: '', dateDon: '', descriptionNature: '' };

export default function DonateurDetailPage() {
  const t = useTranslations('relations.donateurDetail');
  const tc = useTranslations('relations.commun');
  const locale = useLocale() as 'fr' | 'en';
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EDIT_INIT);
  const [editError, setEditError] = useState('');
  const [donOpen, setDonOpen] = useState(false);
  const [donForm, setDonForm] = useState(DON_INIT);
  const [donError, setDonError] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data: donateur, isLoading, isError, error } = useQuery<Donateur>({
    queryKey: ['donateur', id],
    queryFn: async () => {
      const { data } = await api.get(`/donateurs/${id}`);
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  const updateDonateur = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put(`/donateurs/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donateur', id] });
      queryClient.invalidateQueries({ queryKey: ['donateurs'] });
      setEditOpen(false);
      setEditError('');
    },
    onError: (err: unknown) => setEditError(err instanceof Error ? err.message : tc('erreurModification')),
  });

  const createDon = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post(`/donateurs/${id}/dons`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donateur', id] });
      queryClient.invalidateQueries({ queryKey: ['donateur-dons', id] });
      queryClient.invalidateQueries({ queryKey: ['donateurs'] });
      queryClient.invalidateQueries({ queryKey: ['donateurs-stats'] });
      setDonOpen(false);
      setDonError('');
    },
    onError: (err: unknown) => setDonError(err instanceof Error ? err.message : tc('erreurEnregistrement')),
  });

  const typeDonLabel = (type: string) => {
    const key = TYPE_DON_KEY[type];
    return key ? t(`typesDon.${key}`) : type;
  };

  if (isLoading) return <DetailSkeleton />;

  if (isError || !donateur) {
    const message = error instanceof Error ? error.message : t('introuvableMessage');
    return <IntrouvableCard message={message} />;
  }

  const dons = donateur.dons ?? [];
  const totalDons = dons.reduce((s, d) => s + toNum(d.montant), 0);
  const valeurNature = dons.reduce((s, d) => s + toNum(d.valeurEstimee), 0);
  const dernierDon = dons.length > 0
    ? dons.reduce((latest, d) => (new Date(d.dateDon) > new Date(latest.dateDon) ? d : latest), dons[0])
    : null;
  const donMoyen = dons.length > 0 ? totalDons / dons.length : 0;

  const nomComplet = `${donateur.prenom ? donateur.prenom + ' ' : ''}${donateur.nom}`;
  const adresse = adresseToText(donateur.adresse);

  const openEdit = () => {
    setForm({
      nom: donateur.nom ?? '',
      prenom: donateur.prenom ?? '',
      type: donateur.type ?? 'PHYSIQUE',
      email: donateur.email ?? '',
      telephone: donateur.telephone ?? '',
      pays: donateur.pays ?? '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const openDon = () => {
    setDonForm({ ...DON_INIT, dateDon: new Date().toISOString().slice(0, 10) });
    setDonError('');
    setDonOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const def: DocumentExportDefinition = {
        title: t('export.titre', { nom: nomComplet }),
        subtitle: donateur.type === 'PHYSIQUE' ? t('typePhysique') : t('typeMoral'),
        documentType: 'record',
        branding: ANOUANZE_BRANDING,
        lang: locale,
        filtersSummary: t('export.resume', { count: dons.length, total: formatMontant(totalDons) }),
        columns: [
          { key: 'dateDon', label: t('export.colDate'), type: 'date', priority: 'essential', nowrap: true, format: formatDateFR },
          { key: 'type', label: t('export.colType'), type: 'code', priority: 'essential' },
          { key: 'montant', label: t('export.colMontant'), type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
          { key: 'valeurEstimee', label: t('export.colValeurEstimee'), type: 'amount', priority: 'secondary', nowrap: true, format: formatFCFA },
          { key: 'statut', label: t('export.colStatut'), type: 'status', priority: 'important', nowrap: true },
          { key: 'numeroRecu', label: t('export.colNumeroRecu'), type: 'reference', priority: 'important', nowrap: true },
          { key: 'descriptionNature', label: t('export.colDescription'), type: 'short-description', priority: 'secondary' },
        ],
      };
      await exportDocument(def, dons as unknown as Record<string, unknown>[], 'pdf');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/dashboard" className="hover:text-primary-600">{tc('tableauDeBord')}</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/donateurs" className="hover:text-primary-600">{t('filAriane')}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700 font-medium truncate">{nomComplet}</span>
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-sm">
            {initiales(donateur.nom, donateur.prenom ?? undefined)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 leading-tight">{nomComplet}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${donateur.type === 'PHYSIQUE' ? 'badge-neutral' : ''}`}>
                {donateur.type === 'PHYSIQUE' ? t('typePhysique') : t('typeMoral')}
              </span>
              {donateur.anonymous && <span className="badge badge-warning text-xs">{t('anonyme')}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="btn-secondary flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4" />
            {exporting ? tc('exportEnCours') : tc('exporter')}
          </button>
          <button onClick={openDon} className="btn-secondary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {t('nouveauDon')}
          </button>
          <button onClick={openEdit} className="btn-primary flex items-center gap-2 text-sm">
            <Pencil className="w-4 h-4" /> {tc('modifier')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.totalDons')}</p>
            <p className="text-lg font-bold text-neutral-800">{formatMontant(totalDons)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.nombreDons')}</p>
            <p className="text-lg font-bold text-neutral-800">{dons.length}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.donMoyen')}</p>
            <p className="text-lg font-bold text-neutral-800">{formatMontant(donMoyen)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('kpi.dernierDon')}</p>
            <p className="text-lg font-bold text-neutral-800">{dernierDon ? formatDate(dernierDon.dateDon) : '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-1">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">{t('infos.titre')}</h2>
          <InfoLigne label={t('infos.email')} value={donateur.email} />
          <InfoLigne label={t('infos.telephone')} value={donateur.telephone} />
          <InfoLigne label={t('infos.pays')} value={donateur.pays} />
          <InfoLigne label={t('infos.adresse')} value={adresse} />
          <InfoLigne label={t('infos.valeurNature')} value={valeurNature > 0 ? formatMontant(valeurNature) : null} />
          <InfoLigne label={t('infos.enregistreLe')} value={donateur.createdAt ? formatDate(donateur.createdAt) : null} />
          <InfoLigne label={t('infos.notes')} value={donateur.notes} />
        </div>

        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">{t('dons.titre')}</h2>
            <span className="badge badge-neutral">{dons.length}</span>
          </div>
          {dons.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">{t('dons.vide')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">{t('dons.colDate')}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">{t('dons.colType')}</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-neutral-500 uppercase">{t('dons.colMontant')}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">{t('dons.colNumeroRecu')}</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">{t('dons.colStatut')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dons.map((d) => {
                    const spKey = STATUT_PAIEMENT_KEY[d.statut];
                    const spLabel = spKey ? t(`statutsDon.${spKey}`) : d.statut;
                    const spCls = STATUT_PAIEMENT_CLS[d.statut] ?? 'badge badge-neutral';
                    return (
                      <tr key={d.id} className="border-b border-neutral-50">
                        <td className="px-3 py-2.5 text-neutral-700">{formatDate(d.dateDon)}</td>
                        <td className="px-3 py-2.5">
                          <span className="badge badge-neutral text-xs">{typeDonLabel(d.type)}</span>
                          {d.descriptionNature && <p className="text-xs text-neutral-400 mt-0.5">{d.descriptionNature}</p>}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-neutral-800">
                          {formatMontant(toNum(d.montant ?? d.valeurEstimee))}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-xs text-neutral-500">{d.numeroRecu ?? '—'}</td>
                        <td className="px-3 py-2.5"><span className={spCls}>{spLabel}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={editOpen}
        onOpenChange={setEditOpen}
        title={t('modalDonateur.titre')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditOpen(false)}>{tc('annuler')}</button>
            <button
              className="btn-primary"
              disabled={updateDonateur.isPending || !form.nom}
              onClick={() =>
                updateDonateur.mutate({
                  nom: form.nom,
                  prenom: form.prenom || undefined,
                  type: form.type,
                  email: form.email || undefined,
                  telephone: form.telephone || undefined,
                  pays: form.pays || undefined,
                })
              }
            >
              {updateDonateur.isPending ? tc('enregistrementEnCours') : tc('enregistrer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{editError}</p>}
          <div>
            <label className="label">{t('modalDonateur.type')}</label>
            <select className="input w-full" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="PHYSIQUE">{t('typePhysique')}</option>
              <option value="MORAL">{t('typeMoralLong')}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{form.type === 'PHYSIQUE' ? t('modalDonateur.nom') : t('modalDonateur.raisonSociale')}</label>
              <input className="input w-full" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            {form.type === 'PHYSIQUE' && (
              <div>
                <label className="label">{t('modalDonateur.prenom')}</label>
                <input className="input w-full" value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
              </div>
            )}
            <div>
              <label className="label">{t('modalDonateur.email')}</label>
              <input className="input w-full" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modalDonateur.telephone')}</label>
              <input className="input w-full" value={form.telephone} onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('modalDonateur.pays')}</label>
              <input className="input w-full" value={form.pays} onChange={(e) => setForm((p) => ({ ...p, pays: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={donOpen}
        onOpenChange={setDonOpen}
        title={t('modalDon.titre')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDonOpen(false)}>{tc('annuler')}</button>
            <button
              className="btn-primary"
              disabled={createDon.isPending || (donForm.type === 'NUMERAIRE' && !donForm.montant)}
              onClick={() =>
                createDon.mutate({
                  type: donForm.type,
                  montant: donForm.montant ? Number(donForm.montant) : undefined,
                  dateDon: donForm.dateDon,
                  descriptionNature: donForm.descriptionNature || undefined,
                  statut: 'PAYE',
                })
              }
            >
              {createDon.isPending ? tc('enregistrementEnCours') : t('modalDon.enregistrerDon')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {donError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{donError}</p>}
          <div>
            <label className="label">{t('modalDon.typeDon')}</label>
            <select className="input w-full" value={donForm.type} onChange={(e) => setDonForm((p) => ({ ...p, type: e.target.value }))}>
              <option value="NUMERAIRE">{t('typesDon.numeraire')}</option>
              <option value="EN_NATURE">{t('typesDon.enNature')}</option>
              <option value="COMPETENCES">{t('typesDon.competencesLong')}</option>
              <option value="FONCIER">{t('typesDon.foncier')}</option>
            </select>
          </div>
          {donForm.type === 'NUMERAIRE' ? (
            <div>
              <label className="label">{t('modalDon.montant')}</label>
              <input className="input w-full" type="number" min="0" value={donForm.montant} onChange={(e) => setDonForm((p) => ({ ...p, montant: e.target.value }))} />
            </div>
          ) : (
            <div>
              <label className="label">{t('modalDon.description')}</label>
              <input className="input w-full" value={donForm.descriptionNature} onChange={(e) => setDonForm((p) => ({ ...p, descriptionNature: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="label">{t('modalDon.dateDon')}</label>
            <input className="input w-full" type="date" value={donForm.dateDon} onChange={(e) => setDonForm((p) => ({ ...p, dateDon: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
