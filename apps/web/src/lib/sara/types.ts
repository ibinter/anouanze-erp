/**
 * SARA — Types communs de la couche IA multi-fournisseur.
 * Tout ce fichier est exécuté EXCLUSIVEMENT côté serveur.
 */

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatOptions {
  /** Nombre maximum de tokens générés. */
  maxTokens: number;
  /** Température d'échantillonnage. */
  temperature: number;
  /** Timeout réseau (ms). */
  timeoutMs: number;
  /** Modèle explicite (sinon modèle par défaut du fournisseur). */
  model?: string;
}

export interface ChatResult {
  content: string;
  /** Identifiant du fournisseur ayant réellement produit la réponse. */
  provider: ProviderId;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export type ProviderId = 'groq' | 'openai' | 'anthropic' | 'mistral';

export interface Provider {
  readonly id: ProviderId;
  readonly label: string;
  /** Modèle par défaut utilisé si aucun n'est fourni. */
  readonly defaultModel: string;
  /** Nom de la variable d'environnement portant la clé API. */
  readonly apiKeyEnv: string;
  /** true si la clé API est présente côté serveur. */
  isConfigured(): boolean;
  /** Exécute une complétion de chat. Lève une SaraProviderError en cas d'échec. */
  chat(messages: ChatMessage[], opts: ChatOptions): Promise<ChatResult>;
}

export class SaraProviderError extends Error {
  readonly provider: ProviderId;
  readonly status?: number;

  constructor(provider: ProviderId, message: string, status?: number) {
    super(message);
    this.name = 'SaraProviderError';
    this.provider = provider;
    this.status = status;
  }
}
