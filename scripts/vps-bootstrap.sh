#!/usr/bin/env bash
# Bootstrap EduPulse on the VPS (run from your laptop once).
# Usage: bash scripts/vps-bootstrap.sh [user@host]
set -euo pipefail

TARGET="${1:-ubuntu@54.37.159.216}"
REMOTE_PATH="${VPS_PATH:-/opt/edupulse}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==> Target: $TARGET"
echo "==> Path:   $REMOTE_PATH"

ssh "$TARGET" "sudo mkdir -p '$REMOTE_PATH' && sudo chown \"\$(id -u):\$(id -g)\" '$REMOTE_PATH'"

echo "==> Syncing project (excluding secrets / node_modules)..."
rsync -az --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude '.nuxt/' \
  --exclude '.output/' \
  --exclude '.env' \
  --exclude '.env.local' \
  --exclude '.cursor/' \
  "$ROOT_DIR/" "$TARGET:$REMOTE_PATH/"

echo "==> Ensuring .env on server..."
ssh "$TARGET" "bash -s" <<REMOTE
set -euo pipefail
cd '$REMOTE_PATH'
if [ ! -f .env ]; then
  cp .env.production.example .env
  DB_PASS=\$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)
  JWT=\$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)
  sed -i "s/CHANGE_ME_STRONG_DB_PASSWORD/\$DB_PASS/" .env
  sed -i "s/CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS/\$JWT/" .env
  echo "Created .env with generated secrets"
else
  echo ".env already present — left untouched"
fi
chmod +x scripts/deploy-prod.sh docker/prod/entrypoint.sh
REMOTE

echo "==> First production deploy (build can take several minutes)..."
ssh "$TARGET" "cd '$REMOTE_PATH' && bash scripts/deploy-prod.sh"

echo "==> Optional seed (first time only)"
ssh "$TARGET" "cd '$REMOTE_PATH' && docker compose -f docker-compose.prod.yml exec -T app npx prisma db seed" || true

echo ""
echo "Done. App should be at http://54.37.159.216:3000"
echo "Next: add GitHub Actions secrets (see docker/prod/README.md) for auto-deploy on main."
