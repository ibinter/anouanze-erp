import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: { template: '%s | Console IBIG Soft', default: 'Console IBIG Soft' } };

const NAV = [
  { href: '/superadmin', label: '🏠 Dashboard' },
  { href: '/superadmin/organisations', label: '🏛️ Organisations' },
  { href: '/superadmin/licences', label: '🔑 Licences' },
  { href: '/superadmin/prospects', label: '🎯 Prospects / CRM' },
  { href: '/superadmin/utilisateurs', label: '👤 Utilisateurs globaux' },
  { href: '/superadmin/sara', label: '🤖 SARA — IA Visiteurs' },
  { href: '/superadmin/logs', label: '📋 Logs système' },
];

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-60 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-neutral-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-xs font-bold">IS</div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-white">IBIG Soft</p>
            <p className="text-xs text-neutral-400">Console Superadmin</p>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-neutral-800">
          <Link href="/dashboard" className="block text-center text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-2">
            ← Retour ERP
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-8">
          <div className="text-sm text-neutral-400">
            Console d'administration IBIG SOFT (Intermark Business International Group) — <span className="text-primary-400 font-semibold">Superadmin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-xs text-neutral-400">Système opérationnel</span>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
