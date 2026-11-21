#!/usr/bin/env bash
set -euo pipefail
cd /root/hackathon
./node_modules/.bin/wrangler dev --ip 127.0.0.1 --port 8799 >/dev/null 2>&1 &
collector_pid=$!
trap 'kill "$collector_pid" 2>/dev/null || true' EXIT
for attempt in {1..30}; do
  if curl -fsS --max-time 2 http://127.0.0.1:8799/api/admin/sources >/dev/null 2>&1; then break; fi
  sleep 1
done
curl -fsS --max-time 90 -X POST http://127.0.0.1:8799/api/admin/collect -H 'content-type: application/json' -d '{}'
