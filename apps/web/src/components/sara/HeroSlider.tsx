'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SLIDES = [
  {
    badge: 'Conforme SYCEBNL · Norme OHADA · Adapté à l\'Afrique francophone',
    title: <>Pilotez votre impact.<br /><span className="text-accent-400">Gérez avec</span><br />excellence.</>,
    subtitle: <>La solution ERP tout-en-un conçue pour les <strong className="text-white font-semibold">associations, ONG et organisations à but non lucratif</strong> d'Afrique francophone.</>,
    cta: { label: 'Démarrer l\'essai gratuit — 30 jours →', href: '/demo' },
    secondary: { label: 'Voir les fonctionnalités', href: '#fonctionnalites' },
  },
  {
    badge: '12 modules · Tout inclus · Zéro installation',
    title: <><span className="text-accent-400">12 modules</span><br />intégrés pour<br />votre ONG.</>,
    subtitle: <>Gouvernance, Membres, Comptabilité SYCEBNL, Projets MEAL, RH, Donateurs, Budget, Achats, Documents, Événements, BI et Assistant IA — <strong className="text-white font-semibold">dans une seule plateforme.</strong></>,
    cta: { label: 'Découvrir les modules →', href: '#fonctionnalites' },
    secondary: { label: 'Voir les tarifs', href: '#tarifs' },
  },
  {
    badge: 'Essai gratuit 30 jours · Sans carte bancaire',
    title: <>30 jours<br /><span className="text-accent-400">gratuits,</span><br />sans risque.</>,
    subtitle: <>Testez ANOUANZÊ ERP pendant 30 jours complets. <strong className="text-white font-semibold">Aucune carte bancaire requise.</strong> Résiliation en un clic. Données hébergées en Afrique.</>,
    cta: { label: 'Commencer maintenant — Gratuit →', href: '/demo' },
    secondary: { label: 'Comparer les plans', href: '#tarifs' },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-600 to-[#2E9E4F] text-white pt-20 pb-28 px-6 lg:px-20">
      {/* Blobs décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-accent-400/15 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </div>

      <div className="relative max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8 backdrop-blur-sm transition-all duration-700">
          <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
          {slide.badge}
        </div>

        {/* Titre — hauteur fixe pour éviter le layout shift */}
        <div className="min-h-[220px] lg:min-h-[280px] flex items-start">
          <h1
            key={current}
            className="text-5xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight animate-fade-in"
          >
            {slide.title}
          </h1>
        </div>

        <p key={`sub-${current}`} className="text-xl lg:text-2xl text-white/80 max-w-2xl mb-10 leading-relaxed font-light animate-fade-in">
          {slide.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href={slide.cta.href}
            className="inline-flex items-center justify-center gap-2 bg-accent-400 hover:bg-amber-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
          >
            {slide.cta.label}
          </Link>
          <a
            href={slide.secondary.href}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors backdrop-blur-sm"
          >
            {slide.secondary.label}
          </a>
        </div>

        <p className="text-sm text-white/40">✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Résiliation à tout moment &nbsp;·&nbsp; ✓ Données hébergées en Afrique</p>

        {/* Dots navigation */}
        <div className="flex items-center gap-3 mt-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-accent-400' : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Stats inline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 pt-10 border-t border-white/10">
          {[
            { val: '12+', label: 'Modules intégrés' },
            { val: '11', label: 'Niveaux de droits' },
            { val: '100%', label: 'Conforme SYCEBNL' },
            { val: '30j', label: 'Essai gratuit' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-accent-400">{s.val}</p>
              <p className="text-sm text-white/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
