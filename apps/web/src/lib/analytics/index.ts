/**
 * Couche de mesure d'audience respectueuse du consentement.
 *
 * ## Principe
 *
 * `trackEvent()` **ne fait strictement rien** tant que l'utilisateur n'a pas
 * accepté les cookies analytiques dans la bannière. Aucun script tiers n'est
 * chargé, aucun cookie non essentiel n'est posé, aucune requête réseau n'est
 * émise : conformément au cahier des charges, la page publique reste vierge
 * de toute traçabilité avant consentement.
 *
 * ## Aucun fournisseur n'est branché
 *
 * Ce module n'embarque volontairement **aucun** fournisseur (pas de Google
 * Analytics, pas de Plausible, pas de balise externe). Il expose une
 * interface {@link AnalyticsProvider} : le jour où un outil sera choisi, il
 * suffira de l'enregistrer (voir « Brancher un fournisseur » plus bas). Tant
 * qu'aucun fournisseur n'est enregistré, les événements sont simplement
 * ignorés (et tracés en console en développement).
 *
 * ## Brancher un fournisseur plus tard
 *
 * ```ts
 * // 1. Écrire l'adaptateur — il ne reçoit QUE des événements post-consentement.
 * const plausible: AnalyticsProvider = {
 *   name: 'plausible',
 *   // Charger le script ici, jamais au niveau du module : `init` n'est appelé
 *   // qu'après un consentement analytique explicite.
 *   init: () => loadScriptOnce('/js/script.js'),
 *   track: (name, props) => window.plausible?.(name, { props }),
 *   // Appelé si l'utilisateur retire son consentement : couper la collecte.
 *   shutdown: () => { delete window.plausible; },
 * };
 *
 * // 2. L'enregistrer dans un composant client monté sur les pages publiques.
 * registerAnalyticsProvider(plausible);
 * ```
 *
 * Contraintes à respecter pour tout futur adaptateur :
 * - héberger le script en première partie si possible (pas d'appel tiers) ;
 * - ne transmettre que les propriétés du catalogue `events.ts` ;
 * - ne jamais envoyer d'URL contenant des paramètres personnels.
 */

import { hasAnalyticsConsent, onConsentChanged } from './consent';
import type { AnalyticsEventName, AnalyticsProps } from './events';

export * from './consent';
export * from './events';

/** Contrat d'un adaptateur de mesure. */
export interface AnalyticsProvider {
  /** Identifiant lisible, pour les journaux. */
  name: string;
  /** Initialisation — appelée **uniquement** après consentement analytique. */
  init?: () => void | Promise<void>;
  /** Réception d'un événement déjà filtré par le consentement. */
  track: (name: AnalyticsEventName, props?: AnalyticsProps) => void;
  /** Arrêt de la collecte lorsque le consentement est retiré. */
  shutdown?: () => void;
}

let provider: AnalyticsProvider | null = null;
let initialised = false;
/** Désabonnement de l'écoute du consentement (un seul abonnement global). */
let unsubscribeConsent: (() => void) | null = null;

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Enregistre l'unique fournisseur de mesure. Sans appel à cette fonction,
 * `trackEvent` reste un no-op. Peut être appelée avant le consentement :
 * `init()` sera différée jusqu'à son obtention.
 */
export function registerAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
  initialised = false;

  // Un seul écouteur, quel que soit le nombre de composants montés.
  unsubscribeConsent?.();
  unsubscribeConsent = onConsentChanged(() => {
    if (hasAnalyticsConsent()) {
      void ensureInitialised();
    } else if (initialised) {
      initialised = false;
      try {
        provider?.shutdown?.();
      } catch {
        /* l'arrêt de la mesure ne doit jamais casser la page */
      }
    }
  });

  if (hasAnalyticsConsent()) void ensureInitialised();
}

/** Retire le fournisseur (tests, démontage). */
export function unregisterAnalyticsProvider(): void {
  try {
    if (initialised) provider?.shutdown?.();
  } catch {
    /* ignoré */
  }
  provider = null;
  initialised = false;
  unsubscribeConsent?.();
  unsubscribeConsent = null;
}

async function ensureInitialised(): Promise<boolean> {
  if (!provider) return false;
  if (initialised) return true;
  try {
    await provider.init?.();
    initialised = true;
    return true;
  } catch {
    // Un fournisseur défaillant ne doit jamais empêcher l'affichage.
    return false;
  }
}

/**
 * Enregistre un événement.
 *
 * Ne fait rien si :
 * - on est côté serveur ;
 * - l'utilisateur n'a pas accepté les cookies analytiques ;
 * - aucun fournisseur n'est enregistré.
 *
 * Ne lève jamais d'exception.
 */
export function trackEvent(name: AnalyticsEventName, props?: AnalyticsProps): void {
  if (typeof window === 'undefined') return;

  // Verrou de consentement — lu à chaque appel, jamais mis en cache : un
  // retrait de consentement prend effet immédiatement.
  if (!hasAnalyticsConsent()) return;

  if (!provider) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.debug('[analytics] (aucun fournisseur enregistré)', name, props ?? {});
    }
    return;
  }

  void ensureInitialised().then((ready) => {
    if (!ready) return;
    try {
      provider?.track(name, props);
    } catch {
      /* une erreur de mesure ne doit jamais remonter à l'utilisateur */
    }
  });
}
