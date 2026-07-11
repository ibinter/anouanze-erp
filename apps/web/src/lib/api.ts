import axios from 'axios';
import { getSession } from 'next-auth/react';

export const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api') + '/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Injecter le token JWT avant chaque requête
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
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
