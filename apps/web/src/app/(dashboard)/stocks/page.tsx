'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Package, AlertTriangle, Search, ArrowDownCircle, ArrowUpCircle, Bell, Boxes, Wallet } from 'lucide-react';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Pagination } from '@/components/ui/Pagination';
import { cn, toNum, formatMontant } from '@/lib/utils';

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

function estEnAlerte(a: Article) {
  return toNum(a.stockActuel) < toNum(a.stockMinimum);
}

export default function StocksPage() {
  const t = useTranslations('finance.stocks');
  const tc = useTranslations('finance.common');
  const [search, setSearch] = useState('');
  const [alertesOnly, setAlertesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [mouvModal, setMouvModal] = useState<{ article: Article; type: MouvType } | null>(null);
  const [detail, setDetail] = useState<Article | null>(null);
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
    onError: (err: any) => setMouvError(err?.response?.data?.message ?? tc('error')),
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
  const enAlerte = alertesData?.length ?? articles.filter(estEnAlerte).length;
  const valeurTotale = articles.reduce((s, a) => s + toNum(a.stockActuel) * toNum(a.prixUnitaire), 0);

  const displayed = alertesOnly ? articles.filter(estEnAlerte) : articles;

  const columns: Column<Article>[] = [
    {
      key: 'reference', header: t('colonnes.reference'),
      render: (r) => <span className="font-mono text-xs text-neutral-500">{r.reference}</span>,
    },
    {
      key: 'designation', header: t('colonnes.designation'),
      render: (r) => <span className="font-medium text-neutral-800">{r.designation}</span>,
    },
    {
      key: 'categorie', header: t('colonnes.categorie'),
      render: (r) => <span className="badge badge-neutral">{r.categorie}</span>,
    },
    {
      key: 'stockActuel', header: t('colonnes.stockActuel'),
      render: (r) => {
        const alerte = estEnAlerte(r);
        return (
          <span className={cn('inline-flex items-center gap-1.5 font-bold', alerte ? 'text-red-600' : 'text-neutral-800')}>
            {toNum(r.stockActuel)}
            {alerte && <span className="badge badge-error">{t('badgeBas')}</span>}
          </span>
        );
      },
    },
    {
      key: 'stockMinimum', header: t('colonnes.stockMin'),
      render: (r) => <span className="text-neutral-500">{toNum(r.stockMinimum)}</span>,
    },
    { key: 'unite', header: t('colonnes.unite') },
    {
      key: 'prixUnitaire', header: t('colonnes.prixUnit'),
      render: (r) => <span className="text-xs">{formatMontant(r.prixUnitaire)}</span>,
    },
    {
      key: 'valeur', header: t('colonnes.valeur'),
      render: (r) => <span className="text-xs font-semibold text-neutral-700">{formatMontant(toNum(r.stockActuel) * toNum(r.prixUnitaire))}</span>,
    },
    {
      key: 'alerte', header: t('colonnes.alerte'),
      render: (r) => estEnAlerte(r) ? <AlertTriangle className="w-4 h-4 text-red-500" /> : null,
    },
    {
      key: 'actions', header: '',
      render: (r) => (
        <div className="flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); setMouvModal({ article: r, type: 'entree' }); setForm({ quantite: 1, motif: '' }); }}
            className="text-xs btn-primary py-1 px-2 flex items-center gap-1"
          >
            <ArrowDownCircle className="w-3 h-3" /> {t('actions.entree')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setMouvModal({ article: r, type: 'sortie' }); setForm({ quantite: 1, motif: '' }); }}
            className="text-xs btn-secondary py-1 px-2 flex items-center gap-1"
          >
            <ArrowUpCircle className="w-3 h-3" /> {t('actions.sortie')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary-50">
          <Package className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">{t('title')}</h1>
          <p className="text-sm text-neutral-500">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard titre={t('kpi.totalArticles')} valeur={isLoading ? '—' : total} icone={<Boxes className="w-5 h-5" />} couleur="blue" description={t('kpi.totalArticlesDesc')} />
        <StatCard titre={t('kpi.enAlerte')} valeur={enAlerte} icone={<AlertTriangle className="w-5 h-5" />} couleur="red" description={t('kpi.enAlerteDesc')} />
        <StatCard titre={t('kpi.valeurTotale')} valeur={formatMontant(valeurTotale)} icone={<Wallet className="w-5 h-5" />} couleur="green" description={t('kpi.valeurTotaleDesc')} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            className="input pl-9"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <button
          onClick={() => setAlertesOnly((v) => !v)}
          className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors', alertesOnly ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300')}
        >
          <Bell className="w-4 h-4" />
          {t('alertesSeulement')} {alertesOnly && `(${enAlerte})`}
        </button>
      </div>

      <DataTable columns={columns} data={displayed as unknown as Record<string, unknown>[]} isLoading={isLoading} onRowClick={(r) => setDetail(r as Article)} />

      {total > limit && !alertesOnly && (
        <Pagination total={total} page={page} limit={limit} onChange={setPage} />
      )}

      <Modal
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.designation ?? ''}
        description={detail?.reference}
      >
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.categorie')}</p>
                <p className="mt-1"><span className="badge badge-neutral">{detail.categorie}</span></p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.stockActuel')}</p>
                <p className={cn('mt-1 font-bold', estEnAlerte(detail) ? 'text-red-600' : 'text-neutral-800')}>
                  {toNum(detail.stockActuel)} {detail.unite}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.stockMinimum')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{toNum(detail.stockMinimum)} {detail.unite}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <p className="text-xs text-neutral-500">{t('detail.prixUnitaire')}</p>
                <p className="mt-1 font-semibold text-neutral-800">{formatMontant(detail.prixUnitaire)}</p>
              </div>
            </div>
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-primary-700">{t('detail.valeurStock')}</span>
              <span className="text-lg font-bold text-primary-700">{formatMontant(toNum(detail.stockActuel) * toNum(detail.prixUnitaire))}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setMouvModal({ article: detail, type: 'entree' }); setForm({ quantite: 1, motif: '' }); setDetail(null); }}
                className="btn-primary flex-1 flex items-center justify-center gap-1"
              >
                <ArrowDownCircle className="w-4 h-4" /> {t('actions.entree')}
              </button>
              <button
                onClick={() => { setMouvModal({ article: detail, type: 'sortie' }); setForm({ quantite: 1, motif: '' }); setDetail(null); }}
                className="btn-secondary flex-1 flex items-center justify-center gap-1"
              >
                <ArrowUpCircle className="w-4 h-4" /> {t('actions.sortie')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!mouvModal}
        onOpenChange={(o) => !o && setMouvModal(null)}
        title={mouvModal?.type === 'entree' ? t('modal.entreeTitle') : t('modal.sortieTitle')}
        description={mouvModal?.article.designation}
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setMouvModal(null); setMouvError(''); }}>{tc('cancel')}</button>
            <button
              className="btn-primary"
              disabled={mouvementMutation.isPending || form.quantite < 1}
              onClick={() => mouvModal && mouvementMutation.mutate({ article: mouvModal.article, type: mouvModal.type, quantite: form.quantite, motif: form.motif })}
            >
              {mouvementMutation.isPending ? tc('saving') : t('modal.confirmer')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {mouvError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{mouvError}</p>}
          <div className="space-y-1">
            <label className="label">{t('modal.quantite')}</label>
            <input
              type="number"
              className="input"
              min={1}
              value={form.quantite}
              onChange={(e) => setForm((f) => ({ ...f, quantite: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1">
            <label className="label">{t('modal.motif')}</label>
            <input
              type="text"
              className="input"
              placeholder={mouvModal?.type === 'entree' ? t('modal.motifEntreePlaceholder') : t('modal.motifSortiePlaceholder')}
              value={form.motif}
              onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))}
            />
          </div>
          {mouvModal && (
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 p-3 text-sm">
              <p className="text-neutral-500">{t('modal.stockActuel')} <span className="font-semibold text-neutral-800">{mouvModal.article.stockActuel} {mouvModal.article.unite}</span></p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
