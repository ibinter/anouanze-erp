'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { locales, localeLabels, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from '@/i18n/config';

export default function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur / touche Échap
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (locale: Locale) => {
    setOpen(false);
    if (locale === current) return;

    // Mémorisation du choix : cookie (lu côté serveur) + localStorage (confort client)
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
    try {
      window.localStorage.setItem(LOCALE_COOKIE, locale);
    } catch {
      /* stockage indisponible (navigation privée) — le cookie suffit */
    }

    startTransition(() => router.refresh());
  };

  const labelFor: Record<Locale, string> = {
    fr: t('french'),
    en: t('english'),
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-60"
        aria-label={t('aria')}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isPending}
      >
        <span className="text-base leading-none">{localeLabels[current].flag}</span>
        <span className="uppercase text-xs tracking-wide">{current}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              role="option"
              aria-selected={locale === current}
              onClick={() => select(locale)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-neutral-50 transition-colors ${
                locale === current ? 'text-primary-600 font-semibold bg-primary-50' : 'text-neutral-700'
              }`}
            >
              <span aria-hidden="true">{localeLabels[locale].flag}</span> {labelFor[locale]}
              {locale === current && <span className="ml-auto text-primary-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
