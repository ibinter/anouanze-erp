'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Section, Champ, BientotDisponible, LigneOption, Toggle } from './primitives';

interface DocForm {
  enteteAfficherLogo: boolean;
  enteteLigne1: string;
  enteteLigne2: string;
  piedTexte: string;
  piedAfficherPagination: boolean;
  prefixeRecu: string;
  prefixeFacture: string;
  prefixeRapport: string;
  compteurDepart: string;
  mentionsLegales: string;
}

const DEFAUT: DocForm = {
  enteteAfficherLogo: true,
  enteteLigne1: '',
  enteteLigne2: '',
  piedTexte: '',
  piedAfficherPagination: true,
  prefixeRecu: 'REC',
  prefixeFacture: 'FAC',
  prefixeRapport: 'RAP',
  compteurDepart: '1',
  mentionsLegales: '',
};

const CLE_STOCKAGE = 'anouanze:parametres-documents';

/**
 * Préférences de composition documentaire.
 * L'API n'expose aucun endpoint pour le modèle ParametreOrganisation :
 * ces réglages sont donc conservés localement, et c'est indiqué à l'utilisateur.
 */
export function DocumentsSettings({ organisationId }: { organisationId?: string }) {
  const t = useTranslations('shell.parametres.documents');
  const [form, setForm] = useState<DocForm>(DEFAUT);
  const cle = `${CLE_STOCKAGE}:${organisationId ?? 'inconnue'}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const brut = window.localStorage.getItem(cle);
      if (brut) setForm({ ...DEFAUT, ...(JSON.parse(brut) as Partial<DocForm>) });
      else setForm(DEFAUT);
    } catch {
      setForm(DEFAUT);
    }
  }, [cle]);

  function set<K extends keyof DocForm>(k: K, v: DocForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function enregistrer() {
    try {
      window.localStorage.setItem(cle, JSON.stringify(form));
      toast.success(t('succes'));
    } catch {
      toast.error(t('erreur'));
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-xs leading-relaxed text-neutral-600">
          {t('avertissementDebut')} <code className="font-mono">ParametreOrganisation</code>.{' '}
          {t('avertissementSuite')} <strong>{t('avertissementConserve')}</strong> {t('avertissementFin')}{' '}
          <em>{t('avertissementOrganisation')}</em>.
        </p>
      </div>

      <Section titre={t('enteteTitre')} description={t('enteteDesc')}>
        <LigneOption titre={t('afficherLogoTitre')} description={t('afficherLogoDesc')}>
          <Toggle
            label={t('afficherLogoLabel')}
            checked={form.enteteAfficherLogo}
            onChange={(v) => set('enteteAfficherLogo', v)}
          />
        </LigneOption>
        <Champ label={t('ligne1')} aide={t('ligne1Aide')}>
          <input className="input" value={form.enteteLigne1} onChange={(e) => set('enteteLigne1', e.target.value)} />
        </Champ>
        <Champ label={t('ligne2')}>
          <input className="input" value={form.enteteLigne2} onChange={(e) => set('enteteLigne2', e.target.value)} />
        </Champ>
      </Section>

      <Section titre={t('piedTitre')} description={t('piedDesc')}>
        <Champ label={t('piedTexte')}>
          <textarea
            className="input min-h-[80px]"
            value={form.piedTexte}
            onChange={(e) => set('piedTexte', e.target.value)}
            placeholder={t('piedPlaceholder')}
          />
        </Champ>
        <LigneOption titre={t('paginationTitre')} description={t('paginationDesc')}>
          <Toggle
            label={t('paginationTitre')}
            checked={form.piedAfficherPagination}
            onChange={(v) => set('piedAfficherPagination', v)}
          />
        </LigneOption>
      </Section>

      <Section titre={t('numerotationTitre')} description={t('numerotationDesc')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label={t('prefixeRecu')}><input className="input" value={form.prefixeRecu} onChange={(e) => set('prefixeRecu', e.target.value)} /></Champ>
          <Champ label={t('prefixeFacture')}><input className="input" value={form.prefixeFacture} onChange={(e) => set('prefixeFacture', e.target.value)} /></Champ>
          <Champ label={t('prefixeRapport')}><input className="input" value={form.prefixeRapport} onChange={(e) => set('prefixeRapport', e.target.value)} /></Champ>
          <Champ label={t('compteurDepart')}><input type="number" min={1} className="input" value={form.compteurDepart} onChange={(e) => set('compteurDepart', e.target.value)} /></Champ>
        </div>
        <BientotDisponible
          titre={t('numerotationBientotTitre')}
          raison={t('numerotationBientotRaison')}
        />
      </Section>

      <Section titre={t('mentionsTitre')} description={t('mentionsDesc')}>
        <Champ label={t('mentionsLabel')}>
          <textarea
            className="input min-h-[110px]"
            value={form.mentionsLegales}
            onChange={(e) => set('mentionsLegales', e.target.value)}
            placeholder={t('mentionsPlaceholder')}
          />
        </Champ>
      </Section>

      <div className="flex justify-end">
        <button onClick={enregistrer} className="btn-primary">{t('enregistrer')}</button>
      </div>
    </div>
  );
}
