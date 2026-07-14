'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { setApiToken } from '@/lib/api';

// Synchronise le token NextAuth dans le client API dès que la session change
function TokenSync() {
  const { data: session } = useSession();
  useEffect(() => {
    setApiToken((session as any)?.accessToken ?? null);
  }, [session]);
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Providers({ children }: { children: any }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <TokenSync />
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
