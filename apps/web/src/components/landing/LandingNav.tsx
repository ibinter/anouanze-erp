'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const NAV_LINKS = [
  { href: '#fonctionnalites', label: 'Fonctionnalités' },
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#tarifs', label: 'Tarifs' },
  { href: '#temoignages', label: 'Témoignages' },
  { href: '#faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/98 backdrop-blur-xl border-b border-neutral-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[60px] sm:h-[68px] flex items-center justify-between gap-2">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0" onClick={close}>
            <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0" />
            <div className="flex items-baseline gap-1 leading-none min-w-0">
              <span className="font-extrabold text-primary-700 text-base sm:text-lg tracking-tight truncate">ANOUANZÊ</span>
              <span className="font-bold text-accent-400 text-[10px] sm:text-[11px] bg-accent-50 border border-accent-200 px-1.5 py-0.5 rounded-md leading-none flex-shrink-0">ERP</span>
            </div>
          </Link>

          {/* Nav centre — xl only */}
          <div className="hidden xl:flex items-center gap-1 text-[13.5px] text-neutral-600 font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <a key={href} href={href} className="hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                {label}
              </a>
            ))}
          </div>

          {/* Actions droite — md+ */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <a
              href="https://ibigpartners.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent-500 hover:text-accent-600 border border-accent-300 hover:border-accent-400 hover:bg-accent-50 px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              🤝 Devenir partenaire
            </a>
            <Link href="/login" className="text-[13px] font-semibold text-neutral-700 hover:text-primary-600 hover:bg-neutral-100 transition-colors px-3 py-2 rounded-lg whitespace-nowrap">
              Connexion
            </Link>
            <Link href="/demo" className="bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-px whitespace-nowrap">
              Essai gratuit
            </Link>
          </div>

          {/* Mobile droite : langue + hamburger */}
          <div className="flex items-center gap-1 md:hidden shrink-0">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-700 flex-shrink-0"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={close} aria-hidden="true" />

          {/* Drawer */}
          <div
            className="fixed inset-x-0 top-[60px] sm:top-[68px] z-50 bg-white border-t border-neutral-100 shadow-2xl md:hidden overflow-y-auto"
            style={{ maxHeight: 'calc(100dvh - 60px)' }}
          >
            {/* Liens nav */}
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={close}
                  className="flex items-center py-3 px-4 rounded-xl text-base font-semibold text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  {label}
                </a>
              ))}
              <a
                href="https://ibigpartners.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="flex items-center py-3 px-4 rounded-xl text-base font-semibold text-accent-500 hover:bg-accent-50 transition-colors"
              >
                🤝 Devenir partenaire
              </a>
            </div>

            {/* CTA */}
            <div className="px-4 pb-8 pt-3 border-t border-neutral-100 space-y-3">
              <Link
                href="/login"
                onClick={close}
                className="flex items-center justify-center w-full py-3.5 rounded-xl border-2 border-neutral-200 text-base font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/demo"
                onClick={close}
                className="flex items-center justify-center w-full py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-base font-bold transition-colors shadow-sm"
              >
                Essai gratuit — 30 jours →
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
