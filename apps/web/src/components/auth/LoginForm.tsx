'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    const result = await signIn('credentials', {
      email: data.email,
      password: data.motDePasse,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Email ou mot de passe incorrect');
      return;
    }

    toast.success('Connexion réussie !');
    router.push('/dashboard');
  }

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
