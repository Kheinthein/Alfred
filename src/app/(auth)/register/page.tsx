import { AuthForm } from '@components/AuthForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-neutral-bgSecondary to-white border-2 border-ai-primary/20 p-8 shadow-xl sm:p-10">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-ai-primary"></div>
        <h1 className="font-interface text-2xl font-bold bg-gradient-to-r from-ai-primary to-ai-primaryAlt bg-clip-text text-transparent sm:text-3xl">
          Créer un compte
        </h1>
      </div>
      <p className="mb-6 font-interface text-sm text-neutral-textSecondary">
        Un espace sécurisé pour écrire et analyser vos textes.
      </p>

      <div className="mt-6">
        <AuthForm mode="register" />
      </div>

      <p className="mt-6 text-center font-interface text-xs text-neutral-textSecondary sm:text-sm">
        Déjà inscrit ?{' '}
        <Link
          href="/login"
          className="font-semibold text-action-link transition-colors hover:underline focus:outline-none focus:ring-2 focus:ring-action-link focus:ring-offset-2 rounded"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
