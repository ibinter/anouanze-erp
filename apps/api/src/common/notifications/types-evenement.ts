/**
 * Catalogue des types d'évènements notifiables.
 *
 * Les clés sont partagées par le service d'évènements (émission) et par le
 * module de préférences (filtrage). Toute nouvelle notification métier doit
 * y être déclarée pour devenir configurable par l'utilisateur.
 */
export const TYPES_EVENEMENT = [
  { cle: 'cotisation-retard', libelle: 'Cotisation en retard' },
  { cle: 'cotisation-reglee', libelle: 'Cotisation encaissée' },
  { cle: 'budget-seuil', libelle: 'Seuil budgétaire atteint' },
  { cle: 'don-recu', libelle: 'Don reçu' },
  { cle: 'ticket-nouveau', libelle: 'Nouveau ticket support' },
  { cle: 'ticket-reponse', libelle: 'Réponse à un ticket' },
  { cle: 'resolution-attente', libelle: 'Résolution de gouvernance en attente' },
  { cle: 'generique', libelle: 'Autres notifications' },
] as const;

export type CleEvenement = (typeof TYPES_EVENEMENT)[number]['cle'];
