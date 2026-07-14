'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Heart, Building2, FolderKanban,
  BookOpen, Wallet, ShoppingCart, FileText,
  BarChart3, Settings, Shield, Calendar, HelpCircle,
  ChevronLeft, ChevronRight, Landmark, Briefcase,
  PiggyBank, UserSquare2, PackageSearch, Bot, X,
  MessageSquare, Upload, CreditCard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navigation = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
  { label: 'Gouvernance', href: '/gouvernance', icon: Landmark },
  { label: 'Membres', href: '/membres', icon: Users, tourId: 'membres' },
  { label: 'Donateurs', href: '/donateurs', icon: Heart },
  { label: 'Bailleurs', href: '/bailleurs', icon: Building2 },
  { label: 'Projets', href: '/projets', icon: FolderKanban, tourId: 'projets' },
  { label: 'Bénéficiaires', href: '/beneficiaires', icon: UserSquare2 },
  { label: 'Ressources humaines', href: '/rh', icon: Briefcase },
  { label: 'Comptabilité', href: '/comptabilite', icon: BookOpen, tourId: 'comptabilite' },
  { label: 'Budget', href: '/budget', icon: PiggyBank },
  { label: 'Trésorerie', href: '/tresorerie', icon: Wallet },
  { label: 'Achats', href: '/achats', icon: ShoppingCart },
  { label: 'Stocks', href: '/stocks', icon: PackageSearch },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Événements', href: '/evenements', icon: Calendar },
  { label: 'Rapports & BI', href: '/reporting', icon: BarChart3 },
  { label: 'Assistant IA', href: '/ia', icon: Bot, tourId: 'ia' },
  { label: 'Audit', href: '/audit', icon: Shield },
  { label: 'Paiements Mobile', href: '/paiements', icon: CreditCard },
  { label: 'Import de données', href: '/import', icon: Upload },
  { label: 'Support', href: '/tickets', icon: MessageSquare },
];

const bottomNav = [
  { label: 'Paramètres', href: '/parametres', icon: Settings },
  { label: 'Aide', href: '/aide', icon: HelpCircle },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-100 shrink-0">
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
        {/* Desktop collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded-md hover:bg-neutral-100 text-neutral-400 ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-md hover:bg-neutral-100 text-neutral-400 ml-auto"
        >
          <X className="w-4 h-4" />
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
              {...((item as any).tourId ? { 'data-tour': (item as any).tourId } : {})}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Navigation bas */}
      <div className="py-3 px-2 border-t border-neutral-100 space-y-0.5 shrink-0">
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
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full bg-white border-r border-neutral-100 transition-all duration-300 shrink-0',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-white shadow-2xl lg:hidden">
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
