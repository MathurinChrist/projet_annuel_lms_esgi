# EduPulse LMS

Plateforme LMS (Learning Management System) — monolithe **Nuxt 4** + **Prisma** / **PostgreSQL**.

Rôles : `APPRENANT`, `FORMATEUR`, `ADMINISTRATEUR`.

---

## Démarrage rapide

```bash
make setup-env          # copie .env.example → .env (si absent)
make docker-up          # App + PostgreSQL + pgAdmin (+ LiveKit)
make install            # npm install + prisma generate (+ sync Docker si besoin)
make init-db            # migrations + seed
```

App : [http://localhost:3000](http://localhost:3000)  
pgAdmin : [http://localhost:5050](http://localhost:5050)

Comptes seed (exemples) :

| Rôle | Email | Mot de passe |
|---|---|---|
| Apprenant | `marie.apprenant@edupulse.com` | `apprenant123` |
| Formateur | `jean.formateur@edupulse.com` | `formateur123` |
| Admin | `admin@edupulse.com` | `admin123` |

> Ne lance pas `make dev` en parallèle si Docker expose déjà le port `3000`.

---

## Git Workflow

### Branches

| Branche | Rôle |
|---|---|
| `main` | Production — mise à jour via release depuis `developp` |
| `developp` | Intégration — toutes les features y arrivent |
| `feature/<nom>` | Nouvelle fonctionnalité (depuis `developp`) |
| `fix/<nom>` | Correction de bug (depuis `developp`) |

```
feature → PR → developp → auto PR/merge → main → Deploy VPS (auto)
```

### Flux quotidien

1. Partir de `developp` à jour :
   ```bash
   git checkout developp
   git pull --rebase origin developp
   git checkout -b feature/ma-fonctionnalite
   ```
2. Commiter selon la convention ci-dessous.
3. Ouvrir une **Pull Request vers `developp`**.
4. Après merge dans `developp`, la CI tourne et une **release automatique** prépare / merge `developp` → `main`.

> Ne pas pusher directement sur `main`. Preferer les PR vers `developp`.

---

## CI / CD (GitHub Actions)

### Workflow `ci.yml` — tests & qualité

Déclenché sur :

| Événement | Branches |
|---|---|
| `push` | **toutes** (`main`, `developp`, `feature/*`, …) |
| `pull_request` | vers `main` et `developp` |

Jobs :

1. **Quality** — `prisma validate`, parité i18n FR/EN, tests unitaires, build Nuxt  
2. **Integration + functional** — PostgreSQL éphémère, migrations, seed, tests API

En local :

```bash
make check    # prisma + i18n + unit
make ci       # check + integration + build (DB requise)
make test     # unit + integration + functional
```

### Workflow `auto-pr-main.yml` — release `developp` → `main`

À chaque **push** / **merge** sur `developp` :

1. Crée (ou réutilise) une PR `developp` → `main`
2. Tente de **merger automatiquement** pour aligner `main` sur `developp`

#### Prérequis Actions (une fois)

**Settings → Actions → General → Workflow permissions**

- [x] Read and write permissions  
- [x] Allow GitHub Actions to create and approve pull requests  
- Save  

Optionnel : secret repo `AUTO_PR_TOKEN` (PAT avec droits `contents` + `pull_requests`).

#### Si la PR est bloquée (« Review required »)

La protection de branche sur `main` peut exiger **au moins 1 approve**. Dans ce cas :

1. Ouvrir la PR *Release: merge developp into main*
2. **Approve** (compte avec write access)
3. **Merge pull request**

Ou, avec les droits admin : *Merge without waiting for requirements to be met (bypass rules)*.

Pour un merge 100 % automatique ensuite : assouplir la règle sur `main` (retirer « Require approvals ») ou utiliser un `AUTO_PR_TOKEN` admin.

### Workflow `deploy.yml` — mise en prod VPS

Chaîne automatique :

1. Push / merge sur `developp` → workflow **Auto release** ouvre/merge la PR vers `main`
2. Après merge réussi → dispatch du workflow **Deploy production**
3. Aussi : tout **push sur `main`** (merge manuel inclus) déclenche le deploy

Le deploy :

1. Rsync du code vers le VPS (`ubuntu@54.37.159.216`)
2. `docker compose -f docker-compose.prod.yml build && up -d`
3. Migrations Prisma au démarrage du conteneur

**Secrets GitHub** (Settings → Secrets → Actions) :

| Secret | Exemple |
|---|---|
| `VPS_HOST` | `54.37.159.216` |
| `VPS_USER` | `ubuntu` |
| `VPS_SSH_KEY` | clé privée SSH autorisée sur le VPS |
| `VPS_PATH` | `/opt/edupulse` (optionnel) |
| `AUTO_PR_TOKEN` | PAT recommandé (merge Actions → push `main` déclenche aussi le deploy) |

**Premier déploiement (une fois) :**

```bash
make vps-bootstrap
# → http://54.37.159.216:3000
```

Détails : `docker/prod/README.md`

---

## Convention de commits

Messages **en anglais**, format :

```
<type>(<scope>): <short description>
```

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Restructuration sans changement fonctionnel |
| `style` | Formatage uniquement |
| `docs` | Documentation |
| `chore` | Dépendances, config, build |
| `ci` | GitHub Actions / pipelines |
| `test` | Ajout ou correction de tests |

Exemples :

```bash
feat(certificates): issue and download completion PDF
fix(auth): avoid SSR auth deadlock
ci: auto-merge developp into main
test(unit): cover quiz pass threshold
```

---

## Configuration

```bash
cp .env.example .env
```

Variables importantes : `DATABASE_URL`, `JWT_SECRET` (**≥ 32 caractères**), Google OAuth, SMTP, LiveKit, `OPENAI_API_KEY` (quiz IA formateur).

Ne jamais committer de vraies clés dans `.env.example`.

---

## Base de données (Prisma)

```bash
make init-db          # migrate deploy + seed
make db-generate      # régénère le client
make db-studio        # UI Prisma
make db-reset         # wipe + migrate + seed
```

---

## i18n (FR / EN)

- Locales : `i18n/locales/fr.json` et `en.json`
- Switcher FR/EN dans la top bar
- FR : `/…` · EN : `/en/…`
- Vérifier la parité des clés : `npm run check:i18n`

---

## Commandes Makefile

```bash
make help
```

Raccourcis utiles :

| Commande | Description |
|---|---|
| `make install` | Dépendances + Prisma client |
| `make docker-up` / `docker-down` | Stack Docker |
| `make docker-db-up` | DB (+ pgAdmin) seule |
| `make init-db` | Migrations + seed |
| `make dev` | Nuxt en local |
| `make check` / `make ci` / `make test` | Qualité & tests |
| `make commit` | Rappel des conventions de commits |

---

## Structure utile

```
app/                 # Pages & composants Nuxt
server/api/          # Endpoints Nitro
server/utils/        # Auth, Prisma, quiz IA, certificats, …
prisma/              # Schema, migrations, seed
i18n/locales/        # Traductions FR/EN
tests/               # unit / integration / functional (Vitest)
.github/workflows/   # CI + auto-release vers main
```
