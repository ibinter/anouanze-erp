'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onHamburgerClick={() => setMobileSidebarOpen(true)} />
        <div className="px-4 sm:px-6 py-2 border-b border-neutral-100 bg-white">
          <Breadcrumb />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <OnboardingTour />
      </div>
    </div>
  );
}
