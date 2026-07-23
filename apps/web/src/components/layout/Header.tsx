'use client';

import { Bell, Search, ChevronDown, X, Menu } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface SearchResult {
  type: 'membre' | 'projet' | 'donateur' | 'bailleur' | 'document';
  id: string;
  label: string;
  sublabel?: string;
  href: string;
}

const TYPE_LABELS: Record<string, string> = {
  membre: 'Membre',
  projet: 'Projet',
  donateur: 'Donateur',
  bailleur: 'Bailleur',
  document: 'Document',
};

interface HeaderProps {
  onHamburgerClick?: () => void;
}

export function Header({ onHamburgerClick }: HeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    setSearching(true);
    try {
      const requests = await Promise.allSettled([
        api.get('/membres', { params: { search: q, limit: 3 } }),
        api.get('/projets', { params: { search: q, limit: 3 } }),
        api.get('/donateurs', { params: { search: q, limit: 3 } }),
      ]);

      const all: SearchResult[] = [];
      const [membresRes, projetsRes, donateursRes] = requests;

      if (membresRes.status === 'fulfilled') {
        const data = membresRes.value.data?.data ?? membresRes.value.data ?? [];
        data.slice(0, 3).forEach((m: any) => {
          all.push({ type: 'membre', id: m.id, label: `${m.prenom ?? ''} ${m.nom}`.trim(), sublabel: m.email, href: '/membres' });
        });
      }
      if (projetsRes.status === 'fulfilled') {
        const data = projetsRes.value.data?.data ?? projetsRes.value.data ?? [];
        data.slice(0, 3).forEach((p: any) => {
          all.push({ type: 'projet', id: p.id, label: p.nom ?? p.titre ?? p.code, sublabel: p.statut, href: '/projets' });
        });
      }
      if (donateursRes.status === 'fulfilled') {
        const data = donateursRes.value.data?.data ?? donateursRes.value.data ?? [];
        data.slice(0, 3).forEach((d: any) => {
          all.push({ type: 'donateur', id: d.id, label: d.nom ?? `${d.prenom ?? ''} ${d.nom ?? ''}`.trim(), sublabel: d.email, href: '/donateurs' });
        });
      }

      setResults(all);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(() => doSearch(q), 300);
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setQuery('');
    setResults([]);
    setOpen(false);
    setMobileSearchOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setTimeout(() => mobileInputRef.current?.focus(), 50);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const SearchDropdown = ({ results, searching, query, open }: { results: SearchResult[]; searching: boolean; query: string; open: boolean }) => {
    if (!open) return null;
    return (
      <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-xl border border-neutral-100 z-50 overflow-hidden dark:bg-neutral-800 dark:border-neutral-700">
        {searching && <div className="px-4 py-3 text-sm text-neutral-400">Recherche…</div>}
        {!searching && results.length === 0 && query.length >= 2 && (
          <div className="px-4 py-3 text-sm text-neutral-400">Aucun résultat pour « {query} »</div>
        )}
        {!searching && results.length > 0 && (
          <ul>
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700/60 transition-colors"
                  onClick={() => handleSelect(r)}
                >
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-100 font-medium whitespace-nowrap">
                    {TYPE_LABELS[r.type] ?? r.type}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100 block truncate">{r.label}</span>
                    {r.sublabel && <span className="text-xs text-neutral-400 truncate block">{r.sublabel}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-3">
      {/* Mobile: hamburger + search icon */}
      <div className="flex items-center gap-2 lg:hidden">
        <button
          onClick={onHamburgerClick}
          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-700"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={openMobileSearch}
          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-700"
          aria-label="Rechercher"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop: search bar */}
      <div ref={wrapperRef} className="relative hidden lg:block w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Rechercher membres, projets…"
          className="input pl-9 pr-8 py-1.5 text-sm w-full"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        )}
        <SearchDropdown results={results} searching={searching} query={query} open={open} />
      </div>

      {/* Mobile: expanded search bar */}
      {mobileSearchOpen && (
        <div className="absolute inset-x-0 top-0 h-16 bg-white dark:bg-neutral-800 z-50 flex items-center px-4 gap-2 lg:hidden border-b border-neutral-100 dark:border-neutral-700">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={mobileInputRef}
              type="search"
              placeholder="Rechercher membres, projets…"
              className="input pl-9 pr-8 py-1.5 text-sm w-full"
              value={query}
              onChange={handleChange}
              autoComplete="off"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <SearchDropdown results={results} searching={searching} query={query} open={open} />
          </div>
          <button
            onClick={() => { setMobileSearchOpen(false); handleClear(); }}
            className="text-sm font-medium text-primary-600 whitespace-nowrap"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Spacer on mobile */}
      <div className="flex-1 lg:hidden" />

      {/* Actions droite */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Thème clair / sombre / système */}
        <ThemeToggle />

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-700">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-400 rounded-full" />
        </button>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 pr-2 sm:pr-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-primary-700 dark:text-primary-50">
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-none">
                {session?.user?.name ?? 'Utilisateur'}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {session?.user?.email ?? ''}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 card shadow-lg py-1 z-50">
              <a href="/profil" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700/60">
                Mon profil
              </a>
              <a href="/parametres" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700/60">
                Paramètres
              </a>
              <hr className="my-1 border-neutral-100 dark:border-neutral-700" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
