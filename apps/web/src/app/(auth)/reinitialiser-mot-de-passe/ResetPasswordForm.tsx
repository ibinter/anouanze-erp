'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Lien invalide ou manquant. Veuillez refaire une demande de réinitialisation.');
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (motDePasse.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return; }
    if (motDePasse !== confirmation) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? 'http://localhost:4000'}/api/v1/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, motDePasse }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Erreur');
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-4 space-y-3">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <p className="text-sm text-neutral-600">Lien de réinitialisation invalide.</p>
        <a href="/mot-de-passe-oublie" className="btn-primary inline-flex">
          Refaire une demande
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4 space-y-3">
        <CheckCircle className="w-12 h-12 text-primary-600 mx-auto" />
        <p className="font-semibold text-neutral-800">Mot de passe modifié !</p>
        <p className="text-sm text-neutral-500">Redirection vers la connexion…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div>
        <label className="label">Nouveau mot de passe</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            className="input pr-10"
            placeholder="Minimum 8 caractères"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Confirmer le mot de passe</label>
        <input
          type={showPwd ? 'text' : 'password'}
          className="input"
          placeholder="Répétez le mot de passe"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          required
        />
        {confirmation && motDePasse !== confirmation && (
          <p className="mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
        )}
      </div>

      <button type="submit" disabled={loading || !token} className="btn-primary w-full">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
        ) : (
          'Définir le nouveau mot de passe'
        )}
      </button>
    </form>
  );
}
