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

// Fallback : une seule promesse getSession() partagée, jamais en rafale
let _sessionPromise: Promise<string | null> | null = null;
async function resolveToken(): Promise<string | null> {
  if (_token) return _token;                       // voie rapide
  if (!_sessionPromise) {
    _sessionPromise = getSession()
      .then((s) => {
        const t = (s as any)?.accessToken ?? null;
        if (t) _token = t;
        return t;
      })
      .finally(() => { _sessionPromise = null; });
  }
  return _sessionPromise;                           // requêtes concurrentes partagent la même promesse
}

// Injecter le token JWT avant chaque requête
api.interceptors.request.use(async (config) => {
  const token = await resolveToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion globale des erreurs — pas de redirection brutale (évite les boucles)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? 'Une erreur est survenue';
    return Promise.reject(new Error(message));
  },
);
