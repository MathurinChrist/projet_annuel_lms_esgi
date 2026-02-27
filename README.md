# LMS Backend - Nuxt.js API

Ce dossier contient l'API Nuxt.js pour la plateforme LMS (Learning Management System).

---

## Git Workflow

### Stratégie de branches

| Branche | Rôle |
|---|---|
| `main` | **Production** — code stable et déployé uniquement. Ne jamais commiter directement. |
| `develop` | **Intégration** — toutes les fonctionnalités sont mergées ici avant de partir en production. Ne jamais commiter directement. |
| `feature/<nom>` | Branches de développement de fonctionnalités, créées depuis `develop`. |
| `fix/<nom>` | Branches de correction de bugs, créées depuis `develop` (ou `main` pour les hotfixes). |

### Flux de travail

```
main
 └── develop
       ├── user-auth
       ├── course-list
       └── sidebar-active-state
```

1. **Créer une branche** depuis `develop` pour chaque nouvelle fonctionnalité ou correction :
   ```bash
   git checkout develop
   git rebase origin develop    ---> faire de rebase pour avoir une historique propre
   git checkout -b ma-fonctionnalite
   ```

2. **Travailler et commiter** sur ta branche (voir la convention de commits ci-dessous).

3. **Ouvrir une rebase Request** vers `develop` une fois le travail terminé.

4. **Une release** merge `develop` → `main` lorsque l'équipe décide de mettre en production.

>  **Ne jamais pusher directement sur `develop` ou `main`.** Toujours passer par une Pull Request ou une rebase.

---

## Convention de commits

Tous les messages de commit doivent être rédigés **en anglais** et respecter le format suivant :

```
<type>(<scope>): <description courte>
```

### Types disponibles

| Type | Quand l'utiliser |
|---|---|
| `feat` | Ajout d'une nouvelle fonctionnalité |
| `fix` | Correction d'un bug |
| `refactor` | Restructuration du code sans changement fonctionnel |
| `style` | Formatage, indentation, etc. (aucun changement logique) |
| `docs` | Modifications de la documentation uniquement |
| `chore` | Mises à jour des dépendances, configuration, build |

### Exemples

```bash
feat(user-auth): add JWT login endpoint
fix(sidebar): restore active state after locale change
refactor(course-list): extract CourseCard into separate component
docs(readme): add git workflow section
chore(deps): upgrade @nuxtjs/i18n to v9
```

> 💡 Le `scope` doit correspondre au nom de la branche ou à la zone du code modifiée.

---

## Configuration

1. Copier le fichier `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```
2. Modifier `DATABASE_URL` dans le fichier `.env` si nécessaire.

---

## Base de données (Prisma)

Le projet utilise Prisma comme ORM.

### Initialisation de la base de données

À lancer lors de la première installation ou après modification de `prisma/schema.prisma` :

```bash
# Appliquer les changements à la base de données
npx prisma db push

# Générer le client Prisma
npx prisma generate
```

### Visualiser les données

Ouvrir l'interface graphique Prisma Studio pour inspecter et modifier les données :

```bash
npx prisma studio
```

---

## Développement

Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000` (ou `http://localhost:3001` si configuré via Docker).
