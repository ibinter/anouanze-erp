import type { ProviderId } from './types';

/**
 * SARA — Journalisation et compteurs en mémoire.
 * Volontairement non persistant : réinitialisé au redémarrage du serveur.
 * Aucune clé API n'est jamais journalisée.
 */

export interface SaraLogEntry {
  id: string;
  timestamp: string;
  userMessage: string;
  saraResponse: string;
  sessionId: string;
  provider: ProviderId | 'none';
  model: string;
  /** true si la réponse provient du fournisseur de secours. */
  fallbackUsed: boolean;
  latencyMs: number;
  totalTokens?: number;
}

export interface SaraCounters {
  requests: number;
  success: number;
  errors: number;
  fallbacks: number;
  quotaBlocks: number;
  totalTokens: number;
  totalLatencyMs: number;
  byProvider: Record<string, { success: number; errors: number }>;
  startedAt: string;
}

const logs: SaraLogEntry[] = [];

const counters: SaraCounters = {
  requests: 0,
  success: 0,
  errors: 0,
  fallbacks: 0,
  quotaBlocks: 0,
  totalTokens: 0,
  totalLatencyMs: 0,
  byProvider: {},
  startedAt: new Date().toISOString(),
};

function providerBucket(provider: string) {
  if (!counters.byProvider[provider]) {
    counters.byProvider[provider] = { success: 0, errors: 0 };
  }
  return counters.byProvider[provider];
}

export function recordRequest(): void {
  counters.requests += 1;
}

export function recordQuotaBlock(): void {
  counters.quotaBlocks += 1;
}

export function recordProviderError(provider: ProviderId): void {
  counters.errors += 1;
  providerBucket(provider).errors += 1;
}

export function recordFallback(): void {
  counters.fallbacks += 1;
}

export function recordSuccess(provider: ProviderId, latencyMs: number, tokens?: number): void {
  counters.success += 1;
  counters.totalLatencyMs += latencyMs;
  if (tokens) counters.totalTokens += tokens;
  providerBucket(provider).success += 1;
}

export function pushLog(entry: SaraLogEntry, maxEntries: number): void {
  logs.unshift(entry);
  if (logs.length > maxEntries) logs.splice(maxEntries);
}

export function getLogs(limit = 100): SaraLogEntry[] {
  return logs.slice(0, limit);
}

export function getLogCount(): number {
  return logs.length;
}

export function getCounters(): SaraCounters {
  return {
    ...counters,
    byProvider: { ...counters.byProvider },
  };
}

export function getAverageLatencyMs(): number {
  return counters.success > 0 ? Math.round(counters.totalLatencyMs / counters.success) : 0;
}
