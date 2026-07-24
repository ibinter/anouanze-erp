'use client';

import Link from 'next/link';
import { Download, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, BientotDisponible, LigneOption } from './primitives';

/** `cle` renvoie vers `shell.parametres.donnees.import*`. */
const IMPORTS_DISPONIBLES = [
  { type: 'membres', cle: 'importMembres', endpoint: 'POST /api/v1/import/membres' },
  { type: 'donateurs', cle: 'importDonateurs', endpoint: 'POST /api/v1/import/donateurs' },
] as const;

export function DonneesSettings() {
  const t = useTranslations('shell.parametres.donnees');

  return (
    <div className="max-w-3xl space-y-6">
      <Section
        titre={t('importTitre')}
        description={t('importDesc')}
        action={
          <Link href="/import" className="btn-primary inline-flex items-center gap-2">
            <Upload className="h-4 w-4" /> {t('ouvrirImport')}
          </Link>
        }
      >
        <div>
          {IMPORTS_DISPONIBLES.map((i) => (
            <LigneOption key={i.type} titre={t(i.cle)} description={i.endpoint}>
              <span className="badge badge-success">{t('disponible')}</span>
            </LigneOption>
          ))}
        </div>
        <p className="text-xs text-neutral-500">{t('importNote')}</p>
        <BientotDisponible titre={t('importBientotTitre')} raison={t('importBientotRaison')} />
      </Section>

      <Section titre={t('exportTitre')} description={t('exportDesc')}>
        <LigneOption titre={t('exportModuleTitre')} description={t('exportModuleDesc')}>
          <span className="badge badge-success">{t('disponible')}</span>
        </LigneOption>
        <div className="pt-1">
          <Link href="/reporting" className="btn-secondary inline-flex items-center gap-2">
            <Download className="h-4 w-4" /> {t('ouvrirReporting')}
          </Link>
        </div>
        <BientotDisponible titre={t('exportBientotTitre')} raison={t('exportBientotRaison')} />
      </Section>

      <Section titre={t('sauvegardeTitre')} description={t('sauvegardeDesc')}>
        <BientotDisponible titre={t('sauvegardeBientotTitre')} raison={t('sauvegardeBientotRaison')} />
      </Section>

      <Section titre={t('purgeTitre')} description={t('purgeDesc')}>
        <BientotDisponible titre={t('purgeBientotTitre')} raison={t('purgeBientotRaison')} />
      </Section>
    </div>
  );
}
