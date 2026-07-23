import {
  SaraProviderError,
  type ChatMessage,
  type ChatOptions,
  type ChatResult,
  type ProviderId,
} from './types';
import { getProvider, resolveFallbackProviderId, resolvePrimaryProviderId, PROVIDERS, PROVIDER_IDS } from './providers';
import { getSaraConfig } from './config';
import { buildKnowledgeContext } from './knowledge';
import { buildSystemPrompt } from './system-prompt';
import { redactSecrets } from './guardrails';
import { recordFallback, recordProviderError, recordSuccess } from './telemetry';

export interface EngineResult {
  content: string;
  provider: ProviderId;
  model: string;
  fallbackUsed: boolean;
  latencyMs: number;
  totalTokens?: number;
  /** Titres des passages de la base de connaissances injectés. */
  knowledgeUsed: boolean;
}

/**
 * Exécute une complétion SARA : construit le message système (garde-fous +
 * base de connaissances), appelle le fournisseur principal puis, en cas
 * d'échec, le fournisseur de secours.
 */
export async function runSara(
  messages: ChatMessage[],
  lastUserMessage: string,
): Promise<EngineResult> {
  const config = getSaraConfig();
  const knowledgeContext = buildKnowledgeContext(lastUserMessage);
  const systemPrompt = buildSystemPrompt(knowledgeContext);

  const payload: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...messages];

  const opts: ChatOptions = {
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    timeoutMs: config.timeoutMs,
  };

  const primaryId = resolvePrimaryProviderId();
  const fallbackId = resolveFallbackProviderId(primaryId);
  const chain: ProviderId[] = fallbackId ? [primaryId, fallbackId] : [primaryId];

  let lastError: unknown = null;

  for (let i = 0; i < chain.length; i++) {
    const id = chain[i];
    const provider = getProvider(id);
    if (!provider.isConfigured()) {
      lastError = new SaraProviderError(id, `Fournisseur non configuré (${provider.apiKeyEnv})`);
      recordProviderError(id);
      continue;
    }

    const startedAt = Date.now();
    try {
      const result: ChatResult = await provider.chat(payload, opts);
      const latencyMs = Date.now() - startedAt;
      const fallbackUsed = i > 0;
      if (fallbackUsed) recordFallback();
      recordSuccess(id, latencyMs, result.usage?.totalTokens);

      return {
        content: redactSecrets(result.content),
        provider: result.provider,
        model: result.model,
        fallbackUsed,
        latencyMs,
        totalTokens: result.usage?.totalTokens,
        knowledgeUsed: knowledgeContext.length > 0,
      };
    } catch (err) {
      lastError = err;
      recordProviderError(id);
      const detail = err instanceof Error ? err.message : String(err);
      console.error(`[SARA] Échec fournisseur ${id} : ${detail}`);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Aucun fournisseur SARA disponible.');
}

export interface ProviderStatus {
  id: ProviderId;
  label: string;
  model: string;
  configured: boolean;
  role: 'principal' | 'secours' | 'inactif';
}

/** État de configuration des fournisseurs — sans jamais exposer de clé. */
export function getProviderStatuses(): ProviderStatus[] {
  const primaryId = resolvePrimaryProviderId();
  const fallbackId = resolveFallbackProviderId(primaryId);

  return PROVIDER_IDS.map((id) => {
    const provider = PROVIDERS[id];
    return {
      id,
      label: provider.label,
      model: provider.defaultModel,
      configured: provider.isConfigured(),
      role: id === primaryId ? 'principal' : id === fallbackId ? 'secours' : 'inactif',
    };
  });
}
