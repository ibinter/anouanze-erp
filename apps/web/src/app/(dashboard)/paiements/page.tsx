'use client';

import { useState } from 'react';
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

const TYPE_LABELS: Record<string, string> = {
  DON: 'Don',
  COTISATION: 'Cotisation',
  PRESTATION: 'Prestation',
  REMBOURSEMENT: 'Remboursement',
};

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

const INTEGRATION_BADGES: Record<StatutIntegration, { label: string; className: string }> = {
  DISPONIBLE: { label: 'Disponible', className: 'bg-green-100 text-green-700' },
  INTEGRATION: { label: 'En intégration', className: 'bg-amber-100 text-amber-700' },
  BIENTOT: { label: 'Bientôt disponible', className: 'bg-gray-100 text-gray-500' },
};

interface Operateur {
  id: string;
  label: string;
  initiales: string;
  pastille: string;
  integration: StatutIntegration;
  detail: string;
}

const OPERATEURS: Operateur[] = [
  {
    id: 'ORANGE_MONEY',
    label: 'Orange Money',
    initiales: 'OM',
    pastille: 'bg-orange-500',
    integration: 'INTEGRATION',
    detail: 'Webhook de confirmation actif — initiation à finaliser',
  },
  {
    id: 'CINETPAY',
    label: 'CinetPay',
    initiales: 'CP',
    pastille: 'bg-blue-600',
    integration: 'INTEGRATION',
    detail: 'Webhook de confirmation actif — initiation à finaliser',
  },
  {
    id: 'MTN_MOMO',
    label: 'MTN MoMo',
    initiales: 'MTN',
    pastille: 'bg-yellow-500',
    integration: 'BIENTOT',
    detail: 'Intégration non démarrée',
  },
  {
    id: 'WAVE',
    label: 'Wave',
    initiales: 'W',
    pastille: 'bg-sky-500',
    integration: 'BIENTOT',
    detail: 'Intégration non démarrée',
  },
];

const OPERATEURS_SELECTIONNABLES = OPERATEURS.filter((o) => o.integration !== 'BIENTOT');

export default function PaiementsPage() {
  const qc = useQueryClient();
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
          <h1 className="text-2xl font-bold text-gray-900">Paiements Mobile</h1>
          <p className="text-gray-500 text-sm mt-1">Orange Money, MTN MoMo, CinetPay, Wave</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 border border-gray-300 rounded-lg text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowInitier(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Initier un paiement
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Total collecté</span>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{(stats?.totalCollecte ?? 0).toLocaleString('fr-FR')} FCFA</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Transactions</span>
            <CreditCard className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.nbTransactions ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Taux de succès</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{stats?.tauxSucces ?? 0}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">En attente</span>
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
                  {badge.label}
                </span>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">{op.detail}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
        Aucune passerelle n&apos;est encore en collecte automatique de bout en bout : un paiement initié
        ici est enregistré au statut <span className="font-semibold">En attente</span> et n&apos;est
        confirmé qu&apos;à réception du webhook de l&apos;opérateur.
      </p>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="SUCCES">Succès</option>
          <option value="ECHEC">Échec</option>
        </select>
        <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
          <option value="">Tous les types</option>
          <option value="DON">Don</option>
          <option value="COTISATION">Cotisation</option>
          <option value="PRESTATION">Prestation</option>
        </select>
      </div>

      {/* Table transactions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Aucune transaction</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Référence</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{tx.reference ?? tx.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{tx.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{TYPE_LABELS[tx.type] ?? tx.type}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{toNum(tx.montant).toLocaleString('fr-FR')} {tx.devise}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_COLORS[tx.statut] ?? 'bg-gray-100 text-gray-600'}`}>{tx.statut}</span>
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
              <h2 className="text-lg font-bold">Initier un paiement</h2>
              <button onClick={() => setShowInitier(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Montant *" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} />
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.devise} onChange={e => setForm(f => ({ ...f, devise: e.target.value }))}>
                  <option value="XOF">FCFA (XOF)</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="DON">Don</option>
                <option value="COTISATION">Cotisation</option>
              </select>
              <div>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.operateur} onChange={e => setForm(f => ({ ...f, operateur: e.target.value }))}>
                  {OPERATEURS_SELECTIONNABLES.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.label} — {INTEGRATION_BADGES[op.integration].label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Canal indicatif : seuls les opérateurs dont le webhook de confirmation est actif
                  sont proposés. Le routage automatique vers la passerelle n&apos;est pas encore actif.
                </p>
              </div>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Email du payeur *" value={form.payeurEmail} onChange={e => setForm(f => ({ ...f, payeurEmail: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Téléphone du payeur *" value={form.payeurTel} onChange={e => setForm(f => ({ ...f, payeurTel: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowInitier(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
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
                {initierPaiement.isPending ? 'Envoi...' : 'Initier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
