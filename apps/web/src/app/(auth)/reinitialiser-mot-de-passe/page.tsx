import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = { title: 'Réinitialiser le mot de passe' };

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-4">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <h1 className="text-xl font-bold">
            <span className="text-primary-600">ANOUANZÊ</span>{' '}
            <span className="text-accent-400">ERP</span>
          </h1>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">Nouveau mot de passe</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
          <Suspense fallback={<div className="py-4 text-center text-sm text-neutral-400">Chargement…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          © {new Date().getFullYear()} IBIG SOFT (Intermark Business International Group) — ANOUANZÊ ERP
        </p>
      </div>
    </main>
  );
}
