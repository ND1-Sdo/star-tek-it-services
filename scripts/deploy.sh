#!/usr/bin/env bash
# Build and deploy Star-Tek IT Services to Render.
#
# Git deploy (auto on push to main):
#   bash scripts/deploy.sh
#   git add -A && git commit -m "..." && git push origin main
#
# Deploy hook (instant redeploy without commit):
#   Add to scripts/local.render.env:
#     RENDER_STAR_TEK_DEPLOY_HOOK=https://api.render.com/deploy/srv-...
#   bash scripts/deploy.sh --hook
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/scripts/local.render.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/scripts/local.render.env"
  set +a
fi

echo "==> Building site…"
npm run build

echo "==> Copying SEO files to repo root (Render publish path fallback)…"
cp dist/robots.txt dist/sitemap.xml .

if [[ "${1:-}" == "--hook" && -n "${RENDER_STAR_TEK_DEPLOY_HOOK:-}" ]]; then
  echo "==> Triggering Render deploy hook…"
  curl -fsS -X POST "$RENDER_STAR_TEK_DEPLOY_HOOK"
  echo ""
  echo "Deploy started. Check https://services-ltdstartek-org.onrender.com in a few minutes."
elif [[ "${1:-}" == "--hook" ]]; then
  echo "No RENDER_STAR_TEK_DEPLOY_HOOK in scripts/local.render.env"
  echo "Add your hook from Render → Settings → Deploy Hook"
  exit 1
else
  echo ""
  echo "Built: $ROOT/dist"
  echo "Commit and push to deploy:"
  echo "  git add -A && git commit -m 'Deploy site' && git push origin main"
  echo ""
  echo "Render settings (Dashboard → star-tek static site):"
  echo "  Build command:  npm run build"
  echo "  Publish path:   dist"
fi
