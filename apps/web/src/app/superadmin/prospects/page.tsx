'use client';

import { useState } from 'react';

type Etape = 'NOUVEAU' | 'CONTACTE' | 'DEMO_PLANIFIEE' | 'DEMO_FAITE' | 'PROPOSITION' | 'GAGNE' | 'PERDU';
type Source = 'site_web' | 'referral' | 'linkedin' | 'salon' | 'cold_email' | 'autre';

interface Prospect {
  id: string;
  nom: string;
  organisation: string;
  email: string;
  telephone?: string;
  pays: string;
  typeOrg: string;
  planInteret: string;
  etape: Etape;
  source: Source;
  dateContact: string;
  demoDate?: string;
  notes?: string;
  valeurEstimee: number;
}

const PROSPECTS: Prospect[] = [
  { id: '1', nom: 'Sékou Diallo', organisation: 'ONG Vision Guinée', email: 'sekou.diallo@vision-gn.org', telephone: '+224 62 00 00 00', pays: 'GN', typeOrg: 'ONG nationale', planInteret: 'Pro', etape: 'DEMO_PLANIFIEE', source: 'site_web', dateContact: '2026-07-08', demoDate: '2026-07-15', notes: 'Intéressé par le module MEAL et les rapports bailleurs. Démo planifiée lundi.', valeurEstimee: 65000 },
  { id: '2', nom: 'Adjoa Mensah', organisation: 'ASSOC Femmes Rurales', email: 'a.mensah@afr.ci', pays: 'CI', typeOrg: 'Association locale', planInteret: 'Starter', etape: 'CONTACTE', source: 'referral', dateContact: '2026-07-09', valeurEstimee: 25000 },
  { id: '3', nom: 'Ibrahim Traoré', organisation: 'Réseau Santé BF', email: 'i.traore@sante-bf.org', pays: 'BF', typeOrg: 'Réseau / fédération', planInteret: 'Enterprise', etape: 'PROPOSITION', source: 'linkedin', dateContact: '2026-07-05', demoDate: '2026-07-10', notes: 'Démo réalisée. Proposition envoyée. Décision en attente du CA.', valeurEstimee: 180000 },
  { id: '4', nom: 'Marie-Claire Bamba', organisation: 'Fondation Éducation+', email: 'mc.bamba@edu-plus.ci', pays: 'CI', typeOrg: 'Fondation', planInteret: 'Pro', etape: 'DEMO_FAITE', source: 'salon', dateContact: '2026-07-02', demoDate: '2026-07-07', valeurEstimee: 65000 },
  { id: '5', nom: 'Oumar Kouyaté', organisation: 'ONG Développement Sahel', email: 'o.kouyate@devsa.ml', pays: 'ML', typeOrg: 'ONG internationale', planInteret: 'Pro', etape: 'NOUVEAU', source: 'cold_email', dateContact: '2026-07-11', valeurEstimee: 65000 },
  { id: '6', nom: 'Fatima Sy', organisation: 'Mutuelle Santé Dakar', email: 'fatima.sy@mutdakar.sn', pays: 'SN', typeOrg: 'Mutuelle / groupement', planInteret: 'Starter', etape: 'GAGNE', source: 'site_web', dateContact: '2026-06-20', demoDate: '2026-06-25', notes: 'Converti → Starter. Onboarding terminé.', valeurEstimee: 25000 },
  { id: '7', nom: 'Alassane Coulibaly', organisation: 'Coopérative Café Togo', email: 'a.coulibaly@cafetogo.tg', pays: 'TG', typeOrg: 'Coopérative', planInteret: 'Starter', etape: 'PERDU', source: 'referral', dateContact: '2026-06-15', notes: 'Trop cher pour eux. Rappeler dans 6 mois.', valeurEstimee: 0 },
];

