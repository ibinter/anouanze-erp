'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LayoutDashboard, MoreHorizontal, Users, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** §9.3 — 4 accès rapides + « Plus » (jamais plus de 5 entrées) */
const items = [
  { key: 'accueil', href: '/dashboard', icon: LayoutDashboard },
  { key: 'membres', href: '/membres', icon: Users },
  { key: 'tresorerie', href: '/tresorerie', icon: Wallet },
  { key: 'alertes', href: '/notifications', icon: Bell },
] as const;

interface BottomNavProps {
  /** Ouvre le drawer Sidebar complet */
  onMoreClick?: () => void;
  /** Le drawer « Plus » est-il ouvert ? */
  moreOpen?: boolean;
}

export function BottomNav({ onMoreClick, moreOpen = false }: BottomNavProps) {
  const t = useTranslations('shell.bottomNav');
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <nav
      aria-label={t('aria')}
      className="bottom-nav lg:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn('bottom-nav-item', active && 'bottom-nav-item-active')}
              >
                <Icon className="w-[22px] h-[22px]" />
                <span className="bottom-nav-label">{t(item.key)}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            type="button"
            onClick={onMoreClick}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            className={cn('bottom-nav-item w-full', moreOpen && 'bottom-nav-item-active')}
          >
            <MoreHorizontal className="w-[22px] h-[22px]" />
            <span className="bottom-nav-label">{t('plus')}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
