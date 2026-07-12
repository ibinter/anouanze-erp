'use client';

import { useState } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("L'email est requis"); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:4000'}/api/v1/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <CheckCircle className="w-14 h-14 text-primary-600" />
        </div>
        <h3 className="font-semibold text-neutral-800">Email envoyé !</h3>
        <p className="text-sm text-neutral-500">
          Si un compte existe pour <strong>{email}</strong>, vous recevrez un email avec les instructions
          de réinitialisation dans quelques minutes.
        </p>
        <p className="text-xs text-neutral-400">
          Pensez à vérifier vos spams si vous ne recevez rien.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}
      <div>
        <label htmlFor="email" className="label">Adresse email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          placeholder="vous@organisation.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</>
        ) : (
          'Envoyer le lien de réinitialisation'
        )}
      </button>
    </form>
  );
}
