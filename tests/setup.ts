import '@testing-library/jest-dom';
import 'reflect-metadata';

// Fermer le singleton Prisma partagé après chaque fichier de test
// pour éviter que Jest reste bloqué sur des connexions ouvertes.
afterAll(async () => {
  const g = global as typeof globalThis & {
    prisma?: { $disconnect?: () => Promise<void> };
  };
  if (g.prisma?.$disconnect) {
    await g.prisma.$disconnect();
  }
});
