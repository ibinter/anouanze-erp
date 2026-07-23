'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { Section, BientotDisponible, LigneOption, Toggle } from './primitives';

/** Types d'alertes câblés dans l'ERP — repris de l'ancien écran Paramètres. */
export const TYPES_ALERTES = [
  { id: 'cotisation_retard', label: 'Cotisation en retard', desc: "Alerte quand une cotisation n'est pas réglée à échéance" },
  { id: 'budget_depasse', label: 'Budget dépassé', desc: 'Alerte quand un budget de projet est dépassé' },
  { id: 'stock_alerte', label: 'Stock sous le minimum', desc: 'Alerte quand un article passe sous le seuil minimum' },
  { id: 'nouveau_membre', label: 'Nouveau membre inscrit', desc: "Notification lors d'une nouvelle adhésion" },
  { id: 'paiement_recu', label: 'Paiement reçu', desc: "Confirmation lors de la réception d'un paiement" },
  { id: 'rapport_mensuel', label: 'Rapport mensuel disponible', desc: 'Notification à la génération du rapport mensuel' },
];

interface Canal {
  cle: string;
  libelle: string;
  actif: boolean;
  modifiable: boolean;
}

interface Preferences {
  disponible: boolean;
  message?: string;
  canaux: Canal[];
}

export function NotificationsSettings() {
  const { data, isLoading } = useQuery<Preferences>({
    queryKey: ['notifications-preferences'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/preferences');
      return data as Preferences;
    },
    retry: false,
  });

  const canaux = data?.canaux ?? [];
  const modifiable = data?.disponible === true;

  return (
    <div className="max-w-3xl space-y-6">
      <Section
        titre="Canaux de diffusion"
        description="Moyens par lesquels l'ERP vous adresse ses notifications."
      >
        {isLoading ? (
          <div className="flex justify-center gap-2 py-8 text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin" /> Chargement des préférences…
          </div>
        ) : canaux.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">Aucun canal renvoyé par l'API.</p>
        ) : (
          <div>
            {canaux.map((c) => (
              <LigneOption
                key={c.cle}
                titre={c.libelle}
                description={
                  c.modifiable
                    ? undefined
                    : "Canal activé par défaut — non désactivable pour le moment."
                }
              >
                <Toggle
                  label={c.libelle}
                  checked={c.actif}
                  disabled={!c.modifiable}
                  onChange={() => undefined}
                />
              </LigneOption>
            ))}
          </div>
        )}
        {!modifiable && (
          <BientotDisponible
            titre="Personnalisation des canaux"
            raison={
              data?.message ??
              "L'endpoint /notifications/preferences renvoie explicitement des canaux non modifiables : aucune préférence n'est encore persistée côté serveur."
            }
          />
        )}
      </Section>

      <Section
        titre="Alertes métier"
        description="Événements qui déclenchent une notification dans l'application."
      >
        <div>
          {TYPES_ALERTES.map((n) => (
            <LigneOption key={n.id} titre={n.label} description={n.desc}>
              <Toggle label={n.label} checked disabled onChange={() => undefined} />
            </LigneOption>
          ))}
        </div>
        <BientotDisponible
          titre="Activation à la carte des alertes"
          raison="Ces alertes sont actives pour tous les membres de l'organisation. Le modèle de données ne prévoit pas encore de préférence par utilisateur et par type d'alerte : les interrupteurs sont donc affichés en lecture seule plutôt que de simuler une sauvegarde."
        />
      </Section>
    </div>
  );
}
