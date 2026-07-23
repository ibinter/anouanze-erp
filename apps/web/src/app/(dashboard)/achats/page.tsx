'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShoppingCart, Plus, Clock, Package, Wallet } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';
import { toNum, formatMontant, formatDate } from '@/lib/utils';

type StatutCmd = 'BROUILLON' | 'VALIDEE' | 'RECUE';

interface Commande {
  id: string;
  numero: string;
  fournisseur?: { nom: string } | string;
  dateCommande?: string;
  createdAt?: string;
  montantTotal?: number;
  statut: StatutCmd;
}

interface Fournisseur {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  pays?: string;
  _count?: { commandes: number };
}

const STATUT_STYLES: Record<string, string> = {
  BROUILLON: 'badge badge-neutral',
  VALIDEE: 'badge badge-warning',
  RECUE: 'badge badge-success',
};

const STATUT_IDS = ['BROUILLON', 'VALIDEE', 'RECUE'] as const;

const TAB_IDS = ['commandes', 'fournisseurs'] as const;

export default function AchatsPage() {
  const t = useTranslations('finance.achats');
  const tc = useTranslations('finance.common');
  const [tab, setTab] = useState('commandes');
  const [modalNvCmd, setModalNvCmd] = useState(false);
  const [detailCmd, setDetailCmd] = useState<Commande | null>(null);
  const [pageCmd, setPageCmd] = useState(1);
  const [pageFrn, setPageFrn] = useState(1);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [articles, setArticles] = useState([{ designation: '', quantite: 1, prixUnit: 0 }]);
  const [cmdForm, setCmdForm] = useState({ fournisseurId: '', dateCommande: new Date().toISOString().split('T')[0], notes: '' });
  const [cmdError, setCmdError] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const TABS = TAB_IDS.map((id) => ({ id, label: t(`tabs.${id}`) }));
  const statutLabel = (statut: string) =>
    (STATUT_IDS as readonly string[]).includes(statut) ? t(`statuts.${statut}`) : statut;

  const createCommande = useMutation({
    mutationFn: () => {
      const montantTotal = articles.reduce((s, a) => s + toNum(a.quantite) * toNum(a.prixUnit), 0);
      const numero = `CMD-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
      return api.post('/achats/commandes', {
        fournisseurId: cmdForm.fournisseurId,
        numero,
        dateCommande: cmdForm.dateCommande,
        montantTotal,
        notes: cmdForm.notes || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achats-commandes'] });
      queryClient.invalidateQueries({ queryKey: ['achats-stats'] });
      setModalNvCmd(false);
      setArticles([{ designation: '', quantite: 1, prixUnit: 0 }]);
      setCmdForm({ fournisseurId: '', dateCommande: new Date().toISOString().split('T')[0], notes: '' });
      setCmdError('');
    },
    onError: (err: any) => setCmdError(err?.response?.data?.message ?? tc('error')),
  });

  const { data: cmdData, isLoading: cmdLoading } = useQuery({
    queryKey: ['achats-commandes', pageCmd, filtreStatut],
    queryFn: async () => {
      const { data } = await api.get('/achats/commandes', {
        params: { page: pageCmd, limit, statut: filtreStatut || undefined },
      });
      return data;
    },
  });

  const { data: frnData, isLoading: frnLoading } = useQuery({
    queryKey: ['achats-fournisseurs', pageFrn],
    queryFn: async () => {
      const { data } = await api.get('/achats/fournisseurs', {
        params: { page: pageFrn, limit },
      });
      return data;
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['achats-stats'],
    queryFn: async () => {
      const { data } = await api.get('/achats/commandes/stats');
      return data;
    },
  });

  const commandes: Commande[] = cmdData?.data ?? [];
  const totalCmd = cmdData?.meta?.total ?? 0;
  const fournisseurs: Fournisseur[] = frnData?.data ?? [];
  const totalFrn = frnData?.meta?.total ?? 0;

  function getFournisseurNom(cmd: Commande) {
    if (!cmd.fournisseur) return '—';
    if (typeof cmd.fournisseur === 'string') return cmd.fournisseur;
    return cmd.fournisseur.nom;
  }

  const colonnesCommandes: Column<Commande>[] = [
    {
      key: 'numero', header: t('colonnes.numero'),
      render: (r) => <span className="font-mono font-medium text-primary-600">{r.numero}</span>,
    },
    { key: 'fournisseur', header: t('colonnes.fournisseur'), render: (r) => <span>{getFournisseurNom(r)}</span> },
    {
      key: 'dateCommande', header: t('colonnes.date'),
      render: (r) => <span>{r.dateCommande ?? r.createdAt?.slice(0, 10) ?? '—'}</span>,
    },
    {
      key: 'montantTotal', header: t('colonnes.montant'),
      render: (r) => <span className="font-semibold">{r.montantTotal != null ? formatMontant(r.montantTotal) : '—'}</span>,
    },
    {
      key: 'statut', header: t('colonnes.statut'),
      render: (r) => <span className={STATUT_STYLES[r.statut] ?? 'badge badge-neutral'}>{statutLabel(r.statut)}</span>,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex gap-2">
          {r.statut === 'BROUILLON' && (
            <button onClick={(e) => e.stopPropagation()} className="text-xs btn-primary py-1 px-2">{t('actions.valider')}</button>
          )}
          {r.statut === 'VALIDEE' && (
            <button onClick={(e) => e.stopPropagation()} className="text-xs btn-secondary py-1 px-2">{t('actions.receptionner')}</button>
          )}
        </div>
      ),
    },
  ];

  const colonnesFournisseurs: Column<Fournisseur>[] = [
    { key: 'nom', header: t('colonnes.nom'), render: (r) => <span className="font-semibold text-neutral-800">{r.nom}</span> },
    { key: 'email', header: t('colonnes.email'), render: (r) => <span className="text-xs">{r.email ?? '—'}</span> },
    { key: 'telephone', header: t('colonnes.telephone'), render: (r) => <span className="text-xs">{r.telephone ?? '—'}</span> },
    { key: 'pays', header: t('colonnes.pays'), render: (r) => <span>{r.pays ?? '—'}</span> },
    {
      key: '_count', header: t('colonnes.commandes'),
      render: (r) => <span className="badge badge-neutral">{(r as any)._count?.commandes ?? 0}</span>,
    },
    {
      key: 'actions', header: '',
      render: () => (
        <button onClick={() => setModalNvCmd(true)} className="text-xs btn-primary py-1 px-2 flex items-center gap-1">
          <Plus className="w-3 h-3" /> {t('actions.commande')}
        </button>
      ),
    },
  ];

  const enAttente = statsData?.enAttente ?? commandes.filter((c) => c.statut === 'BROUILLON' || c.statut === 'VALIDEE').length;
  const montantTotal = toNum(statsData?.montantTotal ?? commandes.reduce((s, c) => s + toNum(c.montantTotal), 0));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">{t('title')}</h1>
            <p className="text-sm text-neutral-500">{t('subtitle')}</p>
          </div>
        </div>
        <button onClick={() => setModalNvCmd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('actions.new')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titre={t('kpi.totalCommandes')} valeur={totalCmd} icone={<Package className="w-5 h-5" />} couleur="blue" description={t('kpi.totalCommandesDesc')} />
        <StatCard titre={t('kpi.enAttente')} valeur={enAttente} icone={<Clock className="w-5 h-5" />} couleur="orange" description={t('kpi.enAttenteDesc')} />
        <StatCard titre={t('kpi.montantTotal')} valeur={formatMontant(montantTotal)} icone={<Wallet className="w-5 h-5" />} couleur="green" description={t('kpi.montantTotalDesc')} />
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'commandes' && (
        <>
          <div className="flex gap-3">
            <select
              className="input w-48"
              value={filtreStatut}
              onChange={(e) => { setFiltreStatut(e.target.value); setPageCmd(1); }}
            >
              <option value="">{t('filtre.tousStatuts')}</option>
              {STATUT_IDS.map((s) => (
                <option key={s} value={s}>{t(`statuts.${s}`)}</option>
              ))}
            </select>
          </div>
          <DataTable columns={colonnesCommandes as Column[]} data={commandes} isLoading={cmdLoading} onRowClick={(r) => setDetailCmd(r as Commande)} />
          {totalCmd > limit && <Pagination total={totalCmd} page={pageCmd} limit={limit} onChange={setPageCmd} />}
        </>
      )}

      {tab === 'fournisseurs' && (
        <>
          <DataTable columns={colonnesFournisseurs} data={fournisseurs as unknown as Record<string, unknown>[]} isLoading={frnLoading} />
          {totalFrn > limit && <Pagination total={totalFrn} page={pageFrn} limit={limit} onChange={setPageFrn} />}
        </>
      )}

      <Modal
        open={modalNvCmd}
        onOpenChange={setModalNvCmd}
        title={t('modal.title')}
        size="xl"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalNvCmd(false); setCmdError(''); }}>{tc('cancel')}</button>
            <button
              className="btn-primary"
              disabled={createCommande.isPending || !cmdForm.fournisseurId}
              onClick={() => createCommande.mutate()}
            >
              {createCommande.isPending ? tc('saving') : tc('save')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {cmdError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{cmdError}</p>}
          <div className="space-y-1">
            <label className="label">{t('modal.fournisseur')}</label>
            <select className="input" value={cmdForm.fournisseurId} onChange={(e) => setCmdForm((p) => ({ ...p, fournisseurId: e.target.value }))}>
              <option value="">{t('modal.choisirFournisseur')}</option>
              {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">{t('modal.dateCommande')}</label>
            <input type="date" className="input" value={cmdForm.dateCommande} onChange={(e) => setCmdForm((p) => ({ ...p, dateCommande: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="label">{t('modal.articles')}</label>
              <button
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setArticles((prev) => [...prev, { designation: '', quantite: 1, prixUnit: 0 }])}
              >
                {t('modal.addLigne')}
              </button>
            </div>
            <div className="space-y-2">
              {articles.map((art, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input className="input col-span-1" placeholder={t('modal.designationPlaceholder')} value={art.designation} onChange={(e) => setArticles((prev) => prev.map((a, j) => j === i ? { ...a, designation: e.target.value } : a))} />
                  <input type="number" className="input" placeholder={t('modal.quantitePlaceholder')} min={1} value={art.quantite} onChange={(e) => setArticles((prev) => prev.map((a, j) => j === i ? { ...a, quantite: Number(e.target.value) } : a))} />
                  <input type="number" className="input" placeholder={t('modal.prixPlaceholder')} min={0} value={art.prixUnit} onChange={(e) => setArticles((prev) => prev.map((a, j) => j === i ? { ...a, prixUnit: Number(e.target.value) } : a))} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <p className="text-sm font-semibold text-neutral-700">
              {t('modal.total', { montant: formatMontant(articles.reduce((s, a) => s + toNum(a.quantite) * toNum(a.prixUnit), 0)) })}
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detailCmd}
        onOpenChange={(o) => !o && setDetailCmd(null)}
        title={detailCmd ? t('detail.title', { numero: detailCmd.numero }) : ''}
        description={detailCmd ? getFournisseurNom(detailCmd) : undefined}
      >
        {detailCmd && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.statut')}</p>
                <p className="mt-1"><span className={STATUT_STYLES[detailCmd.statut] ?? 'badge badge-neutral'}>{statutLabel(detailCmd.statut)}</span></p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.date')}</p>
                <p className="mt-1 font-semibold text-neutral-800">
                  {detailCmd.dateCommande ? formatDate(detailCmd.dateCommande) : detailCmd.createdAt ? formatDate(detailCmd.createdAt) : '—'}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.fournisseur')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{getFournisseurNom(detailCmd)}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.numero')}</p>
                <p className="mt-1 font-mono text-sm text-primary-600">{detailCmd.numero}</p>
              </div>
            </div>
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">{t('detail.montantTotal')}</span>
              <span className="text-lg font-bold text-primary-700">{detailCmd.montantTotal != null ? formatMontant(detailCmd.montantTotal) : '—'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
