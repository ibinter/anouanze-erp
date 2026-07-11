'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  dashboard: 'Tableau de bord',
  membres: 'Membres',
  projets: 'Projets',
  comptabilite: 'Comptabilité',
  tresorerie: 'Trésorerie',
  rh: 'Ressources humaines',
  donateurs: 'Donateurs',
  bailleurs: 'Bailleurs',
  beneficiaires: 'Bénéficiaires',
  documents: 'Documents',
  reporting: 'Rapports & BI',
  audit: 'Audit & Traçabilité',
  achats: 'Achats',
  stocks: 'Stocks & Inventaire',
  evenements: 'Événements',
  parametres: 'Paramètres',
  immobilisations: 'Immobilisations',
  volontaires: 'Volontaires',
  ia: 'ANOUANZÊ AI',
  meal: 'SERA / MEAL',
  profil: 'Mon profil',
  notifications: 'Notifications',
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-neutral-500" aria-label="Fil d'Ariane">
      <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
        <Home className="w-4 h-4" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          {crumb.isLast ? (
            <span className="text-neutral-700 font-medium">{crumb.label}</span>
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
