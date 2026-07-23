/**
 * SARA — Configuration serveur (quotas, limites, timeouts).
 * Toutes les valeurs sont surchargeables par variables d'environnement.
 * Aucune de ces valeurs n'est un secret ; les clés API restent dans les
 * providers et ne sortent jamais du serveur.
 */

function intEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function floatEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export interface SaraConfig {
  /** Nombre max de messages utilisateur par session. */
  maxMessagesPerSession: number;
  /** Nombre max de tours d'historique renvoyés au modèle. */
  maxHistoryTurns: number;
  /** Longueur max (caractères) d'un message entrant. */
  maxInputChars: number;
  /** Budget max (caractères) de l'historique envoyé au modèle. */
  maxContextChars: number;
  /** Tokens max générés par réponse. */
  maxTokens: number;
  /** Température d'échantillonnage. */
  temperature: number;
  /** Timeout par appel fournisseur (ms). */
  timeoutMs: number;
  /** Nombre max d'entrées de journal conservées en mémoire. */
  maxLogEntries: number;
}

export function getSaraConfig(): SaraConfig {
  return {
    maxMessagesPerSession: intEnv('SARA_MAX_MESSAGES_PER_SESSION', 30, 1, 500),
    maxHistoryTurns: intEnv('SARA_MAX_HISTORY_TURNS', 12, 2, 60),
    maxInputChars: intEnv('SARA_MAX_INPUT_CHARS', 2000, 100, 20000),
    maxContextChars: intEnv('SARA_MAX_CONTEXT_CHARS', 12000, 1000, 100000),
    maxTokens: intEnv('SARA_MAX_TOKENS', 512, 64, 4096),
    temperature: floatEnv('SARA_TEMPERATURE', 0.7, 0, 2),
    timeoutMs: intEnv('SARA_TIMEOUT_MS', 20000, 1000, 60000),
    maxLogEntries: intEnv('SARA_MAX_LOG_ENTRIES', 500, 50, 5000),
  };
}
