'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Enregistre le service worker `/sw.js` (production uniquement) et affiche
 * un bandeau discret lorsqu'une nouvelle version est prête à être activée.
 */
export default function PWARegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);
  const reloadedRef = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    let disposed = false;

    const trackInstalling = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          if (!disposed) setWaiting(worker);
        }
      });
    };

    const onControllerChange = () => {
      if (reloadedRef.current) return;
      reloadedRef.current = true;
      window.location.reload();
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        if (disposed) return;

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaiting(registration.waiting);
        }
        if (registration.installing) trackInstalling(registration.installing);

        registration.addEventListener('updatefound', () => {
          const installing = registration?.installing;
          if (installing) trackInstalling(installing);
        });
      } catch {
        /* Enregistrement impossible (HTTP, navigateur non compatible) : on ignore. */
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    void register();

    /* Vérifie périodiquement l'existence d'une nouvelle version (toutes les heures). */
    const interval = window.setInterval(() => {
      void registration?.update().catch(() => undefined);
    }, 60 * 60 * 1000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const applyUpdate = useCallback(() => {
    if (!waiting) return;
    setUpdating(true);
    waiting.postMessage({ type: 'SKIP_WAITING' });
    /* Filet de sécurité si `controllerchange` n'est pas émis. */
    window.setTimeout(() => {
      if (!reloadedRef.current) {
        reloadedRef.current = true;
        window.location.reload();
      }
    }, 3000);
  }, [waiting]);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2
                 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-lg
                 flex items-center gap-3"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-accent-400" aria-hidden />
      <p className="flex-1 text-sm text-neutral-700">
        Nouvelle version disponible
      </p>
      <button type="button" onClick={applyUpdate} disabled={updating} className="btn-primary !py-1.5 !px-3">
        {updating ? 'Actualisation…' : 'Actualiser'}
      </button>
      <button
        type="button"
        onClick={() => setWaiting(null)}
        aria-label="Ignorer"
        className="text-lg leading-none text-neutral-400 hover:text-neutral-600"
      >
        ×
      </button>
    </div>
  );
}
