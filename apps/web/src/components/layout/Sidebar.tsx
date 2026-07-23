'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Heart, Building2, FolderKanban,
  BookOpen, Wallet, ShoppingCart, FileText,
  BarChart3, Settings, Shield, Calendar, HelpCircle,
  ChevronLeft, ChevronRight, Landmark, Briefcase,
  PiggyBank, UserSquare2, PackageSearch, Bot, X,
  MessageSquare, Upload, CreditCard, GraduationCap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navSections = [
  {
    title: 'Principal',
    items: [
      { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
      { label: 'Gouvernance', href: '/gouvernance', icon: Landmark },
    ],
  },
  {
    title: 'Relations',
    items: [
      { label: 'Membres', href: '/membres', icon: Users, tourId: 'membres' },
      { label: 'Donateurs', href: '/donateurs', icon: Heart },
      { label: 'Bailleurs', href: '/bailleurs', icon: Building2 },
      { label: 'Bénéficiaires', href: '/beneficiaires', icon: UserSquare2 },
    ],
  },
  {
    title: 'Activités',
    items: [
      { label: 'Projets', href: '/projets', icon: FolderKanban, tourId: 'projets' },
      { label: 'Ressources humaines', href: '/rh', icon: Briefcase },
      { label: 'Événements', href: '/evenements', icon: Calendar },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Comptabilité', href: '/comptabilite', icon: BookOpen, tourId: 'comptabilite' },
      { label: 'Budget', href: '/budget', icon: PiggyBank },
      { label: 'Trésorerie', href: '/tresorerie', icon: Wallet },
      { label: 'Paiements Mobile', href: '/paiements', icon: CreditCard },
      { label: 'Achats', href: '/achats', icon: ShoppingCart },
      { label: 'Stocks', href: '/stocks', icon: PackageSearch },
    ],
  },
  {
    title: 'Outils',
    items: [
      { label: 'Documents', href: '/documents', icon: FileText },
      { label: 'Rapports & BI', href: '/reporting', icon: BarChart3 },
      { label: 'Assistant IA', href: '/ia', icon: Bot, tourId: 'ia' },
      { label: 'Import de données', href: '/import', icon: Upload },
      { label: 'Audit', href: '/audit', icon: Shield },
      { label: 'Académie', href: '/academie', icon: GraduationCap },
      { label: 'Support', href: '/tickets', icon: MessageSquare },
    ],
  },
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

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
              <img src="/logo.svg" alt="ANOUANZÊ ERP" className="w-6 h-6" />
            </div>
            <div className="leading-none min-w-0">
              <span className="text-sm font-bold text-white tracking-tight">ANOUANZÊ</span>
              <span className="text-[11px] font-semibold text-accent-300 block mt-0.5 tracking-wider">ERP</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center mx-auto">
            <img src="/logo.svg" alt="A" className="w-6 h-6" />
          </div>
        )}
        {/* Desktop collapse button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded-md hover:bg-white/10 text-primary-100/60 hover:text-white ml-auto transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-md hover:bg-white/10 text-primary-100/60 hover:text-white ml-auto transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4 sidebar-scroll">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary-100/40">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item', collapsed && 'justify-center')}
                  title={collapsed ? item.label : undefined}
                  {...((item as any).tourId ? { 'data-tour': (item as any).tourId } : {})}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Navigation bas */}
      <div className="py-3 px-2.5 border-t border-white/10 space-y-0.5 shrink-0">
        {bottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item', collapsed && 'justify-center')}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </>
  );

  const sidebarBg = 'bg-gradient-to-b from-primary-700 to-primary-900';

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full transition-all duration-300 shrink-0',
          sidebarBg,
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
          <aside className={cn('fixed inset-y-0 left-0 z-50 flex flex-col w-72 shadow-2xl lg:hidden', sidebarBg)}>
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
