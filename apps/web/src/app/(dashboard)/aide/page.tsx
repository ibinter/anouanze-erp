'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, HelpCircle, BookOpen, FileQuestion, ListChecks, GraduationCap,
  MessageCircle, LifeBuoy, Zap, ChevronDown, ChevronUp, ChevronRight,
  AlertTriangle, Lightbulb, ShieldCheck, Users, ClipboardCheck, Target,
  CheckCircle2, X,
} from 'lucide-react';
import {
  GUIDE_MODULES, CATEGORIES_GUIDE,
  FAQ_ITEMS, CATEGORIES_FAQ,
  CAS_PRATIQUES,
  rechercherAide,
  type CategorieFaq,
  type ResultatRecherche,
} from '@/lib/help';

type Onglet = 'guide' | 'faq' | 'cas';

const ONGLETS: { id: Onglet; label: string; icon: typeof BookOpen; compte: number }[] = [
  { id: 'guide', label: 'Guide utilisateur', icon: BookOpen, compte: GUIDE_MODULES.length },
  { id: 'faq', label: 'FAQ', icon: FileQuestion, compte: FAQ_ITEMS.length },
  { id: 'cas', label: 'Cas pratiques', icon: ListChecks, compte: CAS_PRATIQUES.length },
];

export default function AidePage() {
  const [search, setSearch] = useState('');
  const [onglet, setOnglet] = useState<Onglet>('guide');
  const [catGuide, setCatGuide] = useState<string>('Toutes');
  const [catFaq, setCatFaq] = useState<CategorieFaq | 'Toutes'>('Toutes');
  const [moduleOuvert, setModuleOuvert] = useState<string | null>(null);
  const [faqOuverte, setFaqOuverte] = useState<string | null>(null);
  const [casOuvert, setCasOuvert] = useState<string | null>(null);

  const resultats: ResultatRecherche[] = useMemo(
    () => (search.trim().length >= 2 ? rechercherAide(search) : []),
    [search],
  );

  const modulesFiltres = useMemo(
    () => GUIDE_MODULES.filter((m) => catGuide === 'Toutes' || m.categorie === catGuide),
    [catGuide],
  );

  const faqFiltrees = useMemo(
    () => FAQ_ITEMS.filter((f) => catFaq === 'Toutes' || f.categorie === catFaq),
    [catFaq],
  );

  const ouvrirResultat = (r: ResultatRecherche) => {
    setSearch('');
    if (r.type === 'guide') {
      setOnglet('guide');
      setCatGuide('Toutes');
      setModuleOuvert(r.id);
    } else if (r.type === 'faq') {
      setOnglet('faq');
      setCatFaq('Toutes');
      setFaqOuverte(r.id);
    } else {
      setOnglet('cas');
      setCasOuvert(r.id);
    }
  };

  const relancerVisite = () => {
    try {
      localStorage.removeItem('anouanze-onboarding-done');
    } catch {
      /* stockage indisponible : la visite devra être relancée manuellement */
    }
    window.location.href = '/dashboard';
  };

  const compteParType = (type: ResultatRecherche['type']) =>
    resultats.filter((r) => r.type === type).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <header className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 mb-3">
          <HelpCircle className="w-7 h-7 text-primary-600" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-800">Centre d&apos;aide</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Guide utilisateur, questions fréquentes et cas pratiques d&apos;ANOUANZÊ ERP
        </p>
      </header>

      {/* Recherche globale */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher dans le guide, la FAQ et les cas pratiques…"
          className="input pl-10 pr-10 w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher dans le centre d'aide"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Résultats de recherche globale */}
      {search.trim().length >= 2 && (
        <section className="card p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">
              {resultats.length} résultat{resultats.length > 1 ? 's' : ''} pour « {search} »
            </span>
            <span>{compteParType('guide')} guide</span>
            <span>{compteParType('faq')} FAQ</span>
            <span>{compteParType('cas')} cas pratique{compteParType('cas') > 1 ? 's' : ''}</span>
          </div>

          {resultats.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4 text-center">
              Aucun résultat. Essayez un autre mot-clé, ou posez la question à SARA.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {resultats.slice(0, 25).map((r) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    onClick={() => ouvrirResultat(r)}
                    className="w-full text-left py-3 px-1 hover:bg-neutral-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <span className="badge shrink-0 mt-0.5 text-[10px] uppercase tracking-wide">
                        {r.type === 'guide' ? 'Guide' : r.type === 'faq' ? 'FAQ' : 'Cas'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-neutral-800">{r.titre}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{r.extrait}</p>
                        <p className="text-[11px] text-neutral-400 mt-1">{r.categorie}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 mt-1" />
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Accès rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/ia" className="card card-hover p-4 flex flex-col items-center gap-2 text-center">
          <MessageCircle className="w-6 h-6 text-primary-600" />
          <span className="text-xs font-medium text-neutral-700">Poser la question à SARA</span>
        </Link>
        <Link href="/tickets" className="card card-hover p-4 flex flex-col items-center gap-2 text-center">
          <LifeBuoy className="w-6 h-6 text-accent-500" />
          <span className="text-xs font-medium text-neutral-700">Ouvrir un ticket</span>
        </Link>
        <Link href="/academie" className="card card-hover p-4 flex flex-col items-center gap-2 text-center">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          <span className="text-xs font-medium text-neutral-700">Académie ANOUANZÊ</span>
        </Link>
        <button
          onClick={relancerVisite}
          className="card card-hover p-4 flex flex-col items-center gap-2 text-center"
        >
          <Zap className="w-6 h-6 text-blue-600" />
          <span className="text-xs font-medium text-neutral-700">Relancer la visite guidée</span>
        </button>
      </div>

      {/* Onglets */}
      <div className="border-b border-neutral-200 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {ONGLETS.map((o) => {
            const actif = onglet === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setOnglet(o.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  actif
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <o.icon className="w-4 h-4" />
                {o.label}
                <span className="text-[11px] text-neutral-400">({o.compte})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Onglet Guide */}
      {onglet === 'guide' && (
        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['Toutes', ...CATEGORIES_GUIDE] as string[]).map((c) => (
              <button
                key={c}
                onClick={() => setCatGuide(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  catGuide === c
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {modulesFiltres.map((mod) => {
              const ouvert = moduleOuvert === mod.id;
              return (
                <article key={mod.id} className="card overflow-hidden">
                  <button
                    onClick={() => setModuleOuvert(ouvert ? null : mod.id)}
                    className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-neutral-800 text-sm">{mod.titre}</h2>
                        <span className="badge text-[10px]">{mod.categorie}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{mod.objectif}</p>
                    </div>
                    {ouvert
                      ? <ChevronUp className="w-4 h-4 text-primary-600 shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />}
                  </button>

                  {ouvert && (
                    <div className="px-4 pb-5 space-y-5 border-t border-neutral-100 pt-4 bg-neutral-50/60">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Bloc icon={Users} titre="Utilisateurs concernés">
                          <ListeSimple items={mod.utilisateurs} />
                        </Bloc>
                        <Bloc icon={ClipboardCheck} titre="Prérequis">
                          <ListeSimple items={mod.prerequis} />
                        </Bloc>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                          Procédure pas à pas
                        </h3>
                        <ol className="space-y-2">
                          {mod.procedure.map((etape, i) => (
                            <li key={etape.titre} className="flex gap-3">
                              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-800">{etape.titre}</p>
                                <p className="text-xs text-neutral-600 mt-0.5">{etape.detail}</p>
                                {etape.chemin && (
                                  <p className="text-[11px] text-primary-600 mt-1 font-mono">{etape.chemin}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                          Erreurs fréquentes
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs min-w-[560px]">
                            <thead>
                              <tr className="text-left text-neutral-400 border-b border-neutral-200">
                                <th className="py-2 pr-3 font-medium">Problème</th>
                                <th className="py-2 pr-3 font-medium">Cause probable</th>
                                <th className="py-2 font-medium">Solution</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {mod.erreurs.map((e) => (
                                <tr key={e.probleme} className="align-top">
                                  <td className="py-2 pr-3 text-neutral-800 font-medium">{e.probleme}</td>
                                  <td className="py-2 pr-3 text-neutral-600">{e.cause}</td>
                                  <td className="py-2 text-neutral-600">{e.solution}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Bloc icon={Lightbulb} titre="Conseils">
                          <ListeSimple items={mod.conseils} />
                        </Bloc>
                        <Bloc icon={ShieldCheck} titre="Permissions nécessaires">
                          <ListeSimple items={mod.permissions} />
                        </Bloc>
                      </div>

                      <Link href={mod.href} className="btn-secondary inline-flex items-center gap-2 text-xs">
                        Ouvrir le module
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Onglet FAQ */}
      {onglet === 'faq' && (
        <section className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['Toutes', ...CATEGORIES_FAQ] as (CategorieFaq | 'Toutes')[]).map((c) => (
              <button
                key={c}
                onClick={() => setCatFaq(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  catFaq === c
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <p className="text-xs text-neutral-400">
            {faqFiltrees.length} question{faqFiltrees.length > 1 ? 's' : ''} affichée
            {faqFiltrees.length > 1 ? 's' : ''}
          </p>

          <div className="card divide-y divide-neutral-100">
            {faqFiltrees.map((f) => {
              const ouverte = faqOuverte === f.id;
              return (
                <div key={f.id}>
                  <button
                    onClick={() => setFaqOuverte(ouverte ? null : f.id)}
                    className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 hover:bg-neutral-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800">{f.question}</p>
                      {catFaq === 'Toutes' && (
                        <p className="text-[11px] text-neutral-400 mt-0.5">{f.categorie}</p>
                      )}
                    </div>
                    {ouverte
                      ? <ChevronUp className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                      : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />}
                  </button>
                  {ouverte && (
                    <div className="px-4 pb-4 bg-neutral-50">
                      <p className="text-sm text-neutral-600 leading-relaxed">{f.reponse}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {f.motsCles.map((mc) => (
                          <span
                            key={mc}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-500"
                          >
                            {mc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Onglet Cas pratiques */}
      {onglet === 'cas' && (
        <section className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
            <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Les noms, montants et références utilisés dans ces cas pratiques sont fictifs et servent
              uniquement d&apos;illustration.
            </p>
          </div>

          {CAS_PRATIQUES.map((cas) => {
            const ouvert = casOuvert === cas.id;
            return (
              <article key={cas.id} className="card overflow-hidden">
                <button
                  onClick={() => setCasOuvert(ouvert ? null : cas.id)}
                  className="w-full text-left px-4 py-4 flex items-start justify-between gap-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="min-w-0">
                    <h2 className="font-semibold text-neutral-800 text-sm">{cas.titre}</h2>
                    <p className="text-xs text-neutral-500 mt-1">{cas.contexte}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="badge text-[10px]">{cas.niveau}</span>
                      <span className="badge text-[10px]">≈ {cas.dureeMinutes} min</span>
                      {cas.modules.map((m) => (
                        <span key={m} className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  {ouvert
                    ? <ChevronUp className="w-4 h-4 text-primary-600 shrink-0 mt-1" />
                    : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />}
                </button>

                {ouvert && (
                  <div className="px-4 pb-5 pt-4 border-t border-neutral-100 bg-neutral-50/60 space-y-5">
                    <Bloc icon={Target} titre="Objectif">
                      <p className="text-xs text-neutral-600">{cas.objectif}</p>
                    </Bloc>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                        Étapes
                      </h3>
                      <ol className="space-y-2">
                        {cas.etapes.map((etape, i) => (
                          <li key={etape.titre} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent-100 text-accent-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-neutral-800">{etape.titre}</p>
                              <p className="text-xs text-neutral-600 mt-0.5">{etape.detail}</p>
                              {etape.chemin && (
                                <p className="text-[11px] text-primary-600 mt-1 font-mono">{etape.chemin}</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <Bloc icon={CheckCircle2} titre="Résultat attendu">
                      <ListeSimple items={cas.resultatAttendu} />
                    </Bloc>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                        Erreurs possibles
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs min-w-[560px]">
                          <thead>
                            <tr className="text-left text-neutral-400 border-b border-neutral-200">
                              <th className="py-2 pr-3 font-medium">Problème</th>
                              <th className="py-2 pr-3 font-medium">Cause probable</th>
                              <th className="py-2 font-medium">Solution</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {cas.erreursPossibles.map((e) => (
                              <tr key={e.probleme} className="align-top">
                                <td className="py-2 pr-3 text-neutral-800 font-medium">{e.probleme}</td>
                                <td className="py-2 pr-3 text-neutral-600">{e.cause}</td>
                                <td className="py-2 text-neutral-600">{e.solution}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* Support */}
      <section className="card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="p-3 rounded-xl bg-primary-50 shrink-0">
            <LifeBuoy className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 w-full">
            <h2 className="font-semibold text-neutral-800 mb-1">
              Vous n&apos;avez pas trouvé votre réponse ?
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              Posez la question à SARA pour une explication immédiate, ou ouvrez un ticket auprès du
              support IBIG SOFT en précisant le module, l&apos;action réalisée et le message d&apos;erreur exact.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/ia" className="btn-primary flex items-center gap-2 justify-center">
                <MessageCircle className="w-4 h-4" />
                Poser la question à SARA
              </Link>
              <Link href="/tickets" className="btn-secondary flex items-center gap-2 justify-center">
                <LifeBuoy className="w-4 h-4" />
                Ouvrir un ticket
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Sous-composants ──────────────────────────────────────── */

function Bloc({
  icon: Icon,
  titre,
  children,
}: {
  icon: typeof BookOpen;
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {titre}
      </h3>
      {children}
    </div>
  );
}

function ListeSimple({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item} className="text-xs text-neutral-600 flex gap-2">
          <span className="text-primary-500 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
