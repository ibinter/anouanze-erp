'use client';

import { useState } from 'react';
import { CreditCard, Search, RefreshCw, Plus, X, TrendingUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Licence {
  id: string;
  nom: string;
  planActuel?: string;
  dateFinLicence?: string;
  statutLicence?: string;
  renouvellementAuto?: boolean;
  maxUtilisateurs?: number;
  _count?: { utilisateurs: number };
}

const PLAN_COLORS: Record<string, string> = {
  ESSENTIEL: 'bg-gray-100 text-gray-700',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-yellow-100 text-yellow-700',
};

const STATUT_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ESSAI: 'bg-orange-100 text-orange-700',
  SUSPENDUE: 'bg-red-100 text-red-700',
  EXPIREE: 'bg-gray-100 text-gray-500',
};

const PLAN_PRIX: Record<string, number> = {
  ESSENTIEL: 12900,
  STARTER: 29900,
  PRO: 59900,
  ENTERPRISE: 0,
};

export default function SuperAdminLicencesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState('PRO');

  const { data, isLoading, refetch } = useQuery<{ data: Licence[]; total: number }>({
    queryKey: ['sa-licences', search],
    queryFn: () => api.get('/organisations', { params: { search: search || undefined, limit: 100 } }).then((r: any) => r.data),
  });

  const updateLicence = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      api.patch(`/organisations/${id}`, { planActuel: plan }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-licences'] }); setShowModal(null); },
  });

  const orgs = data?.data ?? [];
  const mrr = orgs.reduce((sum, o) => sum + (PLAN_PRIX[o.planActuel ?? 'ESSENTIEL'] ?? 0), 0);
  const actives = orgs.filter(o => o.statutLicence === 'ACTIVE' || !o.statutLicence).length;
  const essais = orgs.filter(o => o.statutLicence === 'ESSAI').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Licences</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} organisation{(data?.total ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => refetch()} className="p-2 border border-gray-300 rounded-lg text-gray-500"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'MRR estimé', value: `${mrr.toLocaleString('fr-FR')} FCFA`, icon: TrendingUp, color: 'text-green-600' },
          { label: 'Licences actives', value: actives, icon: CreditCard, color: 'text-primary' },
          { label: 'En essai', value: essais, icon: CreditCard, color: 'text-orange-500' },
          { label: 'Total orgs', value: data?.total ?? 0, icon: CreditCard, color: 'text-blue-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Organisation</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Expiration</th>
                <th className="px-4 py-3 text-left">Utilisateurs</th>
                <th className="px-4 py-3 text-left">MRR</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgs.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{o.nom}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLORS[o.planActuel ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>{o.planActuel ?? 'ESSENTIEL'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_COLORS[o.statutLicence ?? ''] ?? 'bg-green-100 text-green-700'}`}>{o.statutLicence ?? 'ACTIVE'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{o.dateFinLicence ? new Date(o.dateFinLicence).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{o._count?.utilisateurs ?? 0} / {o.maxUtilisateurs ?? '∞'}</td>
                  <td className="px-4 py-3 text-gray-600">{(PLAN_PRIX[o.planActuel ?? ''] ?? 0).toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setShowModal(o.id); setNewPlan(o.planActuel ?? 'PRO'); }} className="text-xs text-primary hover:underline">Modifier plan</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Modifier le plan</h2>
              <button onClick={() => setShowModal(null)}><X className="w-5 h-5" /></button>
            </div>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4" value={newPlan} onChange={e => setNewPlan(e.target.value)}>
              <option value="ESSENTIEL">Essentiel — 12 900 FCFA/mois</option>
              <option value="STARTER">Starter — 29 900 FCFA/mois</option>
              <option value="PRO">Pro — 59 900 FCFA/mois</option>
              <option value="ENTERPRISE">Enterprise — Sur devis</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button onClick={() => updateLicence.mutate({ id: showModal, plan: newPlan })} disabled={updateLicence.isPending} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60">
                {updateLicence.isPending ? 'Mise à jour...' : 'Appliquer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
