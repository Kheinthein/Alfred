'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@shared/providers/AuthProvider';
import { LoginPayload, RegisterPayload } from '@shared/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  });

  const { login, register: signup } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: AuthFormValues): Promise<void> => {
    setError(null);
    try {
      const payload: LoginPayload = {
        email: values.email,
        password: values.password,
      };
      if (mode === 'login') {
        await login(payload);
      } else {
        const registerPayload: RegisterPayload = payload;
        await signup(registerPayload);
      }
      // La redirection est gérée automatiquement par AuthLayout
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit(onSubmit)(event);
      }}
      className="font-interface space-y-4"
    >
      <div>
        <label
          className="block text-sm font-medium text-neutral-text"
          htmlFor={`${mode}-email`}
        >
          Email
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          {...register('email')}
          className="mt-1 w-full rounded-md border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text focus:border-ai-primary focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-1 sm:text-base"
          placeholder="votre@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-action-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label
          className="block text-sm font-medium text-neutral-text"
          htmlFor={`${mode}-password`}
        >
          Mot de passe
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          {...register('password')}
          className="mt-1 w-full rounded-md border border-neutral-border bg-white px-3 py-2 text-sm text-neutral-text focus:border-ai-primary focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-1 sm:text-base"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-action-error">
            {errors.password.message}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-action-error/10 border border-action-error/30 px-3 py-2 text-sm text-action-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 sm:text-base"
      >
        {isSubmitting
          ? 'Chargement...'
          : mode === 'login'
            ? 'Se connecter'
            : 'Créer un compte'}
      </button>
    </form>
  );
}
