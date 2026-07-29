# Déploiement production (VPS)

## Architecture

- **VPS** : `ubuntu@54.37.159.216`
- **Stack** : `docker-compose.prod.yml` (PostgreSQL + app Nuxt prod)
- **CD** : workflow `.github/workflows/deploy.yml` sur chaque push / merge vers `main`

Flux :

```
feature → PR → developp → auto PR/merge → main → Deploy production (SSH + rsync + docker compose)
```

## 1. Secrets GitHub (obligatoire)

Repo → **Settings → Secrets and variables → Actions** :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | `54.37.159.216` |
| `VPS_USER` | `ubuntu` |
| `VPS_SSH_KEY` | clé privée SSH (PEM / OpenSSH) autorisée sur le VPS |
| `VPS_PATH` | `/opt/edupulse` (optionnel) |

Générer une clé dédiée deploy (recommandé) :

```bash
ssh-keygen -t ed25519 -f ./edupulse-deploy -N "" -C "edupulse-github-deploy"
# publique → ~/.ssh/authorized_keys sur le VPS
# privée  → secret GitHub VPS_SSH_KEY (contenu complet du fichier)
```

## 2. Bootstrap VPS (une fois)

Sur le VPS (ou depuis ta machine avec SSH) :

```bash
ssh ubuntu@54.37.159.216
sudo mkdir -p /opt/edupulse
sudo chown ubuntu:ubuntu /opt/edupulse
```

Depuis le poste de dev :

```bash
rsync -az --exclude node_modules --exclude .git --exclude .nuxt --exclude .output --exclude .env \
  ./ ubuntu@54.37.159.216:/opt/edupulse/

ssh ubuntu@54.37.159.216
cd /opt/edupulse
cp .env.production.example .env
nano .env   # JWT_SECRET ≥ 32, DB_PASSWORD fort, APP_URL
chmod +x scripts/deploy-prod.sh docker/prod/entrypoint.sh
bash scripts/deploy-prod.sh
```

Seed initial (une fois) :

```bash
docker compose -f docker-compose.prod.yml exec app npx prisma db seed
```

App : http://54.37.159.216:3000

Proxy HTTP (optionnel) :

```bash
docker compose -f docker-compose.prod.yml --profile proxy up -d
# puis http://54.37.159.216/ (port 80)
```

## 3. Déploiements suivants

Automatiques dès qu’il y a un push sur `main` (y compris après merge de la release `developp` → `main`).

Manuel : Actions → **Deploy production** → **Run workflow**.

## 4. Commandes utiles sur le VPS

```bash
cd /opt/edupulse
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml restart app
```
