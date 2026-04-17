#!/bin/sh
set -e

# Créer le répertoire data si nécessaire (volume Railway)
mkdir -p /app/data

# Synchroniser le schéma Prisma (crée la DB si absente, applique les changements)
npx prisma db push --skip-generate

# Seeder les données de base (styles d'écriture etc.) — silencieux si déjà présent
npx tsx prisma/seed.ts || true

# Démarrer l'application Next.js standalone
exec node server.js
