import type { ChatMessage, ChatRole } from './types';
import type { SaraConfig } from './config';

/* ─── Validation & normalisation des messages entrants ─────────────────── */

export interface SanitizeResult {
  ok: boolean;
  messages: ChatMessage[];
  lastUserMessage: string;
  error?: string;
}

function isRole(value: unknown): value is ChatRole {
  return value === 'user' || value === 'assistant' || value === 'system';
}

/**
 * Valide le corps de la requête, ignore tout message `system` fourni par le
 * client (protection contre l'injection de prompt), tronque et borne le
 * contexte selon la configuration.
 */
export function sanitizeMessages(input: unknown, config: SaraConfig): SanitizeResult {
  if (!Array.isArray(input)) {
    return { ok: false, messages: [], lastUserMessage: '', error: 'Format de requête invalide.' };
  }

  const cleaned: ChatMessage[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const candidate = raw as { role?: unknown; content?: unknown };
    if (!isRole(candidate.role)) continue;
    // Un message système ne peut JAMAIS venir du navigateur.
    if (candidate.role === 'system') continue;
    if (typeof candidate.content !== 'string') continue;
    const content = candidate.content.trim().slice(0, config.maxInputChars);
    if (!content) continue;
    cleaned.push({ role: candidate.role, content });
  }

  if (cleaned.length === 0) {
    return { ok: false, messages: [], lastUserMessage: '', error: 'Aucun message exploitable.' };
  }

  // Limite du nombre de tours conservés (les plus récents).
  let windowed = cleaned.slice(-config.maxHistoryTurns);

  // Limite du budget de contexte en caractères (on retire les plus anciens).
  let total = windowed.reduce((sum, m) => sum + m.content.length, 0);
  while (windowed.length > 1 && total > config.maxContextChars) {
    total -= windowed[0].content.length;
    windowed = windowed.slice(1);
  }

  const lastUser = [...windowed].reverse().find((m) => m.role === 'user');

  return {
    ok: true,
    messages: windowed,
    lastUserMessage: lastUser?.content ?? '',
  };
}

/** Compte les messages utilisateur d'une conversation. */
export function countUserMessages(messages: ChatMessage[]): number {
  return messages.filter((m) => m.role === 'user').length;
}

/* ─── Quota par session (compteur en mémoire) ──────────────────────────── */

interface SessionState {
  count: number;
  firstSeen: number;
  lastSeen: number;
}

const SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 h
const MAX_TRACKED_SESSIONS = 5000;

const sessions = new Map<string, SessionState>();

function pruneSessions(now: number): void {
  for (const [id, state] of sessions) {
    if (now - state.lastSeen > SESSION_TTL_MS) sessions.delete(id);
  }
  if (sessions.size > MAX_TRACKED_SESSIONS) {
    const sorted = [...sessions.entries()].sort((a, b) => a[1].lastSeen - b[1].lastSeen);
    const excess = sessions.size - MAX_TRACKED_SESSIONS;
    for (let i = 0; i < excess; i++) sessions.delete(sorted[i][0]);
  }
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
}

/** Incrémente et vérifie le quota de messages d'une session. */
export function consumeSessionQuota(sessionId: string, config: SaraConfig): QuotaResult {
  const now = Date.now();
  pruneSessions(now);

  const state = sessions.get(sessionId) ?? { count: 0, firstSeen: now, lastSeen: now };
  state.count += 1;
  state.lastSeen = now;
  sessions.set(sessionId, state);

  return {
    allowed: state.count <= config.maxMessagesPerSession,
    used: state.count,
    limit: config.maxMessagesPerSession,
  };
}

export function getActiveSessionCount(): number {
  pruneSessions(Date.now());
  return sessions.size;
}

/** Réinitialise les compteurs de session (tests / maintenance). */
export function resetSessionQuotas(): void {
  sessions.clear();
}

/* ─── Nettoyage de la réponse du modèle ────────────────────────────────── */

const SECRET_PATTERNS: RegExp[] = [
  /\bgsk_[A-Za-z0-9]{8,}/g,
  /\bsk-[A-Za-z0-9-_]{12,}/g,
  /\bsk-ant-[A-Za-z0-9-_]{8,}/g,
  /\b(?:GROQ|OPENAI|ANTHROPIC|MISTRAL)_API_KEY\s*[:=]\s*\S+/gi,
];

/**
 * Filet de sécurité final : masque tout ce qui ressemblerait à une clé API
 * dans la réponse produite par le modèle.
 */
export function redactSecrets(text: string): string {
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, '[information confidentielle masquée]');
  }
  return out;
}
