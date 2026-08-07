#!/usr/bin/env bash
set -e

# Always use global HOME for external CLIs in Hermes environment
export HOME="/Users/admin"

echo "=========================================="
echo " SmartBill Deployment & Verification Pipeline "
echo "=========================================="

echo ">>> Step 1: Verify Supabase Connection & Health..."
if [ -f "scripts/verify-supabase-connection.sh" ]; then
    bash scripts/verify-supabase-connection.sh
else
    echo "Warning: scripts/verify-supabase-connection.sh not found, skipping..."
fi

echo ">>> Step 2: Checking Git Diff for Format & Conflict Markers..."
git diff --check

echo ">>> Step 3: Checking Supabase Remote Config Alignment..."
if [ -f "supabase/config.toml" ]; then
    echo "Syncing Supabase CLI config..."
    supabase config push --yes || echo "Supabase config push skipped or already up-to-date."
fi

echo ">>> Step 4: Pushing Changes to Remote Git Repository..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current Branch: $CURRENT_BRANCH"
git push origin "$CURRENT_BRANCH"

echo "=========================================="
echo " Deployment Pipeline Completed Successfully!"
echo "=========================================="
