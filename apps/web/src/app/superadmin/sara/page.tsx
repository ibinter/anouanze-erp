'use client';

import { useState, useEffect } from 'react';

interface SaraLog {
  id: string;
  timestamp: string;
  userMessage: string;
  saraResponse: string;
  sessionId: string;
  provider?: string;
  model?: string;
  fallbackUsed?: boolean;
  latencyMs?: number;
  totalTokens?: number;
}

interface ProviderStatus {
  id: string;
  label: string;
  model: string;
  configured: boolean;
  role: 'principal' | 'secours' | 'inactif';
}

interface EngineInfo {
  primaryProvider: string;
  primaryModel: string | null;
  primaryConfigured: boolean;
  fallbackProvider: string | null;
  status: 'operationnel' | 'non-configure';
  providers: ProviderStatus[];
}

interface LimitsInfo {
  maxMessagesPerSession: number;
  maxTokens: number;
  maxInputChars: number;
  maxHistoryTurns: number;
  timeoutMs: number;
  temperature: number;
}

interface UsageInfo {
  requests: number;
  success: number;
  errors: number;
  fallbacks: number;
  quotaBlocks: number;
  totalTokens: number;
  averageLatencyMs: number;
  activeSessions: number;
  byProvider: Record<string, { success: number; errors: number }>;
  startedAt: string;
}

interface SaraStats {
  total: number;
  logs: SaraLog[];
  engine?: EngineInfo;
  limits?: LimitsInfo;
  usage?: UsageInfo;
}

const EMPTY: SaraStats = { total: 0, logs: [] };

