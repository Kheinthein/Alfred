// Forcer les variables de test : next/jest charge .env avant setupFiles,
// on doit écraser explicitement pour garantir l'isolation test.
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-key';
process.env.AI_PROVIDER = process.env.AI_PROVIDER ?? 'openai';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? 'test-openai-key';
process.env.OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4-turbo';

// Réinitialiser le singleton global Prisma entre les fichiers de test
// pour éviter qu'une connexion périmée soit réutilisée par les route handlers.
const g = global as typeof globalThis & { prisma?: unknown };
delete g.prisma;
