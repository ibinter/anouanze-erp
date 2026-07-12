'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InfoBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="bg-primary-800 text-white text-xs py-2 px-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-pulse" />
          Essai gratuit 30 jours · Sans carte bancaire
        </span>
        <span className="hidden sm:inline text-white/50">·</span>
        <span className="hidden sm:inline">📞 +225 05 55 05 99 01</span>
        <span className="hidden md:inline text-white/50">·</span>
        <Link href="https://ibigsoft.com" target="_blank" rel="noopener noreferrer" className="hidden md:inline hover:text-accent-400 transition-colors">
          Une solution IBIG SOFT →
        </Link>
      </div>
      <button onClick={() => setVisible(false)} className="text-white/50 hover:text-white shrink-0 text-base leading-none" aria-label="Fermer">×</button>
    </div>
  );
}
