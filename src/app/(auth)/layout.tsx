'use client';

import { useAuth } from '@shared/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/documents');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="font-interface flex-1 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
