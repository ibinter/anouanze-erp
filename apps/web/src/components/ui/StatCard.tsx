'use client';

import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  titre: string;
  valeur: string | number;
  variation?: number;
  icone: ReactNode;
  couleur: 'green' | 'orange' | 'blue' | 'red' | 'purple' | 'teal';
  description?: string;
}

const couleurClasses: Record<StatCardProps['couleur'], { bg: string; text: string }> = {
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  red: { bg: 'bg-red-100', text: 'text-red-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

export function StatCard({ titre, valeur, variation, icone, couleur, description }: StatCardProps) {
  const c = couleurClasses[couleur];
  return (
    <div className="card flex items-start gap-4">
      <div className={cn('p-3 rounded-xl flex-shrink-0', c.bg, c.text)}>{icone}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-500 truncate">{titre}</p>
        <p className="text-2xl font-bold text-neutral-800 mt-0.5">{valeur}</p>
        {variation !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium mt-1',
              variation >= 0 ? 'text-green-600' : 'text-red-500',
            )}
          >
            {variation >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {variation >= 0 ? '+' : ''}
              {variation}%
            </span>
            <span className="text-neutral-400 font-normal">vs mois dernier</span>
          </div>
        )}
        {description && <p className="text-xs text-neutral-400 mt-1">{description}</p>}
      </div>
    </div>
  );
}
