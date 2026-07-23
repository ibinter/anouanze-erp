import { SaraProviderError, type ProviderId } from '../types';

/**
 * fetch avec timeout dur (AbortController) — évite qu'un fournisseur lent
 * bloque la route API. La clé API ne transite jamais hors du serveur.
 */
export async function fetchWithTimeout(
  provider: ProviderId,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    const aborted = err instanceof Error && err.name === 'AbortError';
    throw new SaraProviderError(
      provider,
      aborted ? `Timeout après ${timeoutMs} ms` : `Erreur réseau : ${reason}`,
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Lit le corps d'erreur sans jamais laisser fuiter la clé API dans les logs. */
export async function readErrorBody(res: Response): Promise<string> {
  try {
    const text = await res.text();
    return text.slice(0, 500);
  } catch {
    return `HTTP ${res.status}`;
  }
}
