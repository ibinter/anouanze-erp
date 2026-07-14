'use client';

import { useState } from 'react';
import { Building2, Search, Plus, RefreshCw, Shield, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Organisation {
  id: string;
  nom: string;
  email?: string;
  pays?: string;
  plan?: string;
  statut?: string;
  createdAt: string;
  _count?: { utilisateurs: number };
}

const PLAN_COLORS: Record<string, string> = {
  ESSENTIEL: 'bg-gray-100 text-gray-700',
  STARTER: 'bg-blue-100 text-blue-700',
  PRO: 'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-yellow-100 text-yellow-700',
};

export default function SuperAdminOrganisationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nom: '', email: '', pays: 'CI', telephone: '' });

  const { data, isLoading, refetch } = useQuery<{ data: Organisation[]; total: number }>({
    queryKey: ['sa-organisations', search],
    queryFn: () => api.get('/organisations', { params: { search: search || undefined, limit: 50 } }).then((r: any) => r.data),
  });

  const createOrg = useMutation({
    mutationFn: (d: any) => api.post('/organisations', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sa-organisations'] }); setShowCreate(false); setForm({ nom: '', email: '', pays: 'CI', telephone: '' }); },
  });

  const suspendOrg = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) => api.patch(`/organisations/${id}`, { statut }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-organisations'] }),
  });

  const orgs = data?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} organisation{(data?.total ?? 0) > 1 ? 's' : ''} enregistrée{(data?.total ?? 0) > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 border border-gray-300 rounded-lg text-gray-500"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm"><Plus className="w-4 h-4" /> Nouvelle</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Rechercher une organisation..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : orgs.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{search ? `Aucun résultat pour "${search}"` : 'Aucune organisation'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Organisation</th>
                <th className="px-4 py-3 text-left">Pays</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Utilisateurs</th>
                <th className="px-4 py-3 text-left">Inscrite le</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orgs.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{o.nom}</p>
                    {o.email && <p className="text-xs text-gray-400">{o.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.pays ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLORS[o.plan ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>{o.plan ?? 'Essentiel'}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o._count?.utilisateurs ?? 0}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => suspendOrg.mutate({ id: o.id, statut: o.statut === 'SUSPENDU' ? 'ACTIF' : 'SUSPENDU' })}
                      className={`text-xs px-2 py-1 rounded ${o.statut === 'SUSPENDU' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                    >
                      {o.statut === 'SUSPENDU' ? 'Réactiver' : 'Suspendre'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nouvelle organisation</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Téléphone" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={form.pays} onChange={e => setForm(f => ({ ...f, pays: e.target.value }))}>
                <option value="CI">Côte d'Ivoire</option>
                <option value="SN">Sénégal</option>
                <option value="ML">Mali</option>
                <option value="BF">Burkina Faso</option>
                <option value="GN">Guinée</option>
                <option value="TG">Togo</option>
                <option value="BJ">Bénin</option>
                <option value="CM">Cameroun</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowCreate(false)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button onClick={() => createOrg.mutate(form)} disabled={!form.nom || createOrg.isPending} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60">
                {createOrg.isPending ? 'Création...' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
