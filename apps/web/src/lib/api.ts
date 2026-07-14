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

// Cache de session — évite N appels getSession() simultanés
let _sessionCache: { token: string; exp: number } | null = null;

async function getToken(): Promise<string | null> {
  const now = Date.now();
  if (_sessionCache && now < _sessionCache.exp) return _sessionCache.token;
  const session = await Promise.race([
    getSession(),
    new Promise<null>((res) => setTimeout(() => res(null), 3000)),
  ]);
  const token = (session as any)?.accessToken ?? null;
  if (token) _sessionCache = { token, exp: now + 55 * 1000 };
  return token;
}

// Injecter le token JWT avant chaque requête
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion globale des erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const message = error.response?.data?.message ?? 'Une erreur est survenue';

    if (error.response?.status === 401) {
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  },
);
