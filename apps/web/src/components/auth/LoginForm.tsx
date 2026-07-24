'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  /** Étape « code » affichée uniquement pour les comptes ayant activé la 2FA. */
  const [etape, setEtape] = useState<'identifiants' | 'code'>('identifiants');
  const [identifiants, setIdentifiants] = useState<LoginFormData | null>(null);
  const [code, setCode] = useState('');
  const [verificationEnCours, setVerificationEnCours] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  /** Connexion effective : NextAuth relaie les identifiants (et le code) à l'API. */
  async function connecter(data: LoginFormData, codeDeuxFacteurs?: string) {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.motDePasse,
      ...(codeDeuxFacteurs ? { code: codeDeuxFacteurs } : {}),
      redirect: false,
    });

    if (result?.error) {
      toast.error(
        codeDeuxFacteurs
          ? 'Code de vérification incorrect ou expiré'
          : 'Email ou mot de passe incorrect',
      );
      return false;
    }

    toast.success('Connexion réussie !');
    router.push('/dashboard');
    return true;
  }

  async function onSubmit(data: LoginFormData) {
    // Pré-connexion : indique si un code 2FA sera demandé, sans délivrer de jeton.
    // En cas d'indisponibilité, on retombe sur le flux de connexion habituel.
    let deuxFacteursRequis = false;
    try {
      const { data: reponse } = await api.post('/auth/pre-login', {
        email: data.email,
        motDePasse: data.motDePasse,
      });
      deuxFacteursRequis = reponse?.deuxFacteursRequis === true;
    } catch {
      deuxFacteursRequis = false;
    }

    if (deuxFacteursRequis) {
      setIdentifiants(data);
      setCode('');
      setEtape('code');
      return;
    }

    await connecter(data);
  }

  async function validerCode() {
    if (!identifiants) return;
    if (code.trim().length < 6) {
      toast.error('Saisissez le code à 6 chiffres ou un code de secours');
      return;
    }
    setVerificationEnCours(true);
    try {
      await connecter(identifiants, code.trim());
    } finally {
      setVerificationEnCours(false);
    }
  }

  // ─── Étape 2 : code de double authentification ───
  if (etape === 'code') {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
          <p className="text-xs leading-relaxed text-primary-800">
            Ce compte est protégé par la double authentification. Saisissez le code à 6 chiffres
            affiché par votre application d&apos;authentification, ou l&apos;un de vos codes de secours.
          </p>
        </div>

        <div>
          <label htmlFor="code2fa" className="label">Code de vérification</label>
          <input
            id="code2fa"
            autoComplete="one-time-code"
            inputMode="numeric"
            className="input text-center font-mono text-lg tracking-[0.4em]"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^0-9A-F-]/g, ''))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void validerCode();
            }}
          />
        </div>

        <button
          type="button"
          onClick={validerCode}
          disabled={verificationEnCours}
          className="btn-primary w-full"
        >
          {verificationEnCours ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Vérification…
            </>
          ) : (
            'Vérifier et se connecter'
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setEtape('identifiants');
            setIdentifiants(null);
            setCode('');
          }}
          className="flex w-full items-center justify-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Revenir à la saisie du mot de passe
        </button>
      </div>
    );
  }

  // ─── Étape 1 : identifiants (inchangée pour les comptes sans 2FA) ───
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <label htmlFor="email" className="label">Adresse email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          placeholder="vous@organisation.org"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <label htmlFor="motDePasse" className="label">Mot de passe</label>
        <div className="relative">
          <input
            id="motDePasse"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="input pr-10"
            placeholder="••••••••"
            {...register('motDePasse')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.motDePasse && (
          <p className="mt-1 text-xs text-red-600">{errors.motDePasse.message}</p>
        )}
      </div>

      {/* Mot de passe oublié */}
      <div className="flex justify-end">
        <a href="/mot-de-passe-oublie" className="text-xs text-primary-600 hover:text-primary-700">
          Mot de passe oublié ?
        </a>
      </div>

      {/* Bouton */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connexion en cours...
          </>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
