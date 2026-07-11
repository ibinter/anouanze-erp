import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Connexion',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo & titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800">
            <span className="text-primary-600">ANOUANZÊ</span>{' '}
            <span className="text-accent-400">ERP</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            L&apos;ERP des associations et ONG
          </p>
        </div>

        {/* Formulaire */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-6">
            Connexion à votre espace
          </h2>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          © {new Date().getFullYear()} IBIG SARL — ANOUANZÊ ERP
        </p>
      </div>
    </main>
  );
}
