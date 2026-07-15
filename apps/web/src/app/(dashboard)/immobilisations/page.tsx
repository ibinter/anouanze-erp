'use client';

import { useState } from 'react';
import { Building2, Plus, TrendingDown, Wallet } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { cn, toNum, formatMontant, formatDate } from '@/lib/utils';

type StatutImmo = 'EN_SERVICE' | 'CEDE' | 'REBUTE';
type CategorieImmo = 'Matériel informatique' | 'Mobilier' | 'Véhicule' | 'Équipement' | 'Bâtiment';

interface Immobilisation {
  id: string;
  reference: string;
  designation: string;
  categorie: CategorieImmo;
  dateAcquisition: string;
  valeurAcquisition: number;
  tauxAmortissement: number;
  statut: StatutImmo;
}

const IMMOBILISATIONS: Immobilisation[] = [
  { id: '1', reference: 'IMM-001', designation: 'Toyota Land Cruiser VDJ200', categorie: 'Véhicule', dateAcquisition: '2022-03-15', valeurAcquisition: 28_000_000, tauxAmortissement: 25, statut: 'EN_SERVICE' },
  { id: '2', reference: 'IMM-002', designation: 'Serveur Dell PowerEdge T40', categorie: 'Matériel informatique', dateAcquisition: '2023-06-01', valeurAcquisition: 2_800_000, tauxAmortissement: 33, statut: 'EN_SERVICE' },
  { id: '3', reference: 'IMM-003', designation: 'Bureaux et chaises (lot 10)', categorie: 'Mobilier', dateAcquisition: '2021-01-10', valeurAcquisition: 3_500_000, tauxAmortissement: 20, statut: 'EN_SERVICE' },
  { id: '4', reference: 'IMM-004', designation: 'Groupe électrogène 15 KVA', categorie: 'Équipement', dateAcquisition: '2020-08-22', valeurAcquisition: 5_200_000, tauxAmortissement: 20, statut: 'EN_SERVICE' },
  { id: '5', reference: 'IMM-005', designation: 'Laptop HP ProBook 450 G9', categorie: 'Matériel informatique', dateAcquisition: '2024-01-20', valeurAcquisition: 650_000, tauxAmortissement: 33, statut: 'EN_SERVICE' },
  { id: '6', reference: 'IMM-006', designation: 'Climatiseur split 18000 BTU', categorie: 'Équipement', dateAcquisition: '2019-05-14', valeurAcquisition: 850_000, tauxAmortissement: 20, statut: 'REBUTE' },
  { id: '7', reference: 'IMM-007', designation: 'Moto Honda CG 125', categorie: 'Véhicule', dateAcquisition: '2021-11-08', valeurAcquisition: 900_000, tauxAmortissement: 25, statut: 'CEDE' },
];

const STATUT_STYLES: Record<StatutImmo, string> = {
  EN_SERVICE: 'badge badge-success',
  CEDE: 'badge badge-warning',
  REBUTE: 'badge badge-error',
};

const STATUT_LABELS: Record<StatutImmo, string> = {
  EN_SERVICE: 'En service',
  CEDE: 'Cédé',
  REBUTE: 'Rebuté',
};

const CAT_STYLES: Record<CategorieImmo, string> = {
  'Matériel informatique': 'badge bg-blue-100 text-blue-700',
  'Mobilier': 'badge badge-neutral',
  'Véhicule': 'badge bg-purple-100 text-purple-700',
  'Équipement': 'badge badge-warning',
  'Bâtiment': 'badge bg-teal-100 text-teal-700',
};