export default function SaraAdminPage() {
  const [data, setData] = useState<SaraStats>(EMPTY);
  const [selected, setSelected] = useState<SaraLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/sara');
      if (res.status === 401 || res.status === 403) {
        setDenied(true);
        return;
      }
      const json = (await res.json()) as SaraStats;
      setDenied(false);
      setData({ ...EMPTY, ...json });
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
  const engine = data.engine;
  const usage = data.usage;
  const limits = data.limits;

  const roleBadge: Record<ProviderStatus['role'], string> = {
    principal: 'bg-green-900/40 text-green-400 border-green-800',
    secours: 'bg-amber-900/40 text-amber-400 border-amber-800',
    inactif: 'bg-neutral-800 text-neutral-500 border-neutral-700',
  };

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

      {denied && (
        <div className="bg-red-900/20 border border-red-800/60 rounded-xl p-5 text-sm text-red-300">
          Accès refusé : la console SARA est réservée au rôle <span className="font-semibold">SUPER_ADMIN</span>. Reconnectez-vous avec un compte autorisé.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Échanges totaux', val: data.total, color: 'text-primary-400' },
          { label: 'Sessions uniques', val: sessions, color: 'text-cyan-400' },
          { label: 'Aujourd\'hui', val: data.logs.filter(l => l.timestamp.startsWith(new Date().toISOString().slice(0, 10))).length, color: 'text-green-400' },
          {
            label: 'Modèle IA',
            val: engine?.primaryModel ? `${engine.primaryProvider} · ${engine.primaryModel}` : '—',
            color: 'text-yellow-400',
          },
        ].map(k => (
          <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-1">{k.label}</p>
            <p className={`text-xl font-bold ${k.color} break-words`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Moteur IA */}
      {engine && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm font-semibold text-white">Moteur IA — fournisseurs</p>
            <span className={`text-xs px-2.5 py-1 rounded-full border ${engine.status === 'operationnel' ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-red-900/40 text-red-400 border-red-800'}`}>
              {engine.status === 'operationnel' ? '● Opérationnel' : '● Non configuré'}
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
              <span>Principal : <span className="text-white font-semibold">{engine.primaryProvider}</span></span>
              <span>·</span>
              <span>Secours : <span className="text-white font-semibold">{engine.fallbackProvider ?? 'aucun'}</span></span>
              <span>·</span>
              <span className="text-neutral-500">Sélection via <code className="text-neutral-300">SARA_PROVIDER</code> / <code className="text-neutral-300">SARA_FALLBACK_PROVIDER</code></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-xs text-neutral-500 border-b border-neutral-800">
                    <th className="text-left font-medium py-2">Fournisseur</th>
                    <th className="text-left font-medium py-2">Modèle</th>
                    <th className="text-left font-medium py-2">Clé API</th>
                    <th className="text-left font-medium py-2">Rôle</th>
                    <th className="text-right font-medium py-2">OK / KO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {engine.providers.map(p => {
                    const stat = usage?.byProvider?.[p.id];
                    return (
                      <tr key={p.id}>
                        <td className="py-2 text-white font-medium">{p.label}</td>
                        <td className="py-2 text-neutral-400 font-mono text-xs">{p.model}</td>
                        <td className="py-2">
                          <span className={p.configured ? 'text-green-400' : 'text-neutral-600'}>
                            {p.configured ? '✓ configurée' : '— absente'}
                          </span>
                        </td>
                        <td className="py-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${roleBadge[p.role]}`}>{p.role}</span>
                        </td>
                        <td className="py-2 text-right text-neutral-400 font-mono text-xs">
                          {stat ? `${stat.success} / ${stat.errors}` : '0 / 0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-neutral-600">Console en lecture seule. Les clés API ne sont jamais exposées : seul l&apos;état « configurée » est remonté.</p>
          </div>
        </div>
      )}

      {/* Compteurs d'utilisation */}
      {usage && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Requêtes', val: usage.requests },
            { label: 'Réussites', val: usage.success },
            { label: 'Erreurs fournisseur', val: usage.errors },
            { label: 'Bascules secours', val: usage.fallbacks },
            { label: 'Quotas atteints', val: usage.quotaBlocks },
            { label: 'Tokens consommés', val: usage.totalTokens },
            { label: 'Latence moyenne', val: `${usage.averageLatencyMs} ms` },
            { label: 'Sessions actives', val: usage.activeSessions },
          ].map(k => (
            <div key={k.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-xs text-neutral-500 mb-1">{k.label}</p>
              <p className="text-lg font-bold text-neutral-200">{k.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Limites actives */}
      {limits && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-sm font-semibold text-white mb-3">Garde-fous techniques actifs</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              `${limits.maxMessagesPerSession} messages / session`,
              `${limits.maxTokens} tokens max / réponse`,
              `${limits.maxInputChars} caractères max / message`,
              `${limits.maxHistoryTurns} tours d'historique`,
              `timeout ${limits.timeoutMs} ms`,
              `température ${limits.temperature}`,
            ].map(t => (
              <span key={t} className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300">{t}</span>
            ))}
          </div>
          {usage && (
            <p className="text-xs text-neutral-600 mt-3">Compteurs en mémoire depuis le {new Date(usage.startedAt).toLocaleString('fr-CI')} — réinitialisés au redémarrage du serveur.</p>
          )}
        </div>
      )}

      {loading && data.logs.length === 0 && (
        <div className="text-center py-16 text-neutral-500">
          <p className="text-4xl mb-3">🤖</p>
          <p>Chargement des conversations...</p>
        </div>
      )}

      {!loading && data.logs.length === 0 && (
        <div className="text-center py-16 text-neutral-500 bg-neutral-900 rounded-xl border border-neutral-800">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold text-neutral-300">Aucune conversation pour l&apos;instant</p>
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
                  {log.provider && (
                    <p className="text-[10px] text-neutral-600 mt-1 font-mono">
                      {log.provider}{log.fallbackUsed ? ' (secours)' : ''}
                      {typeof log.latencyMs === 'number' ? ` · ${log.latencyMs} ms` : ''}
                      {typeof log.totalTokens === 'number' ? ` · ${log.totalTokens} tk` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Détail */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-800">
              <p className="text-sm font-semibold text-white">Détail de l&apos;échange</p>
            </div>
            {selected ? (
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
                  <span>🕐 {new Date(selected.timestamp).toLocaleString('fr-CI')}</span>
                  <span>·</span>
                  <span>Session : <span className="font-mono text-neutral-300">{selected.sessionId}</span></span>
                  {selected.provider && (
                    <>
                      <span>·</span>
                      <span>Moteur : <span className="font-mono text-neutral-300">{selected.provider}{selected.model ? ` / ${selected.model}` : ''}</span></span>
                    </>
                  )}
                  {selected.fallbackUsed && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-800">secours</span>
                  )}
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
