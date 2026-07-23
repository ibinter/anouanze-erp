'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, UserCheck, Clock, Banknote, Check, X, Plus } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { formatMontant, formatDate, toNum } from '@/lib/utils';

const TAB_IDS = ['employes', 'paie', 'conges', 'volontaires'] as const;

interface Employe {
  id: string;
  matricule?: string;
  nom: string;
  prenom: string;
  poste?: string;
  departement?: string;
  typeContrat?: string;
  dateEmbauche?: string;
  salaireBase?: number;
  actif?: boolean;
}

interface FichePaie {
  id: string;
  employe?: { nom?: string; prenom?: string };
  periode?: string;
  salaireBrut?: number;
  salaireNet?: number;
  statut?: string;
}

interface Conge {
  id: string;
  employe?: { nom?: string; prenom?: string };
  type?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
}

interface Volontaire {
  id: string;
  nom: string;
  prenom: string;
  competences?: string;
  projet?: { titre?: string } | string;
  dateDebut?: string;
}

const CONTRAT_COLORS: Record<string, string> = {
  CDI: 'badge-success',
  CDD: 'badge-warning',
  STAGE: 'badge-neutral',
  CONSULTANT: 'badge',
};

const EMPLOYE_INIT = { nom: '', prenom: '', poste: '', departement: '', typeContrat: 'CDI', salaireBase: '', dateEmbauche: '' };
const VOLONTAIRE_INIT = { nom: '', prenom: '', competences: '', dateDebut: '' };

