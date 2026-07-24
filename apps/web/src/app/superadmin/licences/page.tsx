'use client';

import { useState } from 'react';
import { CreditCard, RefreshCw, X, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Plan {
  id: string;
  code: string;
  nom: string;
  description?: string | null;
  prixMensuel: string | number;
  prixAnnuel: string | number;
  maxUtilisateurs: number | null;
  modulesInclus: string[];
  surDevis: boolean;
  ordre: number;
  actif: boolean;
}

interface Abonnement {
  id: string;
  periodicite: 'MENSUELLE' | 'ANNUELLE';
  dateDebut: string;
  dateFin: string;
  statut: string;
  montant: string | number;
  renouvellementAuto: boolean;
  plan: Plan;
  organisation: { id: string; nom: string; slug: string; statutAbonnement: string };
}

interface Statistiques {
  mrr: number;
  arr: number;
  abonnementsActifs: number;
  organisationsTotal: number;
  organisationsEnEssai: number;
  facturesImpayees: number;
  parPlan: Record<string, { nom: string; abonnements: number; mrr: number }>;
}

const num = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fcfa = (v: string | number | null | undefined) =>
  `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num(v))} FCFA`;

const dateFr = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString('fr-FR') : '—';

const STATUT_COLORS: Record<string, string> = {
  ACTIF: 'bg-green-100 text-green-700',
  ESSAI: 'bg-orange-100 text-orange-700',
  SUSPENDU: 'bg-red-100 text-red-700',
  EXPIRE: 'bg-gray-100 text-gray-500',
};

export default function SuperAdminLicencesPage() {
  const qc = useQueryClient();
  const [planEdite, setPlanEdite] = useState<Plan | null>(null);
  const [prixMensuel, setPrixMensuel] = useState('0');
  const [prixAnnuel, setPrixAnnuel] = useState('0');
  const [maxUtilisateurs, setMaxUtilisateurs] = useState('');

  const { data: stats, refetch: refetchStats } = useQuery<Statistiques>({
    queryKey: ['sa-abonnements-stats'],
    queryFn: () => api.get('/abonnements/statistiques').then((r) => r.data as Statistiques),
  });

  const { data: plans = [], isLoading: chargePlans } = useQuery<Plan[]>({
    queryKey: ['sa-plans'],
    queryFn: () => api.get('/abonnements/plans', { params: { tous: 'true' } }).then((r) => r.data as Plan[]),
  });

  const { data: abonnements = [], isLoading: chargeAbos } = useQuery<Abonnement[]>({
    queryKey: ['sa-abonnements'],
    queryFn: () => api.get('/abonnements').then((r) => r.data as Abonnement[]),
  });

  const majPlan = useMutation({
    mutationFn: (p: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/abonnements/plans/${p.id}`, p.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-plans'] });
      qc.invalidateQueries({ queryKey: ['sa-abonnements-stats'] });
      setPlanEdite(null);
    },
  });

  const genererFacture = useMutation({
    mutationFn: (id: string) => api.post(`/abonnements/${id}/factures`, { emettre: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-abonnements-stats'] });
    },
  });

  function ouvrirEdition(p: Plan) {
    setPlanEdite(p);
    setPrixMensuel(String(num(p.prixMensuel)));
    setPrixAnnuel(String(num(p.prixAnnuel)));
    setMaxUtilisateurs(p.maxUtilisateurs === null ? '' : String(p.maxUtilisateurs));
  }

  const kpis = [
    { label: 'MRR réel', value: fcfa(stats?.mrr ?? 0), icon: TrendingUp, color: 'text-green-600' },
    { label: 'ARR réel', value: fcfa(stats?.arr ?? 0), icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'Abonnements actifs', value: stats?.abonnementsActifs ?? 0, icon: CreditCard, color: 'text-primary' },
    { label: 'Organisations en essai', value: stats?.organisationsEnEssai ?? 0, icon: CreditCard, color: 'text-orange-500' },
    { label: 'Factures impayées', value: stats?.facturesImpayees ?? 0, icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Licences &amp; abonnements</h1>
          <p className="text-gray-500 text-sm">
            {stats?.organisationsTotal ?? 0} organisation{(stats?.organisationsTotal ?? 0) > 1 ? 's' : ''} · MRR calculé depuis les abonnements réels
          </p>
        </div>
        <button
          onClick={() => { refetchStats(); qc.invalidateQueries({ queryKey: ['sa-abonnements'] }); }}
          className="p-2 border border-gray-300 rounded-lg text-gray-500"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Catalogue des formules */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Catalogue des formules</h2>
          <p className="text-xs text-gray-500">Source de vérité des tarifs facturés.</p>
        </div>
        {chargePlans ? (
          <div className="p-6 space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Formule</th>
                  <th className="px-4 py-3 text-left">Mensuel</th>
                  <th className="px-4 py-3 text-left">Annuel</th>
                  <th className="px-4 py-3 text-left">Utilisateurs</th>
                  <th className="px-4 py-3 text-left">Abonnements</th>
                  <th className="px-4 py-3 text-left">MRR</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((p) => {
                  const agg = stats?.parPlan?.[p.code];
                  return (
                    <tr key={p.id} className={p.actif ? 'hover:bg-gray-50' : 'opacity-50 hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.nom} <span className="text-xs text-gray-400">{p.code}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.surDevis ? 'Sur devis' : fcfa(p.prixMensuel)}</td>
                      <td className="px-4 py-3 text-gray-600">{p.surDevis ? 'Sur devis' : fcfa(p.prixAnnuel)}</td>
                      <td className="px-4 py-3 text-gray-600">{p.maxUtilisateurs ?? '∞'}</td>
                      <td className="px-4 py-3 text-gray-600">{agg?.abonnements ?? 0}</td>
                      <td className="px-4 py-3 text-gray-600">{fcfa(Math.round(agg?.mrr ?? 0))}</td>
                      <td className="px-4 py-3 flex gap-3">
                        <button onClick={() => ouvrirEdition(p)} className="text-xs text-primary hover:underline">Modifier</button>
                        <button
                          onClick={() => majPlan.mutate({ id: p.id, body: { actif: !p.actif } })}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          {p.actif ? 'Désactiver' : 'Réactiver'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Abonnements souscrits */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Abonnements souscrits</h2>
        </div>
        {chargeAbos ? (
          <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : abonnements.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">Aucun abonnement enregistré.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Organisation</th>
                  <th className="px-4 py-3 text-left">Formule</th>
                  <th className="px-4 py-3 text-left">Périodicité</th>
                  <th className="px-4 py-3 text-left">Montant</th>
                  <th className="px-4 py-3 text-left">Échéance</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {abonnements.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{a.organisation.nom}</td>
                    <td className="px-4 py-3 text-gray-600">{a.plan.nom}</td>
                    <td className="px-4 py-3 text-gray-600">{a.periodicite === 'ANNUELLE' ? 'Annuelle' : 'Mensuelle'}</td>
                    <td className="px-4 py-3 text-gray-600">{fcfa(a.montant)}</td>
                    <td className="px-4 py-3 text-gray-500">{dateFr(a.dateFin)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUT_COLORS[a.statut] ?? 'bg-gray-100 text-gray-600'}`}>{a.statut}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => genererFacture.mutate(a.id)}
                        disabled={genererFacture.isPending}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-60"
                      >
                        <FileText className="w-3.5 h-3.5" /> Générer la facture
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Paiement en ligne des factures et relance automatique des impayés : bientôt disponible. Le règlement s&apos;effectue
        aujourd&apos;hui hors application.
      </p>

      {planEdite && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{planEdite.nom}</h2>
              <button onClick={() => setPlanEdite(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-4">
              <label className="block text-sm">
                <span className="text-gray-500 text-xs">Prix mensuel (FCFA)</span>
                <input type="number" min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={prixMensuel} onChange={(e) => setPrixMensuel(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="text-gray-500 text-xs">Prix annuel (FCFA)</span>
                <input type="number" min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={prixAnnuel} onChange={(e) => setPrixAnnuel(e.target.value)} />
              </label>
              <label className="block text-sm">
                <span className="text-gray-500 text-xs">Utilisateurs inclus (vide = illimité)</span>
                <input type="number" min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" value={maxUtilisateurs} onChange={(e) => setMaxUtilisateurs(e.target.value)} />
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPlanEdite(null)} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Annuler</button>
              <button
                onClick={() =>
                  majPlan.mutate({
                    id: planEdite.id,
                    body: {
                      prixMensuel: Number(prixMensuel) || 0,
                      prixAnnuel: Number(prixAnnuel) || 0,
                      ...(maxUtilisateurs.trim() === '' ? {} : { maxUtilisateurs: Number(maxUtilisateurs) }),
                    },
                  })
                }
                disabled={majPlan.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60"
              >
                {majPlan.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
