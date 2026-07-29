# Présentation du projet EduPulse LMS

| | |
|---|---|
| **Projet** | EduPulse — Learning Management System |
| **Contexte** | Projet annuel ESGI 2025–2026 |
| **Production** | [https://edupulselms.eu](https://edupulselms.eu) |
| **Stack** | Nuxt 4 · Vue 3 · Prisma · PostgreSQL · Docker · LiveKit · OpenAI / Gemini |
| **Document** | v1.0 — 29 juillet 2026 |
| **Source équipe** | Historique Git du dépôt (auteurs dédupliqués par email) |

---

## 1. Présentation du projet

### 1.1 Qu’est-ce qu’EduPulse ?

**EduPulse** est une plateforme LMS (Learning Management System) web qui permet de :

- **créer et publier** des parcours de formation structurés ;
- **suivre** la progression des apprenants avec un système de validation (quiz, examen final) ;
- **animer** des classes virtuelles en direct ;
- **communiquer** via une messagerie temps réel ;
- **certifier** les acquis ;
- **accélérer** la pédagogie grâce à l’intelligence artificielle (génération de quiz, tuteur apprenant).

La plateforme s’adresse à trois profils : **apprenant**, **formateur** et **administrateur**.

### 1.2 Problème adressé

Les formateurs et organismes de formation jonglent souvent entre plusieurs outils (hébergement vidéo, quiz, visioconférence, suivi). EduPulse regroupe ces besoins dans **une seule application** moderne, bilingue (FR/EN), déployable en production.

### 1.3 Objectifs atteints (MVP)

| Objectif | Résultat |
|---|---|
| Parcours formateur complet | Création de cours (vidéo, texte, PDF, quiz), publication, feedback |
| Parcours apprenant guidé | Inscription, player, gating 70 %, examen final, certificat PDF |
| Classes live | Conférences LiveKit (salle, parole, rappels email) |
| Communication | Messagerie 1–1 avec WebSocket |
| IA pédagogique | Quiz YouTube (transcription + Gemini), tuteur IA apprenant |
| Exploitation | Docker, CI/CD GitHub Actions, prod HTTPS sur VPS |

### 1.4 Architecture en bref

```
┌─────────────┐     HTTPS      ┌──────────┐     ┌────────────┐
│  Navigateur │ ──────────────► │  Caddy   │ ──► │ Nuxt / Nitro│
└─────────────┘                 └──────────┘     └─────┬──────┘
                                                       │
                        ┌──────────────────────────────┼──────────────────┐
                        ▼                              ▼                  ▼
                  PostgreSQL                      LiveKit Cloud     OpenAI / Gemini
                  (Prisma)                        (visio)           (IA)
```

- **Monolithe Nuxt 4** : UI + API Nitro dans le même dépôt.
- **Données** : PostgreSQL via Prisma.
- **Temps réel** : WebSocket (messages) + LiveKit Cloud (visio).
- **Déploiement** : `feature/*` → `developp` → `main` → VPS (`/opt/edupulse`).

### 1.5 Fonctionnalités phares

1. **Curriculum riche** — modules / leçons multi-formats.
2. **Gating pédagogique** — déblocage conditionné aux scores.
3. **Agent IA formateur** — quiz généré depuis YouTube (sous-titres ou analyse vidéo Gemini).
4. **Tuteur IA apprenant** — explication, chat, quiz d’entraînement.
5. **Live + messagerie** — engagement synchrone et asynchrone.
6. **Certificats** — émission, aperçu, téléchargement PDF.
7. **Admin** — utilisateurs, catégories, publication, stats.
8. **i18n FR/EN** — interface bilingue contrôlée en CI.

### 1.6 Documents associés

- Cahier des charges (livré + roadmap) : [`docs/CAHIER_DES_CHARGES.md`](./CAHIER_DES_CHARGES.md)
- MCD, outils, Docker & GitHub Actions : [`docs/ARCHITECTURE_MCD_DOCKER_GITHUB.md`](./ARCHITECTURE_MCD_DOCKER_GITHUB.md)
- README technique : [`README.md`](../README.md)

---

## 2. Équipe projet (d’après Git)

Les contributeurs sont **regroupés par adresse email Git** (plusieurs pseudos possibles pour une même personne).  
Les compteurs excluent les commits de merge. Les tâches listées s’appuient sur les **messages de commit** et les **zones de fichiers** touchées.

### 2.1 Vue d’ensemble

| Développeur | Email Git | Pseudos observés | Commits* | Période* |
|---|---|---|---|---|
| **Mathurin** (Kimbembe) | `Kimbembebobann2001@gmail.com` | `mathurin` | **43** | févr. → juil. 2026 |
| **Hugo Espenan** | `espenanhugo@gmail.com` | `Hugo`, `hugoespenan`, `Angelo` | **13** | févr. → juil. 2026 |
| **Ibrahim Konaté** | `ibrahkonate95@gmail.com` | `ibrah`, `IbrahimKo95` | **7** | juil. 2026 |

\* Historique Git au 29/07/2026 — `git log --all --no-merges`.

```
Répartition des commits (hors merges)
████████████████████████████████████████████  Mathurin   43 (≈ 68 %)
█████████████                                 Hugo       13 (≈ 21 %)
███████                                       Ibrahim     7 (≈ 11 %)
```

### 2.2 Mathurin — socle plateforme, auth, learning, IA, CI/CD, prod

**Rôle observé :** lead technique / intégration continue / fonctionnalités cœur LMS & IA.

**Tâches principales (commits significatifs) :**

| Domaine | Contributions |
|---|---|
| **Auth & sécurité** | JWT, RBAC (`ensureRole` / `ensureAdmin` / `ensureTrainer`), rate limiting, Google OAuth, session, profil / mot de passe / options de sécurité |
| **Base de données** | Migrations Prisma initiales, seed, schémas certificats / quiz final / login alerts |
| **Apprentissage** | Quiz IA, gating de progression, examen final, avis dynamiques, programme du cours |
| **Certificats** | Émission, aperçu, téléchargement PDF |
| **IA** | Quiz YouTube (prod), fallback Gemini vidéo, tuteur IA apprenant |
| **i18n** | Couverture FR/EN étendue |
| **Qualité** | Suites Vitest (unit / intégration / fonctionnel) |
| **DevOps / CI-CD** | Workflows GitHub (CI, auto-PR `developp`→`main`, deploy VPS), Docker prod, Makefile, README, variables d’environnement |
| **Admin** | Endpoints de gestion utilisateurs |

**Zones Git les plus touchées :** `app/pages`, `server/api`, `app/components`, `prisma/`, `server/utils`, `.github/workflows`, `i18n/`, `tests/`.

**Exemples de messages de commit :**
- `feat(auth): add role-based access control helpers`
- `feat(learning): AI quizzes, progression gates and final exam`
- `feat(certificates): issue, preview and download completion certificates`
- `feat: Gemini video fallback for quizzes and student AI tutor`
- `ci: deploy to VPS automatically after merge into main`

---

### 2.3 Hugo Espenan — progression apprenant, dashboard, données de démo

**Rôle observé :** features côté apprenant (progression, tableau de bord) et enrichissement seed / UI.

**Tâches principales :**

| Domaine | Contributions |
|---|---|
| **Progression de cours** | Suivi leçon par leçon (`feat(student): track lesson-by-lesson course progression`) |
| **Dashboard** | Feature dashboard (`feat: dashboard`) |
| **Données** | Enrichissement du seed (`add seed`) |
| **Intégration** | Branches `feature/courseProgression`, `feature/dashboard`, `feature/notes`, `feature/course-reviews-and-qa` (travaux / merges) |

**Zones Git les plus touchées :** `server/api`, `app/components`, `app/pages`, `app/composables`, `i18n/`, `prisma/`.

**Note :** une partie des commits portent le message `wip` (travail en cours) ; la valeur livrée se lit aussi via les branches feature et les fichiers modifiés (player, progression, UI).

---

### 2.4 Ibrahim Konaté — création de cours, live, messagerie, landing, back-office

**Rôle observé :** parcours formateur, communication temps réel, conférences, landing & admin UI.

**Tâches principales (commits) :**

| Domaine | Contributions |
|---|---|
| **Formateur** | Création de cours + liste des cours instructeur |
| **Conférences** | Système de conférences LiveKit ; correctif Firefox ; rappels email ; retrait LiveKit du docker local (passage Cloud) |
| **Messagerie** | Système de messages |
| **Front / UX** | Landing page + design responsive |
| **Admin / catalogue** | Back-office et pages détails de cours |
| **Correctifs** | Indicateur d’inscription (`Fix enrolment indicator`) |

**Zones Git les plus touchées :** `server/api`, `app/pages`, `app/components`, `prisma/migrations`, `i18n/`, `docker-compose.yml`.

**Exemples de messages de commit :**
- `feature: course creation and course list for instructor`
- `add: conferences and messages system`
- `add: remind email for conference and delete livekit from docker`
- `add: landing page and responsive design`
- `add: backoffice and course details`

---

## 3. Répartition fonctionnelle (synthèse)

| Module produit | Principal(aux) contributeur(s) Git |
|---|---|
| Authentification / comptes / RBAC | Mathurin |
| Création de cours (formateur) | Ibrahim (+ intégration Mathurin) |
| Catalogue / landing / responsive | Ibrahim |
| Progression & dashboard apprenant | Hugo |
| Quiz, gating, examen final, certificats | Mathurin |
| IA formateur & tuteur apprenant | Mathurin |
| Conférences LiveKit + rappels mail | Ibrahim |
| Messagerie temps réel | Ibrahim |
| Admin back-office | Ibrahim + Mathurin (API users) |
| i18n FR/EN | Mathurin (+ contributions locales équipe) |
| CI/CD, Docker, production | Mathurin |
| Notes / avis & Q&A (branches feature) | Hugo (WIP / intégration) + Mathurin (avis dynamiques) |

---

## 4. Méthode d’analyse Git

Commandes de référence utilisées pour ce document :

```bash
# Contributeurs (hors merges)
git shortlog -sn --all --no-merges

# Déduplication par email
git log --all --format='%aE|%aN|%s' --no-merges

# Historique d’une personne
git log --all --author='email@domaine' --no-merges --format='%h %ad %s' --date=short
```

Les pseudos `Hugo` / `hugoespenan` / `Angelo` partagent le même email → **une seule personne**.  
Idem `ibrah` / `IbrahimKo95`.

---

## 5. Conclusion

EduPulse est un **MVP LMS complet** déjà en production, construit en équipe de **trois développeurs**, avec une répartition claire :

- **Mathurin** — socle, sécurité, pédagogie avancée, IA, qualité et déploiement ;
- **Hugo** — expérience apprenant (progression, dashboard) ;
- **Ibrahim** — création de cours, live, messagerie, landing et back-office.

Le détail des exigences et la roadmap figurent dans le [cahier des charges](./CAHIER_DES_CHARGES.md).

---

*Document généré à partir de l’historique Git du dépôt au 29 juillet 2026.*
