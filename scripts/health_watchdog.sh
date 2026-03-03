#!/usr/bin/env bash
set -euo pipefail

HEALTH_URL=${1:-"http://localhost:8080/api/health"}
PM2_NAME=${2:-"kronos-hub"}
INTERVAL=${3:-60}

echo "Kronos Watchdog running. Polling ${HEALTH_URL} every ${INTERVAL}s..."

while true; do
  echo "$(date -u) - ping $HEALTH_URL"
  status=$(curl -s --max-time 6 "$HEALTH_URL" | jq -r '.status' 2>/dev/null || echo "error")
  
  if [ "$status" != "ok" ]; then
    echo "$(date -u) - Health bad ($status). Restarting $PM2_NAME"
    pm2 restart "$PM2_NAME" || echo "pm2 restart failed"
    sleep 8
  else
    echo "$(date -u) - Health OK"
  fi
  sleep "$INTERVAL"
done
