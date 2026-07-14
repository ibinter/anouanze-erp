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

const DEPENSES_MOIS = [
  { mois: 'Fév', montant: 2_100_000 },
  { mois: 'Mar', montant: 3_450_000 },
  { mois: 'Avr', montant: 2_800_000 },
  { mois: 'Mai', montant: 4_100_000 },
  { mois: 'Jui', montant: 3_700_000 },
  { mois: 'Jul', montant: 2_950_000 },
];

const REPARTITION_SECTEURS = [
  { name: 'Éducation', value: 35 },
  { name: 'Santé', value: 28 },
  { name: 'Agriculture', value: 18 },
  { name: 'Eau & Assainissement', value: 12 },
  { name: 'Environnement', value: 7 },
];

const COLORS = ['#146C43', '#F28C25', '#2563EB', '#7C3AED', '#0891B2'];

function formatK(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="card p-5 lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800">Dépenses des 6 derniers mois</h2>
          <span className="text-xs font-medium text-neutral-400 bg-neutral-50 px-2.5 py-1 rounded-lg">6 mois</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={DEPENSES_MOIS} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
              formatter={(value: number) =>
                new Intl.NumberFormat('fr-CI', {
                  style: 'currency',
                  currency: 'XOF',
                  minimumFractionDigits: 0,
                }).format(value)
              }
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="montant" fill="#146C43" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-neutral-800">Répartition par secteur</h2>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={REPARTITION_SECTEURS}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {REPARTITION_SECTEURS.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value}%`, 'Part']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
