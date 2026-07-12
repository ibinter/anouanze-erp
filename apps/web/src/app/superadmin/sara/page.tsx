'use client';

import { useState, useEffect } from 'react';

interface SaraLog {
  id: string;
  timestamp: string;
  userMessage: string;
  saraResponse: string;
  sessionId: string;
}

interface SaraStats {
  total: number;
  logs: SaraLog[];
}

export default function SaraAdminPage() {
  const [data, setData] = useState<SaraStats>({ total: 0, logs: [] });
  const [selected, setSelected] = useState<SaraLog | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/sara');
      const json = await res.json();
      setData(json);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const sessions = [...new Set(data.logs.map(l => l.sessionId))].length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SARA — Assistant IA</h1>
          <p className="text-neutral-400 text-sm mt-1">Conversations des visiteurs de la landing page</p>
        </div>
        <button onClick={fetchLogs} className="text-sm text-primary-400 hover:text-primary-300 border border-primary-700 rounded-lg px-4 py-2 transition-colors">
          ↻ Actualiser
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Échanges totaux', val: data.total, color: 'text-primary-400' },
          { label: 'Sessions uniques', val: sessions, color: 'text-cyan-400' },
          { label: 'Aujourd\'hui', val: data.logs.filter(l => l.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length, color: 'text-green-400' },
          { label: 'Modèle IA', val: 'Groq LLaMA 3.3', color: 'text-yellow-400' },
        ].map(k => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {loading && data.logs.length === 0 && (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-4xl mb-3">🤖</p>
          <p>Chargement des conversations...</p>
        </div>
      )}

      {!loading && data.logs.length === 0 && (
        <div className="text-center py-16 text-neutral-500 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold text-neutral-300">Aucune conversation pour l'instant</p>
          <p className="text-sm mt-2">Les échanges des visiteurs avec SARA apparaîtront ici en temps réel.</p>
          <p className="text-xs mt-4 text-neutral-600">Les logs sont conservés en mémoire — réinitialisés au redémarrage du serveur.</p>
        </div>
      )}

      {data.logs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-800">
              <p className="text-sm font-semibold text-white">Derniers échanges</p>
            </div>
            <div className="divide-y divide-neutral-800 max-h-[500px] overflow-y-auto">
              {data.logs.map(log => (
                <div
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className={`px-5 py-3 cursor-pointer hover:bg-neutral-800/60 transition-colors ${selected?.id === log.id ? 'bg-neutral-800' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-mono text-neutral-500">{log.sessionId.slice(0, 16)}…</p>
                    <p className="text-xs text-neutral-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString('fr-CI')}</p>
                  </div>
                  <p className="text-sm text-white line-clamp-1">💬 {log.userMessage}</p>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">🤖 {log.saraResponse.slice(0, 80)}…</p>
                </div>
              ))}
            </div>
          </div>

          {/* Détail */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-800">
              <p className="text-sm font-semibold text-white">Détail de l'échange</p>
            </div>
            {selected ? (
              <div className="p-5 space-y-4">
                <div className="flex gap-3 text-xs text-neutral-400">
                  <span>🕐 {new Date(selected.timestamp).toLocaleString('fr-CI')}</span>
                  <span>·</span>
                  <span>Session : <span className="font-mono text-neutral-300">{selected.sessionId}</span></span>
                </div>
                <div className="p-4 bg-primary-900/30 border border-primary-800/50 rounded-xl">
                  <p className="text-xs text-primary-400 font-semibold mb-2">💬 VISITEUR</p>
                  <p className="text-sm text-white">{selected.userMessage}</p>
                </div>
                <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-xl">
                  <p className="text-xs text-green-400 font-semibold mb-2">🤖 SARA</p>
                  <p className="text-sm text-neutral-200 whitespace-pre-wrap">{selected.saraResponse}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-500 text-sm">
                Sélectionnez un échange pour voir le détail
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
