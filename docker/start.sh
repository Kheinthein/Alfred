#!/bin/sh
set -e

# Créer le répertoire data si le volume est vide
mkdir -p /app/data

# Appliquer les migrations Prisma (crée la DB si elle n'existe pas)
npx prisma migrate deploy

# Démarrer l'application
exec node server.js
