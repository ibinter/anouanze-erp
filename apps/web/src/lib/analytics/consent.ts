/**
 * Lecture et diffusion du consentement cookies.
 *
 * Source de vérité : la clé `anouanze-cookie-consent` du `localStorage`,
 * écrite par `components/landing/CookieBanner.tsx`. Aucun cookie n'est posé
 * ici — le stockage local ne sert qu'à mémoriser le choix de l'utilisateur,
 * ce qui relève du strictement nécessaire.
 */

export const CONSENT_STORAGE_KEY = 'anouanze-cookie-consent';

/** Événement `window` émis à chaque changement de consentement. */
export const CONSENT_CHANGED_EVENT = 'anouanze:consent-changed';

export interface ConsentPreferences {
  /** Toujours vrai : session, sécurité, préférence de langue. */
  necessary: true;
  /** Mesure d'audience. Faux tant que l'utilisateur n'a pas dit oui. */
  analytics: boolean;
  /** Personnalisation / remarketing. */
  marketing: boolean;
}

/** Consentement par défaut : tout ce qui est optionnel est refusé. */
export const DEFAULT_CONSENT: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

/**
 * Consentement courant.
 *
 * Renvoie `null` si l'utilisateur n'a pas encore choisi (bannière non
 * validée) — état volontairement distinct d'un refus explicite, utile pour
 * ne rien mesurer tant que la question n'a pas été posée.
 * Côté serveur, renvoie toujours `null`.
 */
export function readConsent(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    // Stockage indisponible (mode privé strict) ou JSON corrompu :
    // on se comporte comme si rien n'avait été accepté.
    return null;
  }
}

/** L'utilisateur a-t-il explicitement accepté la mesure d'audience ? */
export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

/**
 * Signale un changement de consentement aux abonnés de la page courante.
 * Appelé par la bannière juste après l'enregistrement du choix.
 */
export function notifyConsentChanged(prefs: ConsentPreferences): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<ConsentPreferences>(CONSENT_CHANGED_EVENT, { detail: prefs }));
}

/**
 * S'abonne aux changements de consentement (onglet courant via
 * {@link CONSENT_CHANGED_EVENT}, autres onglets via `storage`).
 * Renvoie la fonction de désabonnement.
 */
export function onConsentChanged(handler: (prefs: ConsentPreferences | null) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const local = () => handler(readConsent());
  const cross = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) handler(readConsent());
  };

  window.addEventListener(CONSENT_CHANGED_EVENT, local);
  window.addEventListener('storage', cross);

  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, local);
    window.removeEventListener('storage', cross);
  };
}
