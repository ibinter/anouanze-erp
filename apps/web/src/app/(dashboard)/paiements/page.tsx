'use client';

import { useState } from 'react';
import { CreditCard, TrendingUp, CheckCircle, XCircle, Clock, Plus, X, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Transaction {
  id: string;
  reference?: string;
  montant: number;
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

const OPERATEURS = [
  { id: 'ORANGE_MONEY', label: 'Orange Money', color: 'bg-orange-500', img: '🟠' },
  { id: 'MTN_MOMO', label: 'MTN MoMo', color: 'bg-yellow-500', img: '🟡' },
  { id: 'CINETPAY', label: 'CinetPay', color: 'bg-blue-600', img: '🔵' },
  { id: 'WAVE', label: 'Wave', color: 'bg-blue-400', img: '💙' },
];

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

      {/* Opérateurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {OPERATEURS.map(op => (
          <div key={op.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{op.img}</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{op.label}</p>
              <p className="text-xs text-gray-400">Intégré</p>
            </div>
          </div>
        ))}
      </div>

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
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{tx.montant.toLocaleString('fr-FR')} {tx.devise}</td>
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
                <option value="PRESTATION">Prestation</option>
              </select>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.operateur} onChange={e => setForm(f => ({ ...f, operateur: e.target.value }))}>
                {OPERATEURS.map(op => <option key={op.id} value={op.id}>{op.img} {op.label}</option>)}
              </select>
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Email du payeur" value={form.payeurEmail} onChange={e => setForm(f => ({ ...f, payeurEmail: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Téléphone du payeur *" value={form.payeurTel} onChange={e => setForm(f => ({ ...f, payeurTel: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowInitier(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button
                onClick={() => initierPaiement.mutate({ ...form, montant: parseFloat(form.montant) })}
                disabled={!form.montant || !form.payeurTel || initierPaiement.isPending}
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
