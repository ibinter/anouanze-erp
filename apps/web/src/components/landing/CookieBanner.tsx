'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CONSENT_STORAGE_KEY,
  DEFAULT_CONSENT,
  notifyConsentChanged,
  type ConsentPreferences,
} from '@/lib/analytics/consent';
import { useLandingAnalytics } from '@/lib/analytics/landing-autotrack';

type Prefs = ConsentPreferences;

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_CONSENT);

  // Instrumentation de la landing : posée ici car la bannière n'est montée
  // que sur la page publique. Elle reste inerte tant que l'utilisateur n'a
  // pas accepté les cookies analytiques (filtre appliqué dans `trackEvent`).
  useLandingAnalytics();

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!saved) setTimeout(() => setShow(true), 1500);
  }, []);

  function save(p: Prefs) {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(p));
    // Prend effet immédiatement : la couche analytics écoute ce signal.
    notifyConsentChanged(p);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-neutral-200 shadow-2xl">
      <div className="max-w-6xl mx-auto px-6 py-5">
        {!customize ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-800 mb-1">🍪 Gestion des cookies</p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Nous utilisons des cookies pour assurer le fonctionnement du service et améliorer votre expérience.
                Les cookies analytiques sont optionnels.{' '}
                <Link href="/cookies" className="text-primary-600 hover:underline">Politique de cookies</Link>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => setCustomize(true)}
                className="text-xs border border-neutral-300 text-neutral-600 hover:border-neutral-400 px-4 py-2 rounded-lg transition-colors"
              >
                Personnaliser
              </button>
              <button
                onClick={() => save({ necessary: true, analytics: false, marketing: false })}
                className="text-xs border border-neutral-300 text-neutral-600 hover:border-neutral-400 px-4 py-2 rounded-lg transition-colors"
              >
                Refuser les optionnels
              </button>
              <button
                onClick={() => save({ necessary: true, analytics: true, marketing: true })}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-semibold"
              >
                Tout accepter
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-neutral-800 mb-4">Personnaliser vos préférences</p>
            <div className="space-y-3 mb-4">
              {[
                { key: 'necessary', label: 'Cookies nécessaires', desc: 'Indispensables au fonctionnement — ne peuvent pas être désactivés.', disabled: true },
                { key: 'analytics', label: 'Cookies analytiques', desc: 'Nous aident à améliorer la plateforme (anonymisés).', disabled: false },
                { key: 'marketing', label: 'Cookies marketing', desc: 'Permettent de personnaliser les contenus et offres.', disabled: false },
              ].map(({ key, label, desc, disabled }) => (
                <label key={key} className={`flex items-start gap-3 p-3 rounded-lg border ${disabled ? 'border-neutral-100 bg-neutral-50' : 'border-neutral-200 cursor-pointer hover:bg-neutral-50'}`}>
                  <input
                    type="checkbox"
                    checked={key === 'necessary' ? true : prefs[key as 'analytics' | 'marketing']}
                    disabled={disabled}
                    onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
                    className="mt-0.5 accent-primary-600"
                  />
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">{label} {disabled && <span className="text-neutral-400 font-normal">(toujours actifs)</span>}</p>
                    <p className="text-xs text-neutral-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCustomize(false)} className="text-xs text-neutral-500 hover:text-neutral-700 px-3 py-2">← Retour</button>
              <button
                onClick={() => save(prefs)}
                className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg transition-colors font-semibold"
              >
                Enregistrer mes préférences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
