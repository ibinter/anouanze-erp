import type { Metadata } from 'next';
import OfflineActions from '@/components/pwa/OfflineActions';

export const metadata: Metadata = {
  title: 'Hors connexion',
  description: "Vous n'êtes plus connecté à Internet.",
  robots: 'noindex, nofollow',
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-neutral-50">
      <div className="card w-full max-w-md p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="ANOUANZÊ ERP" width={72} height={72} className="mx-auto mb-6" />

        <h1 className="text-xl font-bold text-neutral-800">Vous êtes hors connexion</h1>

        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Impossible de joindre les serveurs ANOUANZÊ ERP. Les pages déjà consultées restent
          accessibles ; les données à jour nécessitent une connexion Internet.
        </p>

        <OfflineActions />

        <p className="mt-6 text-xs text-neutral-400">
          Vérifiez votre connexion Wi-Fi ou vos données mobiles, puis réessayez.
        </p>
      </div>
    </main>
  );
}
