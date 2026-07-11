'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Modal } from '@/components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit2, Plus, ClipboardList } from 'lucide-react';

const PROJETS = [
  { id: '1', nom: 'Eau Potable — Région Nord' },
  { id: '2', nom: 'Santé Communautaire' },
  { id: '3', nom: 'Éducation des Filles' },
];

const CADRE_LOGIQUE = {
  intrants: ['Budget 45M FCFA', '3 agents terrain', 'Matériaux WASH', 'Partenariats locaux'],
  activites: ['Formation comités eau', 'Construction forages', 'Sensibilisation hygiène', 'Suivi technique'],
  extrants: ['20 forages réalisés', '1 500 ménages touchés', '60 agents formés', '12 comités opérationnels'],
  effets: ['Réduction maladies hydriques de 40%', 'Accès eau potable 80% population', 'Autonomie gestion eau durable'],
};

const INDICATEURS = [
  { id: 1, nom: 'Forages construits', unite: 'unités', cible: 20, realise: 18 },
  { id: 2, nom: 'Ménages bénéficiaires', unite: 'ménages', cible: 1500, realise: 1340 },
  { id: 3, nom: 'Agents formés', unite: 'personnes', cible: 60, realise: 55 },
  { id: 4, nom: 'Comités opérationnels', unite: 'comités', cible: 12, realise: 8 },
  { id: 5, nom: 'Réduction maladies hydriques', unite: '%', cible: 40, realise: 31 },
];

const COLLECTES = [
  { id: 1, indicateur: 'Forages construits', valeur: 18, date: '2026-06-30', agent: 'Koné Adama' },
  { id: 2, indicateur: 'Ménages bénéficiaires', valeur: 1340, date: '2026-06-28', agent: 'Bamba Fatoumata' },
  { id: 3, indicateur: 'Agents formés', valeur: 55, date: '2026-06-25', agent: 'Koné Adama' },
];

const TABS = [
  { id: 'cadre', label: 'Cadre Logique' },
  { id: 'indicateurs', label: 'Indicateurs' },
  { id: 'collecte', label: 'Collecte' },
  { id: 'rapport', label: 'Rapport' },
];

export default function MealPage() {
  const [projet, setProjet] = useState('1');
  const [tab, setTab] = useState('cadre');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndicateur, setSelectedIndicateur] = useState<(typeof INDICATEURS)[0] | null>(null);
  const [collecteForm, setCollecteForm] = useState({ indicateur: '', valeur: '', date: '', agent: '' });

  function openModal(ind: (typeof INDICATEURS)[0]) {
    setSelectedIndicateur(ind);
    setModalOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">SERA / MEAL</h1>
          <p className="text-sm text-neutral-500 mt-1">Suivi-Évaluation, Redevabilité et Apprentissage</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="label text-sm">Projet :</label>
          <select
            value={projet}
            onChange={(e) => setProjet(e.target.value)}
            className="input w-64"
          >
            {PROJETS.map((p) => (
              <option key={p.id} value={p.id}>{p.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'cadre' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {([
            { key: 'intrants', label: 'Intrants', color: 'border-t-blue-500' },
            { key: 'activites', label: 'Activités', color: 'border-t-accent-400' },
            { key: 'extrants', label: 'Extrants', color: 'border-t-primary-600' },
            { key: 'effets', label: 'Effets / Impact', color: 'border-t-emerald-500' },
          ] as const).map((col) => (
            <div key={col.key} className={`card border-t-4 ${col.color} space-y-3`}>
              <h3 className="font-semibold text-neutral-800">{col.label}</h3>
              <ul className="space-y-2">
                {CADRE_LOGIQUE[col.key].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'indicateurs' && (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {['Indicateur', 'Unité', 'Cible', 'Réalisé', 'Taux', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {INDICATEURS.map((ind) => {
                const taux = Math.round((ind.realise / ind.cible) * 100);
                return (
                  <tr key={ind.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{ind.nom}</td>
                    <td className="px-4 py-3 text-neutral-500">{ind.unite}</td>
                    <td className="px-4 py-3 text-neutral-700">{ind.cible.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-neutral-700">{ind.realise.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 w-48">
                      <ProgressBar value={taux} couleur="auto" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openModal(ind)}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Mettre à jour
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'collecte' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-neutral-800">Nouvelle saisie terrain</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Indicateur</label>
                <select
                  className="input w-full"
                  value={collecteForm.indicateur}
                  onChange={(e) => setCollecteForm({ ...collecteForm, indicateur: e.target.value })}
                >
                  <option value="">Sélectionner...</option>
                  {INDICATEURS.map((ind) => (
                    <option key={ind.id} value={ind.nom}>{ind.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Valeur collectée</label>
                <input
                  type="number"
                  className="input w-full"
                  value={collecteForm.valeur}
                  onChange={(e) => setCollecteForm({ ...collecteForm, valeur: e.target.value })}
                  placeholder="Ex: 18"
                />
              </div>
              <div>
                <label className="label">Date de collecte</label>
                <input
                  type="date"
                  className="input w-full"
                  value={collecteForm.date}
                  onChange={(e) => setCollecteForm({ ...collecteForm, date: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Agent collecteur</label>
                <input
                  type="text"
                  className="input w-full"
                  value={collecteForm.agent}
                  onChange={(e) => setCollecteForm({ ...collecteForm, agent: e.target.value })}
                  placeholder="Nom de l'agent"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="btn-primary">Enregistrer la collecte</button>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-sm text-neutral-800">Historique des collectes</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Indicateur', 'Valeur', 'Date', 'Agent'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {COLLECTES.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-700">{c.indicateur}</td>
                    <td className="px-4 py-3 font-medium text-neutral-800">{c.valeur.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-neutral-500">{new Date(c.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-neutral-600">{c.agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'rapport' && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-neutral-800">Rapport MEAL — Eau Potable Région Nord</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {INDICATEURS.slice(0, 4).map((ind) => {
                const taux = Math.round((ind.realise / ind.cible) * 100);
                return (
                  <div key={ind.id} className="stat-card text-center">
                    <p className="text-xs text-neutral-500 mb-1">{ind.nom}</p>
                    <p className="text-2xl font-bold text-primary-600">{taux}%</p>
                    <p className="text-xs text-neutral-400">{ind.realise} / {ind.cible}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-neutral-800 mb-4">Taux d&apos;atteinte par indicateur</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={INDICATEURS.map((ind) => ({
                  name: ind.nom.length > 20 ? ind.nom.slice(0, 20) + '…' : ind.nom,
                  taux: Math.round((ind.realise / ind.cible) * 100),
                }))}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Taux']} />
                <Bar dataKey="taux" fill="#146C43" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Mettre à jour : ${selectedIndicateur?.nom}`}
        size="sm"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
            <button onClick={() => setModalOpen(false)} className="btn-primary">Enregistrer</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nouvelle valeur</label>
            <input type="number" className="input w-full" placeholder={`Cible : ${selectedIndicateur?.cible}`} />
          </div>
          <div>
            <label className="label">Date de collecte</label>
            <input type="date" className="input w-full" />
          </div>
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea className="input w-full resize-none" rows={3} placeholder="Observations terrain..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}
