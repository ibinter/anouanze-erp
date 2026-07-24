'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TourStep {
  /** Clé de traduction sous `shell.onboarding.etapes.*`. */
  cle: string;
  target: string;       // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const STEPS: TourStep[] = [
  { cle: 'dashboard', target: '[data-tour="dashboard"]', position: 'right' },
  { cle: 'membres', target: '[data-tour="membres"]', position: 'right' },
  { cle: 'projets', target: '[data-tour="projets"]', position: 'right' },
  { cle: 'comptabilite', target: '[data-tour="comptabilite"]', position: 'right' },
  { cle: 'ia', target: '[data-tour="ia"]', position: 'right' },
  { cle: 'notifications', target: '[data-tour="notifications"]', position: 'right' },
];

const TOUR_KEY = 'anouanze-onboarding-done';

export function OnboardingTour() {
  const t = useTranslations('shell.onboarding');
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
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {t('progression', { etape: step + 1, total: STEPS.length })}
          </span>
          <button onClick={finish} aria-label={t('fermer')} className="text-gray-400 hover:text-gray-600 -mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <h3 className="font-bold text-gray-900 mb-1">{t(`etapes.${current.cle}.titre`)}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{t(`etapes.${current.cle}.contenu`)}</p>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1 text-sm text-gray-400 disabled:opacity-30 hover:text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" /> {t('precedent')}
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1 bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary/90">
              {t('suivant')} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finish} className="bg-primary text-white text-sm px-4 py-1.5 rounded-lg hover:bg-primary/90">
              {t('terminer')}
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {STEPS.map((s, i) => (
            <button
              key={s.cle}
              onClick={() => setStep(i)}
              aria-label={t('allerEtape', { etape: i + 1 })}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
