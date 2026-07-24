'use client';

import { useEffect } from 'react';
import { trackEvent } from './index';
import { ANALYTICS_EVENTS } from './events';

/**
 * Instrumentation de la landing par **délégation d'événements**.
 *
 * Un seul écouteur posé sur `document` reconnaît les appels à l'action à leur
 * cible (href, `aria-label`) : aucun composant de la page n'a besoin d'être
 * modifié, et rien n'est mesuré tant que le consentement analytique n'a pas
 * été donné — le filtre est appliqué dans `trackEvent`.
 *
 * Événements couverts :
 * - « Essai gratuit » et « Demander une démonstration » (liens vers `/demo`) ;
 * - ouverture de l'assistant SARA ;
 * - clic sur le bouton WhatsApp ;
 * - installation de la PWA (`appinstalled`).
 */

/** Le libellé désigne-t-il un essai gratuit plutôt qu'une démonstration ? */
function looksLikeTrial(label: string): boolean {
  return /essai|gratuit|trial|free/i.test(label);
}

/** Libellé lisible d'un élément, tronqué et sans donnée saisie par l'utilisateur. */
function labelOf(el: Element): string {
  return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
}

function handleClick(event: MouseEvent) {
  const target = event.target as Element | null;
  if (!target || typeof target.closest !== 'function') return;

  // --- Assistant SARA -----------------------------------------------------
  // Couvre aussi les boutons de la page, qui déclenchent un clic synthétique
  // sur ce même bouton (voir OpenSaraButton) : le clic remonte jusqu'ici.
  if (target.closest('[aria-label="Ouvrir SARA"]')) {
    trackEvent(ANALYTICS_EVENTS.SARA_OPEN, { source: 'landing' });
    return;
  }

  const link = target.closest('a[href]') as HTMLAnchorElement | null;
  if (!link) return;

  const href = link.getAttribute('href') ?? '';

  // --- WhatsApp -----------------------------------------------------------
  if (href.includes('wa.me') || href.startsWith('whatsapp:')) {
    trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, { source: 'landing' });
    return;
  }

  // --- Essai gratuit / demande de démonstration ---------------------------
  // Les deux parcours pointent vers /demo : on les distingue par le libellé.
  if (href === '/demo' || href.startsWith('/demo?') || href.startsWith('/demo#')) {
    const label = labelOf(link);
    trackEvent(
      looksLikeTrial(label) ? ANALYTICS_EVENTS.TRIAL_CLICK : ANALYTICS_EVENTS.DEMO_REQUEST_CLICK,
      // Emplacement approximatif (id de la section) — jamais de donnée saisie.
      { section: link.closest('section')?.id || 'inconnue' },
    );
  }
}

function handleAppInstalled() {
  trackEvent(ANALYTICS_EVENTS.PWA_INSTALLED, {
    display: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches
      ? 'standalone'
      : 'navigateur',
  });
}

/**
 * Monte l'instrumentation de la landing. À appeler depuis un composant client
 * rendu uniquement sur la page publique.
 */
export function useLandingAnalytics(): void {
  useEffect(() => {
    // `capture` : on mesure même si un gestionnaire en amont stoppe la
    // propagation (cas des menus qui se referment au clic).
    document.addEventListener('click', handleClick, true);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);
}
