'use client';

import type { ReactNode } from 'react';

interface EmptyStateProps {
  titre: string;
  description: string;
  icone: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ titre, description, icone, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 flex items-center justify-center text-neutral-300 mb-4">
        {icone}
      </div>
      <h3 className="text-base font-semibold text-neutral-700 mb-1">{titre}</h3>
      <p className="text-sm text-neutral-400 max-w-sm">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-6">
          {action.label}
        </button>
      )}
    </div>
  );
}
