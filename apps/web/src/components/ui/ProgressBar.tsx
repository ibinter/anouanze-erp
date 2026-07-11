'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  couleur?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'auto';
  showLabel?: boolean;
  className?: string;
}

function resolveColor(couleur: ProgressBarProps['couleur'], value: number): string {
  if (couleur === 'auto') {
    if (value < 50) return 'bg-red-500';
    if (value <= 80) return 'bg-orange-400';
    return 'bg-emerald-500';
  }
  const map: Record<string, string> = {
    primary: 'bg-primary-600',
    accent: 'bg-accent-400',
    success: 'bg-emerald-500',
    warning: 'bg-orange-400',
    error: 'bg-red-500',
  };
  return map[couleur ?? 'primary'];
}

export function ProgressBar({ value, couleur = 'primary', showLabel = true, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor = resolveColor(couleur, clamped);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', barColor)}
            style={{ width: `${clamped}%` }}
          />
        </div>
        {showLabel && (
          <span className="text-xs font-medium text-neutral-600 w-9 text-right shrink-0">
            {clamped}%
          </span>
        )}
      </div>
    </div>
  );
}
