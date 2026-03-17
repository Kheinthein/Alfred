/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify est activé par défaut dans Next.js 16
  output: 'standalone', // Enable standalone output for Docker
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // S'assurer que les variables d'environnement sont chargées
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

module.exports = nextConfig;
