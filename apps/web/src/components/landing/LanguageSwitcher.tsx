'use client';

import { useState } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Changer la langue"
      >
        <span className="text-base leading-none">{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
        <span className="uppercase text-xs tracking-wide">{lang}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
          <button
            onClick={() => { setLang('fr'); setOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors ${lang === 'fr' ? 'text-primary-600 font-semibold bg-primary-50' : 'text-neutral-700'}`}
          >
            <span>🇫🇷</span> Français
            {lang === 'fr' && <span className="ml-auto text-primary-500">✓</span>}
          </button>
          <button
            onClick={() => { setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-400 hover:bg-neutral-50 transition-colors"
            title="Bientôt disponible"
          >
            <span>🇬🇧</span> English
            <span className="ml-auto text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full font-medium">Soon</span>
          </button>
        </div>
      )}
    </div>
  );
}
