'use client';

import { useAuth } from '@shared/providers/AuthProvider';
import { BookOpen, FileText, Menu, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactElement | null {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Attendre que le chargement de l'authentification soit terminé avant de rediriger
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Afficher un loader pendant le chargement de l'authentification
  if (isLoading) {
    return (
      <div className="font-interface flex min-h-screen items-center justify-center">
        <p className="font-writing text-neutral-textSecondary">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = (): void => {
    logout();
    router.replace('/login');
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path: string): void => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="font-interface min-h-screen flex flex-col">
      <header className="border-b border-neutral-border/50 bg-neutral-bgSecondary/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo + User info */}
            <div className="flex flex-1 items-center gap-3">
              <Image
                src="/logo.png"
                alt="Alfred"
                width={72}
                height={72}
                className="rounded-full object-contain"
              />
              <div>
                <p className="text-xs text-neutral-textSecondary sm:text-sm">
                  Bienvenue
                </p>
                <p className="text-sm font-semibold text-neutral-text sm:text-base">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Desktop: Navigation buttons */}
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/documents"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:text-parchment-text"
              >
                <FileText size={15} />
                Documents
              </Link>
              <Link
                href="/books"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:text-parchment-text"
              >
                <BookOpen size={15} />
                Livres
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:text-parchment-text"
              >
                <User size={15} />
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-md border border-neutral-border px-4 py-2 text-sm font-semibold text-neutral-text transition-colors hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-neutral-border focus:ring-offset-2"
              >
                Déconnexion
              </button>
            </div>

            {/* Mobile: Hamburger menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-4 rounded-md p-2 text-neutral-text transition-colors hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-ai-primary md:hidden"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile: Dropdown menu */}
          {mobileMenuOpen && (
            <div className="mt-4 border-t border-neutral-border pt-4 md:hidden">
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavigate('/documents')}
                  className="flex items-center gap-2 rounded-md bg-ai-primary px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-ai-primary/90"
                >
                  <FileText size={15} />
                  Mes documents
                </button>
                <button
                  onClick={() => handleNavigate('/books')}
                  className="flex items-center gap-2 rounded-md border border-neutral-border px-4 py-3 text-left text-sm font-medium text-neutral-text transition-colors hover:bg-neutral-bg"
                >
                  <BookOpen size={15} />
                  Mes livres
                </button>
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="flex items-center gap-2 rounded-md border border-neutral-border px-4 py-3 text-left text-sm font-medium text-neutral-text transition-colors hover:bg-neutral-bg"
                >
                  <User size={15} />
                  Mon profil
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-neutral-border px-4 py-3 text-left text-sm font-semibold text-neutral-text transition-colors hover:bg-neutral-bg"
                >
                  Déconnexion
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
