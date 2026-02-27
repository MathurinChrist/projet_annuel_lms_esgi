# LMS Backend - Nuxt.js API

Ce dossier contient l'API Nuxt.js pour la plateforme LMS.

## Configuration

1. Copiez le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```
2. Modifiez `DATABASE_URL` dans le fichier `.env` si nécessaire.

## Base de données (Prisma)

Le projet utilise Prisma comme ORM.

### Initialisation de la DB

Si vous lancez le projet pour la première fois ou si vous avez modifié `prisma/schema.prisma` :

```bash
# Appliquer les changements à la base de données
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### Visualiser les données

Pour ouvrir l'interface graphique de Prisma et gérer vos données facilement :

```bash
npx prisma studio
```

## Développement

Lancez le serveur de développement :

```bash
npm run dev
```

L'API sera accessible sur `http://localhost:3000` (ou `http://localhost:3001` si configuré via Docker).
