import {
  SaraProviderError,
  type ChatMessage,
  type ChatOptions,
  type ChatResult,
  type Provider,
} from '../types';
import { fetchWithTimeout, readErrorBody } from './http';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-3-5-haiku-latest';
const API_VERSION = '2023-06-01';

interface AnthropicResponse {
  content?: Array<{ type?: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

/**
 * Fournisseur Anthropic (Messages API).
 * Particularité : le message système est un paramètre `system` distinct,
 * il ne fait pas partie du tableau `messages`.
 */
export const anthropicProvider: Provider = {
  id: 'anthropic',
  label: 'Anthropic',
  defaultModel: process.env.SARA_ANTHROPIC_MODEL || DEFAULT_MODEL,
  apiKeyEnv: 'ANTHROPIC_API_KEY',

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  async chat(messages: ChatMessage[], opts: ChatOptions): Promise<ChatResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new SaraProviderError('anthropic', 'Clé API absente (ANTHROPIC_API_KEY)');
    }
    const model = opts.model || process.env.SARA_ANTHROPIC_MODEL || DEFAULT_MODEL;

    const system = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n\n');
    const turns = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

    if (turns.length === 0) {
      throw new SaraProviderError('anthropic', 'Aucun message utilisateur à traiter');
    }

    const res = await fetchWithTimeout(
      'anthropic',
      ENDPOINT,
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': API_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          system: system || undefined,
          messages: turns,
          max_tokens: opts.maxTokens,
          temperature: opts.temperature,
        }),
      },
      opts.timeoutMs,
    );

    if (!res.ok) {
      throw new SaraProviderError('anthropic', await readErrorBody(res), res.status);
    }

    const data = (await res.json()) as AnthropicResponse;
    const content = (data.content || [])
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text as string)
      .join('')
      .trim();

    if (!content) {
      throw new SaraProviderError('anthropic', 'Réponse vide du fournisseur');
    }

    const promptTokens = data.usage?.input_tokens;
    const completionTokens = data.usage?.output_tokens;

    return {
      content,
      provider: 'anthropic',
      model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens:
          promptTokens !== undefined && completionTokens !== undefined
            ? promptTokens + completionTokens
            : undefined,
      },
    };
  },
};
