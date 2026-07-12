'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

type Plan = 'Starter' | 'Pro' | 'Enterprise';
type Statut = 'ACTIF' | 'ESSAI' | 'SUSPENDU' | 'EXPIRE';

interface Organisation {
  id: string;
  nom: string;
  email: string;
  pays: string;
  plan: Plan;
  statut: Statut;
  users: number;
  licenceExpire: string;
  createdAt: string;
  mrr: number;
}

const ORGS: Organisation[] = [
  { id: '1', nom: 'ONG Espoir CI', email: 'contact@espoir-ci.org', pays: 'CI', plan: 'Pro', statut: 'ACTIF', users: 8, licenceExpire: '2027-01-31', createdAt: '2026-01-15', mrr: 65000 },
  { id: '2', nom: 'Association YMCA Abidjan', email: 'ymca@abidjan.ci', pays: 'CI', plan: 'Starter', statut: 'ACTIF', users: 3, licenceExpire: '2026-12-31', createdAt: '2026-03-10', mrr: 25000 },
  { id: '3', nom: 'Réseau Femmes Leaders Mali', email: 'rfl@mali.org', pays: 'ML', plan: 'Pro', statut: 'ACTIF', users: 12, licenceExpire: '2027-03-15', createdAt: '2026-02-20', mrr: 65000 },
  { id: '4', nom: 'CARITAS Bouaké', email: 'caritas@bouake.ci', pays: 'CI', plan: 'Enterprise', statut: 'ACTIF', users: 28, licenceExpire: '2027-06-30', createdAt: '2025-07-01', mrr: 180000 },
  { id: '5', nom: 'Fondation Santé 2030', email: 'fs2030@gmail.com', pays: 'SN', plan: 'Starter', statut: 'ESSAI', users: 2, licenceExpire: '2026-07-17', createdAt: '2026-07-10', mrr: 0 },
  { id: '6', nom: 'AVSF Burkina Faso', email: 'avsf@bf.org', pays: 'BF', plan: 'Pro', statut: 'ACTIF', users: 6, licenceExpire: '2027-02-28', createdAt: '2026-04-05', mrr: 65000 },
  { id: '7', nom: 'ONG JADES Niger', email: 'jades@niger.org', pays: 'NE', plan: 'Starter', statut: 'SUSPENDU', users: 1, licenceExpire: '2026-06-30', createdAt: '2026-01-20', mrr: 0 },
];

const PLAN_COLORS: Record<Plan, string> = {
  Pro: 'text-blue-400 bg-blue-400/10',
  Starter: 'text-neutral-400 bg-neutral-400/10',
  Enterprise: 'text-yellow-400 bg-yellow-400/10',
};

const STATUT_COLORS: Record<Statut, string> = {
  ACTIF: 'text-green-400 bg-green-400/10',
  ESSAI: 'text-yellow-400 bg-yellow-400/10',
  SUSPENDU: 'text-red-400 bg-red-400/10',
  EXPIRE: 'text-neutral-500 bg-neutral-500/10',
};

export default function OrganisationsPage() {
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('');
  const [filterStatut, setFilterStatut] = useState<string>('');

  const filtered = ORGS.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.nom.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    const matchPlan = !filterPlan || o.plan === filterPlan;
    const matchStatut = !filterStatut || o.statut === filterStatut;
    return matchSearch && matchPlan && matchStatut;
  });

  const totalMRR = ORGS.filter((o) => o.statut === 'ACTIF').reduce((s, o) => s + o.mrr, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Organisations</h1>
          <p className="text-neutral-400 text-sm mt-1">{ORGS.length} organisations enregistrées · MRR total : <span className="text-primary-400 font-semibold">{totalMRR.toLocaleString('fr-CI')} FCFA</span></p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          + Nouvelle organisation
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <input
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
        >
          <option value="">Tous les plans</option>
          <option>Starter</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
        <select
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option>ACTIF</option>
          <option>ESSAI</option>
          <option>SUSPENDU</option>
          <option>EXPIRE</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-800">
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Organisation</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Pays</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Plan</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Statut</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Users</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">MRR</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Expiration</th>
              <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-medium text-white">{o.nom}</p>
                  <p className="text-xs text-neutral-500">{o.email}</p>
                </td>
                <td className="px-5 py-3 text-neutral-400 font-mono text-xs">{o.pays}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[o.plan]}`}>{o.plan}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_COLORS[o.statut]}`}>{o.statut}</span>
                </td>
                <td className="px-5 py-3 text-neutral-400">{o.users}</td>
                <td className="px-5 py-3 text-neutral-300 font-mono text-xs">{o.mrr > 0 ? `${o.mrr.toLocaleString('fr-CI')} F` : '—'}</td>
                <td className="px-5 py-3 text-xs text-neutral-400">{new Date(o.licenceExpire).toLocaleDateString('fr-CI')}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-primary-400 hover:underline">Gérer</button>
                    <button className="text-xs text-neutral-500 hover:text-white">Impersonner</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-neutral-500 text-sm">Aucune organisation.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
