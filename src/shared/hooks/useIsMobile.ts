import { useEffect, useState } from 'react';

/**
 * Hook pour détecter si on est sur mobile ou tablette
 * Breakpoint par défaut : 1024px (Tailwind 'lg')
 * Inclut mobile + tablette pour éviter les problèmes de drag & drop tactile
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fonction de vérification
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Vérification initiale
    checkMobile();

    // Écouter les changements de taille
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
