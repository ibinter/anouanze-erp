'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { NotificationItem, PreferencesNotification } from './types';

/** Intervalle de rafraîchissement de la cloche (pas de WebSocket : simple et robuste). */
export const NOTIF_REFETCH_MS = 60_000;

export const notificationKeys = {
  all: ['notifications'] as const,
  liste: (filtre: string) => ['notifications', 'liste', filtre] as const,
  apercu: ['notifications', 'apercu'] as const,
  count: ['notifications', 'count'] as const,
  preferences: ['notifications', 'preferences'] as const,
};

interface ApercuResponse {
  data: NotificationItem[];
  nonLues: number;
}

/**
 * Aperçu + compteur pour la cloche du header.
 * Un seul appel réseau sert les deux besoins.
 */
export function useNotificationsApercu(options?: { enabled?: boolean; limit?: number }) {
  return useQuery<ApercuResponse>({
    queryKey: notificationKeys.apercu,
    queryFn: async () => {
      const res = await api.get('/notifications/apercu', { params: { limit: options?.limit ?? 8 } });
      const body = res.data ?? {};
      return { data: body.data ?? [], nonLues: body.nonLues ?? 0 };
    },
    enabled: options?.enabled ?? true,
    refetchInterval: NOTIF_REFETCH_MS,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
    retry: 1,
  });
}

interface ListeResponse {
  data: NotificationItem[];
  meta: { total: number; page: number; limit: number; totalPages: number; nonLues: number };
}

/** Liste paginée (page /notifications). */
export function useNotificationsListe(params: { lue?: boolean; page?: number; limit?: number }) {
  const cle = JSON.stringify(params);
  return useQuery<ListeResponse>({
    queryKey: notificationKeys.liste(cle),
    queryFn: async () => {
      const res = await api.get('/notifications', { params });
      const body = res.data ?? {};
      return {
        data: body.data ?? [],
        meta: body.meta ?? { total: 0, page: 1, limit: params.limit ?? 20, totalPages: 1, nonLues: 0 },
      };
    },
    refetchInterval: NOTIF_REFETCH_MS,
    staleTime: 20_000,
  });
}

export function useNotificationsPreferences() {
  return useQuery<PreferencesNotification>({
    queryKey: notificationKeys.preferences,
    queryFn: async () => {
      const res = await api.get('/notifications/preferences');
      return res.data;
    },
    staleTime: 5 * 60_000,
    retry: 0,
  });
}

/** Mutations partagées — invalident toutes les vues notifications. */
export function useNotificationsActions() {
  const qc = useQueryClient();
  const invalider = () => qc.invalidateQueries({ queryKey: notificationKeys.all });

  const marquerLue = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/lue`),
    onSuccess: invalider,
  });

  const marquerToutesLues = useMutation({
    mutationFn: () => api.patch('/notifications/marquer-toutes-lues'),
    onSuccess: invalider,
  });

  const supprimer = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: invalider,
  });

  return { marquerLue, marquerToutesLues, supprimer, invalider };
}
