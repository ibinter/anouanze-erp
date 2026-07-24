'use client';

import type { ReactNode } from 'react';
import { Clock3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface SectionProps {
  titre: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Bloc de paramètres standard (carte + titre + description). */
export function Section({ titre, description, action, children, className }: SectionProps) {
  return (
    <section className={cn('card space-y-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold text-neutral-800">{titre}</h3>
          {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** État honnête : la fonctionnalité est prévue mais la donnée n'existe pas encore côté API. */
export function BientotDisponible({
  titre,
  raison,
}: {
  titre: string;
  raison: string;
}) {
  const t = useTranslations('shell.parametres');
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <Clock3 className="h-4 w-4 text-neutral-400" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-700">
            {titre}{' '}
            <span className="badge badge-neutral ml-1 align-middle">{t('bientotDisponible')}</span>
          </p>
          <p className="text-xs leading-relaxed text-neutral-500">{raison}</p>
        </div>
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary-600' : 'bg-neutral-200',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
}

export function LigneOption({
  titre,
  description,
  children,
}: {
  titre: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-700">{titre}</p>
        {description && <p className="mt-0.5 text-xs text-neutral-400">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Champ({
  label,
  children,
  aide,
  className,
}: {
  label: string;
  children: ReactNode;
  aide?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="label">{label}</label>
      {children}
      {aide && <p className="text-[11px] text-neutral-400">{aide}</p>}
    </div>
  );
}
