#!/usr/bin/env bash
# Publishes docs/wiki/*.md to the GitHub wiki (a separate repo: <repo>.wiki.git).
# GitHub only creates that repo after the first page is saved in the browser, so do that once first.
# Usage: scripts/publish-wiki.sh            (from anywhere inside the repo)
set -euo pipefail
ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
ORIGIN="$(git -C "$ROOT" remote get-url origin)"
WIKI="${ORIGIN%.git}.wiki.git"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --quiet "$WIKI" "$WORK" || { echo "No wiki repo yet. Open the Wiki tab on GitHub, save the Home page once, then run this again."; exit 1; }
cp "$ROOT"/docs/wiki/*.md "$WORK"/
cd "$WORK"
git add -A
if git diff --cached --quiet; then echo "Wiki already up to date."; exit 0; fi
git commit --quiet -m "Sync wiki from docs/wiki at $(git -C "$ROOT" rev-parse --short HEAD)"
git push --quiet
echo "Wiki published: ${ORIGIN%.git}/wiki"
