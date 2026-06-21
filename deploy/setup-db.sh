#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

HOST_DATABASE_URL="${HOST_DATABASE_URL:-${DATABASE_URL/postgres:5432/127.0.0.1:5432}}"

if [[ -z "${HOST_DATABASE_URL:-}" ]]; then
  echo "HOST_DATABASE_URL or DATABASE_URL must be set in .env"
  exit 1
fi

echo "Pushing database schema..."
DATABASE_URL="$HOST_DATABASE_URL" pnpm --filter @workspace/db run push

echo "Seeding database..."
DATABASE_URL="$HOST_DATABASE_URL" pnpm --filter @workspace/scripts run seed

echo "Database ready."
