#!/usr/bin/env sh
set -eu

HEALTH_URL="${TAOLING_HEALTH_URL:-http://127.0.0.1:3000/health}"
RESPONSE="$(curl --fail --silent --show-error --max-time 5 "$HEALTH_URL")"

printf '%s' "$RESPONSE" | grep -q '"status":"ok"'
printf 'taoling-gallery healthcheck: ok\n'
