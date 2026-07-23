'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatDate, formatMontant, toNum, initiales, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { exportDocument, ANOUANZE_BRANDING, formatDateFR, formatFCFA } from '@/lib/pdf-engine';
import type { DocumentExportDefinition } from '@/lib/pdf-engine';
import {
  ArrowLeft,
  ChevronRight,
  Pencil,
  FileText,
  Wallet,
  CheckCircle2,
  Clock,
  Percent,
  UserX,
} from 'lucide-react';

interface Cotisation {
  id: string;
  periode: string;
  montant: number | string;
  typeCotisation: string;
  statut: string;
  dateEcheance: string;
  datePaiement?: string | null;
  modePaiement?: string | null;
  reference?: string | null;
  notes?: string | null;
}

interface Membre {
  id: string;
  numero?: string | null;
  nom: string;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  genre?: string | null;
  nationalite?: string | null;
  dateNaissance?: string | null;
  statutMembre: string;
  dateAdhesion: string;
  dateExpiration?: string | null;
  fonctions?: string[];
  competences?: string[];
  groupes?: string[];
  notes?: string | null;
  adresse?: unknown;
  createdAt?: string;
  cotisations?: Cotisation[];
}

const STATUT_MEMBRE: Record<string, { label: string; cls: string }> = {
  ACTIF: { label: 'Actif', cls: 'badge badge-success' },
  INACTIF: { label: 'Inactif', cls: 'badge badge-neutral' },
  SUSPENDU: { label: 'Suspendu', cls: 'badge badge-warning' },
};

const STATUT_PAIEMENT: Record<string, { label: string; cls: string }> = {
  PAYE: { label: 'Payée', cls: 'badge badge-success' },
  EN_ATTENTE: { label: 'En attente', cls: 'badge badge-warning' },
  PARTIEL: { label: 'Partielle', cls: 'badge badge-warning' },
  ANNULE: { label: 'Annulée', cls: 'badge badge-error' },
  RETARD: { label: 'En retard', cls: 'badge badge-error' },
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
        <div className="h-72 rounded-2xl bg-neutral-100 animate-pulse lg:col-span-1" />
        <div className="h-72 rounded-2xl bg-neutral-100 animate-pulse lg:col-span-2" />
      </div>
    </div>
  );
}

function IntrouvableCard({ message }: { message: string }) {
  return (
    <div className="p-4 sm:p-6">
      <div className="card max-w-lg mx-auto text-center py-14 space-y-4">
        <UserX className="w-12 h-12 mx-auto text-neutral-300 stroke-1" />
        <div>
          <h2 className="text-lg font-semibold text-neutral-800">Membre introuvable</h2>
          <p className="text-sm text-neutral-500 mt-1">{message}</p>
        </div>
        <Link href="/membres" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </Link>
      </div>
    </div>
  );
}

const EDIT_INIT = {
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  statutMembre: 'ACTIF',
  dateAdhesion: '',
};

