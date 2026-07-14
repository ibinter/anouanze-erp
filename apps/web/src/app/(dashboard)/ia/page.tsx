'use client';

import { Sparkles, Lightbulb, AlertTriangle, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { AiChat } from './AiChat';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface IaAnalyse {
  insights: string[];
  recommandations: string[];
  alertes: string[];
}

export default function IaPage() {
  const [loadingRapport, setLoadingRapport] = useState(false);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);
  const [analyse, setAnalyse] = useState<IaAnalyse | null>(null);
  const [loadingAnalyse, setLoadingAnalyse] = useState(true);

  async function chargerAnalyse() {
    setLoadingAnalyse(true);
    try {
      const res = await api.post<IaAnalyse>('/ia/analyser-tableau-bord', {});
      setAnalyse(res.data);
    } catch {
      // Fallback silencieux — le composant affiche un état vide
    } finally {
      setLoadingAnalyse(false);
    }
  }

  useEffect(() => {
    chargerAnalyse();
  }, []);

  async function genererRapport() {
    setLoadingRapport(true);
    try {
      await api.post('/ia/rapport-narratif', { type: 'trimestriel', params: {} });
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
      await api.get('/ia/anomalies');
      toast.success('Analyse des anomalies terminée');
    } catch {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setLoadingAnomalies(false);
    }
  }

  const insights = analyse?.insights ?? [];
  const alertes = analyse?.alertes ?? [];
  const recommandations = analyse?.recommandations ?? [];

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col gap-6">
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
          {/* Insights */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-accent-400" />
                <h2 className="font-semibold text-sm text-neutral-800">Insights IA</h2>
              </div>
              <button
                onClick={chargerAnalyse}
                disabled={loadingAnalyse}
                className="p-1 rounded hover:bg-neutral-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-neutral-400 ${loadingAnalyse ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {loadingAnalyse ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-neutral-100 rounded animate-pulse" />
                ))}
              </div>
            ) : insights.length > 0 ? (
              <ul className="space-y-2">
                {insights.map((ins, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-600">
                    <Lightbulb className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" />
                    {ins}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-400">Aucun insight disponible</p>
            )}
          </div>

          {/* Alertes */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="font-semibold text-sm text-neutral-800">Alertes détectées</h2>
            </div>
            {loadingAnalyse ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-10 bg-neutral-100 rounded animate-pulse" />
                ))}
              </div>
            ) : alertes.length > 0 ? (
              <ul className="space-y-2">
                {alertes.map((a, i) => (
                  <li key={i} className="p-3 rounded-lg bg-red-50 text-sm text-neutral-700">
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-400 italic">Aucune alerte critique détectée</p>
            )}
          </div>

          {/* Recommandations */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" />
              <h2 className="font-semibold text-sm text-neutral-800">Recommandations</h2>
            </div>
            {loadingAnalyse ? (
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="h-4 bg-neutral-100 rounded animate-pulse" />
                ))}
              </div>
            ) : recommandations.length > 0 ? (
              <ul className="space-y-2">
                {recommandations.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-600">
                    <CheckCircle className="w-3.5 h-3.5 text-primary-600 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-400">Aucune recommandation disponible</p>
            )}
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
