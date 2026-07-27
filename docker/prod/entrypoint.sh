#!/bin/sh
set -eu

echo "[prod] Running Prisma migrations..."
npx prisma migrate deploy

echo "[prod] Starting EduPulse..."
exec node .output/server/index.mjs
