'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Section, Champ, BientotDisponible } from './primitives';

/** Codes ISO 4217 : les libellés affichés viennent de `shell.parametres.organisation.devises`. */
const DEVISES = ['XOF', 'XAF', 'EUR', 'USD', 'GBP', 'CAD', 'CHF', 'GHS', 'NGN', 'KES'] as const;

const TYPES_ORGANISATION = [
  'ASSOCIATION',
  'ONG_NATIONALE',
  'ONG_INTERNATIONALE',
  'FONDATION',
  'COOPERATIVE',
  'MUTUELLE',
  'CONFESSIONNELLE',
  'RESEAU_FEDERATION',
  'COMMUNAUTAIRE',
  'PROGRAMME_DEVELOPPEMENT',
] as const;

/** Codes ISO 3166-1 alpha-2 ; libellés dans `shell.parametres.organisation.listePays`. */
const PAYS = [
  'CI', 'SN', 'BF', 'ML', 'BJ', 'TG', 'NE', 'GN', 'CM',
  'GA', 'CD', 'GH', 'NG', 'KE', 'FR', 'BE', 'CA',
] as const;

const MOIS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const LANGUES = ['fr', 'en'] as const;

interface OrgForm {
  nom: string;
  sigle: string;
  type: string;
  email: string;
  telephone: string;
  siteWeb: string;
  siege: string;
  logo: string;
  paysPrincipal: string;
  deviseDefaut: string;
  langue: string;
  exerciceComptableDebut: number;
  exerciceComptableFin: number;
  couleurPrimaire: string;
  couleurSecondaire: string;
}

const FORM_VIDE: OrgForm = {
  nom: '', sigle: '', type: 'ASSOCIATION', email: '', telephone: '', siteWeb: '',
  siege: '', logo: '', paysPrincipal: 'CI', deviseDefaut: 'XOF', langue: 'fr',
  exerciceComptableDebut: 1, exerciceComptableFin: 12,
  couleurPrimaire: '#146C43', couleurSecondaire: '#F28C25',
};

