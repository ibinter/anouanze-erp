'use client';

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Section, Champ, BientotDisponible } from './primitives';

const DEVISES = [
  { code: 'XOF', libelle: 'XOF — Franc CFA BCEAO' },
  { code: 'XAF', libelle: 'XAF — Franc CFA BEAC' },
  { code: 'EUR', libelle: 'EUR — Euro' },
  { code: 'USD', libelle: 'USD — Dollar américain' },
  { code: 'GBP', libelle: 'GBP — Livre sterling' },
  { code: 'CAD', libelle: 'CAD — Dollar canadien' },
  { code: 'CHF', libelle: 'CHF — Franc suisse' },
  { code: 'GHS', libelle: 'GHS — Cedi ghanéen' },
  { code: 'NGN', libelle: 'NGN — Naira nigérian' },
  { code: 'KES', libelle: 'KES — Shilling kényan' },
];

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

const PAYS = [
  { code: 'CI', nom: "Côte d'Ivoire" },
  { code: 'SN', nom: 'Sénégal' },
  { code: 'BF', nom: 'Burkina Faso' },
  { code: 'ML', nom: 'Mali' },
  { code: 'BJ', nom: 'Bénin' },
  { code: 'TG', nom: 'Togo' },
  { code: 'NE', nom: 'Niger' },
  { code: 'GN', nom: 'Guinée' },
  { code: 'CM', nom: 'Cameroun' },
  { code: 'GA', nom: 'Gabon' },
  { code: 'CD', nom: 'RD Congo' },
  { code: 'GH', nom: 'Ghana' },
  { code: 'NG', nom: 'Nigeria' },
  { code: 'KE', nom: 'Kenya' },
  { code: 'FR', nom: 'France' },
  { code: 'BE', nom: 'Belgique' },
  { code: 'CA', nom: 'Canada' },
];

const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const LANGUES = [
  { code: 'fr', nom: 'Français' },
  { code: 'en', nom: 'English' },
];

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
      toast.error("Le nom de l'organisation est obligatoire");
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
      toast.success('Organisation mise à jour');
      queryClient.invalidateQueries({ queryKey: ['organisation', organisationId] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (!organisationId) {
    return (
      <BientotDisponible
        titre="Aucune organisation rattachée"
        raison="Votre compte n'est lié à aucune organisation : les paramètres d'identité ne peuvent pas être chargés."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center gap-2 py-12 text-neutral-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Chargement de l'organisation…
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Section titre="Identité visuelle" description="Logo et couleurs repris sur les documents exportés.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-100 text-3xl font-bold text-primary-600">
            {form.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.logo} alt="Logo" className="h-full w-full object-contain" />
            ) : (
              (form.nom[0]?.toUpperCase() ?? 'A')
            )}
          </div>
          <div className="flex-1 space-y-3">
            <Champ label="URL du logo" aide="Adresse publique de l'image (PNG ou SVG).">
              <input
                className="input"
                placeholder="https://…/logo.png"
                value={form.logo}
                onChange={(e) => set('logo', e.target.value)}
              />
            </Champ>
            <div className="grid grid-cols-2 gap-3">
              <Champ label="Couleur primaire">
                <input type="color" className="input h-10 p-1" value={form.couleurPrimaire} onChange={(e) => set('couleurPrimaire', e.target.value)} />
              </Champ>
              <Champ label="Couleur secondaire">
                <input type="color" className="input h-10 p-1" value={form.couleurSecondaire} onChange={(e) => set('couleurSecondaire', e.target.value)} />
              </Champ>
            </div>
          </div>
        </div>
        <BientotDisponible
          titre="Téléversement direct du logo"
          raison="L'API n'expose pas encore d'endpoint d'upload dédié au logo d'organisation ; seule une URL publique est enregistrée pour l'instant."
        />
      </Section>

      <Section titre="Identité de l'organisation" description="Nom légal, sigle et nature juridique.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label="Nom de l'organisation" className="sm:col-span-2">
            <input className="input" value={form.nom} onChange={(e) => set('nom', e.target.value)} />
          </Champ>
          <Champ label="Sigle">
            <input className="input" value={form.sigle} onChange={(e) => set('sigle', e.target.value)} />
          </Champ>
          <Champ label="Type d'organisation">
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES_ORGANISATION.map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Champ>
        </div>
      </Section>

      <Section titre="Coordonnées" description="Contacts affichés sur les documents officiels.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label="Email">
            <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </Champ>
          <Champ label="Téléphone">
            <input type="tel" className="input" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} />
          </Champ>
          <Champ label="Site web">
            <input className="input" placeholder="https://" value={form.siteWeb} onChange={(e) => set('siteWeb', e.target.value)} />
          </Champ>
          <Champ label="Siège social">
            <input className="input" value={form.siege} onChange={(e) => set('siege', e.target.value)} />
          </Champ>
        </div>
      </Section>

      <Section titre="Localisation, langue et devise" description="Paramètres régionaux appliqués à toute l'organisation.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label="Pays principal">
            <select className="input" value={form.paysPrincipal} onChange={(e) => set('paysPrincipal', e.target.value)}>
              {PAYS.map((p) => (
                <option key={p.code} value={p.code}>{p.nom}</option>
              ))}
            </select>
          </Champ>
          <Champ label="Langue de l'interface">
            <select className="input" value={form.langue} onChange={(e) => set('langue', e.target.value)}>
              {LANGUES.map((l) => (
                <option key={l.code} value={l.code}>{l.nom}</option>
              ))}
            </select>
          </Champ>
          <Champ label="Devise par défaut">
            <select className="input" value={form.deviseDefaut} onChange={(e) => set('deviseDefaut', e.target.value)}>
              {DEVISES.map((d) => (
                <option key={d.code} value={d.code}>{d.libelle}</option>
              ))}
            </select>
          </Champ>
        </div>
        <BientotDisponible
          titre="Fuseau horaire"
          raison="Le modèle Organisation ne stocke pas encore de fuseau horaire : les dates sont affichées dans le fuseau du navigateur."
        />
      </Section>

      <Section titre="Exercice comptable" description="Mois d'ouverture et de clôture de l'exercice.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label="Début de l'exercice">
            <select
              className="input"
              value={form.exerciceComptableDebut}
              onChange={(e) => set('exerciceComptableDebut', Number(e.target.value))}
            >
              {MOIS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </Champ>
          <Champ label="Fin de l'exercice">
            <select
              className="input"
              value={form.exerciceComptableFin}
              onChange={(e) => set('exerciceComptableFin', Number(e.target.value))}
            >
              {MOIS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </Champ>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={enregistrer} disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
