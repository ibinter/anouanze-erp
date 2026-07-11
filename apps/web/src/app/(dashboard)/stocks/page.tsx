'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Package, AlertTriangle, Search, ArrowDownCircle, ArrowUpCircle, Bell } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  reference: string;
  designation: string;
  categorie: string;
  stockActuel: number;
  stockMinimum: number;
  unite: string;
  prixUnitaire: number;
}

type MouvType = 'entree' | 'sortie';

function fmtXOF(n: number) {
  return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(n);
}

export default function StocksPage() {
  const [search, setSearch] = useState('');
  const [alertesOnly, setAlertesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [mouvModal, setMouvModal] = useState<{ article: Article; type: MouvType } | null>(null);
  const [form, setForm] = useState({ quantite: 1, motif: '' });
  const [mouvError, setMouvError] = useState('');
  const limit = 20;
  const queryClient = useQueryClient();

  const mouvementMutation = useMutation({
    mutationFn: ({ article, type, quantite, motif }: { article: Article; type: MouvType; quantite: number; motif: string }) =>
      api.post(`/stocks/${article.id}/${type}`, { quantite, motif: motif || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stocks-alertes'] });
      setMouvModal(null);
      setForm({ quantite: 1, motif: '' });
      setMouvError('');
    },
    onError: (err: any) => setMouvError(err?.response?.data?.message ?? 'Erreur'),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['stocks', page, search],
    queryFn: async () => {
      const { data } = await api.get('/stocks', {
        params: { page, limit, search: search || undefined },
      });
      return data;
    },
  });

  const { data: alertesData } = useQuery({
    queryKey: ['stocks-alertes'],
    queryFn: async () => {
      const { data } = await api.get('/stocks/alertes');
      return data;
    },
  });

  const articles: Article[] = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const enAlerte = alertesData?.length ?? articles.filter((a) => a.stockActuel < a.stockMinimum).length;
  const valeurTotale = articles.reduce((s, a) => s + (a.stockActuel ?? 0) * (a.prixUnitaire ?? 0), 0);

  const displayed = alertesOnly ? articles.filter((a) => a.stockActuel < a.stockMinimum) : articles;

  const columns: Column<Article>[] = [
    {
      key: 'reference', header: 'Référence',
      render: (r) => <span className="font-mono text-xs text-neutral-500">{r.reference}</span>,
    },
    {
      key: 'designation', header: 'Désignation',
      render: (r) => <span className="font-medium text-neutral-800">{r.designation}</span>,
    },
    {
      key: 'categorie', header: 'Catégorie',
      render: (r) => <span className="badge badge-neutral">{r.categorie}</span>,
    },
    {
      key: 'stockActuel', header: 'Stock actuel',
      render: (r) => {
        const alerte = r.stockActuel < r.stockMinimum;
        return (
          <span className={cn('font-bold', alerte ? 'text-red-600' : 'text-neutral-800')}>
            {r.stockActuel} {alerte && <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1 align-middle" />}
          </span>
        );
      },
    },
    {
      key: 'stockMinimum', header: 'Stock min.',
      render: (r) => <span className="text-neutral-500">{r.stockMinimum}</span>,
    },
    { key: 'unite', header: 'Unité' },
    {
      key: 'prixUnitaire', header: 'Prix unit.',
      render: (r) => <span className="text-xs">{fmtXOF(r.prixUnitaire)}</span>,
    },
    {
      key: 'alerte', header: 'Alerte',
      render: (r) => r.stockActuel < r.stockMinimum ? <AlertTriangle className="w-4 h-4 text-red-500" /> : null,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={() => { setMouvModal({ article: r, type: 'entree' }); setForm({ quantite: 1, motif: '' }); }}
            className="text-xs btn-primary py-1 px-2 flex items-center gap-1"
          >
            <ArrowDownCircle className="w-3 h-3" /> Entrée
          </button>
          <button
            onClick={() => { setMouvModal({ article: r, type: 'sortie' }); setForm({ quantite: 1, motif: '' }); }}
            className="text-xs btn-secondary py-1 px-2 flex items-center gap-1"
          >
            <ArrowUpCircle className="w-3 h-3" /> Sortie
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50">
          <Package className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">Stocks & Inventaire</h1>
          <p className="text-sm text-neutral-500">Gestion des articles et mouvements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titre="Total articles" valeur={isLoading ? '—' : total} icone={<Package className="w-5 h-5" />} couleur="blue" />
        <StatCard titre="En alerte" valeur={enAlerte} icone={<AlertTriangle className="w-5 h-5" />} couleur="red" description="Stock sous le minimum" />
        <StatCard titre="Valeur totale stock" valeur={fmtXOF(valeurTotale)} icone={<Package className="w-5 h-5" />} couleur="green" />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button
          onClick={() => setAlertesOnly((v) => !v)}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors', alertesOnly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300')}
        >
          <Bell className="w-4 h-4" />
          Alertes seulement {alertesOnly && `(${enAlerte})`}
        </button>
      </div>

      <DataTable columns={columns} data={displayed as unknown as Record<string, unknown>[]} isLoading={isLoading} />

      {total > limit && !alertesOnly && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <Modal
        open={!!mouvModal}
        onOpenChange={(o) => !o && setMouvModal(null)}
        title={mouvModal?.type === 'entree' ? 'Entrée de stock' : 'Sortie de stock'}
        description={mouvModal?.article.designation}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setMouvModal(null); setMouvError(''); }}>Annuler</button>
            <button
              className="btn-primary"
              disabled={mouvementMutation.isPending || form.quantite < 1}
              onClick={() => mouvModal && mouvementMutation.mutate({ article: mouvModal.article, type: mouvModal.type, quantite: form.quantite, motif: form.motif })}
            >
              {mouvementMutation.isPending ? 'Enregistrement…' : 'Confirmer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {mouvError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{mouvError}</p>}
          <div className="space-y-1">
            <label className="label">Quantité</label>
            <input
              type="number"
              className="input"
              min={1}
              value={form.quantite}
              onChange={(e) => setForm((f) => ({ ...f, quantite: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1">
            <label className="label">Motif</label>
            <input
              type="text"
              className="input"
              placeholder={mouvModal?.type === 'entree' ? 'Ex: Réception commande' : 'Ex: Distribution projet'}
              value={form.motif}
              onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}
            />
          </div>
          {mouvModal && (
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3 text-sm">
              <p className="text-neutral-500">Stock actuel : <span className="font-semibold text-neutral-800">{mouvModal.article.stockActuel} {mouvModal.article.unite}</span></p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
