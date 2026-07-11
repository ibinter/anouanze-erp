'use client';

import { Bell, Search, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-between px-6 flex-shrink-0">
      {/* Recherche */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="search"
          placeholder="Rechercher..."
          className="input pl-9 py-1.5 text-sm"
        />
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-400 rounded-full" />
        </button>

        {/* Profil */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary-700">
                {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-neutral-800 leading-none">
                {session?.user?.name ?? 'Utilisateur'}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {session?.user?.email ?? ''}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 card shadow-lg py-1 z-50">
              <a href="/profil" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                Mon profil
              </a>
              <a href="/parametres" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50">
                Paramètres
              </a>
              <hr className="my-1 border-neutral-100" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
