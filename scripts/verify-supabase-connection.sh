#!/usr/bin/env bash
set -euo pipefail

# Verifies that the Expo client configuration and Supabase CLI link target the
# same project. It intentionally never prints API keys. The smartbillpro.com
# backend must also be configured for this ref before authenticated API calls
# can work; this script only validates this repository and Supabase reachability.
#
# Prerequisites: curl, Supabase CLI login under the global macOS HOME, and a
# completed `supabase link`. If it fails, check `.env`, `supabase/.temp/project-ref`,
# and the CLI login account before changing application auth code.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
LINK_FILE="$ROOT_DIR/supabase/.temp/project-ref"
GLOBAL_HOME="${SUPABASE_GLOBAL_HOME:-/Users/admin}"

read_env_value() {
  local name="$1"
  awk -v key="$name" 'index($0, key "=") == 1 { print substr($0, length(key) + 2); exit }' "$ENV_FILE"
}

if [[ ! -f "$ENV_FILE" || ! -f "$LINK_FILE" ]]; then
  echo "Missing .env or Supabase link metadata. Run supabase link first." >&2
  exit 1
fi

supabase_url="$(read_env_value EXPO_PUBLIC_SUPABASE_URL)"
publishable_key="$(read_env_value EXPO_PUBLIC_SUPABASE_ANON_KEY)"
linked_ref="$(tr -d '[:space:]' < "$LINK_FILE")"
configured_ref="${supabase_url#https://}"
configured_ref="${configured_ref%%.*}"

if [[ -z "$supabase_url" || -z "$publishable_key" ]]; then
  echo "Supabase URL or publishable key is missing from .env." >&2
  exit 1
fi

if [[ "$linked_ref" != "$configured_ref" ]]; then
  echo "Supabase mismatch: CLI links to $linked_ref but .env uses $configured_ref." >&2
  exit 1
fi

auth_status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 \
  -H "apikey: $publishable_key" \
  "$supabase_url/auth/v1/health")"

if [[ "$auth_status" != "200" ]]; then
  echo "Supabase Auth health check failed with HTTP $auth_status." >&2
  exit 1
fi

auth_settings="$(curl -sS --max-time 20 \
  -H "apikey: $publishable_key" \
  "$supabase_url/auth/v1/settings")"

google_enabled="$(AUTH_SETTINGS="$auth_settings" python3 -c \
  'import json, os; print("yes" if json.loads(os.environ["AUTH_SETTINGS"]).get("external", {}).get("google") else "no")')"

if [[ "$google_enabled" != "yes" ]]; then
  echo "WARNING: Google Auth is disabled in this Supabase project; the current app login screen cannot sign in yet." >&2
fi

(
  cd "$ROOT_DIR"
  HOME="$GLOBAL_HOME" supabase migration list --linked
)

echo "Supabase connection verified: $linked_ref (Auth HTTP 200, Google enabled: $google_enabled)."
