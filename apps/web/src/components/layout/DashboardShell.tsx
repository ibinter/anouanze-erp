'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { BottomNav } from './BottomNav';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onHamburgerClick={() => setMobileSidebarOpen(true)} />
        <div className="px-4 sm:px-6 py-2 border-b border-neutral-100 bg-white dark:bg-neutral-800 dark:border-neutral-700">
          <Breadcrumb />
        </div>
        {/* pb mobile : hauteur bottom-nav + safe-area iOS (cf. .pb-bottom-nav) */}
        <main className="flex-1 overflow-y-auto pb-bottom-nav lg:pb-0">
          {children}
        </main>
        <OnboardingTour />
      </div>
      <BottomNav
        moreOpen={mobileSidebarOpen}
        onMoreClick={() => setMobileSidebarOpen((v) => !v)}
      />
    </div>
  );
}
