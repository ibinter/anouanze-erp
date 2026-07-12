'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('anouanze-pwa-dismissed');
    if (dismissed) return;

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone;
    setIsIOS(ios);

    if (ios && !standalone) {
      setTimeout(() => setShow(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    localStorage.setItem('anouanze-pwa-dismissed', '1');
    setShow(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-4 animate-fade-in">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <span className="text-white font-black text-xs">ERP</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-neutral-800">Installer ANOUANZÊ ERP</p>
          <p className="text-xs text-neutral-500 mt-0.5">Accès rapide depuis votre écran d'accueil</p>
        </div>
        <button onClick={dismiss} className="text-neutral-400 hover:text-neutral-600 text-lg leading-none">×</button>
      </div>

      {isIOS ? (
        <div className="text-xs text-neutral-600 bg-neutral-50 rounded-xl p-3 mb-3">
          Appuyez sur <strong>Partager</strong> <span>↑</span> puis <strong>Ajouter à l'écran d'accueil</strong>
        </div>
      ) : (
        <button
          onClick={install}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
        >
          Installer maintenant
        </button>
      )}

      <button onClick={dismiss} className="w-full text-xs text-neutral-400 hover:text-neutral-600 mt-2 py-1">
        Plus tard
      </button>
    </div>
  );
}
