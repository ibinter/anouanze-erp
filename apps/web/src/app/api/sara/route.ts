import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getSaraConfig } from '@/lib/sara/config';
import { getProviderStatuses, runSara } from '@/lib/sara/engine';
import {
  consumeSessionQuota,
  getActiveSessionCount,
  sanitizeMessages,
} from '@/lib/sara/guardrails';
import {
  QUOTA_REACHED_ANSWER,
  SERVICE_UNAVAILABLE_ANSWER,
} from '@/lib/sara/system-prompt';
import {
  getAverageLatencyMs,
  getCounters,
  getLogCount,
  getLogs,
  pushLog,
  recordQuotaBlock,
  recordRequest,
} from '@/lib/sara/telemetry';
import { resolveFallbackProviderId, resolvePrimaryProviderId } from '@/lib/sara/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/sara — Chat SARA.
 * Contrat de réponse inchangé pour le client : { content, sessionId }.
 * Les clés API restent strictement côté serveur : aucune n'est renvoyée.
 */
export async function POST(req: NextRequest) {
  const config = getSaraConfig();
  recordRequest();

  try {
    const body = (await req.json()) as { messages?: unknown; sessionId?: unknown };
    const sid =
      typeof body.sessionId === 'string' && body.sessionId.trim()
        ? body.sessionId.trim().slice(0, 100)
        : `session_${Date.now()}`;

    const sanitized = sanitizeMessages(body.messages, config);
    if (!sanitized.ok || !sanitized.lastUserMessage) {
      return NextResponse.json({
        content: 'Je n\'ai pas reçu de question exploitable. Pouvez-vous reformuler ?',
        sessionId: sid,
      });
    }

    // Quota de messages par session.
    const quota = consumeSessionQuota(sid, config);
    if (!quota.allowed) {
      recordQuotaBlock();
      return NextResponse.json({ content: QUOTA_REACHED_ANSWER, sessionId: sid });
    }

    const result = await runSara(sanitized.messages, sanitized.lastUserMessage);

    pushLog(
      {
        id: `sara_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        userMessage: sanitized.lastUserMessage,
        saraResponse: result.content,
        sessionId: sid,
        provider: result.provider,
        model: result.model,
        fallbackUsed: result.fallbackUsed,
        latencyMs: result.latencyMs,
        totalTokens: result.totalTokens,
      },
      config.maxLogEntries,
    );

    return NextResponse.json({ content: result.content, sessionId: sid });
  } catch (error) {
    console.error('[SARA] Erreur route :', error instanceof Error ? error.message : error);
    return NextResponse.json({ content: SERVICE_UNAVAILABLE_ANSWER });
  }
}

/**
 * GET /api/sara — Console superadmin (lecture seule).
 * Expose le fournisseur actif, le modèle, le statut et les compteurs.
 * N'expose JAMAIS de clé API — uniquement un booléen « configuré ».
 *
 * Accès réservé au rôle SUPER_ADMIN : cet endpoint restitue les conversations
 * des visiteurs, il ne doit pas être public.
 */
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as { role?: string }).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const config = getSaraConfig();
  const primary = resolvePrimaryProviderId();
  const fallback = resolveFallbackProviderId(primary);
  const providers = getProviderStatuses();
  const counters = getCounters();

  const primaryStatus = providers.find((p) => p.id === primary);
  const operational = providers.some((p) => p.configured);

  return NextResponse.json({
    total: getLogCount(),
    logs: getLogs(100),
    engine: {
      primaryProvider: primary,
      primaryModel: primaryStatus?.model ?? null,
      primaryConfigured: primaryStatus?.configured ?? false,
      fallbackProvider: fallback,
      status: operational ? 'operationnel' : 'non-configure',
      providers,
    },
    limits: {
      maxMessagesPerSession: config.maxMessagesPerSession,
      maxTokens: config.maxTokens,
      maxInputChars: config.maxInputChars,
      maxHistoryTurns: config.maxHistoryTurns,
      timeoutMs: config.timeoutMs,
      temperature: config.temperature,
    },
    usage: {
      requests: counters.requests,
      success: counters.success,
      errors: counters.errors,
      fallbacks: counters.fallbacks,
      quotaBlocks: counters.quotaBlocks,
      totalTokens: counters.totalTokens,
      averageLatencyMs: getAverageLatencyMs(),
      activeSessions: getActiveSessionCount(),
      byProvider: counters.byProvider,
      startedAt: counters.startedAt,
    },
  });
}
