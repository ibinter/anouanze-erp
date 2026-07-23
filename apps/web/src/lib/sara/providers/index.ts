import type { Provider, ProviderId } from '../types';
import { createOpenAICompatibleProvider } from './openai-compatible';
import { anthropicProvider } from './anthropic';

/**
 * Fournisseur historique — comportement IDENTIQUE à l'implémentation d'origine
 * (endpoint Groq, modèle llama-3.3-70b-versatile, GROQ_API_KEY inchangée).
 */
export const groqProvider: Provider = createOpenAICompatibleProvider({
  id: 'groq',
  label: 'Groq',
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  defaultModel: 'llama-3.3-70b-versatile',
  apiKeyEnv: 'GROQ_API_KEY',
  modelEnv: 'SARA_GROQ_MODEL',
});

export const openaiProvider: Provider = createOpenAICompatibleProvider({
  id: 'openai',
  label: 'OpenAI',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  defaultModel: 'gpt-4o-mini',
  apiKeyEnv: 'OPENAI_API_KEY',
  modelEnv: 'SARA_OPENAI_MODEL',
});

export const mistralProvider: Provider = createOpenAICompatibleProvider({
  id: 'mistral',
  label: 'Mistral AI',
  endpoint: 'https://api.mistral.ai/v1/chat/completions',
  defaultModel: 'mistral-small-latest',
  apiKeyEnv: 'MISTRAL_API_KEY',
  modelEnv: 'SARA_MISTRAL_MODEL',
});

export const PROVIDERS: Record<ProviderId, Provider> = {
  groq: groqProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider,
  mistral: mistralProvider,
};

export const PROVIDER_IDS: ProviderId[] = ['groq', 'openai', 'anthropic', 'mistral'];

export function isProviderId(value: string): value is ProviderId {
  return (PROVIDER_IDS as string[]).includes(value);
}

export function getProvider(id: ProviderId): Provider {
  return PROVIDERS[id];
}

/** Fournisseur principal : SARA_PROVIDER, sinon `groq`. */
export function resolvePrimaryProviderId(): ProviderId {
  const raw = (process.env.SARA_PROVIDER || '').trim().toLowerCase();
  return raw && isProviderId(raw) ? raw : 'groq';
}

/**
 * Fournisseur de secours : SARA_FALLBACK_PROVIDER si valide et différent du
 * principal. Sinon, premier fournisseur configuré (clé API présente) autre que
 * le principal. Retourne null si aucun secours n'est disponible.
 */
export function resolveFallbackProviderId(primary: ProviderId): ProviderId | null {
  const raw = (process.env.SARA_FALLBACK_PROVIDER || '').trim().toLowerCase();
  if (raw === 'none') return null;
  if (raw && isProviderId(raw) && raw !== primary) return raw;
  const auto = PROVIDER_IDS.find((id) => id !== primary && PROVIDERS[id].isConfigured());
  return auto ?? null;
}