export default function MembreDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? '');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EDIT_INIT);
  const [editError, setEditError] = useState('');
  const [exporting, setExporting] = useState(false);

  const { data: membre, isLoading, isError, error } = useQuery<Membre>({
    queryKey: ['membre', id],
    queryFn: async () => {
      const { data } = await api.get(`/membres/${id}`);
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  const updateMembre = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.patch(`/membres/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membre', id] });
      queryClient.invalidateQueries({ queryKey: ['membres'] });
      setEditOpen(false);
      setEditError('');
    },
    onError: (err: unknown) => setEditError(err instanceof Error ? err.message : 'Erreur lors de la modification'),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !membre) {
    const message = error instanceof Error ? error.message : 'Cette fiche n’existe pas ou ne fait pas partie de votre organisation.';
    return <IntrouvableCard message={message} />;
  }

  const cotisations = membre.cotisations ?? [];
  const payees = cotisations.filter((c) => c.statut === 'PAYE');
  const totalCotise = payees.reduce((s, c) => s + toNum(c.montant), 0);
  const totalAttendu = cotisations.reduce((s, c) => s + toNum(c.montant), 0);
  const resteDu = totalAttendu - totalCotise;
  const tauxRecouvrement = cotisations.length > 0
    ? Math.round((payees.length / cotisations.length) * 100)
    : 0;

  const nomComplet = `${membre.prenom ? membre.prenom + ' ' : ''}${membre.nom}`;
  const statut = STATUT_MEMBRE[membre.statutMembre] ?? { label: membre.statutMembre, cls: 'badge badge-neutral' };
  const adresse = adresseToText(membre.adresse);

  const openEdit = () => {
    setForm({
      nom: membre.nom ?? '',
      prenom: membre.prenom ?? '',
      email: membre.email ?? '',
      telephone: membre.telephone ?? '',
      statutMembre: membre.statutMembre ?? 'ACTIF',
      dateAdhesion: membre.dateAdhesion ? membre.dateAdhesion.slice(0, 10) : '',
    });
    setEditError('');
    setEditOpen(true);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const def: DocumentExportDefinition = {
        title: `Fiche membre — ${nomComplet}`,
        subtitle: membre.numero ? `N° ${membre.numero}` : 'Registre des adhérents',
        documentType: 'record',
        branding: ANOUANZE_BRANDING,
        lang: 'fr',
        filtersSummary: `Statut : ${statut.label} — Cotisations : ${cotisations.length} — Total réglé : ${formatMontant(totalCotise)}`,
        columns: [
          { key: 'periode', label: 'Période', type: 'short-code', priority: 'essential', nowrap: true },
          { key: 'typeCotisation', label: 'Type', type: 'code', priority: 'important' },
          { key: 'montant', label: 'Montant', type: 'amount', priority: 'essential', nowrap: true, format: formatFCFA },
          { key: 'statut', label: 'Statut', type: 'status', priority: 'essential', nowrap: true },
          { key: 'dateEcheance', label: 'Échéance', type: 'date', priority: 'important', nowrap: true, format: formatDateFR },
          { key: 'datePaiement', label: 'Payée le', type: 'date', priority: 'secondary', nowrap: true, format: formatDateFR },
          { key: 'modePaiement', label: 'Mode', type: 'code', priority: 'secondary' },
        ],
      };
      await exportDocument(def, cotisations as unknown as Record<string, unknown>[], 'pdf');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-500">
        <Link href="/dashboard" className="hover:text-primary-600">Tableau de bord</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/membres" className="hover:text-primary-600">Membres</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-700 font-medium truncate">{nomComplet}</span>
      </nav>

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
            aria-label="Retour"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold shadow-sm">
            {initiales(membre.nom, membre.prenom ?? undefined)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 leading-tight">{nomComplet}</h1>
            <div className="flex items-center gap-2 mt-1">
              {membre.numero && <span className="text-xs font-mono text-neutral-400">{membre.numero}</span>}
              <span className={statut.cls}>{statut.label}</span>
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

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Total cotisé</p>
            <p className="text-lg font-bold text-neutral-800">{formatMontant(totalCotise)}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Reste dû</p>
            <p className={cn('text-lg font-bold', resteDu > 0 ? 'text-red-600' : 'text-primary-600')}>
              {formatMontant(resteDu > 0 ? resteDu : 0)}
            </p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Cotisations réglées</p>
            <p className="text-lg font-bold text-neutral-800">{payees.length} / {cotisations.length}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
            <Percent className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Taux de recouvrement</p>
            <p className="text-lg font-bold text-neutral-800">{tauxRecouvrement}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Informations */}
        <div className="card lg:col-span-1">
          <h2 className="text-sm font-semibold text-neutral-700 mb-2">Informations personnelles</h2>
          <InfoLigne label="Email" value={membre.email} />
          <InfoLigne label="Téléphone" value={membre.telephone} />
          <InfoLigne label="Genre" value={membre.genre} />
          <InfoLigne label="Nationalité" value={membre.nationalite} />
          <InfoLigne label="Date de naissance" value={membre.dateNaissance ? formatDate(membre.dateNaissance) : null} />
          <InfoLigne label="Adresse" value={adresse} />
          <InfoLigne label="Date d'adhésion" value={membre.dateAdhesion ? formatDate(membre.dateAdhesion) : null} />
          <InfoLigne label="Date d'expiration" value={membre.dateExpiration ? formatDate(membre.dateExpiration) : null} />
          <InfoLigne
            label="Fonctions"
            value={(membre.fonctions ?? []).length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {(membre.fonctions ?? []).map((f) => <span key={f} className="badge badge-neutral text-xs">{f}</span>)}
              </span>
            ) : null}
          />
          <InfoLigne
            label="Compétences"
            value={(membre.competences ?? []).length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {(membre.competences ?? []).map((c) => <span key={c} className="badge badge-neutral text-xs">{c}</span>)}
              </span>
            ) : null}
          />
          <InfoLigne
            label="Groupes"
            value={(membre.groupes ?? []).length > 0 ? (
              <span className="flex flex-wrap gap-1.5">
                {(membre.groupes ?? []).map((g) => <span key={g} className="badge badge-neutral text-xs">{g}</span>)}
              </span>
            ) : null}
          />
          <InfoLigne label="Notes" value={membre.notes} />
        </div>

        {/* Cotisations */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-neutral-700">Cotisations</h2>
            <span className="badge badge-neutral">{cotisations.length}</span>
          </div>

          {cotisations.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">Aucune cotisation enregistrée pour ce membre.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Période</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Type</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-neutral-500 uppercase">Montant</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Échéance</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-neutral-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {cotisations.map((c) => {
                    const sp = STATUT_PAIEMENT[c.statut] ?? { label: c.statut, cls: 'badge badge-neutral' };
                    return (
                      <tr key={c.id} className="border-b border-neutral-50">
                        <td className="px-3 py-2.5 font-medium text-neutral-800">{c.periode}</td>
                        <td className="px-3 py-2.5 text-neutral-600">{c.typeCotisation}</td>
                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-neutral-800">
                          {formatMontant(toNum(c.montant))}
                        </td>
                        <td className="px-3 py-2.5 text-neutral-600">{c.dateEcheance ? formatDate(c.dateEcheance) : '—'}</td>
                        <td className="px-3 py-2.5"><span className={sp.cls}>{sp.label}</span></td>
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
        title="Modifier le membre"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditOpen(false)}>Annuler</button>
            <button
              className="btn-primary"
              disabled={updateMembre.isPending || !form.nom}
              onClick={() =>
                updateMembre.mutate({
                  nom: form.nom,
                  prenom: form.prenom || undefined,
                  email: form.email || undefined,
                  telephone: form.telephone || undefined,
                  statutMembre: form.statutMembre || undefined,
                  dateAdhesion: form.dateAdhesion || undefined,
                })
              }
            >
              {updateMembre.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{editError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Nom *</label>
              <input className="input w-full" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="label">Prénom</label>
              <input className="input w-full" value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input w-full" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input w-full" value={form.telephone} onChange={(e) => setForm((p) => ({ ...p, telephone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Statut</label>
              <select className="input w-full" value={form.statutMembre} onChange={(e) => setForm((p) => ({ ...p, statutMembre: e.target.value }))}>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>
            <div>
              <label className="label">Date d&apos;adhésion</label>
              <input className="input w-full" type="date" value={form.dateAdhesion} onChange={(e) => setForm((p) => ({ ...p, dateAdhesion: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
