import axios from 'axios';
import { getSession } from 'next-auth/react';

function resolveBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
  if (raw.endsWith('/v1') || raw.endsWith('/v1/')) return raw.replace(/\/$/, '');
  return raw.replace(/\/$/, '') + '/v1';
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Token en mémoire — poussé par le SessionProvider (voie rapide synchrone)
let _token: string | null = null;
export function setApiToken(t: string | null) { _token = t; }

// Récupère le token depuis NextAuth (déclenche le refresh serveur si expiré).
// Une seule promesse partagée → pas de rafale de requêtes concurrentes.
let _sessionPromise: Promise<string | null> | null = null;
async function fetchToken(force = false): Promise<string | null> {
  if (_token && !force) return _token;             // voie rapide
  if (!_sessionPromise) {
    _sessionPromise = getSession()
      .then((s) => {
        const t = (s as any)?.accessToken ?? null;
        _token = t;
        return t;
      })
      .finally(() => { _sessionPromise = null; });
  }
  return _sessionPromise;
}

/**
 * Langue active, lue depuis le cookie posé par le sélecteur de langue.
 * Sert à demander à l'API des messages d'erreur dans la bonne langue
 * (l'API traduit ses exceptions selon l'en-tête Accept-Language).
 */
function localeCourante(): string {
  if (typeof document === 'undefined') return 'fr';
  const m = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  return m?.[1] === 'en' ? 'en' : 'fr';
}

// Injecter le token JWT et la langue avant chaque requête
api.interceptors.request.use(async (config) => {
  const token = await fetchToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = localeCourante();
  return config;
});

// Sur 401 : le token a probablement expiré → on force un refresh et on réessaie une fois
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      _token = null;                               // invalide le cache
      const fresh = await fetchToken(true);        // force getSession → refresh serveur
      if (fresh) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${fresh}`;
        return api(original);
      }
    }
    const message = error.response?.data?.message ?? 'Une erreur est survenue';
    return Promise.reject(new Error(message));
  },
);
