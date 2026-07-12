import type { Metadata } from 'next';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const metadata: Metadata = { title: 'Mot de passe oublié' };

export default function ForgotPasswordPage() {
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
          <h2 className="text-lg font-semibold text-neutral-800 mb-2">Mot de passe oublié ?</h2>
          <p className="text-sm text-neutral-500 mb-6">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          <ForgotPasswordForm />
        </div>

        <p className="text-center mt-4">
          <a href="/login" className="text-sm text-primary-600 hover:underline">
            ← Retour à la connexion
          </a>
        </p>

        <p className="text-center text-xs text-neutral-400 mt-4">
          © {new Date().getFullYear()} IBIG SOFT (Intermark Business International Group) — ANOUANZÊ ERP
        </p>
      </div>
    </main>
  );
}
