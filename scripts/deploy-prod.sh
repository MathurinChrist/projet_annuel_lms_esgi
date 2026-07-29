#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=(docker compose -f docker-compose.prod.yml)

echo "==> EduPulse production deploy"
echo "    dir: $ROOT_DIR"

if [ ! -f .env ]; then
  echo "ERROR: missing .env — copy .env.production.example to .env and fill secrets."
  exit 1
fi

echo "==> Building images"
"${COMPOSE[@]}" build --pull

echo "==> Starting stack"
"${COMPOSE[@]}" up -d --remove-orphans

echo "==> Waiting for app health"
for i in $(seq 1 40); do
  if curl -fsS "http://127.0.0.1:${APP_PORT:-3000}/" >/dev/null 2>&1; then
    echo "App is up"
    "${COMPOSE[@]}" ps
    exit 0
  fi
  sleep 3
done

echo "WARNING: app did not respond in time — check logs:"
"${COMPOSE[@]}" logs --tail=80 app
exit 1
