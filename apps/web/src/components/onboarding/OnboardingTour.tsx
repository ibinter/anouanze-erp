'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  target: string;       // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="dashboard"]',
    title: 'Tableau de bord',
    content: 'Votre vue d\'ensemble : KPIs financiers, projets actifs, alertes et graphiques en temps réel.',
    position: 'right',
  },
  {
    target: '[data-tour="membres"]',
    title: 'Gestion des membres',
    content: 'Gérez votre base de membres, cotisations, fonctions et historique de participation.',
    position: 'right',
  },
  {
    target: '[data-tour="projets"]',
    title: 'Projets & MEAL',
    content: 'Suivez vos projets avec le cadre logique, indicateurs MEAL, collectes de données et rapports.',
    position: 'right',
  },
  {
    target: '[data-tour="comptabilite"]',
    title: 'Comptabilité SYCEBNL',
    content: 'Journal comptable conforme OHADA/SYCEBNL, grand livre, bilan et compte de résultat.',
    position: 'right',
  },
  {
    target: '[data-tour="ia"]',
    title: 'Assistant IA SARA',
    content: 'SARA analyse vos données et génère des insights, alertes et recommandations personnalisées.',
    position: 'right',
  },
  {
    target: '[data-tour="notifications"]',
    title: 'Notifications',
    content: 'Restez informé des alertes importantes : échéances, budgets dépassés, actions requises.',
    position: 'right',
  },
];

const TOUR_KEY = 'anouanze-onboarding-done';

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      setTimeout(() => setActive(true), 1500);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    positionTooltip(STEPS[step]);
  }, [active, step]);

  const positionTooltip = (s: TourStep) => {
    const el = document.querySelector(s.target);
    if (!el) {
      setTooltipStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setHighlightStyle({ display: 'none' });
      return;
    }
    const rect = el.getBoundingClientRect();
    const MARGIN = 12;
    const TOOLTIP_W = 280;
    const TOOLTIP_H = 160;

    setHighlightStyle({
      position: 'fixed',
      top: rect.top - 4,
      left: rect.left - 4,
      width: rect.width + 8,
      height: rect.height + 8,
      borderRadius: 8,
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
      border: '2px solid #146C43',
      transition: 'all 0.3s ease',
      zIndex: 9998,
      pointerEvents: 'none',
    });

    const pos = s.position ?? 'right';
    let top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
    let left = rect.right + MARGIN;

    if (pos === 'bottom') { top = rect.bottom + MARGIN; left = rect.left; }
    if (pos === 'top') { top = rect.top - TOOLTIP_H - MARGIN; left = rect.left; }
    if (pos === 'left') { left = rect.left - TOOLTIP_W - MARGIN; top = rect.top + rect.height / 2 - TOOLTIP_H / 2; }

    // Clamp to viewport
    top = Math.max(8, Math.min(top, window.innerHeight - TOOLTIP_H - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_W - 8));

    setTooltipStyle({ position: 'fixed', top, left, width: TOOLTIP_W, zIndex: 9999, transition: 'all 0.3s ease' });
  };

  const finish = () => {
    localStorage.setItem(TOUR_KEY, '1');
    setActive(false);
  };

  if (!active) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Highlight overlay */}
      <div style={highlightStyle} />

      {/* Tooltip */}
      <div style={tooltipStyle} className="bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{step + 1}/{STEPS.length}</span>
          <button onClick={finish} className="text-gray-400 hover:text-gray-600 -mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-bold text-gray-900 mb-1">{current.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{current.content}</p>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm text-gray-400 disabled:opacity-30 hover:text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary/90">
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finish} className="bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary/90">
              Terminer ✓
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>
    </>
  );
}
