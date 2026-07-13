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
  couleur,
  bg,
  loading,
}: {
  titre: string;
  valeur: number;
  unite?: string;
  format?: string;
  icon: React.ElementType;
  couleur: string;
  bg: string;
  loading?: boolean;
}) {
  const display = format === 'montant' ? formatMontant(valeur) : String(valeur);
  return (
    <div className="stat-card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg} shrink-0`}>
        <Icon className={`w-6 h-6 ${couleur}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{titre}</p>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-neutral-300 mt-1" />
        ) : (
          <p className={`text-2xl font-bold ${couleur}`}>{display}</p>
        )}
        {unite && !loading && <p className="text-xs text-neutral-400">{unite}</p>}
      </div>
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
      couleur: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      titre: 'Projets en cours',
      valeur: data?.projetsEnCours ?? 0,
      unite: 'projets',
      icon: FolderOpen,
      couleur: 'text-accent-400',
      bg: 'bg-orange-50',
    },
    {
      titre: 'Trésorerie',
      valeur: data?.soldeTresorerie ?? 0,
      format: 'montant',
      icon: Wallet,
      couleur: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      titre: 'Dons ce mois',
      valeur: data?.totalDonsMois ?? 0,
      format: 'montant',
      icon: HandHeart,
      couleur: 'text-accent-400',
      bg: 'bg-orange-50',
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
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Tableau de bord</h1>
        <p className="text-sm text-neutral-500 mt-1">Vue d&apos;ensemble de votre organisation</p>
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
          <div className="card space-y-3">
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
        <div className="card space-y-4">
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
