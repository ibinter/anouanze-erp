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
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Structure de navigation. `section` et `key` sont des clés de traduction
 * (`shell.sidebar.sections.*` / `shell.sidebar.items.*`) : les libellés
 * affichés proviennent de messages/<locale>/shell.json.
 */
const navSections = [
  {
    section: 'principal',
    items: [
      { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, tourId: 'dashboard' },
      { key: 'gouvernance', href: '/gouvernance', icon: Landmark },
    ],
  },
  {
    section: 'relations',
    items: [
      { key: 'membres', href: '/membres', icon: Users, tourId: 'membres' },
      { key: 'donateurs', href: '/donateurs', icon: Heart },
      { key: 'bailleurs', href: '/bailleurs', icon: Building2 },
      { key: 'beneficiaires', href: '/beneficiaires', icon: UserSquare2 },
    ],
  },
  {
    section: 'activites',
    items: [
      { key: 'projets', href: '/projets', icon: FolderKanban, tourId: 'projets' },
      { key: 'rh', href: '/rh', icon: Briefcase },
      { key: 'evenements', href: '/evenements', icon: Calendar },
    ],
  },
  {
    section: 'finance',
    items: [
      { key: 'comptabilite', href: '/comptabilite', icon: BookOpen, tourId: 'comptabilite' },
      { key: 'budget', href: '/budget', icon: PiggyBank },
      { key: 'tresorerie', href: '/tresorerie', icon: Wallet },
      { key: 'paiements', href: '/paiements', icon: CreditCard },
      { key: 'achats', href: '/achats', icon: ShoppingCart },
      { key: 'stocks', href: '/stocks', icon: PackageSearch },
    ],
  },
  {
    section: 'outils',
    items: [
      { key: 'documents', href: '/documents', icon: FileText },
      { key: 'reporting', href: '/reporting', icon: BarChart3 },
      { key: 'ia', href: '/ia', icon: Bot, tourId: 'ia' },
      { key: 'import', href: '/import', icon: Upload },
      { key: 'audit', href: '/audit', icon: Shield },
      { key: 'academie', href: '/academie', icon: GraduationCap },
      { key: 'tickets', href: '/tickets', icon: MessageSquare },
    ],
  },
];

const bottomNav = [
  { key: 'parametres', href: '/parametres', icon: Settings },
  { key: 'aide', href: '/aide', icon: HelpCircle },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const t = useTranslations('shell.sidebar');
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
              <img src="/logo.svg" alt={t('logoAlt')} className="w-6 h-6" />
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
          aria-label={collapsed ? t('etendre') : t('reduire')}
          className="hidden lg:flex p-1 rounded-md hover:bg-white/10 text-primary-100/60 hover:text-white ml-auto transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          aria-label={t('fermer')}
          className="lg:hidden p-1 rounded-md hover:bg-white/10 text-primary-100/60 hover:text-white ml-auto transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4 sidebar-scroll">
        {navSections.map((section) => (
          <div key={section.section} className="space-y-0.5">
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary-100/40">
                {t(`sections.${section.section}`)}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              const label = t(`items.${item.key}`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item', collapsed && 'justify-center')}
                  title={collapsed ? label : undefined}
                  {...((item as any).tourId ? { 'data-tour': (item as any).tourId } : {})}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
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
          const label = t(`items.${item.key}`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item', collapsed && 'justify-center')}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
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
          <aside
            className={cn('fixed inset-y-0 left-0 z-50 flex flex-col w-72 shadow-2xl lg:hidden', sidebarBg)}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}
