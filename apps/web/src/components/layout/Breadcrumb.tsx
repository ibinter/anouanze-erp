'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Segments d'URL dont le libellé est traduit (`shell.breadcrumb.labels.*`).
 * Tout autre segment est simplement capitalisé.
 */
const SEGMENTS_CONNUS = [
  'dashboard', 'membres', 'projets', 'comptabilite', 'tresorerie', 'rh',
  'donateurs', 'bailleurs', 'beneficiaires', 'documents', 'reporting',
  'audit', 'achats', 'stocks', 'evenements', 'parametres', 'immobilisations',
  'volontaires', 'ia', 'meal', 'profil', 'notifications',
] as const;

export function Breadcrumb() {
  const t = useTranslations('shell.breadcrumb');
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const libelle = (seg: string) =>
    (SEGMENTS_CONNUS as readonly string[]).includes(seg)
      ? t(`labels.${seg}`)
      : seg.charAt(0).toUpperCase() + seg.slice(1);

  const crumbs = segments.map((seg, i) => ({
    label: libelle(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400" aria-label={t('aria')}>
      <Link href="/dashboard" aria-label={t('accueil')} className="hover:text-primary-600 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
          {crumb.isLast ? (
            <span className="text-neutral-700 dark:text-neutral-200 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-primary-600 transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
