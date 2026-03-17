'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-border/50 bg-neutral-bgSecondary/80 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-interface text-sm text-neutral-textSecondary">
              © {currentYear} Alfred. Tous droits réservés.
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/cgu"
              className="font-interface text-sm text-neutral-textSecondary transition-colors hover:text-action-link hover:underline"
            >
              CGU
            </Link>
            <Link
              href="/cgv"
              className="font-interface text-sm text-neutral-textSecondary transition-colors hover:text-action-link hover:underline"
            >
              CGV
            </Link>
            <Link
              href="/mentions-legales"
              className="font-interface text-sm text-neutral-textSecondary transition-colors hover:text-action-link hover:underline"
            >
              Mentions légales
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
