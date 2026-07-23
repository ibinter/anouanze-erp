'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, TrendingUp, CheckCircle, XCircle, Clock, Plus, X, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toNum } from '@/lib/utils';

interface Transaction {
  id: string;
  reference?: string;
  montant: number | string;
  devise: string;
  description?: string;
  type: string;
  statut: string;
  payeur_email?: string;
  payeur_tel?: string;
  created_at: string;
}

interface PaiementStats {
  totalCollecte: number;
  nbTransactions: number;
  tauxSucces: number;
  parStatut: { statut: string; count: number; total: number }[];
}

const STATUT_COLORS: Record<string, string> = {
  SUCCES: 'bg-green-100 text-green-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  ECHEC: 'bg-red-100 text-red-700',
  ANNULE: 'bg-gray-100 text-gray-600',
};

const TYPE_IDS = ['DON', 'COTISATION', 'PRESTATION', 'REMBOURSEMENT'];

const STATUT_IDS = ['EN_ATTENTE', 'SUCCES', 'ECHEC', 'ANNULE'];

/**
 * Statut d'intégration réel de chaque passerelle — audité sur
 * apps/api/src/modules/paiements (contrôleur + service) :
 *  - DISPONIBLE  : initiation ET confirmation opérées de bout en bout
 *  - INTEGRATION : callback (webhook) implémenté, initiation encore manuelle
 *  - BIENTOT     : aucun code d'intégration côté API
 * Le cahier des charges IBIG SOFT interdit d'annoncer « disponible » une
 * intégration non opérationnelle : ne pas modifier sans changement côté API.
 */
type StatutIntegration = 'DISPONIBLE' | 'INTEGRATION' | 'BIENTOT';

const INTEGRATION_BADGES: Record<StatutIntegration, { className: string }> = {
  DISPONIBLE: { className: 'bg-green-100 text-green-700' },
  INTEGRATION: { className: 'bg-amber-100 text-amber-700' },
  BIENTOT: { className: 'bg-gray-100 text-gray-500' },
};

interface Operateur {
  id: string;
  label: string;
  initiales: string;
  pastille: string;
  integration: StatutIntegration;
  /** Clé de traduction du détail affiché sous le badge d'intégration. */
  detailKey: 'detailWebhook' | 'detailNonDemarre';
}

const OPERATEURS: Operateur[] = [
  {
    id: 'ORANGE_MONEY',
    label: 'Orange Money',
    initiales: 'OM',
    pastille: 'bg-orange-500',
    integration: 'INTEGRATION',
    detailKey: 'detailWebhook',
  },
  {
    id: 'CINETPAY',
    label: 'CinetPay',
    initiales: 'CP',
    pastille: 'bg-blue-600',
    integration: 'INTEGRATION',
    detailKey: 'detailWebhook',
  },
  {
    id: 'MTN_MOMO',
    label: 'MTN MoMo',
    initiales: 'MTN',
    pastille: 'bg-yellow-500',
    integration: 'BIENTOT',
    detailKey: 'detailNonDemarre',
  },
  {
    id: 'WAVE',
    label: 'Wave',
    initiales: 'W',
    pastille: 'bg-sky-500',
    integration: 'BIENTOT',
    detailKey: 'detailNonDemarre',
  },
];

const OPERATEURS_SELECTIONNABLES = OPERATEURS.filter((o) => o.integration !== 'BIENTOT');

