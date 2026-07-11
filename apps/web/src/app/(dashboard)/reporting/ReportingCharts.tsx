'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const DONS_12_MOIS = [
  { mois: 'Juil', montant: 3_200_000 },
  { mois: 'Août', montant: 2_800_000 },
  { mois: 'Sep', montant: 4_100_000 },
  { mois: 'Oct', montant: 3_700_000 },
  { mois: 'Nov', montant: 5_200_000 },
  { mois: 'Déc', montant: 6_800_000 },
  { mois: 'Jan', montant: 4_300_000 },
  { mois: 'Fév', montant: 3_900_000 },
  { mois: 'Mar', montant: 5_100_000 },
  { mois: 'Avr', montant: 4_700_000 },
  { mois: 'Mai', montant: 5_900_000 },
  { mois: 'Jun', montant: 6_200_000 },
];

const DEPENSES_PROJETS = [
  { projet: 'Eau Korhogo', montant: 12_500_000 },
  { projet: 'École Bouaké', montant: 9_800_000 },
  { projet: 'Santé Daloa', montant: 8_200_000 },
  { projet: 'Agri Séguéla', montant: 7_100_000 },
  { projet: 'Formation TIC', montant: 5_500_000 },
  { projet: 'Microfinance', montant: 4_800_000 },
  { projet: 'Alphabétis.', montant: 3_900_000 },
  { projet: 'Environnement', montant: 2_700_000 },
];

const CHARGES_NATURE = [
  { name: 'Achats consommés', value: 32 },
  { name: 'Services ext.', value: 24 },
  { name: 'Charges personnel', value: 28 },
  { name: 'Dotations amort.', value: 8 },
  { name: 'Autres charges', value: 8 },
];

const TRESORERIE_6_MOIS = [
  { mois: 'Jan', solde: 18_500_000 },
  { mois: 'Fév', solde: 22_100_000 },
  { mois: 'Mar', solde: 19_800_000 },
  { mois: 'Avr', solde: 25_400_000 },
  { mois: 'Mai', solde: 28_900_000 },
  { mois: 'Jun', solde: 31_200_000 },
];

const COLORS = ['#146C43', '#F28C25', '#2563EB', '#7C3AED', '#0891B2'];

function fmtM(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
}

const tooltipStyle = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  fontSize: '12px',
};

export function ReportingCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card space-y-3">
        <h3 className="font-semibold text-neutral-800">Évolution des dons sur 12 mois</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={DONS_12_MOIS} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtM} tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip formatter={(v: number) => [fmtM(v) + ' FCFA', 'Dons']} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="montant" stroke="#146C43" strokeWidth={2.5} dot={{ r: 3, fill: '#146C43' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-neutral-800">Dépenses par projet (top 8)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={DEPENSES_PROJETS} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" horizontal={false} />
            <XAxis type="number" tickFormatter={fmtM} tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="projet" tick={{ fontSize: 10, fill: '#737373' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip formatter={(v: number) => [fmtM(v) + ' FCFA', 'Dépenses']} contentStyle={tooltipStyle} />
            <Bar dataKey="montant" fill="#F28C25" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-neutral-800">Répartition charges par nature (Classe 6)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={CHARGES_NATURE} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
              {CHARGES_NATURE.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v}%`, 'Part']} contentStyle={tooltipStyle} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-neutral-800">Évolution trésorerie sur 6 mois</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={TRESORERIE_6_MOIS} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tresGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#146C43" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#146C43" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtM} tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} width={48} />
            <Tooltip formatter={(v: number) => [fmtM(v) + ' FCFA', 'Solde']} contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="solde" stroke="#146C43" strokeWidth={2.5} fill="url(#tresGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
