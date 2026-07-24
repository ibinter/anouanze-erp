'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Section, BientotDisponible, LigneOption } from './primitives';

/** Fournisseurs de paiement câblés côté API — noms commerciaux, non traduits. */
const PAIEMENTS = [
  { id: 'orange', nom: 'Orange Money', logo: '🟠', webhook: 'POST /api/v1/paiements/webhook/orange-money' },
  { id: 'cinetpay', nom: 'CinetPay', logo: '🔵', webhook: 'POST /api/v1/paiements/webhook/cinetpay' },
  { id: 'mtn', nom: 'MTN MoMo', logo: '🟡', webhook: null },
  { id: 'wave', nom: 'Wave', logo: '🌊', webhook: null },
];

/** `cle` renvoie vers `shell.parametres.integrations.fonctionsIa.*`. */
const FONCTIONS_IA = [
  { cle: 'analyseTableauBord', endpoint: 'POST /api/v1/ia/analyser-tableau-bord' },
  { cle: 'rapportNarratif', endpoint: 'POST /api/v1/ia/rapport-narratif' },
  { cle: 'propositionBudget', endpoint: 'POST /api/v1/ia/proposer-budget' },
  { cle: 'detectionAnomalies', endpoint: 'GET /api/v1/ia/anomalies' },
  { cle: 'assistantSara', endpoint: 'POST /api/v1/ia/chat' },
  { cle: 'traduction', endpoint: 'POST /api/v1/ia/traduire' },
];

export function IntegrationsSettings() {
  const t = useTranslations('shell.parametres.integrations');

  return (
    <div className="max-w-3xl space-y-6">
      <Section titre={t('paiementsTitre')} description={t('paiementsDesc')}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PAIEMENTS.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3">
              <div className="text-2xl">{p.logo}</div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-neutral-800">{p.nom}</p>
                {p.webhook ? (
                  <>
                    <span className="badge badge-success">{t('webhookExpose')}</span>
                    <p className="mt-1 truncate font-mono text-[10px] text-neutral-400">{p.webhook}</p>
                  </>
                ) : (
                  <span className="badge badge-neutral">{t('nonCable')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <BientotDisponible
          titre={t('paiementsBientotTitre')}
          raison={t('paiementsBientotRaison')}
        />
      </Section>

      <Section titre={t('iaTitre')} description={t('iaDesc')}>
        <div>
          {FONCTIONS_IA.map((f) => (
            <LigneOption key={f.endpoint} titre={t(`fonctionsIa.${f.cle}`)} description={f.endpoint}>
              <span className="badge badge-success">{t('disponible')}</span>
            </LigneOption>
          ))}
        </div>
        <div className="pt-1">
          <Link href="/ia" className="btn-secondary inline-flex">{t('ouvrirIa')}</Link>
        </div>
        <BientotDisponible titre={t('iaBientotTitre')} raison={t('iaBientotRaison')} />
      </Section>

      <Section titre={t('apiTitre')} description={t('apiDesc')}>
        <LigneOption titre={t('openapiTitre')} description={t('openapiDesc')}>
          <span className="badge badge-success">{t('disponible')}</span>
        </LigneOption>
        <BientotDisponible titre={t('apiBientotTitre')} raison={t('apiBientotRaison')} />
      </Section>
    </div>
  );
}
