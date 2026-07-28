#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/home/ubuntu/backups/npinc"
RETENTION_DAYS=7
RETENTION_WEEKS=4
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/npinc_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

if [[ -f /home/ubuntu/npinc/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source /home/ubuntu/npinc/.env
  set +a
fi

HOST_DATABASE_URL="${HOST_DATABASE_URL:-${DATABASE_URL/postgres:5432/127.0.0.1:5432}}"

if [[ -z "${HOST_DATABASE_URL:-}" ]]; then
  echo "ERROR: HOST_DATABASE_URL or DATABASE_URL must be set"
  exit 1
fi

echo "$(date): Starting backup..."

pg_dump "$HOST_DATABASE_URL" | gzip > "$BACKUP_FILE"

if [[ ! -s "$BACKUP_FILE" ]]; then
  echo "ERROR: Backup file is empty"
  rm -f "$BACKUP_FILE"
  exit 1
fi

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "$(date): Backup completed: $BACKUP_FILE ($BACKUP_SIZE)"

echo "$(date): Cleaning old backups..."

find "$BACKUP_DIR" -name "npinc_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

WEEKLY_BACKUPS=($(ls -1t "$BACKUP_DIR"/npinc_*.sql.gz 2>/dev/null | head -$((RETENTION_WEEKS * 7))))
for backup in "$BACKUP_DIR"/npinc_*.sql.gz; do
  if [[ ! -f "$backup" ]]; then
    continue
  fi
  is_kept=false
  for kept in "${WEEKLY_BACKUPS[@]:-}"; do
    if [[ "$backup" == "$kept" ]]; then
      is_kept=true
      break
    fi
  done
  if [[ "$is_kept" == "false" ]]; then
    FILE_AGE_DAYS=$(( ($(date +%s) - $(stat -c %Y "$backup")) / 86400 ))
    if [[ $FILE_AGE_DAYS -gt $RETENTION_DAYS ]]; then
      rm -f "$backup"
    fi
  fi
done

REMAINING=$(ls -1 "$BACKUP_DIR"/npinc_*.sql.gz 2>/dev/null | wc -l)
echo "$(date): Cleanup complete. $REMAINING backups retained."
