# LMS Backend - Nuxt.js API

Ce dossier contient l'API Nuxt.js pour la plateforme LMS (Learning Management System).

---

## CI / CD (GitHub Actions)

À chaque **push**, **rebase** (push de commits réécrits) ou **merge / pull request** :

| Déclencheur | Branches |
|---|---|
| `push` | **toutes** (`main`, `developp`, `feature/*`, …) |
| `pull_request` | vers `main` et `developp` |

Le workflow `.github/workflows/ci.yml` enchaîne :

1. **Quality** — `prisma validate`, parité i18n FR/EN, tests unitaires, `nuxt build`
2. **Integration** — PostgreSQL éphémère, migrations, seed, tests d’intégration
3. **Functional** — build + serveur, tests API fonctionnels

En local :

```bash
make check   # prisma + i18n + unit
make ci      # check + integration + build (DB requise)
```

---

## Git Workflow

### Stratégie de branches

| Branche | Rôle |
|---|---|
| `main` | **Production** — code stable et déployé uniquement. Ne jamais commiter directement. |
| `developp` | **Intégration** — toutes les fonctionnalités sont mergées ici avant de partir en production. Ne jamais commiter directement. |
| `feature/<nom>` | Branches de développement de fonctionnalités, créées depuis `developp`. |
| `fix/<nom>` | Branches de correction de bugs, créées depuis `developp` (ou `main` pour les hotfixes). |

### Flux de travail

```
main
 └── developp
       ├── feature/user-auth
       ├── feature/course-list
       └── feature/sidebar-active-state
```

1. **Créer une branche** depuis `developp` pour chaque nouvelle fonctionnalité ou correction :
   ```bash
   git checkout developp
   git rebase origin/developp    ---> faire de rebase pour avoir une historique propre
   git checkout -b ma-fonctionnalite
   ```

2. **Travailler et commiter** sur ta branche (voir la convention de commits ci-dessous).

3. **Ouvrir une Pull Request** vers `developp` une fois le travail terminé.

4. **Une release** merge `developp` → `main` lorsque l'équipe décide de mettre en production.

>  **Ne jamais pusher directement sur `developp` ou `main`.** Toujours passer par une Pull Request.

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

---

## Commandes Makefile

Un fichier `Makefile` est disponible à la racine du projet pour faciliter l'installation et le lancement de toutes les parties du projet.

Pour voir la liste complète des commandes, lancez :
```bash
make help
```

### Raccourcis principaux :

- **Première installation :**
  ```bash
  make install
  make docker-db-up # Lance PostgreSQL via Docker
  make init-db      # Applique les migrations & seed la base
  make dev          # Lance le serveur local Nuxt
  ```
- **Cycle Docker Complet :**
  ```bash
  make docker-up    # Lance tout le projet (Nuxt + DB + pgAdmin) sous Docker
  make docker-down  # Arrête les conteneeurs
  ```
- **Outils de développement :**
  ```bash
  make db-studio    # Lance l'interface Prisma Studio
  make db-reset     # Réinitialise complètement la base de données
  make commit       # Rappel des conventions de commits
  ```
