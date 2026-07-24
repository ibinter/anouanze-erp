'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Info, KeyRound, Loader2, RotateCcw, Trash2, X } from 'lucide-react';

export type CategorieConfig = 'PAIEMENT' | 'EMAIL' | 'IA' | 'GENERAL';
export type SourceConfig = 'base' | 'environnement' | 'absent';

/**
 * Entrée de configuration telle que renvoyée par l'API.
 * ⚠️ La valeur d'un secret n'est JAMAIS transmise : seul `defini` indique
 * qu'une valeur existe côté serveur.
 */
export interface EntreeConfiguration {
  cle: string;
  categorie: CategorieConfig;
  secret: boolean;
  defini: boolean;
  description?: string | null;
  source: SourceConfig;
  modifieLe?: string | null;
}

interface ChampConfigurationProps {
  entree: EntreeConfiguration;
  onEnregistrer: (valeur: string) => void;
  onSupprimer: () => void;
  enregistrement?: boolean;
  suppression?: boolean;
}

/** Rend une clé technique lisible quand l'API ne fournit pas de description. */
function libelleDepuisCle(cle: string): string {
  const mots = cle.toLowerCase().split(/[_\-.]+/).filter(Boolean);
  if (mots.length === 0) return cle;
  return mots.map((m, i) => (i === 0 ? m.charAt(0).toUpperCase() + m.slice(1) : m)).join(' ');
}

const STYLE_SOURCE: Record<SourceConfig, string> = {
  base: 'bg-green-900/40 text-green-300 border-green-800',
  environnement: 'bg-blue-900/40 text-blue-300 border-blue-800',
  absent: 'bg-neutral-800 text-neutral-400 border-neutral-700',
};

export function ChampConfiguration({
  entree,
  onEnregistrer,
  onSupprimer,
  enregistrement = false,
  suppression = false,
}: ChampConfigurationProps) {
  const t = useTranslations('shell.superadminConfig');

  // Une valeur déjà définie n'est jamais réaffichée : on part en lecture seule
  // et l'utilisateur doit demander explicitement à la remplacer.
  const [enEdition, setEnEdition] = useState(!entree.defini);
  const [valeur, setValeur] = useState('');

  const libelle = entree.description?.trim() || libelleDepuisCle(entree.cle);
  const occupe = enregistrement || suppression;

  const fermerEdition = () => {
    setValeur('');
    setEnEdition(false);
  };

  const soumettre = () => {
    const propre = valeur.trim();
    if (!propre) return;
    onEnregistrer(propre);
    setValeur('');
    setEnEdition(false);
  };

  const dateModif = entree.modifieLe
    ? new Date(entree.modifieLe).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            {entree.secret && <KeyRound className="w-3.5 h-3.5 text-accent-400 shrink-0" aria-hidden />}
            <span className="break-words">{libelle}</span>
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-neutral-500 break-all">{entree.cle}</p>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STYLE_SOURCE[entree.source]}`}
          title={entree.source === 'environnement' ? t('source.environnementInfobulle') : undefined}
        >
          {entree.source === 'environnement' && <Info className="w-3 h-3" aria-hidden />}
          {t(`source.${entree.source}`)}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        {enEdition ? (
          <>
            <input
              type={entree.secret ? 'password' : 'text'}
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') soumettre();
                if (e.key === 'Escape' && entree.defini) fermerEdition();
              }}
              autoComplete="new-password"
              spellCheck={false}
              disabled={occupe}
              placeholder={entree.secret ? t('champ.placeholderSecret') : t('champ.placeholderValeur')}
              aria-label={libelle}
              className="w-full flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 transition-colors focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/30 disabled:opacity-50"
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={soumettre}
                disabled={occupe || valeur.trim().length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enregistrement ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {t('actions.enregistrer')}
              </button>
              {entree.defini && (
                <button
                  type="button"
                  onClick={fermerEdition}
                  disabled={occupe}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-40"
                >
                  <X className="w-3.5 h-3.5" />
                  {t('actions.annuler')}
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              aria-label={libelle}
              value={entree.secret ? '••••••••' : t('champ.valeurDefinie')}
              className="w-full flex-1 cursor-default rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 font-mono text-sm text-neutral-500"
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEnEdition(true)}
                disabled={occupe}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-800 disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('actions.remplacer')}
              </button>
              {entree.source === 'base' && (
                <button
                  type="button"
                  onClick={onSupprimer}
                  disabled={occupe}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-900 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-950/60 disabled:opacity-40"
                >
                  {suppression ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  {t('actions.supprimer')}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <p className="mt-2 text-[11px] text-neutral-600">
        {entree.secret && `${t('champ.avertissementSecret')} `}
        {dateModif ? t('champ.modifieLe', { date: dateModif }) : t('champ.jamaisModifie')}
      </p>
    </div>
  );
}
