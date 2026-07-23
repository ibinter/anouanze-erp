'use client';

import { useEffect, useState } from 'react';

/** Boutons interactifs de la page /offline (état réseau + réessai). */
export default function OfflineActions() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
          online ? 'bg-primary-50 text-primary-700' : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-primary-600' : 'bg-neutral-400'}`}
          aria-hidden
        />
        {online ? 'Connexion rétablie' : 'Aucune connexion détectée'}
      </span>

      <button type="button" onClick={() => window.location.reload()} className="btn-primary w-full">
        Réessayer
      </button>
    </div>
  );
}
