'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, LayoutDashboard, MoreHorizontal, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

/** §9.3 — 4 accès rapides + « Plus » (jamais plus de 5 entrées) */
const items = [
  { label: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Membres', href: '/membres', icon: Users },
  { label: 'Trésorerie', href: '/tresorerie', icon: Wallet },
  { label: 'Alertes', href: '/notifications', icon: Bell },
] as const;

interface BottomNavProps {
  /** Ouvre le drawer Sidebar complet */
  onMoreClick?: () => void;
  /** Le drawer « Plus » est-il ouvert ? */
  moreOpen?: boolean;
}

export function BottomNav({ onMoreClick, moreOpen = false }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <nav
      aria-label="Navigation principale mobile"
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
                <span className="bottom-nav-label">{item.label}</span>
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
            <span className="bottom-nav-label">Plus</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