export default function PaiementsPage() {
  const t = useTranslations('finance.paiements');
  const tc = useTranslations('finance.common');
  const qc = useQueryClient();

  const typeLabel = (type: string) => (TYPE_IDS.includes(type) ? t(`types.${type}`) : type);
  const statutLabel = (statut: string) => (STATUT_IDS.includes(statut) ? t(`statuts.${statut}`) : statut);

  const [showInitier, setShowInitier] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [form, setForm] = useState({ montant: '', devise: 'XOF', description: '', payeurEmail: '', payeurTel: '', type: 'DON', operateur: 'ORANGE_MONEY' });

  const { data: statsData } = useQuery<PaiementStats>({
    queryKey: ['paiements-stats'],
    queryFn: () => api.get('/paiements/stats').then((r: any) => r.data),
  });

  const { data: txData, isLoading, refetch } = useQuery<{ data: Transaction[]; total: number }>({
    queryKey: ['paiements-transactions', filtreStatut, filtreType],
    queryFn: () => api.get('/paiements/transactions', { params: { statut: filtreStatut || undefined, type: filtreType || undefined, limit: 50 } }).then((r: any) => r.data),
  });

  const initierPaiement = useMutation({
    mutationFn: (data: any) => api.post('/paiements/initier', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paiements-transactions'] });
      qc.invalidateQueries({ queryKey: ['paiements-stats'] });
      setShowInitier(false);
      setForm({ montant: '', devise: 'XOF', description: '', payeurEmail: '', payeurTel: '', type: 'DON', operateur: 'ORANGE_MONEY' });
    },
  });

  const transactions = txData?.data ?? [];
  const stats = statsData;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} aria-label={t('actions.refresh')} title={t('actions.refresh')} className="p-2 border border-gray-300 rounded-lg text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowInitier(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> {t('actions.initier')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.totalCollecte')}</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{(stats?.totalCollecte ?? 0).toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.transactions')}</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.nbTransactions ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.tauxSucces')}</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.tauxSucces ?? 0}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{t('kpi.enAttente')}</span>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.parStatut?.find(s => s.statut === 'EN_ATTENTE')?.count ?? 0}</p>
        </div>
      </div>

      {/* Opérateurs — statut d'intégration honnête (cf. audit API en tête de fichier) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {OPERATEURS.map(op => {
          const badge = INTEGRATION_BADGES[op.integration];
          return (
            <div key={op.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <span
                className={`w-9 h-9 shrink-0 rounded-full ${op.pastille} text-white text-[11px] font-bold flex items-center justify-center`}
                aria-hidden="true"
              >
                {op.initiales}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{op.label}</p>
                <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full ${badge.className}`}>
                  {t(`integration.${op.integration}`)}
                </span>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">{t(`operateurs.${op.detailKey}`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        {t.rich('avertissement', {
          b: (chunks) => <span className="font-semibold">{chunks}</span>,
        })}
      </p>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">{t('filtre.tousStatuts')}</option>
          <option value="EN_ATTENTE">{t('statuts.EN_ATTENTE')}</option>
          <option value="SUCCES">{t('statuts.SUCCES')}</option>
          <option value="ECHEC">{t('statuts.ECHEC')}</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
          <option value="">{t('filtre.tousTypes')}</option>
          <option value="DON">{t('types.DON')}</option>
          <option value="COTISATION">{t('types.COTISATION')}</option>
          <option value="PRESTATION">{t('types.PRESTATION')}</option>
        </select>
      </div>

      {/* Table transactions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{t('table.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">{t('table.reference')}</th>
                <th className="px-4 py-3 text-left">{t('table.description')}</th>
                <th className="px-4 py-3 text-left">{t('table.type')}</th>
                <th className="px-4 py-3 text-right">{t('table.montant')}</th>
                <th className="px-4 py-3 text-left">{t('table.statut')}</th>
                <th className="px-4 py-3 text-left">{t('table.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.reference ?? tx.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{tx.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{typeLabel(tx.type)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{toNum(tx.montant).toLocaleString('fr-FR')} {tx.devise}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_COLORS[tx.statut] ?? 'bg-gray-100 text-gray-600'}`}>{statutLabel(tx.statut)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Modal initier paiement */}
      {showInitier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('modal.title')}</h2>
              <button onClick={() => setShowInitier(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.montantPlaceholder')} value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.devise} onChange={e => setForm(f => ({ ...f, devise: e.target.value }))}>
                  <option value="XOF">{t('modal.deviseXof')}</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="DON">{t('types.DON')}</option>
                <option value="COTISATION">{t('types.COTISATION')}</option>
              </select>
              <div>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.operateur} onChange={e => setForm(f => ({ ...f, operateur: e.target.value }))}>
                  {OPERATEURS_SELECTIONNABLES.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.label} — {t(`integration.${op.integration}`)}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {t('modal.canalNote')}
                </p>
              </div>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.descriptionPlaceholder')} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.emailPlaceholder')} value={form.payeurEmail} onChange={e => setForm(f => ({ ...f, payeurEmail: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder={t('modal.telPlaceholder')} value={form.payeurTel} onChange={e => setForm(f => ({ ...f, payeurTel: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowInitier(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">{tc('cancel')}</button>
              <button
                onClick={() =>
                  // `operateur` est volontairement exclu : le DTO API le rejette
                  // (ValidationPipe forbidNonWhitelisted) tant que le routage passerelle n'existe pas.
                  initierPaiement.mutate({
                    montant: parseFloat(form.montant),
                    devise: form.devise,
                    description: form.description,
                    payeurEmail: form.payeurEmail,
                    payeurTel: form.payeurTel,
                    type: form.type,
                  })
                }
                disabled={!form.montant || !form.payeurTel || !form.payeurEmail || initierPaiement.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60"
              >
                {initierPaiement.isPending ? t('modal.sending') : t('modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
