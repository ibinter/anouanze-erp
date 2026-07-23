'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

/** Destinations des CTA — hors traduction (structure, pas contenu). */
const SLIDE_LINKS = [
  { cta: '/demo', secondary: '#fonctionnalites' },
  { cta: '#fonctionnalites', secondary: '#tarifs' },
  { cta: '/demo', secondary: '#tarifs' },
];

type Stat = { val: string; label: string };

/** Balises autorisées dans les messages enrichis du hero. */
const RICH = {
  br: () => <br />,
  accent: (chunks: React.ReactNode) => <span className="text-accent-400">{chunks}</span>,
  b: (chunks: React.ReactNode) => <strong className="text-white font-semibold">{chunks}</strong>,
};

export default function HeroSlider() {
  const t = useTranslations('hero');
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDE_LINKS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const links = SLIDE_LINKS[current];
  const reassurance = t.raw('reassurance') as string[];
  const stats = t.raw('stats') as Stat[];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-600 to-[#2E9E4F] text-white pt-12 sm:pt-20 pb-16 sm:pb-28 px-4 sm:px-6 lg:px-20">
      {/* Blobs décoratifs — clippés par overflow-hidden de la section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -right-32 w-64 sm:w-[500px] h-64 sm:h-[500px] bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-48 sm:w-80 h-48 sm:h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-accent-400/15 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/3 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-6 sm:mb-8 backdrop-blur-sm transition-all duration-700 max-w-full">
          <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse flex-shrink-0" />
          <span className="truncate">{t(`slides.${current}.badge`)}</span>
        </div>

        {/* Titre — hauteur min fluide, taille clamp pour éviter overflow */}
        <div className="min-h-[140px] sm:min-h-[220px] lg:min-h-[280px] flex items-start">
          <h1
            key={current}
            className="text-[clamp(2.25rem,8vw,4.5rem)] lg:text-7xl font-extrabold leading-[1.05] mb-4 sm:mb-6 tracking-tight animate-fade-in"
          >
            {t.rich(`slides.${current}.title`, RICH)}
          </h1>
        </div>

        {/* Sous-titre */}
        <p key={`sub-${current}`} className="text-base sm:text-xl lg:text-2xl text-white/80 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-light animate-fade-in">
          {t.rich(`slides.${current}.subtitle`, RICH)}
        </p>

        {/* CTA buttons — empilés sur mobile */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10 sm:mb-12">
          <Link
            href={links.cta}
            className="inline-flex items-center justify-center gap-2 bg-accent-400 hover:bg-amber-500 text-white font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 w-full sm:w-auto text-center"
          >
            {t(`slides.${current}.cta`)}
          </Link>
          <a
            href={links.secondary}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg transition-colors backdrop-blur-sm w-full sm:w-auto text-center"
          >
            {t(`slides.${current}.secondary`)}
          </a>
        </div>

        {/* Mentions — flex wrap pour mobile, pas de &nbsp; */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/40">
          {reassurance.map((r) => (
            <span key={r}>✓ {r}</span>
          ))}
        </div>

        {/* Dots navigation */}
        <div className="flex items-center gap-3 mt-8 sm:mt-10">
          {SLIDE_LINKS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-accent-400' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'}`}
              aria-label={t('slideLabel', { n: i + 1 })}
            />
          ))}
        </div>

        {/* Stats inline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-white/10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-accent-400">{s.val}</p>
              <p className="text-xs sm:text-sm text-white/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
