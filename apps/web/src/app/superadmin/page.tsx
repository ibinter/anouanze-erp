import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

const KPIS = [
  { label: 'Organisations actives', value: '12', sub: '+2 ce mois', color: 'text-green-400' },
  { label: 'Licences Pro', value: '8', sub: '4 Starter · 1 Enterprise', color: 'text-blue-400' },
  { label: 'Prospects en cours', value: '34', sub: '6 démos planifiées', color: 'text-yellow-400' },
  { label: 'Revenus MRR', value: '720 000 FCFA', sub: '+12% vs mois dernier', color: 'text-primary-400' },
  { label: 'Utilisateurs totaux', value: '187', sub: 'Toutes organisations', color: 'text-purple-400' },
  { label: 'Uptime', value: '99.9%', sub: 'Derniers 30 jours', color: 'text-green-400' },
];

const ORGS_RECENTES = [
  { nom: 'ONG Espoir CI', plan: 'Pro', statut: 'ACTIF', users: 8, createdAt: '2026-07-01' },
  { nom: 'Association YMCA Abidjan', plan: 'Starter', statut: 'ACTIF', users: 3, createdAt: '2026-07-03' },
  { nom: 'Réseau Femmes Leaders Mali', plan: 'Pro', statut: 'ACTIF', users: 12, createdAt: '2026-07-05' },
  { nom: 'CARITAS Bouaké', plan: 'Enterprise', statut: 'ACTIF', users: 28, createdAt: '2026-06-28' },
  { nom: 'Fondation Santé 2030', plan: 'Starter', statut: 'ESSAI', users: 2, createdAt: '2026-07-10' },
];

const ALERTES = [
  { type: 'warn', msg: '2 licences Starter expirent dans 7 jours' },
  { type: 'info', msg: '6 démos planifiées cette semaine' },
  { type: 'ok', msg: 'Backup base de données — OK il y a 3h' },
  { type: 'warn', msg: 'Fondation Santé 2030 — essai expire dans 5 jours' },
];

const PLAN_COLORS: Record<string, string> = {
  Pro: 'text-blue-400 bg-blue-400/10',
  Starter: 'text-neutral-400 bg-neutral-400/10',
  Enterprise: 'text-yellow-400 bg-yellow-400/10',
};

const STATUT_COLORS: Record<string, string> = {
  ACTIF: 'text-green-400 bg-green-400/10',
  ESSAI: 'text-yellow-400 bg-yellow-400/10',
  SUSPENDU: 'text-red-400 bg-red-400/10',
};

export default function SuperadminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard — Vue globale</h1>
        <p className="text-neutral-400 text-sm mt-1">Tableau de bord multi-tenant IBIG Soft · {new Date().toLocaleDateString('fr-CI', { dateStyle: 'full' })}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <p className="text-xs text-neutral-500 mb-2">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organisations récentes */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm">Organisations récentes</h2>
            <a href="/superadmin/organisations" className="text-xs text-primary-400 hover:underline">Voir toutes →</a>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Organisation</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Plan</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Statut</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Users</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {ORGS_RECENTES.map((o) => (
                <tr key={o.nom} className="border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{o.nom}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[o.plan]}`}>{o.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUT_COLORS[o.statut]}`}>{o.statut}</span>
                  </td>
                  <td className="px-5 py-3 text-neutral-400">{o.users}</td>
                  <td className="px-5 py-3 text-neutral-400 text-xs">{new Date(o.createdAt).toLocaleDateString('fr-CI')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alertes */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800">
            <h2 className="font-semibold text-white text-sm">Alertes système</h2>
          </div>
          <div className="p-4 space-y-3">
            {ALERTES.map((a, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/60">
                <span className="text-base mt-0.5">
                  {a.type === 'warn' ? '⚠️' : a.type === 'ok' ? '✅' : 'ℹ️'}
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">{a.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
