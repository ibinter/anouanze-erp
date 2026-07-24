/**
 * Catalogue **fermé** des événements mesurés.
 *
 * On ne mesure que des intentions de conversion sur la page publique. Aucun
 * événement ne transporte de donnée personnelle : pas d'email, pas de nom,
 * pas de contenu saisi, pas d'identifiant utilisateur.
 */
export const ANALYTICS_EVENTS = {
  /** Clic sur un appel à l'action « Essai gratuit ». */
  TRIAL_CLICK: 'landing_trial_click',
  /** Clic sur « Demander une démonstration ». */
  DEMO_REQUEST_CLICK: 'landing_demo_request_click',
  /** Ouverture de l'assistant SARA. */
  SARA_OPEN: 'landing_sara_open',
  /** Clic sur le bouton WhatsApp. */
  WHATSAPP_CLICK: 'landing_whatsapp_click',
  /** Installation effective de la PWA (événement navigateur `appinstalled`). */
  PWA_INSTALLED: 'landing_pwa_installed',
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Propriétés autorisées : uniquement des scalaires non identifiants
 * (emplacement du bouton, plan concerné, plateforme…).
 */
export type AnalyticsProps = Record<string, string | number | boolean | undefined>;
