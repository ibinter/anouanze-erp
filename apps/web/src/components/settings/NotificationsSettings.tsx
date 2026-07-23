'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, BientotDisponible, LigneOption, Toggle } from './primitives';

/**
 * Types d'alertes câblés dans l'ERP. Ce sont des identifiants métier :
 * libellé et description viennent de `shell.parametres.notificationsCat.types.*`.
 */
export const TYPES_ALERTES = [
  'cotisation_retard',
  'budget_depasse',
  'stock_alerte',
  'nouveau_membre',
  'paiement_recu',
  'rapport_mensuel',
] as const;

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
  const t = useTranslations('shell.parametres.notificationsCat');
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
      <Section titre={t('canauxTitre')} description={t('canauxDesc')}>
        {isLoading ? (
          <div className="flex justify-center gap-2 py-8 text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin" /> {t('chargement')}
          </div>
        ) : canaux.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">{t('aucunCanal')}</p>
        ) : (
          <div>
            {canaux.map((c) => (
              <LigneOption
                key={c.cle}
                titre={c.libelle}
                description={c.modifiable ? undefined : t('canalNonModifiable')}
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
            titre={t('canauxBientotTitre')}
            raison={data?.message ?? t('canauxBientotRaison')}
          />
        )}
      </Section>

      <Section titre={t('alertesTitre')} description={t('alertesDesc')}>
        <div>
          {TYPES_ALERTES.map((id) => {
            const label = t(`types.${id}.label`);
            return (
              <LigneOption key={id} titre={label} description={t(`types.${id}.desc`)}>
                <Toggle label={label} checked disabled onChange={() => undefined} />
              </LigneOption>
            );
          })}
        </div>
        <BientotDisponible
          titre={t('alertesBientotTitre')}
          raison={t('alertesBientotRaison')}
        />
      </Section>
    </div>
  );
}
