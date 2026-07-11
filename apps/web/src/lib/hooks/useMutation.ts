'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';

type Method = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'> {
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  url: string,
  method: Method = 'POST',
  options?: ApiMutationOptions<TData, TVariables>,
) {
  const { successMessage, errorMessage, onSuccess, onError, ...rest } = options ?? {};

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      let res;
      if (method === 'DELETE') {
        res = await api.delete<TData>(url, { data: variables });
      } else if (method === 'PUT') {
        res = await api.put<TData>(url, variables);
      } else if (method === 'PATCH') {
        res = await api.patch<TData>(url, variables);
      } else {
        res = await api.post<TData>(url, variables);
      }
      return res.data;
    },
    onSuccess: (data, variables, context) => {
      toast.success(successMessage ?? 'Opération réussie');
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(errorMessage ?? error.message ?? 'Une erreur est survenue');
      onError?.(error, variables, context);
    },
    ...rest,
  });
}
