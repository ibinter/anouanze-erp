'use client';

import {
  Building2, Users, FileText, Calendar, CheckCircle,
  Clock, AlertTriangle, Plus, ChevronRight,
} from 'lucide-react';

const ORGANES = [
  {
    nom: "Assemblée Générale",
    membres: 42,
    prochainReunion: "2026-09-15",
    statut: "actif",
    description: "Organe souverain de l'organisation regroupant tous les membres.",
  },
  {
    nom: "Conseil d'Administration",
    membres: 9,
    prochainReunion: "2026-07-28",
    statut: "actif",
    description: "Gouvernance stratégique et supervision de la direction exécutive.",
  },
  {
    nom: "Bureau Exécutif",
    membres: 5,
    prochainReunion: "2026-07-20",
    statut: "actif",
    description: "Président, Vice-Président, Secrétaire Général, Trésorier, Commissaire aux comptes.",
  },
  {
    nom: "Comité de Contrôle",
    membres: 3,
    prochainReunion: null,
    statut: "actif",
    description: "Contrôle interne, audit et conformité.",
  },
];

const RESOLUTIONS = [
  {
    ref: "RES-2026-01",
    titre: "Approbation du budget annuel 2026",
    organe: "Assemblée Générale",
    date: "2026-01-15",
    statut: "APPLIQUEE",
  },
  {
    ref: "RES-2026-02",
    titre: "Renouvellement du mandat du Directeur Exécutif",
    organe: "Conseil d'Administration",
    date: "2026-02-10",
    statut: "APPLIQUEE",
  },
  {
    ref: "RES-2026-03",
    titre: "Ouverture d'un nouveau compte bancaire ECOBANK",
    organe: "Bureau Exécutif",
    date: "2026-03-05",
    statut: "EN_COURS",
  },
  {
    ref: "RES-2026-04",
    titre: "Partenariat avec USAID — Convention 2026-2028",
    organe: "Conseil d'Administration",
    date: "2026-06-20",
    statut: "EN_ATTENTE",
  },
];

function StatutBadge({ statut }: { statut: string }) {
  if (statut === 'APPLIQUEE') return <span className="badge bg-primary-50 text-primary-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Appliquée</span>;
  if (statut === 'EN_COURS') return <span className="badge bg-blue-50 text-blue-700 flex items-center gap-1"><Clock className="w-3 h-3" /> En cours</span>;
  return <span className="badge bg-amber-50 text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> En attente</span>;
}

export default function GouvernancePage() {
  return (
    <div className="p-4 sm:p-6 space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Gouvernance</h1>
          <p className="text-sm text-neutral-500 mt-1">Organes de gouvernance, résolutions et conformité statutaire</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Planifier une réunion
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle résolution
          </button>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-50">
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Organes actifs</p>
            <p className="text-xl font-bold text-primary-600">4</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Membres total</p>
            <p className="text-xl font-bold text-blue-600">59</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Résolutions 2026</p>
            <p className="text-xl font-bold text-green-600">4</p>
          </div>
        </div>
        <div className="stat-card flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Prochaine réunion</p>
            <p className="text-sm font-bold text-amber-600">20 juil.</p>
          </div>
        </div>
      </div>

      {/* Organes de gouvernance */}
      <section>
        <h2 className="text-base font-semibold text-neutral-700 mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary-600" />
          Organes de gouvernance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ORGANES.map((organe) => (
            <div key={organe.nom} className="card p-5 hover:shadow-card-hover transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-800 group-hover:text-primary-600 transition-colors">
                    {organe.nom}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">{organe.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {organe.membres} membres
                    </span>
                    {organe.prochainReunion && (
                      <span className="flex items-center gap-1 text-primary-600">
                        <Calendar className="w-3.5 h-3.5" />
                        Réunion : {new Date(organe.prochainReunion).toLocaleDateString('fr-CI', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-primary-600 transition-colors shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Résolutions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-neutral-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            Résolutions récentes
          </h2>
          <button className="text-sm text-primary-600 hover:underline font-medium">
            Voir toutes les résolutions
          </button>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Référence</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Résolution</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Organe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {RESOLUTIONS.map((res) => (
                <tr key={res.ref} className="hover:bg-neutral-50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{res.ref}</td>
                  <td className="px-4 py-3 font-medium text-neutral-800">{res.titre}</td>
                  <td className="px-4 py-3 text-neutral-600">{res.organe}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {new Date(res.date).toLocaleDateString('fr-CI')}
                  </td>
                  <td className="px-4 py-3"><StatutBadge statut={res.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Calendrier des prochaines réunions */}
      <section>
        <h2 className="text-base font-semibold text-neutral-700 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-600" />
          Prochaines réunions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ORGANES.filter((o) => o.prochainReunion).map((organe) => (
            <div key={organe.nom} className="card p-4 flex items-center gap-3">
              <div className="bg-primary-50 text-primary-600 rounded-lg p-2 text-center min-w-[3rem]">
                <p className="text-xs font-medium">
                  {new Date(organe.prochainReunion!).toLocaleDateString('fr-CI', { month: 'short' }).toUpperCase()}
                </p>
                <p className="text-xl font-bold leading-none">
                  {new Date(organe.prochainReunion!).getDate()}
                </p>
              </div>
              <div>
                <p className="font-medium text-neutral-800 text-sm">{organe.nom}</p>
                <p className="text-xs text-neutral-400">{organe.membres} membres attendus</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
