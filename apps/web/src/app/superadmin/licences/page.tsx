'use client';

import { useState } from 'react';

interface Licence {
  id: string;
  organisation: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  statut: 'ACTIVE' | 'ESSAI' | 'SUSPENDUE' | 'EXPIREE';
  debut: string;
  fin: string;
  mrr: number;
  renouvellementAuto: boolean;
  maxUsers: number;
  usersActifs: number;
}

const LICENCES: Licence[] = [
  { id: 'L001', organisation: 'ONG Espoir CI', plan: 'Pro', statut: 'ACTIVE', debut: '2026-02-01', fin: '2027-01-31', mrr: 65000, renouvellementAuto: true, maxUsers: 15, usersActifs: 8 },
  { id: 'L002', organisation: 'Association YMCA Abidjan', plan: 'Starter', statut: 'ACTIVE', debut: '2026-04-01', fin: '2026-12-31', mrr: 25000, renouvellementAuto: false, maxUsers: 3, usersActifs: 3 },
  { id: 'L003', organisation: 'Réseau Femmes Leaders Mali', plan: 'Pro', statut: 'ACTIVE', debut: '2026-04-15', fin: '2027-03-15', mrr: 65000, renouvellementAuto: true, maxUsers: 15, usersActifs: 12 },
  { id: 'L004', organisation: 'CARITAS Bouaké', plan: 'Enterprise', statut: 'ACTIVE', debut: '2025-07-01', fin: '2027-06-30', mrr: 180000, renouvellementAuto: true, maxUsers: 999, usersActifs: 28 },
  { id: 'L005', organisation: 'Fondation Santé 2030', plan: 'Starter', statut: 'ESSAI', debut: '2026-07-10', fin: '2026-07-17', mrr: 0, renouvellementAuto: false, maxUsers: 3, usersActifs: 2 },
  { id: 'L006', organisation: 'AVSF Burkina Faso', plan: 'Pro', statut: 'ACTIVE', debut: '2026-05-01', fin: '2027-02-28', mrr: 65000, renouvellementAuto: true, maxUsers: 15, usersActifs: 6 },
  { id: 'L007', organisation: 'ONG JADES Niger', plan: 'Starter', statut: 'SUSPENDUE', debut: '2026-01-20', fin: '2026-06-30', mrr: 0, renouvellementAuto: false, maxUsers: 3, usersActifs: 1 },
];

const STATUT_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10',
  ESSAI: 'text-yellow-400 bg-yellow-400/10',
  SUSPENDUE: 'text-red-400 bg-red-400/10',
  EXPIREE: 'text-neutral-500 bg-neutral-500/10',
};

const PLAN_COLORS: Record<string, string> = {
  Starter: 'text-neutral-400',
  Pro: 'text-blue-400',
  Enterprise: 'text-yellow-400',
};

export default function LicencesPage() {
  const [search, setSearch] = useState('');

  const filtered = LICENCES.filter((l) => !search || l.organisation.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase()));

  const mrrTotal = LICENCES.filter((l) => l.statut === 'ACTIVE').reduce((s, l) => s + l.mrr, 0);
  const essais = LICENCES.filter((l) => l.statut === 'ESSAI').length;
  const expirantSoon = LICENCES.filter((l) => {
    const fin = new Date(l.fin);
    const now = new Date();
    const diff = (fin.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diff > 0 && diff <= 30 && l.statut === 'ACTIVE';
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestion des licences</h1>
        <p className="text-neutral-400 text-sm mt-1">
          MRR actif : <span className="text-green-400 font-semibold">{mrrTotal.toLocaleString('fr-CI')} FCFA</span>
          {' · '}{essais} essai(s) en cours
          {expirantSoon > 0 && <span className="text-yellow-400"> · ⚠️ {expirantSoon} licence(s) expirant dans 30 jours</span>}
        </p>
      </div>

      {/* KPIs mini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Licences actives', val: LICENCES.filter((l) => l.statut === 'ACTIVE').length, color: 'text-green-400' },
          { label: 'Essais en cours', val: essais, color: 'text-yellow-400' },
          { label: 'Suspendues', val: LICENCES.filter((l) => l.statut === 'SUSPENDUE').length, color: 'text-red-400' },
          { label: 'MRR total', val: `${mrrTotal.toLocaleString('fr-CI')} F`, color: 'text-primary-400' },
        ].map((k) => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <input
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 w-72"
        placeholder="Rechercher organisation ou ID…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-800">
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">ID</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Organisation</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Plan</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Statut</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Users</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">MRR</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Période</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Auto-renouvellement</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const daysLeft = Math.ceil((new Date(l.fin).getTime() - Date.now()) / (1000 * 3600 * 24));
              const expirationWarn = daysLeft <= 30 && daysLeft > 0 && l.statut === 'ACTIVE';
              return (
                <tr key={l.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors">
                  <td className="px-5 py-3 text-neutral-400 font-mono text-xs">{l.id}</td>
                  <td className="px-5 py-3 font-medium text-white">{l.organisation}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${PLAN_COLORS[l.plan]}`}>{l.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_COLORS[l.statut]}`}>{l.statut}</span>
                  </td>
                  <td className="px-5 py-3 text-neutral-300 text-xs">
                    <span className={l.usersActifs >= l.maxUsers ? 'text-red-400' : ''}>{l.usersActifs}</span>
                    <span className="text-neutral-600"> / {l.maxUsers === 999 ? '∞' : l.maxUsers}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-primary-400">{l.mrr > 0 ? `${l.mrr.toLocaleString('fr-CI')} F` : '—'}</td>
                  <td className="px-5 py-3 text-xs text-neutral-400">
                    <p>{new Date(l.debut).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: '2-digit' })}</p>
                    <p className={expirationWarn ? 'text-yellow-400 font-semibold' : ''}>
                      → {new Date(l.fin).toLocaleDateString('fr-CI', { day: '2-digit', month: 'short', year: '2-digit' })}
                      {expirationWarn && ` (J-${daysLeft})`}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${l.renouvellementAuto ? 'text-green-400' : 'text-neutral-500'}`}>
                      {l.renouvellementAuto ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-primary-400 hover:underline">Modifier</button>
                      <button className="text-xs text-yellow-400 hover:underline">Renouveler</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
