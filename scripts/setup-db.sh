#!/bin/bash
# Script pour lancer les migrations Prisma et le seeding

echo "Lancement des migrations Prisma..."
npx prisma migrate dev --name init

echo "Seeding de la base de données..."
npm run prisma:seed

echo "ENFIN Fini !"
