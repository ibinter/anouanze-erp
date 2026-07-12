'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Heart, Building2, FolderKanban,
  BookOpen, Wallet, ShoppingCart, FileText,
  BarChart3, Settings, Shield, Calendar, HelpCircle,
  ChevronLeft, ChevronRight, Landmark, Briefcase,
  PiggyBank, UserSquare2, PackageSearch, Bot, Archive,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gouvernance', href: '/gouvernance', icon: Landmark },
  { label: 'Membres', href: '/membres', icon: Users },
  { label: 'Donateurs', href: '/donateurs', icon: Heart },
  { label: 'Bailleurs', href: '/bailleurs', icon: Building2 },
  { label: 'Projets', href: '/projets', icon: FolderKanban },
  { label: 'Bénéficiaires', href: '/beneficiaires', icon: UserSquare2 },
  { label: 'Ressources humaines', href: '/rh', icon: Briefcase },
  { label: 'Comptabilité', href: '/comptabilite', icon: BookOpen },
  { label: 'Budget', href: '/budget', icon: PiggyBank },
  { label: 'Trésorerie', href: '/tresorerie', icon: Wallet },
  { label: 'Achats', href: '/achats', icon: ShoppingCart },
  { label: 'Stocks', href: '/stocks', icon: PackageSearch },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Événements', href: '/evenements', icon: Calendar },
  { label: 'Rapports & BI', href: '/reporting', icon: BarChart3 },
  { label: 'Assistant IA', href: '/ia', icon: Bot },
  { label: 'Audit', href: '/audit', icon: Shield },
];

const bottomNav = [
  { label: 'Paramètres', href: '/parametres', icon: Settings },
  { label: 'Aide', href: '/aide', icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white border-r border-neutral-100 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-100">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-8 h-8 flex-shrink-0" />
            <div className="leading-none min-w-0">
              <span className="text-sm font-bold text-primary-600">ANOUANZÊ</span>
              <span className="text-xs font-semibold text-accent-400 block">ERP</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <img src="/logo.svg" alt="A" className="w-8 h-8 mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item')}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Navigation bas */}
      <div className="py-3 px-2 border-t border-neutral-100 space-y-0.5">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="sidebar-item"
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
