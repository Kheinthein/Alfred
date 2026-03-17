import { Footer } from '@components/Footer';
import { AuthProvider } from '@shared/providers/AuthProvider';
import { QueryProvider } from '@shared/providers/QueryProvider';
import type { Metadata, Viewport } from 'next';
import './globals.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://alfred-writing.app';
const DESCRIPTION =
  "Alfred est un assistant d'écriture propulsé par l'IA. Analysez votre style, corrigez votre syntaxe et obtenez des suggestions narratives personnalisées pour vos romans, nouvelles, essais et plus encore.";

export const metadata: Metadata = {
  title: {
    default: "Alfred - Assistant d'Écriture IA",
    template: '%s | Alfred',
  },
  description: DESCRIPTION,
  keywords: [
    'assistant écriture intelligence artificielle',
    'éditeur de texte avec IA',
    'correction syntaxique automatique',
    "analyse de style d'écriture",
    'outil écrivain professionnel',
    'roman',
    'nouvelle',
    'écriture créative',
  ],
  authors: [{ name: 'Alfred' }],
  openGraph: {
    title: "Alfred - Assistant d'Écriture IA",
    description: DESCRIPTION,
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Alfred',
    url: APP_URL,
  },
  twitter: {
    card: 'summary',
    title: "Alfred - Assistant d'Écriture IA",
    description: DESCRIPTION,
  },
  metadataBase: new URL(APP_URL),
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
