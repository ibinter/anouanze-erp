'use client';

import { useQuery } from '@tanstack/react-query';
import { DashboardCharts } from './DashboardCharts';
import { Users, FolderOpen, Wallet, HandHeart, AlertTriangle, Loader2 } from 'lucide-react';
import { formatMontant } from '@/lib/utils';
import { api } from '@/lib/api';

interface TableauBord {
  membresActifs: number;
  projetsEnCours: number;
  soldeTresorerie: number;
  totalDonsMois: number;
  budgetPrevu: number;
  budgetRealise: number;
  alertesBudgets: { nom: string; taux: number }[];
  cotisationsEnRetard: { id: string; montant: number }[];
  prochainEvenement?: { nom: string; date: string };
}

function KpiCard({
  titre,
  valeur,
  unite,
  format,
  icon: Icon,
  gradient,
  loading,
}: {
  titre: string;
  valeur: number;
  unite?: string;
  format?: string;
  icon: React.ElementType;
  gradient: string;
  loading?: boolean;
}) {
  const display = format === 'montant' ? formatMontant(valeur) : String(valeur);
  return (
    <div className="stat-card group relative overflow-hidden">
      {/* halo décoratif */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`} />
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mt-4">{titre}</p>
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-neutral-300 mt-1.5" />
      ) : (
        <p className="text-2xl font-bold text-neutral-800 mt-1 leading-tight">{display}</p>
      )}
      {unite && !loading && <p className="text-xs text-neutral-400 mt-0.5">{unite}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<TableauBord>({
    queryKey: ['tableau-bord'],
    queryFn: async () => {
      const { data } = await api.get('/reporting/tableau-bord');
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const kpis = [
    {
      titre: 'Membres actifs',
      valeur: data?.membresActifs ?? 0,
      unite: 'membres',
      icon: Users,
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      titre: 'Projets en cours',
      valeur: data?.projetsEnCours ?? 0,
      unite: 'projets',
      icon: FolderOpen,
      gradient: 'from-accent-400 to-accent-600',
    },
    {
      titre: 'Trésorerie',
      valeur: data?.soldeTresorerie ?? 0,
      format: 'montant',
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-700',
    },
    {
      titre: 'Dons ce mois',
      valeur: data?.totalDonsMois ?? 0,
      format: 'montant',
      icon: HandHeart,
      gradient: 'from-rose-400 to-pink-600',
    },
  ];

  const alertes = [
    ...(data?.alertesBudgets ?? []).map((b) => ({
      message: `Budget "${b.nom}" dépassé à ${b.taux}%`,
      niveau: b.taux >= 100 ? 'error' : 'warning',
    })),
    ...(data?.cotisationsEnRetard?.length
      ? [{ message: `${data.cotisationsEnRetard.length} cotisation(s) en retard`, niveau: 'warning' }]
      : []),
  ] as { message: string; niveau: 'error' | 'warning' }[];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Bannière de bienvenue */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600 p-6 sm:p-7 text-white shadow-card">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute right-16 -bottom-12 w-40 h-40 rounded-full bg-accent-400/20" />
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-primary-100 mt-1">Vue d&apos;ensemble de votre organisation en temps réel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.titre} {...kpi} loading={isLoading} />
        ))}
      </div>

      <DashboardCharts />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget */}
        {!isLoading && data && (
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary-600" />
              <h2 className="font-semibold text-neutral-800">Budget {new Date().getFullYear()}</h2>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-neutral-500">Réalisé</span>
                <span className="font-medium">
                  {formatMontant(data.budgetRealise)} / {formatMontant(data.budgetPrevu)}
                </span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    data.budgetPrevu > 0 && data.budgetRealise / data.budgetPrevu > 0.9
                      ? 'bg-amber-400'
                      : 'bg-primary-500'
                  }`}
                  style={{
                    width: `${Math.min(100, data.budgetPrevu > 0 ? (data.budgetRealise / data.budgetPrevu) * 100 : 0)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {data.budgetPrevu > 0
                  ? `${Math.round((data.budgetRealise / data.budgetPrevu) * 100)}% exécuté`
                  : 'Aucun budget défini'}
              </p>
            </div>
          </div>
        )}

        {/* Alertes */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-neutral-800">Alertes critiques</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Chargement...
            </div>
          ) : alertes.length === 0 ? (
            <p className="text-sm text-green-600 font-medium">✓ Aucune alerte critique</p>
          ) : (
            <ul className="space-y-3">
              {alertes.map((a, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                    a.niveau === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  {a.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