function calcValeurNette(immo: Immobilisation): number {
  const debut = new Date(immo.dateAcquisition);
  const annees = (Date.now() - debut.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const cumul = Math.min(annees * toNum(immo.tauxAmortissement) / 100, 1);
  return Math.max(0, toNum(immo.valeurAcquisition) * (1 - cumul));
}

function calcPctAmorti(immo: Immobilisation): number {
  const debut = new Date(immo.dateAcquisition);
  const annees = (Date.now() - debut.getTime()) / (1000 * 60 * 60 * 24 * 365);
  return Math.min(100, Math.round(annees * toNum(immo.tauxAmortissement)));
}

const FORM_INIT = {
  reference: '',
  designation: '',
  categorie: 'Matériel informatique' as CategorieImmo,
  dateAcquisition: '',
  valeurAcquisition: 0,
  tauxAmortissement: 20,
};

export default function ImmobilisationsPage() {
  const [modalNv, setModalNv] = useState(false);
  const [detail, setDetail] = useState<Immobilisation | null>(null);
  const [form, setForm] = useState(FORM_INIT);

  const enService = IMMOBILISATIONS.filter((i) => i.statut === 'EN_SERVICE');
  const vaTotal = IMMOBILISATIONS.reduce((s, i) => s + toNum(i.valeurAcquisition), 0);
  const vnTotal = enService.reduce((s, i) => s + calcValeurNette(i), 0);
  const amortMois = enService.reduce((s, i) => s + (toNum(i.valeurAcquisition) * toNum(i.tauxAmortissement) / 100 / 12), 0);

  const columns: Column<Immobilisation>[] = [
    { key: 'reference', header: 'Référence', render: (r) => <span className="font-mono text-xs text-neutral-500">{r.reference}</span> },
    { key: 'designation', header: 'Désignation', render: (r) => <span className="font-semibold text-neutral-800 text-sm">{r.designation}</span> },
    { key: 'categorie', header: 'Catégorie', render: (r) => <span className={CAT_STYLES[r.categorie]}>{r.categorie}</span> },
    { key: 'dateAcquisition', header: 'Acquisition', render: (r) => <span className="text-xs text-neutral-500">{r.dateAcquisition}</span> },
    { key: 'valeurAcquisition', header: 'Valeur acq.', render: (r) => <span className="text-xs">{formatMontant(r.valeurAcquisition)}</span> },
    {
      key: 'valeurNette', header: 'Valeur nette', render: (r) => (
        <span className="font-semibold text-primary-600 text-sm">{formatMontant(calcValeurNette(r))}</span>
      )
    },
    { key: 'tauxAmortissement', header: 'Taux', render: (r) => <span className="text-xs text-neutral-500">{toNum(r.tauxAmortissement)}%</span> },
    {
      key: 'progression', header: 'Amorti', render: (r) => {
        const pct = calcPctAmorti(r);
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
        <span className={STATUT_STYLES[r.statut]}>{STATUT_LABELS[r.statut]}</span>
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
        <button onClick={() => setModalNv(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle immobilisation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard titre="Total immobilisations" valeur={IMMOBILISATIONS.length} icone={<Building2 className="w-5 h-5" />} couleur="blue" description={`${enService.length} en service`} />
        <StatCard titre="Valeur d'acquisition" valeur={formatMontant(vaTotal)} icone={<Wallet className="w-5 h-5" />} couleur="purple" description="Brut, tous statuts" />
        <StatCard titre="Valeur nette comptable" valeur={formatMontant(vnTotal)} icone={<Building2 className="w-5 h-5" />} couleur="green" description="Actifs en service" />
        <StatCard titre="Amortissements ce mois" valeur={formatMontant(amortMois)} icone={<TrendingDown className="w-5 h-5" />} couleur="orange" />
      </div>

      <DataTable columns={columns} data={IMMOBILISATIONS as unknown as Record<string, unknown>[]} isLoading={false} onRowClick={(r) => setDetail(r as Immobilisation)} />

      <Modal
        open={modalNv}
        onOpenChange={setModalNv}
        title="Nouvelle immobilisation"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setModalNv(false)}>Annuler</button>
            <button className="btn-primary" onClick={() => setModalNv(false)}>Enregistrer</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="label">Référence</label>
              <input className="input" placeholder="IMM-XXX" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="label">Catégorie</label>
              <select className="input" value={form.categorie} onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value as CategorieImmo }))}>
                <option>Matériel informatique</option>
                <option>Mobilier</option>
                <option>Véhicule</option>
                <option>Équipement</option>
                <option>Bâtiment</option>
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
              <span className={CAT_STYLES[detail.categorie]}>{detail.categorie}</span>
              <span className={STATUT_STYLES[detail.statut]}>{STATUT_LABELS[detail.statut]}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Date d'acquisition</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatDate(detail.dateAcquisition)}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Taux d'amortissement</p>
                <p className="mt-1 font-semibold text-neutral-800">{toNum(detail.tauxAmortissement)}%</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Valeur d'acquisition</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatMontant(detail.valeurAcquisition)}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">Amortissement</p>
                <p className="mt-1 font-semibold text-neutral-800">{calcPctAmorti(detail)}%</p>
              </div>
            </div>
            <div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', calcPctAmorti(detail) >= 100 ? 'bg-neutral-400' : 'bg-accent-400')}
                  style={{ width: `${calcPctAmorti(detail)}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">Valeur nette comptable</span>
              <span className="text-lg font-bold text-primary-700">{formatMontant(calcValeurNette(detail))}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
