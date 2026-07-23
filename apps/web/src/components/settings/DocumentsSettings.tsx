'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
      toast.success('Préférences enregistrées sur cet appareil');
    } catch {
      toast.error("Impossible d'enregistrer les préférences");
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-xs leading-relaxed text-neutral-600">
          L'API ne propose pas encore d'endpoint pour la table <code className="font-mono">ParametreOrganisation</code>.
          Ces réglages sont donc <strong>conservés sur cet appareil</strong> et ne sont pas partagés avec les autres
          membres de l'organisation. L'en-tête des exports reprend en revanche bien le nom, le logo et les coordonnées
          saisis dans <em>Organisation</em>.
        </p>
      </div>

      <Section titre="En-tête des documents" description="Bloc affiché en haut des PDF générés par l'ERP.">
        <LigneOption titre="Afficher le logo de l'organisation" description="Repris de la catégorie Organisation.">
          <Toggle
            label="Afficher le logo"
            checked={form.enteteAfficherLogo}
            onChange={(v) => set('enteteAfficherLogo', v)}
          />
        </LigneOption>
        <Champ label="Ligne complémentaire 1" aide="Ex. : Récépissé n° 0123/MI/DGAT du 12 mars 2015">
          <input className="input" value={form.enteteLigne1} onChange={(e) => set('enteteLigne1', e.target.value)} />
        </Champ>
        <Champ label="Ligne complémentaire 2">
          <input className="input" value={form.enteteLigne2} onChange={(e) => set('enteteLigne2', e.target.value)} />
        </Champ>
      </Section>

      <Section titre="Pied de page" description="Bloc affiché en bas de chaque page exportée.">
        <Champ label="Texte du pied de page">
          <textarea
            className="input min-h-[80px]"
            value={form.piedTexte}
            onChange={(e) => set('piedTexte', e.target.value)}
            placeholder="Siège social · Téléphone · Email · Site web"
          />
        </Champ>
        <LigneOption titre="Afficher la pagination" description="Numérotation « page X / Y ».">
          <Toggle
            label="Afficher la pagination"
            checked={form.piedAfficherPagination}
            onChange={(v) => set('piedAfficherPagination', v)}
          />
        </LigneOption>
      </Section>

      <Section titre="Numérotation" description="Préfixes utilisés pour référencer les pièces émises.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ label="Préfixe des reçus"><input className="input" value={form.prefixeRecu} onChange={(e) => set('prefixeRecu', e.target.value)} /></Champ>
          <Champ label="Préfixe des factures"><input className="input" value={form.prefixeFacture} onChange={(e) => set('prefixeFacture', e.target.value)} /></Champ>
          <Champ label="Préfixe des rapports"><input className="input" value={form.prefixeRapport} onChange={(e) => set('prefixeRapport', e.target.value)} /></Champ>
          <Champ label="Compteur de départ"><input type="number" min={1} className="input" value={form.compteurDepart} onChange={(e) => set('compteurDepart', e.target.value)} /></Champ>
        </div>
        <BientotDisponible
          titre="Application automatique de la numérotation"
          raison="Les références des pièces sont actuellement générées par chaque module côté serveur. Tant que ces préférences ne sont pas persistées via l'API, elles ne modifient pas la numérotation réellement appliquée."
        />
      </Section>

      <Section titre="Mentions légales" description="Texte reproduit au bas des documents officiels.">
        <Champ label="Mentions">
          <textarea
            className="input min-h-[110px]"
            value={form.mentionsLegales}
            onChange={(e) => set('mentionsLegales', e.target.value)}
            placeholder="Association déclarée · Exonération fiscale · Numéro d'immatriculation…"
          />
        </Champ>
      </Section>

      <div className="flex justify-end">
        <button onClick={enregistrer} className="btn-primary">Enregistrer</button>
      </div>
    </div>
  );
}
