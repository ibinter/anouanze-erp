'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Clock, CheckCircle2, Circle, PlayCircle, VideoOff,
  ChevronRight, RotateCcw, Library, ExternalLink, Target, BookOpen,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  CATEGORIES_PARCOURS, getParcours, getRessources,
  libelleCategorieParcours, libelleNiveau, libelleTypeRessource,
  type CategorieParcours,
} from '@/lib/help';

const STORAGE_KEY = 'anouanze-academie-progression';

export default function AcademiePage() {
  const locale = useLocale();
  const t = useTranslations('outils.academie');
  const parcoursSource = useMemo(() => getParcours(locale), [locale]);
  const ressources = useMemo(() => getRessources(locale), [locale]);

  /**
   * Toutes les leçons, tous parcours confondus.
   * Les `id` sont identiques d'une langue à l'autre : la progression stockée
   * dans localStorage reste valable après un changement de langue.
   */
  const toutesLecons = useMemo(() => parcoursSource.flatMap((p) => p.lecons), [parcoursSource]);

  const [categorie, setCategorie] = useState<CategorieParcours | 'Toutes'>('Toutes');
  const [terminees, setTerminees] = useState<string[]>([]);
  const [charge, setCharge] = useState(false);

  // Chargement de la progression locale
  useEffect(() => {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      if (brut) {
        const parse: unknown = JSON.parse(brut);
        if (Array.isArray(parse)) {
          setTerminees(parse.filter((v): v is string => typeof v === 'string'));
        }
      }
    } catch {
      /* localStorage indisponible : la progression n'est pas conservée */
    }
    setCharge(true);
  }, []);

  const persister = useCallback((valeurs: string[]) => {
    setTerminees(valeurs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valeurs));
    } catch {
      /* échec silencieux : l'affichage reste correct pour la session en cours */
    }
  }, []);

  const basculer = useCallback(
    (id: string) => {
      persister(terminees.includes(id) ? terminees.filter((x) => x !== id) : [...terminees, id]);
    },
    [terminees, persister],
  );

  const reinitialiser = useCallback(() => persister([]), [persister]);

  const parcoursAffiches = useMemo(
    () => parcoursSource.filter((p) => categorie === 'Toutes' || p.categorie === categorie),
    [categorie, parcoursSource],
  );

  const total = toutesLecons.length;
  const faites = terminees.filter((id) => toutesLecons.some((l) => l.id === id)).length;
  const pourcentage = total > 0 ? Math.round((faites / total) * 100) : 0;
  const minutesTotales = toutesLecons.reduce((s, l) => s + l.dureeMinutes, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary-50 w-fit">
          <GraduationCap className="w-7 h-7 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">{t('titre')}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {t('sousTitre', {
              parcours: parcoursSource.length,
              lecons: total,
              heures: Math.round(minutesTotales / 60),
            })}
          </p>
        </div>
        <Link href="/aide" className="btn-secondary flex items-center gap-2 justify-center text-sm">
          <BookOpen className="w-4 h-4" />
          {t('centreAide')}
        </Link>
      </header>

      {/* Avertissement contenu vidéo */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <VideoOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-medium">{t('videoTitre')}</p>
          <p className="text-xs mt-1 text-amber-800">{t('videoTexte')}</p>
        </div>
      </div>

      {/* Progression */}
      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-neutral-800">{t('progression.titre')}</h2>
              <span className="text-sm font-bold text-primary-600">{pourcentage}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${pourcentage}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {charge ? t('progression.detail', { faites, total }) : t('progression.chargement')}
              {' · '}
              <span className="text-neutral-400">{t('progression.appareil')}</span>
            </p>
          </div>
          <button
            onClick={reinitialiser}
            disabled={faites === 0}
            className="btn-secondary flex items-center gap-2 justify-center text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('progression.reinitialiser')}
          </button>
        </div>
      </section>

      {/* Filtres de catégorie */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['Toutes', ...CATEGORIES_PARCOURS] as (CategorieParcours | 'Toutes')[]).map((c) => (
          <button
            key={c}
            onClick={() => setCategorie(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              categorie === c
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {c === 'Toutes' ? t('toutes') : libelleCategorieParcours(c, locale)}
          </button>
        ))}
      </div>

      {/* Parcours */}
      <div className="space-y-6">
        {parcoursAffiches.map((parcours) => {
          const faitesParcours = parcours.lecons.filter((l) => terminees.includes(l.id)).length;
          const pctParcours = Math.round((faitesParcours / parcours.lecons.length) * 100);
          return (
            <section key={parcours.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-neutral-800">{parcours.titre}</h2>
                    <span className="badge text-[10px]">{libelleCategorieParcours(parcours.categorie, locale)}</span>
                    <span className="badge text-[10px]">{libelleNiveau(parcours.niveau, locale)}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{parcours.description}</p>
                </div>
                <span className="text-xs font-medium text-neutral-500 shrink-0">
                  {faitesParcours}/{parcours.lecons.length} · {pctParcours}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {parcours.lecons.map((lecon) => {
                  const fait = terminees.includes(lecon.id);
                  return (
                    <article
                      key={lecon.id}
                      className={`card p-4 flex flex-col gap-3 transition-colors ${
                        fait ? 'border-primary-200 bg-primary-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => basculer(lecon.id)}
                          aria-pressed={fait}
                          aria-label={fait ? t('lecon.marquerNonTerminee') : t('lecon.marquerTerminee')}
                          className="shrink-0 mt-0.5"
                        >
                          {fait ? (
                            <CheckCircle2 className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-neutral-300 hover:text-primary-400 transition-colors" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-medium text-neutral-800">{lecon.titre}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5">{lecon.resume}</p>
                        </div>
                      </div>

                      <ul className="space-y-1 pl-8">
                        {lecon.objectifs.map((o) => (
                          <li key={o} className="text-[11px] text-neutral-500 flex gap-1.5">
                            <Target className="w-3 h-3 text-primary-400 shrink-0 mt-0.5" />
                            <span>{o}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap items-center gap-2 pl-8 mt-auto">
                        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                          <Clock className="w-3 h-3" />
                          {t('lecon.minutes', { count: lecon.dureeMinutes })}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                          {libelleNiveau(lecon.niveau, locale)}
                        </span>
                        {lecon.disponible ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-primary-600 font-medium">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {t('lecon.videoDisponible')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            <VideoOff className="w-3 h-3" />
                            {t('lecon.videoBientot')}
                          </span>
                        )}
                      </div>

                      {lecon.lienInterne && (
                        <Link
                          href={lecon.lienInterne}
                          className="ml-8 inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:underline"
                        >
                          {t('lecon.voirDansApp')}
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bibliothèque de ressources */}
      <section className="space-y-3">
        <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
          <Library className="w-5 h-5 text-primary-600" />
          {t('ressources.titre')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ressources.map((r) => {
            const contenu = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{r.titre}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{r.description}</p>
                  </div>
                  {r.disponible ? (
                    <ExternalLink className="w-4 h-4 text-neutral-300 shrink-0 mt-0.5" />
                  ) : null}
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full w-fit ${
                    r.disponible
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {r.disponible ? libelleTypeRessource(r.type, locale) : t('ressources.bientot')}
                </span>
              </>
            );

            return r.disponible && r.href ? (
              <Link key={r.id} href={r.href} className="card card-hover p-4 flex flex-col gap-2">
                {contenu}
              </Link>
            ) : (
              <div key={r.id} className="card p-4 flex flex-col gap-2 opacity-70">
                {contenu}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
