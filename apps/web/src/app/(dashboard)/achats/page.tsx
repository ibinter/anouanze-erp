'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ShoppingCart, Plus, Clock, Package, CheckCircle } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';

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

const STATUT_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  VALIDEE: 'Validée',
  RECUE: 'Reçue',
};

function fmtXOF(n: number) {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(n);
}

const TABS = [
  { id: 'commandes', label: 'Commandes' },
  { id: 'fournisseurs', label: 'Fournisseurs' },
];

export default function AchatsPage() {
  const [tab, setTab] = useState('commandes');
  const [modalNvCmd, setModalNvCmd] = useState(false);
  const [pageCmd, setPageCmd] = useState(1);
  const [pageFrn, setPageFrn] = useState(1);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [articles, setArticles] = useState([{ designation: '', quantite: 1, prixUnit: 0 }]);
  const [cmdForm, setCmdForm] = useState({ fournisseurId: '', dateCommande: new Date().toISOString().split('T')[0], notes: '' });
  const [cmdError, setCmdError] = useState('');
  const limit = 10;
  const queryClient = useQueryClient();

  const createCommande = useMutation({
    mutationFn: () => {
      const montantTotal = articles.reduce((s, a) => s + a.quantite * a.prixUnit, 0);
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
    onError: (err: any) => setCmdError(err?.response?.data?.message ?? 'Erreur'),
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
      key: 'numero', header: 'Numéro',
      render: (r) => <span className="font-mono font-medium text-primary-600">{r.numero}</span>,
    },
    { key: 'fournisseur', header: 'Fournisseur', render: (r) => <span>{getFournisseurNom(r)}</span> },
    {
      key: 'dateCommande', header: 'Date',
      render: (r) => <span>{r.dateCommande ?? r.createdAt?.slice(0, 10) ?? '—'}</span>,
    },
    {
      key: 'montantTotal', header: 'Montant',
      render: (r) => <span className="font-semibold">{r.montantTotal != null ? fmtXOF(r.montantTotal) : '—'}</span>,
    },
    {
      key: 'statut', header: 'Statut',
      render: (r) => <span className={STATUT_STYLES[r.statut] ?? 'badge badge-neutral'}>{STATUT_LABELS[r.statut] ?? r.statut}</span>,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex gap-2">
          {r.statut === 'BROUILLON' && (
            <button className="text-xs btn-primary py-1 px-2">Valider</button>
          )}
          {r.statut === 'VALIDEE' && (
            <button className="text-xs btn-secondary py-1 px-2">Réceptionner</button>
          )}
        </div>
      ),
    },
  ];

  const colonnesFournisseurs: Column<Fournisseur>[] = [
    { key: 'nom', header: 'Nom', render: (r) => <span className="font-semibold text-neutral-800">{r.nom}</span> },
    { key: 'email', header: 'Email', render: (r) => <span className="text-xs">{r.email ?? '—'}</span> },
    { key: 'telephone', header: 'Téléphone', render: (r) => <span className="text-xs">{r.telephone ?? '—'}</span> },
    { key: 'pays', header: 'Pays', render: (r) => <span>{r.pays ?? '—'}</span> },
    {
      key: '_count', header: 'Commandes',
      render: (r) => <span className="badge badge-neutral">{(r as any)._count?.commandes ?? 0}</span>,
    },
    {
      key: 'actions', header: '',
      render: () => (
        <button onClick={() => setModalNvCmd(true)} className="text-xs btn-primary py-1 px-2 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Commande
        </button>
      ),
    },
  ];

  const enAttente = statsData?.enAttente ?? commandes.filter((c) => c.statut === 'BROUILLON' || c.statut === 'VALIDEE').length;
  const montantTotal = statsData?.montantTotal ?? commandes.reduce((s, c) => s + (c.montantTotal ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <ShoppingCart className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">Achats</h1>
            <p className="text-sm text-neutral-500">Commandes et fournisseurs</p>
          </div>
        </div>
        <button onClick={() => setModalNvCmd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle commande
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titre="Total commandes" valeur={totalCmd} icone={<Package className="w-5 h-5" />} couleur="blue" />
        <StatCard titre="En attente" valeur={enAttente} icone={<Clock className="w-5 h-5" />} couleur="orange" />
        <StatCard titre="Montant total" valeur={fmtXOF(montantTotal)} icone={<CheckCircle className="w-5 h-5" />} couleur="green" />
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
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="VALIDEE">Validée</option>
              <option value="RECUE">Reçue</option>
            </select>
          </div>
          <DataTable columns={colonnesCommandes} data={commandes as unknown as Record<string, unknown>[]} isLoading={cmdLoading} />
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
        title="Nouvelle commande"
        size="xl"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setModalNvCmd(false); setCmdError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={createCommande.isPending || !cmdForm.fournisseurId}
              onClick={() => createCommande.mutate()}
            >
              {createCommande.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {cmdError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{cmdError}</p>}
          <div className="space-y-1">
            <label className="label">Fournisseur *</label>
            <select className="input" value={cmdForm.fournisseurId} onChange={(e) => setCmdForm((p) => ({ ...p, fournisseurId: e.target.value }))}>
              <option value="">Sélectionner un fournisseur</option>
              {fournisseurs.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="label">Date commande</label>
            <input type="date" className="input" value={cmdForm.dateCommande} onChange={(e) => setCmdForm((p) => ({ ...p, dateCommande: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="label">Articles</label>
              <button
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                onClick={() => setArticles((prev) => [...prev, { designation: '', quantite: 1, prixUnit: 0 }])}
              >
                + Ajouter ligne
              </button>
            </div>
            <div className="space-y-2">
              {articles.map((art, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input className="input col-span-1" placeholder="Désignation" value={art.designation} onChange={(e) => setArticles((prev) => prev.map((a, j) => j === i ? { ...a, designation: e.target.value } : a))} />
                  <input type="number" className="input" placeholder="Qté" min={1} value={art.quantite} onChange={(e) => setArticles((prev) => prev.map((a, j) => j === i ? { ...a, quantite: Number(e.target.value) } : a))} />
                  <input type="number" className="input" placeholder="Prix unit." min={0} value={art.prixUnit} onChange={(e) => setArticles((prev) => prev.map((a, j) => j === i ? { ...a, prixUnit: Number(e.target.value) } : a))} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <p className="text-sm font-semibold text-neutral-700">
              Total : {fmtXOF(articles.reduce((s, a) => s + a.quantite * a.prixUnit, 0))}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
