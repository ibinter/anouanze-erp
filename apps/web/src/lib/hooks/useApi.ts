'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useApi<T>(url: string, params?: Record<string, unknown>) {
  return useQuery<T>({
    queryKey: [url, params],
    queryFn: async () => {
      const { data } = await api.get<T>(url, { params });
      return data;
    },
  });
}
