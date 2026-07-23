import {
  SaraProviderError,
  type ChatMessage,
  type ChatOptions,
  type ChatResult,
  type Provider,
  type ProviderId,
} from '../types';
import { fetchWithTimeout, readErrorBody } from './http';

interface OpenAICompatibleResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
}

export interface OpenAICompatibleConfig {
  id: ProviderId;
  label: string;
  endpoint: string;
  defaultModel: string;
  apiKeyEnv: string;
  modelEnv: string;
}

/**
 * Fabrique un Provider pour toute API compatible « OpenAI chat/completions »
 * (Groq, OpenAI, Mistral partagent exactement ce contrat).
 */
export function createOpenAICompatibleProvider(cfg: OpenAICompatibleConfig): Provider {
  return {
    id: cfg.id,
    label: cfg.label,
    defaultModel: process.env[cfg.modelEnv] || cfg.defaultModel,
    apiKeyEnv: cfg.apiKeyEnv,

    isConfigured() {
      return Boolean(process.env[cfg.apiKeyEnv]);
    },

    async chat(messages: ChatMessage[], opts: ChatOptions): Promise<ChatResult> {
      const apiKey = process.env[cfg.apiKeyEnv];
      if (!apiKey) {
        throw new SaraProviderError(cfg.id, `Clé API absente (${cfg.apiKeyEnv})`);
      }
      const model = opts.model || process.env[cfg.modelEnv] || cfg.defaultModel;

      const res = await fetchWithTimeout(
        cfg.id,
        cfg.endpoint,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            max_tokens: opts.maxTokens,
            temperature: opts.temperature,
          }),
        },
        opts.timeoutMs,
      );

      if (!res.ok) {
        throw new SaraProviderError(cfg.id, await readErrorBody(res), res.status);
      }

      const data = (await res.json()) as OpenAICompatibleResponse;
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new SaraProviderError(cfg.id, 'Réponse vide du fournisseur');
      }

      return {
        content,
        provider: cfg.id,
        model,
        usage: {
          promptTokens: data.usage?.prompt_tokens,
          completionTokens: data.usage?.completion_tokens,
          totalTokens: data.usage?.total_tokens,
        },
      };
    },
  };
}