function EmployesTab() {
  const t = useTranslations('activites.rh');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<Employe | null>(null);
  const [form, setForm] = useState(EMPLOYE_INIT);
  const [error, setError] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const createEmploye = useMutation({
    mutationFn: (data: typeof EMPLOYE_INIT) =>
      api.post('/rh/employes', {
        nom: data.nom,
        prenom: data.prenom,
        poste: data.poste || undefined,
        departement: data.departement || undefined,
        typeContrat: data.typeContrat || undefined,
        salaireBase: data.salaireBase ? Number(data.salaireBase) : undefined,
        dateEmbauche: data.dateEmbauche || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rh-employes'] });
      queryClient.invalidateQueries({ queryKey: ['rh-employes-all'] });
      queryClient.invalidateQueries({ queryKey: ['rh-stats'] });
      setModalOpen(false);
      setForm(EMPLOYE_INIT);
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? t('erreur')),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['rh-employes', page],
    queryFn: async () => {
      const { data } = await api.get('/rh/employes', { params: { page, limit } });
      return data;
    },
  });

  const employes: Employe[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  const columns: Column<Employe>[] = [
    {
      key: 'matricule', header: t('employes.colMatricule'), width: '100px',
      render: (r) => <span className="font-mono text-xs text-neutral-500">{(r as any).matricule ?? '—'}</span>,
    },
    {
      key: 'nom', header: t('employes.colNomComplet'),
      render: (r) => <span className="font-medium text-neutral-800">{r.prenom} {r.nom}</span>,
    },
    { key: 'poste', header: t('employes.colPoste'), render: (r) => <span>{(r as any).poste ?? '—'}</span> },
    { key: 'departement', header: t('employes.colDepartement'), render: (r) => <span>{(r as any).departement ?? '—'}</span> },
    {
      key: 'typeContrat', header: t('employes.colContrat'), width: '110px',
      render: (r) => {
        const t = (r as any).typeContrat ?? '';
        return <span className={`badge ${CONTRAT_COLORS[t] ?? 'badge-neutral'}`}>{t || '—'}</span>;
      },
    },
    {
      key: 'dateEmbauche', header: t('employes.colEmbauche'), width: '110px',
      render: (r) => <span>{(r as any).dateEmbauche ? formatDate((r as any).dateEmbauche) : '—'}</span>,
    },
    {
      key: 'actions', header: t('employes.colActions'), width: '130px',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="text-xs text-primary-600 hover:underline font-medium"
            onClick={(e) => { e.stopPropagation(); setDetail(r); }}
          >
            {t('employes.voir')}
          </button>
          <button
            className="text-xs text-neutral-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t('employes.modifier')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> {t('employes.nouveau')}
        </button>
      </div>
      <DataTable columns={columns as Column<Employe & Record<string, unknown>>[]} data={employes as (Employe & Record<string, unknown>)[]} isLoading={isLoading} onRowClick={(r) => setDetail(r as Employe)} />
      {total > limit && <Pagination total={total} page={page} limit={limit} onChange={setPage} />}

      <Modal open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title={t('employes.fiche.titre')} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center font-semibold">
                {(detail.prenom?.[0] ?? '') + (detail.nom?.[0] ?? '')}
              </div>
              <div>
                <p className="font-semibold text-neutral-800">{detail.prenom} {detail.nom}</p>
                <p className="text-sm text-neutral-500">{detail.poste ?? '—'}</p>
              </div>
              <span className={`badge ml-auto ${CONTRAT_COLORS[detail.typeContrat ?? ''] ?? 'badge-neutral'}`}>{detail.typeContrat ?? '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-500">{t('employes.fiche.matricule')}</p>
                <p className="text-sm font-medium text-neutral-800 font-mono">{detail.matricule ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">{t('employes.fiche.departement')}</p>
                <p className="text-sm font-medium text-neutral-800">{detail.departement ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">{t('employes.fiche.dateEmbauche')}</p>
                <p className="text-sm font-medium text-neutral-800">{detail.dateEmbauche ? formatDate(detail.dateEmbauche) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">{t('employes.fiche.salaireBase')}</p>
                <p className="text-sm font-semibold text-primary-700">{detail.salaireBase != null ? formatMontant(detail.salaireBase) : '—'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t('employes.modal.titre')}
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>{t('employes.modal.annuler')}</button>
            <button
              className="btn-primary"
              disabled={createEmploye.isPending || !form.nom || !form.prenom}
              onClick={() => createEmploye.mutate(form)}
            >
              {createEmploye.isPending ? t('employes.modal.enregistrement') : t('employes.modal.enregistrer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('employes.modal.prenom')}</label>
              <input type="text" className="input w-full" value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('employes.modal.nom')}</label>
              <input type="text" className="input w-full" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('employes.modal.poste')}</label>
              <input type="text" className="input w-full" placeholder={t('employes.modal.postePlaceholder')} value={form.poste} onChange={(e) => setForm((p) => ({ ...p, poste: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('employes.modal.departement')}</label>
              <input type="text" className="input w-full" placeholder={t('employes.modal.departementPlaceholder')} value={form.departement} onChange={(e) => setForm((p) => ({ ...p, departement: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('employes.modal.typeContrat')}</label>
              <select className="input w-full" value={form.typeContrat} onChange={(e) => setForm((p) => ({ ...p, typeContrat: e.target.value }))}>
                {['CDI', 'CDD', 'STAGE', 'CONSULTANT'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">{t('employes.modal.salaireBase')}</label>
              <input type="number" className="input w-full" placeholder="0" value={form.salaireBase} onChange={(e) => setForm((p) => ({ ...p, salaireBase: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">{t('employes.modal.dateEmbauche')}</label>
              <input type="date" className="input w-full" value={form.dateEmbauche} onChange={(e) => setForm((p) => ({ ...p, dateEmbauche: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function PaieTab({ employes }: { employes: Employe[] }) {
  const t = useTranslations('activites.rh');
  const [selectedEmployeId, setSelectedEmployeId] = useState(employes[0]?.id ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['rh-fiches-paie', selectedEmployeId],
    queryFn: async () => {
      const { data } = await api.get(`/rh/employes/${selectedEmployeId}/fiches-paie`);
      return data;
    },
    enabled: !!selectedEmployeId,
  });

  const fiches: FichePaie[] = data ?? [];

  const columns: Column<FichePaie>[] = [
    {
      key: 'periode', header: t('paie.colPeriode'),
      render: (r) => <span className="font-medium text-neutral-800">{(r as any).periode ?? '—'}</span>,
    },
    {
      key: 'salaireBrut', header: t('paie.colBrut'),
      render: (r) => <span className="font-mono">{(r as any).salaireBrut != null ? formatMontant((r as any).salaireBrut) : '—'}</span>,
    },
    {
      key: 'salaireNet', header: t('paie.colNet'),
      render: (r) => <span className="font-mono font-semibold text-neutral-800">{(r as any).salaireNet != null ? formatMontant((r as any).salaireNet) : '—'}</span>,
    },
    {
      key: 'statut', header: t('paie.colStatut'), width: '120px',
      render: (r) => (r as any).statut === 'PAYE' || (r as any).statut === 'payé'
        ? <span className="badge badge-success">{t('paie.paye')}</span>
        : <span className="badge badge-warning">{t('paie.enAttente')}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="label mb-0">{t('paie.employe')}</label>
        <select
          className="input w-64"
          value={selectedEmployeId}
          onChange={(e) => setSelectedEmployeId(e.target.value)}
        >
          {employes.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
      </div>
      <DataTable columns={columns as Column<FichePaie & Record<string, unknown>>[]} data={fiches as (FichePaie & Record<string, unknown>)[]} isLoading={isLoading} />
    </div>
  );
}

function CongesTab({ employes }: { employes: Employe[] }) {
  const t = useTranslations('activites.rh');
  const [selectedEmployeId, setSelectedEmployeId] = useState(employes[0]?.id ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['rh-conges', selectedEmployeId],
    queryFn: async () => {
      const { data } = await api.get(`/rh/employes/${selectedEmployeId}/conges`);
      return data;
    },
    enabled: !!selectedEmployeId,
  });

  const conges: Conge[] = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="label mb-0">{t('conges.employe')}</label>
        <select
          className="input w-64"
          value={selectedEmployeId}
          onChange={(e) => setSelectedEmployeId(e.target.value)}
        >
          {employes.map((e) => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              {[t('conges.colType'), t('conges.colDebut'), t('conges.colFin'), t('conges.colStatut'), t('conges.colActions')].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">{t('conges.chargement')}</td></tr>
            )}
            {!isLoading && conges.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-400 text-sm">{t('conges.vide')}</td></tr>
            )}
            {conges.map((c) => (
              <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                <td className="px-4 py-3 text-neutral-600">{c.type ?? '—'}</td>
                <td className="px-4 py-3 text-neutral-600">{c.dateDebut ? formatDate(c.dateDebut) : '—'}</td>
                <td className="px-4 py-3 text-neutral-600">{c.dateFin ? formatDate(c.dateFin) : '—'}</td>
                <td className="px-4 py-3">
                  {c.statut === 'APPROUVE' && <span className="badge badge-success">{t('conges.approuve')}</span>}
                  {c.statut === 'REJETE' && <span className="badge badge-error">{t('conges.rejete')}</span>}
                  {(c.statut === 'EN_ATTENTE' || !c.statut) && <span className="badge badge-warning">{t('conges.enAttente')}</span>}
                </td>
                <td className="px-4 py-3">
                  {c.statut === 'EN_ATTENTE' && (
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium">
                        <Check className="w-3 h-3" /> {t('conges.approuver')}
                      </button>
                      <button className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
                        <X className="w-3 h-3" /> {t('conges.rejeter')}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function VolontairesTab() {
  const t = useTranslations('activites.rh');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VOLONTAIRE_INIT);
  const [error, setError] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const createVolontaire = useMutation({
    mutationFn: (data: typeof VOLONTAIRE_INIT) =>
      api.post('/rh/volontaires', {
        nom: data.nom,
        prenom: data.prenom,
        competences: data.competences || undefined,
        dateDebut: data.dateDebut || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rh-volontaires'] });
      queryClient.invalidateQueries({ queryKey: ['rh-stats'] });
      setModalOpen(false);
      setForm(VOLONTAIRE_INIT);
      setError('');
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? t('erreur')),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['rh-volontaires', page],
    queryFn: async () => {
      const { data } = await api.get('/rh/volontaires', { params: { page, limit } });
      return data;
    },
  });

  const volontaires: Volontaire[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  function getProjetLabel(v: Volontaire) {
    if (!v.projet) return '—';
    if (typeof v.projet === 'string') return v.projet;
    return v.projet.titre ?? '—';
  }

  const columns: Column<Volontaire>[] = [
    {
      key: 'nom', header: t('volontaires.colNomComplet'),
      render: (r) => <span className="font-medium text-neutral-800">{r.prenom} {r.nom}</span>,
    },
    { key: 'competences', header: t('volontaires.colCompetences'), render: (r) => <span>{(r as any).competences ?? '—'}</span> },
    { key: 'projet', header: t('volontaires.colProjet'), render: (r) => <span>{getProjetLabel(r)}</span> },
    {
      key: 'dateDebut', header: t('volontaires.colDepuis'),
      render: (r) => <span>{r.dateDebut ? formatDate(r.dateDebut) : '—'}</span>,
    },
    {
      key: 'actions', header: t('volontaires.colActions'), width: '80px',
      render: () => <button className="text-xs text-primary-600 hover:underline font-medium">{t('volontaires.voir')}</button>,
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-3">
        <button className="btn-primary flex items-center gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> {t('volontaires.nouveau')}
        </button>
      </div>
      <DataTable columns={columns as Column<Volontaire & Record<string, unknown>>[]} data={volontaires as (Volontaire & Record<string, unknown>)[]} isLoading={isLoading} />
      {total > limit && <Pagination total={total} page={page} limit={limit} onChange={setPage} />}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={t('volontaires.modal.titre')}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalOpen(false); setError(''); }}>{t('volontaires.modal.annuler')}</button>
            <button
              className="btn-primary"
              disabled={createVolontaire.isPending || !form.nom || !form.prenom}
              onClick={() => createVolontaire.mutate(form)}
            >
              {createVolontaire.isPending ? t('volontaires.modal.enregistrement') : t('volontaires.modal.enregistrer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('volontaires.modal.prenom')}</label>
              <input type="text" className="input w-full" value={form.prenom} onChange={(e) => setForm((p) => ({ ...p, prenom: e.target.value }))} />
            </div>
            <div>
              <label className="label">{t('volontaires.modal.nom')}</label>
              <input type="text" className="input w-full" value={form.nom} onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">{t('volontaires.modal.competences')}</label>
              <input type="text" className="input w-full" placeholder={t('volontaires.modal.competencesPlaceholder')} value={form.competences} onChange={(e) => setForm((p) => ({ ...p, competences: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="label">{t('volontaires.modal.dateDebut')}</label>
              <input type="date" className="input w-full" value={form.dateDebut} onChange={(e) => setForm((p) => ({ ...p, dateDebut: e.target.value }))} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function RHPage() {
  const t = useTranslations('activites.rh');
  const [activeTab, setActiveTab] = useState('employes');
  const tabs = TAB_IDS.map((id) => ({ id, label: t(`onglets.${id}` as never) }));

  const { data: statsData } = useQuery({
    queryKey: ['rh-stats'],
    queryFn: async () => {
      const { data } = await api.get('/rh/stats');
      return data;
    },
  });

  const { data: employesData } = useQuery({
    queryKey: ['rh-employes-all'],
    queryFn: async () => {
      const { data } = await api.get('/rh/employes', { params: { limit: 100 } });
      return data;
    },
  });

  const employes: Employe[] = employesData?.data ?? [];

  // Somme monétaire : les salaires arrivent en chaînes (Decimal Prisma) → toNum
  // avant addition, sinon `+` concatène et corrompt la masse salariale.
  const masseSalarialeCalc = employes.reduce((sum, e) => sum + toNum(e.salaireBase), 0);
  const masseSalariale = statsData?.masseSalariale != null ? toNum(statsData.masseSalariale) : masseSalarialeCalc;
  const totalEmployes = statsData?.totalEmployes ?? employes.length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">{t('titre')}</h1>
        <p className="text-sm text-neutral-500 mt-1">{t('sousTitre')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Users className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.totalEmployes')}</p>
            <p className="text-xl font-bold text-neutral-800">{totalEmployes}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-50">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.enConge')}</p>
            <p className="text-xl font-bold text-orange-600">{statsData?.enConge ?? '—'}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <UserCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.volontairesActifs')}</p>
            <p className="text-xl font-bold text-blue-600">{statsData?.totalVolontaires ?? '—'}</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <Banknote className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">{t('stats.masseSalariale')}</p>
            <p className="text-lg font-bold text-green-600">{formatMontant(masseSalariale)}</p>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {activeTab === 'employes' && <EmployesTab />}
        {activeTab === 'paie' && <PaieTab employes={employes} />}
        {activeTab === 'conges' && <CongesTab employes={employes} />}
        {activeTab === 'volontaires' && <VolontairesTab />}
      </div>
    </div>
  );
}
