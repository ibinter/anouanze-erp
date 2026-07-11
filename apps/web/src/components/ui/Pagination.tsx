'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, page, limit, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );

  const withEllipsis: (number | '...')[] = [];
  let prev: number | undefined;
  for (const p of pages) {
    if (prev !== undefined && p - prev > 1) withEllipsis.push('...');
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-neutral-500">
        {from} – {to} sur {total} résultats
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {withEllipsis.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-neutral-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={cn(
                'w-8 h-8 text-sm rounded font-medium transition-colors',
                p === page
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-neutral-100 text-neutral-700',
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