export function OrganisationSettings({ organisationId }: { organisationId?: string }) {
  const t = useTranslations('shell.parametres.organisation');
  const queryClient = useQueryClient();
  const [form, setForm] = useState<OrgForm>(FORM_VIDE);
  const [saving, setSaving] = useState(false);

  const { data: org, isLoading } = useQuery({
    queryKey: ['organisation', organisationId],
    queryFn: async () => {
      const { data } = await api.get(`/organisations/${organisationId}`);
      return data as Record<string, unknown>;
    },
    enabled: !!organisationId,
  });

  useEffect(() => {
    if (!org) return;
    const langues = Array.isArray(org.languesActives) ? (org.languesActives as string[]) : [];
    setForm({
      nom: (org.nom as string) ?? '',
      sigle: (org.sigle as string) ?? '',
      type: (org.type as string) ?? 'ASSOCIATION',
      email: (org.email as string) ?? '',
      telephone: (org.telephone as string) ?? '',
      siteWeb: (org.siteWeb as string) ?? '',
      siege: (org.siege as string) ?? '',
      logo: (org.logo as string) ?? '',
      paysPrincipal: (org.paysPrincipal as string) ?? 'CI',
      deviseDefaut: (org.deviseDefaut as string) ?? 'XOF',
      langue: langues[0] ?? 'fr',
      exerciceComptableDebut: Number(org.exerciceComptableDebut ?? 1),
      exerciceComptableFin: Number(org.exerciceComptableFin ?? 12),
      couleurPrimaire: (org.couleurPrimaire as string) ?? '#146C43',
      couleurSecondaire: (org.couleurSecondaire as string) ?? '#F28C25',
    });
  }, [org]);

  function set<K extends keyof OrgForm>(cle: K, valeur: OrgForm[K]) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  async function enregistrer() {
    if (!organisationId) return;
    if (!form.nom.trim()) {
      toast.error(t('nomObligatoire'));
      return;
    }
    setSaving(true);
    try {
      // Champs strictement conformes à UpdateOrganisationDto (whitelist API activée)
      await api.patch(`/organisations/${organisationId}`, {
        nom: form.nom.trim(),
        sigle: form.sigle.trim() || undefined,
        type: form.type,
        email: form.email.trim() || undefined,
        telephone: form.telephone.trim() || undefined,
        siteWeb: form.siteWeb.trim() || undefined,
        siege: form.siege.trim() || undefined,
        logo: form.logo.trim() || undefined,
        paysPrincipal: form.paysPrincipal,
        deviseDefaut: form.deviseDefaut,
        languesActives: [form.langue],
        exerciceComptableDebut: form.exerciceComptableDebut,
        exerciceComptableFin: form.exerciceComptableFin,
        couleurPrimaire: form.couleurPrimaire,
        couleurSecondaire: form.couleurSecondaire,
      });
      toast.success(t('succes'));
      queryClient.invalidateQueries({ queryKey: ['organisation', organisationId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('erreurSauvegarde'));
    } finally {
      setSaving(false);
    }
  }

  if (!organisationId) {
    return (
      <BientotDisponible titre={t('aucuneTitre')} raison={t('aucuneRaison')} />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center gap-2 py-12 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin" /> {t('chargement')}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Section titre={t('identiteVisuelleTitre')} description={t('identiteVisuelleDesc')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-100 text-3xl font-bold text-primary-600">
            {form.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo} alt={t('logoAlt')} className="h-full w-full object-contain" />
            ) : (
              (form.nom[0]?.toUpperCase() ?? 'A')
            )}
          </div>
          <div className="flex-1 space-y-3">
            <Champ label={t('logoUrl')} aide={t('logoUrlAide')}>
              <input
                className="input"
                placeholder="https://…/logo.png"
                value={form.logo}
                onChange={(e) => set('logo', e.target.value)}
              />
            </Champ>
            <div className="grid grid-cols-2 gap-3">
              <Champ label={t('couleurPrimaire')}>
                <input type="color" className="input h-10 p-1" value={form.couleurPrimaire} onChange={(e) => set('couleurPrimaire', e.target.value)} />
              </Champ>
              <Champ label={t('couleurSecondaire')}>
                <input type="color" className="input h-10 p-1" value={form.couleurSecondaire} onChange={(e) => set('couleurSecondaire', e.target.value)} />
              </Champ>
            </div>
          </div>
        </div>
        <BientotDisponible titre={t('uploadTitre')} raison={t('uploadRaison')} />
      </Section>

      <Section titre={t('identiteTitre')} description={t('identiteDesc')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label={t('nom')} className="sm:col-span-2">
            <input className="input" value={form.nom} onChange={(e) => set('nom', e.target.value)} />
          </Champ>
          <Champ label={t('sigle')}>
            <input className="input" value={form.sigle} onChange={(e) => set('sigle', e.target.value)} />
          </Champ>
          <Champ label={t('type')}>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES_ORGANISATION.map((code) => (
                <option key={code} value={code}>{t(`types.${code}`)}</option>
              ))}
            </select>
          </Champ>
        </div>
      </Section>

      <Section titre={t('coordonneesTitre')} description={t('coordonneesDesc')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label={t('email')}>
            <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Champ>
          <Champ label={t('telephone')}>
            <input type="tel" className="input" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
          </Champ>
          <Champ label={t('siteWeb')}>
            <input className="input" placeholder="https://" value={form.siteWeb} onChange={(e) => set('siteWeb', e.target.value)} />
          </Champ>
          <Champ label={t('siege')}>
            <input className="input" value={form.siege} onChange={(e) => set('siege', e.target.value)} />
          </Champ>
        </div>
      </Section>

      <Section titre={t('regionalTitre')} description={t('regionalDesc')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label={t('pays')}>
            <select className="input" value={form.paysPrincipal} onChange={(e) => set('paysPrincipal', e.target.value)}>
              {PAYS.map((code) => (
                <option key={code} value={code}>{t(`listePays.${code}`)}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('langue')}>
            <select className="input" value={form.langue} onChange={(e) => set('langue', e.target.value)}>
              {LANGUES.map((code) => (
                <option key={code} value={code}>{t(`langues.${code}`)}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('devise')}>
            <select className="input" value={form.deviseDefaut} onChange={(e) => set('deviseDefaut', e.target.value)}>
              {DEVISES.map((code) => (
                <option key={code} value={code}>{t(`devises.${code}`)}</option>
              ))}
            </select>
          </Champ>
        </div>
        <BientotDisponible titre={t('fuseauTitre')} raison={t('fuseauRaison')} />
      </Section>

      <Section titre={t('exerciceTitre')} description={t('exerciceDesc')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label={t('exerciceDebut')}>
            <select
              className="input"
              value={form.exerciceComptableDebut}
              onChange={(e) => set('exerciceComptableDebut', Number(e.target.value))}
            >
              {MOIS.map((m) => (
                <option key={m} value={m}>{t(`mois.${m}`)}</option>
              ))}
            </select>
          </Champ>
          <Champ label={t('exerciceFin')}>
            <select
              className="input"
              value={form.exerciceComptableFin}
              onChange={(e) => set('exerciceComptableFin', Number(e.target.value))}
            >
              {MOIS.map((m) => (
                <option key={m} value={m}>{t(`mois.${m}`)}</option>
              ))}
            </select>
          </Champ>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={enregistrer} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? t('enregistrement') : t('enregistrer')}
        </button>
      </div>
    </div>
  );
}