const ETAPES: { value: Etape; label: string; color: string }[] = [
  { value: 'NOUVEAU', label: 'Nouveau', color: 'text-neutral-400 bg-neutral-400/10' },
  { value: 'CONTACTE', label: 'Contacté', color: 'text-blue-400 bg-blue-400/10' },
  { value: 'DEMO_PLANIFIEE', label: 'Démo planifiée', color: 'text-yellow-400 bg-yellow-400/10' },
  { value: 'DEMO_FAITE', label: 'Démo faite', color: 'text-purple-400 bg-purple-400/10' },
  { value: 'PROPOSITION', label: 'Proposition envoyée', color: 'text-orange-400 bg-orange-400/10' },
  { value: 'GAGNE', label: 'Gagné ✓', color: 'text-green-400 bg-green-400/10' },
  { value: 'PERDU', label: 'Perdu', color: 'text-red-400 bg-red-400/10' },
];

const SOURCES: Record<Source, string> = {
  site_web: '🌐 Site web',
  referral: '🤝 Référence',
  linkedin: '💼 LinkedIn',
  salon: '🎪 Salon',
  cold_email: '📧 Email',
  autre: '❓ Autre',
};

type View = 'pipeline' | 'liste';

export default function ProspectsPage() {
  const [view, setView] = useState<View>('pipeline');
  const [selected, setSelected] = useState<Prospect | null>(null);
  const [search, setSearch] = useState('');

  const filtered = PROSPECTS.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.nom.toLowerCase().includes(q) || p.organisation.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  const totalPipeline = filtered.filter((p) => !['GAGNE', 'PERDU'].includes(p.etape)).reduce((s, p) => s + p.valeurEstimee, 0);
  const totalGagnes = filtered.filter((p) => p.etape === 'GAGNE').reduce((s, p) => s + p.valeurEstimee, 0);

  const etapeStyle = (e: Etape) => ETAPES.find((x) => x.value === e)?.color ?? '';
  const etapeLabel = (e: Etape) => ETAPES.find((x) => x.value === e)?.label ?? e;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">CRM Prospects</h1>
          <p className="text-neutral-400 text-sm mt-1">
            Pipeline : <span className="text-yellow-400 font-semibold">{totalPipeline.toLocaleString('fr-CI')} FCFA</span>
            {' · '}Gagnés : <span className="text-green-400 font-semibold">{totalGagnes.toLocaleString('fr-CI')} FCFA</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-800 rounded-lg p-1">
            <button onClick={() => setView('pipeline')} className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${view === 'pipeline' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>Pipeline</button>
            <button onClick={() => setView('liste')} className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${view === 'liste' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>Liste</button>
          </div>
          <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            + Prospect
          </button>
        </div>
      </div>

      <input
        className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 w-72"
        placeholder="Rechercher…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Vue Pipeline (Kanban) */}
      {view === 'pipeline' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ETAPES.filter((e) => e.value !== 'GAGNE' && e.value !== 'PERDU').map((etape) => {
            const cards = filtered.filter((p) => p.etape === etape.value);
            return (
              <div key={etape.value} className="flex-shrink-0 w-56">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${etape.color}`}>{etape.label}</span>
                  <span className="text-xs text-neutral-500">{cards.length}</span>
                </div>
                <div className="space-y-3">
                  {cards.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="w-full bg-neutral-800 border border-neutral-700 hover:border-primary-600 rounded-xl p-4 text-left transition-colors"
                    >
                      <p className="text-sm font-semibold text-white">{p.nom}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{p.organisation}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-neutral-500">{p.pays}</span>
                        <span className="text-xs font-mono text-primary-400">{p.valeurEstimee.toLocaleString('fr-CI')} F</span>
                      </div>
                    </button>
                  ))}
                  {cards.length === 0 && (
                    <div className="border-2 border-dashed border-neutral-800 rounded-xl p-4 text-center text-xs text-neutral-600">Aucun prospect</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Colonne Gagné/Perdu */}
          <div className="flex-shrink-0 w-56 space-y-3">
            {['GAGNE', 'PERDU'].map((statut) => {
              const e = ETAPES.find((x) => x.value === statut)!;
              const cards = filtered.filter((p) => p.etape === statut as Etape);
              return (
                <div key={statut}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${e.color}`}>{e.label}</span>
                    <span className="text-xs text-neutral-500">{cards.length}</span>
                  </div>
                  {cards.map((p) => (
                    <button key={p.id} onClick={() => setSelected(p)} className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-left mb-2">
                      <p className="text-xs font-semibold text-white">{p.nom}</p>
                      <p className="text-xs text-neutral-500">{p.organisation}</p>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vue Liste */}
      {view === 'liste' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-800">
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Contact</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Organisation</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Plan</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Étape</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Source</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Valeur</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium">Démo</th>
                <th className="px-5 py-3 text-xs text-neutral-500 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/40 transition-colors cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-white">{p.nom}</p>
                    <p className="text-xs text-neutral-500">{p.email}</p>
                  </td>
                  <td className="px-5 py-3 text-neutral-300 text-xs">{p.organisation} <span className="text-neutral-600">({p.pays})</span></td>
                  <td className="px-5 py-3"><span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full font-semibold">{p.planInteret}</span></td>
                  <td className="px-5 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${etapeStyle(p.etape)}`}>{etapeLabel(p.etape)}</span></td>
                  <td className="px-5 py-3 text-xs text-neutral-400">{SOURCES[p.source]}</td>
                  <td className="px-5 py-3 text-xs font-mono text-primary-400">{p.valeurEstimee > 0 ? `${p.valeurEstimee.toLocaleString('fr-CI')} F` : '—'}</td>
                  <td className="px-5 py-3 text-xs text-neutral-400">{p.demoDate ? new Date(p.demoDate).toLocaleDateString('fr-CI') : '—'}</td>
                  <td className="px-5 py-3"><button className="text-xs text-primary-400 hover:underline">Voir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Détail prospect (slide-over) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-96 bg-neutral-900 border-l border-neutral-800 overflow-y-auto">
            <div className="p-6 border-b border-neutral-800 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-white text-lg">{selected.nom}</h2>
                <p className="text-sm text-neutral-400 mt-0.5">{selected.organisation} · {selected.pays}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-white text-xl leading-none mt-1">×</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${etapeStyle(selected.etape)}`}>{etapeLabel(selected.etape)}</span>
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full font-semibold">{selected.planInteret}</span>
              </div>

              <div className="space-y-2 text-sm">
                <p><span className="text-neutral-500">Email : </span><a href={`mailto:${selected.email}`} className="text-primary-400 hover:underline">{selected.email}</a></p>
                {selected.telephone && <p><span className="text-neutral-500">Tél : </span><span className="text-white">{selected.telephone}</span></p>}
                <p><span className="text-neutral-500">Type : </span><span className="text-white">{selected.typeOrg}</span></p>
                <p><span className="text-neutral-500">Source : </span><span className="text-white">{SOURCES[selected.source]}</span></p>
                <p><span className="text-neutral-500">1er contact : </span><span className="text-white">{new Date(selected.dateContact).toLocaleDateString('fr-CI')}</span></p>
                {selected.demoDate && <p><span className="text-neutral-500">Démo : </span><span className="text-white">{new Date(selected.demoDate).toLocaleDateString('fr-CI')}</span></p>}
                <p><span className="text-neutral-500">Valeur estimée : </span><span className="text-primary-400 font-mono font-semibold">{selected.valeurEstimee > 0 ? `${selected.valeurEstimee.toLocaleString('fr-CI')} FCFA / mois` : '—'}</span></p>
              </div>

              {selected.notes && (
                <div className="bg-neutral-800 rounded-xl p-4">
                  <p className="text-xs text-neutral-400 mb-1">Notes</p>
                  <p className="text-sm text-neutral-200 leading-relaxed">{selected.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Changer l'étape</label>
                <select className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {ETAPES.map((e) => (
                    <option key={e.value} value={e.value} selected={e.value === selected.etape}>{e.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-neutral-400">Ajouter une note</label>
                <textarea rows={3} className="w-full bg-neutral-800 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Note sur ce prospect…" />
              </div>

              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">Sauvegarder</button>
                <a href={`mailto:${selected.email}`} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors text-center">
                  Envoyer un email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
