'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { toNum } from '@/lib/utils';

interface EvolutionDepense {
  periode: string;
  mois: string;
  annee: number;
  montant: number;
}

interface RepartitionSecteur {
  secteur: string;
  libelle: string;
  montant: number;
  pourcentage: number;
}

const COLORS = ['#146C43', '#F28C25', '#2563EB', '#7C3AED', '#0891B2', '#DB2777', '#65A30D'];

const NB_MOIS = 6;

function formatK(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

function formatXOF(value: number) {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value);
}

const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '12px',
};

function ChartSkeleton() {
  return (
    <div className="h-[240px] flex items-end gap-3 px-2 pb-2">
      {[55, 80, 40, 95, 65, 75].map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-neutral-100 animate-pulse"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

function EmptyChart({ icone, message }: { icone: React.ReactNode; message: string }) {
  return (
    <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-neutral-400">
      {icone}
      <p className="text-sm font-medium text-center max-w-[220px]">{message}</p>
    </div>
  );
}

export function DashboardCharts() {
  const { data: evolution, isLoading: loadingEvolution } = useQuery<EvolutionDepense[]>({
    queryKey: ['reporting', 'evolution-depenses', NB_MOIS],
    queryFn: async () => {
      const { data } = await api.get('/reporting/evolution-depenses', {
        params: { mois: NB_MOIS },
      });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: secteurs, isLoading: loadingSecteurs } = useQuery<RepartitionSecteur[]>({
    queryKey: ['reporting', 'repartition-secteurs'],
    queryFn: async () => {
      const { data } = await api.get('/reporting/repartition-secteurs');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const depenses = (evolution ?? []).map((d) => ({
    mois: d.mois,
    montant: toNum(d.montant),
  }));
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);

  const repartition = (secteurs ?? []).map((s) => ({
    name: s.libelle,
    value: toNum(s.pourcentage),
    montant: toNum(s.montant),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800">
            Dépenses des {NB_MOIS} derniers mois
          </h2>
          <span className="text-xs font-medium text-neutral-400 bg-neutral-50 px-2.5 py-1 rounded-lg">
            {NB_MOIS} mois
          </span>
        </div>

        {loadingEvolution ? (
          <ChartSkeleton />
        ) : totalDepenses <= 0 ? (
          <EmptyChart
            icone={<BarChart3 className="w-10 h-10 stroke-1" />}
            message="Aucune dépense comptabilisée sur la période"
          />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={depenses} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
              <XAxis
                dataKey="mois"
                tick={{ fontSize: 12, fill: '#737373' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatK}
                tick={{ fontSize: 11, fill: '#737373' }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                formatter={(value: number) => formatXOF(toNum(value))}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="montant" fill="#146C43" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-neutral-800">Répartition par secteur</h2>

        {loadingSecteurs ? (
          <div className="h-[240px] flex items-center justify-center">
            <div className="w-[150px] h-[150px] rounded-full border-[22px] border-neutral-100 animate-pulse" />
          </div>
        ) : repartition.length === 0 ? (
          <EmptyChart
            icone={<PieChartIcon className="w-10 h-10 stroke-1" />}
            message="Aucune dépense rattachée à un secteur d'intervention"
          />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={repartition}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {repartition.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name: string, entry: { payload?: { montant?: number } }) => [
                  `${toNum(value)}% — ${formatXOF(toNum(entry?.payload?.montant))}`,
                  'Part',
                ]}
                contentStyle={TOOLTIP_STYLE}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
