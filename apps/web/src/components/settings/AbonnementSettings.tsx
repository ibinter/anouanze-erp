'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, BientotDisponible } from './primitives';
import { ROLES_ADMINISTRATION, type Role } from './roles';

interface MembreLeger {
  id: string;
  actif: boolean;
}

export function AbonnementSettings({ roleCourant }: { roleCourant?: string }) {
  const t = useTranslations('shell.parametres.abonnement');
  const estAdministrateur = ROLES_ADMINISTRATION.includes(roleCourant as Role);

  const { data: membres = [] } = useQuery<MembreLeger[]>({
    queryKey: ['membres-organisation'],
    queryFn: async () => {
      const { data } = await api.get('/utilisateurs/organisation/membres');
      return (Array.isArray(data) ? data : []) as MembreLeger[];
    },
    enabled: estAdministrateur,
    retry: false,
  });

  const actifs = membres.filter((m) => m.actif).length;

  return (
    <div className="max-w-3xl space-y-6">
      <Section titre={t('consommationTitre')} description={t('consommationDesc')}>
        {estAdministrateur ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">{t('comptesActifs')}</p>
                  <p className="text-xl font-bold text-neutral-800">{actifs}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">{t('comptesTotal')}</p>
                  <p className="text-xl font-bold text-neutral-800">{membres.length}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">{t('reserveAdmin')}</p>
        )}
        <BientotDisponible
          titre={t('consommationBientotTitre')}
          raison={t('consommationBientotRaison')}
        />
      </Section>

      <Section titre={t('formuleTitre')} description={t('formuleDesc')}>
        <BientotDisponible titre={t('formuleBientotTitre')} raison={t('formuleBientotRaison')} />
        <div className="pt-1">
          <Link href="/aide" className="btn-secondary inline-flex">{t('contacterSupport')}</Link>
        </div>
      </Section>
    </div>
  );
}
