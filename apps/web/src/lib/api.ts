import axios from 'axios';

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

// Token stocké par le SessionProvider — lecture synchrone, pas d'HTTP call
let _token: string | null = null;
export function setApiToken(t: string | null) { _token = t; }

// Injecter le token JWT avant chaque requête (synchrone)
api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
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
