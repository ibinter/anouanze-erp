'use client';

import { Sparkles, Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { AiChat } from './AiChat';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';

const INSIGHTS = [
  { id: 1, texte: 'Vos dépenses RH ont augmenté de 18% ce trimestre par rapport au précédent.' },
  { id: 2, texte: 'Le projet Eau Potable atteint 92% de ses objectifs MEAL — clôture recommandée.' },
  { id: 3, texte: 'Trésorerie stable avec une réserve de 3,2 mois de charges opérationnelles.' },
];

const ALERTES = [
  { id: 1, message: 'Dépense imprévue de 450 000 FCFA détectée sur le budget Logistique', niveau: 'Élevé' },
  { id: 2, message: '3 cotisations membres sans versement depuis plus de 90 jours', niveau: 'Moyen' },
];

const RECOMMANDATIONS = [
  { id: 1, texte: 'Négocier un avenant avec le bailleur AFD avant la clôture Q3 2026.' },
  { id: 2, texte: 'Lancer une campagne de recouvrement des cotisations membres en retard.' },
  { id: 3, texte: 'Consolider les lignes budgétaires Transports et Carburant en une seule rubrique.' },
];

export default function IaPage() {
  const [loadingRapport, setLoadingRapport] = useState(false);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);

  async function genererRapport() {
    setLoadingRapport(true);
    try {
      await api.post('/ia/rapport-narratif', {});
      toast.success('Rapport narratif généré avec succès');
    } catch {
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setLoadingRapport(false);
    }
  }

  async function analyserAnomalies() {
    setLoadingAnomalies(true);
    try {
      await api.post('/ia/analyser-anomalies', {});
      toast.success('Analyse des anomalies terminée');
    } catch {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setLoadingAnomalies(false);
    }
  }

  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-50 rounded-xl">
          <Sparkles className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-neutral-800">ANOUANZÊ AI</h1>
            <span className="badge-info text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">Bêta</span>
          </div>
          <p className="text-sm text-neutral-500">Assistant intelligent pour votre organisation</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 card flex flex-col min-h-[500px] lg:min-h-0 p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="font-medium text-sm text-neutral-700">Conversation</span>
          </div>
          <div className="flex-1 min-h-0">
            <AiChat />
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-4">
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-accent-400" />
              <h2 className="font-semibold text-sm text-neutral-800">Insights IA</h2>
            </div>
            <ul className="space-y-2">
              {INSIGHTS.map((ins) => (
                <li key={ins.id} className="flex gap-2 text-sm text-neutral-600">
                  <Lightbulb className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" />
                  {ins.texte}
                </li>
              ))}
            </ul>
          </div>

          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="font-semibold text-sm text-neutral-800">Alertes détectées</h2>
            </div>
            <ul className="space-y-2">
              {ALERTES.map((a) => (
                <li key={a.id} className="p-3 rounded-lg bg-red-50 text-sm">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded mr-2 ${a.niveau === 'Élevé' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {a.niveau}
                  </span>
                  <span className="text-neutral-700">{a.message}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-sm text-neutral-800">Recommandations</h2>
            </div>
            <ul className="space-y-2">
              {RECOMMANDATIONS.map((r) => (
                <li key={r.id} className="flex gap-2 text-sm text-neutral-600">
                  <CheckCircle className="w-3.5 h-3.5 text-primary-600 mt-0.5 shrink-0" />
                  {r.texte}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={genererRapport}
              disabled={loadingRapport}
              className="btn-primary w-full text-sm disabled:opacity-60"
            >
              {loadingRapport ? 'Génération...' : 'Générer rapport narratif'}
            </button>
            <button
              onClick={analyserAnomalies}
              disabled={loadingAnomalies}
              className="btn-secondary w-full text-sm disabled:opacity-60"
            >
              {loadingAnomalies ? 'Analyse...' : 'Analyser anomalies'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
