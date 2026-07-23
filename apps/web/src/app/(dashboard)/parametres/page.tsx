'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Settings, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useCategories, filtrerCategories, type CategorieId } from '@/components/settings/categories';
import { OrganisationSettings } from '@/components/settings/OrganisationSettings';
import { UtilisateursSettings } from '@/components/settings/UtilisateursSettings';
import { DocumentsSettings } from '@/components/settings/DocumentsSettings';
import { NotificationsSettings } from '@/components/settings/NotificationsSettings';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';
import { DonneesSettings } from '@/components/settings/DonneesSettings';
import { AbonnementSettings } from '@/components/settings/AbonnementSettings';

export default function ParametresPage() {
  const t = useTranslations('shell.parametres');
  const { data: session } = useSession();
  const utilisateurId = session?.user?.id;
  const organisationId = session?.user?.organisationId;
  const roleCourant = session?.user?.role;

  const [categorie, setCategorie] = useState<CategorieId>('organisation');
  const [recherche, setRecherche] = useState('');

  const categories = useCategories();
  const resultats = useMemo(() => filtrerCategories(recherche, categories), [recherche, categories]);
  const categorieActive = categories.find((c) => c.id === categorie) ?? categories[0];
  const enRecherche = recherche.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-50 p-2">
            <Settings className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">{t('titre')}</h1>
            <p className="text-sm text-neutral-500">{t('sousTitre')}</p>
          </div>
        </div>

        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="input pl-9 pr-9"
            placeholder={t('recherchePlaceholder')}
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            aria-label={t('rechercheAria')}
          />
          {enRecherche && (
            <button
              onClick={() => setRecherche('')}
              aria-label={t('rechercheEffacer')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {enRecherche && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {t('rechercheResultats', { count: resultats.length, requete: recherche.trim() })}
          </p>
          {resultats.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('rechercheAucun')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {resultats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategorie(c.id);
                    setRecherche('');
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                    'border-neutral-200 hover:border-primary-300 hover:bg-primary-50',
                  )}
                >
                  <span className="font-semibold text-neutral-700">
                    {c.lettre}. {c.titre}
                  </span>
                  <span className="ml-2 text-xs text-neutral-400">{c.resume}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sous-navigation des 7 catégories */}
        <nav
          aria-label={t('navAria')}
          className="shrink-0 lg:w-64"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {categories.map((c) => {
              const actif = c.id === categorie;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategorie(c.id)}
                  aria-current={actif ? 'page' : undefined}
                  className={cn(
                    'flex shrink-0 items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors lg:w-full',
                    actif
                      ? 'border-primary-200 bg-primary-50'
                      : 'border-transparent hover:bg-neutral-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                      actif ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-500',
                    )}
                  >
                    {c.lettre}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block whitespace-nowrap text-sm font-medium lg:whitespace-normal',
                        actif ? 'text-primary-700' : 'text-neutral-700',
                      )}
                    >
                      {c.titre}
                    </span>
                    <span className="hidden text-xs text-neutral-400 lg:block">{c.resume}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="border-b border-neutral-200 pb-3">
            <h2 className="text-lg font-semibold text-neutral-800">
              {categorieActive.lettre}. {categorieActive.titre}
            </h2>
            <p className="text-sm text-neutral-500">{categorieActive.resume}</p>
          </div>

          {categorie === 'organisation' && <OrganisationSettings organisationId={organisationId} />}
          {categorie === 'utilisateurs' && (
            <UtilisateursSettings utilisateurId={utilisateurId} roleCourant={roleCourant} />
          )}
          {categorie === 'documents' && <DocumentsSettings organisationId={organisationId} />}
          {categorie === 'notifications' && <NotificationsSettings />}
          {categorie === 'integrations' && <IntegrationsSettings />}
          {categorie === 'donnees' && <DonneesSettings />}
          {categorie === 'abonnement' && <AbonnementSettings roleCourant={roleCourant} />}
        </div>
      </div>
    </div>
  );
}
