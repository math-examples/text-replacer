#!/usr/bin/env bash
# setup.sh — Compute SRI hashes + update index.html in-place
# Usage:
#   ./setup.sh                    # auto-detect owner/repo; timestamp version
#   ./setup.sh user repo          # specify owner + repo
#   ./setup.sh user repo v1.0.0   # specify owner + repo + version
set -euo pipefail

# ============ REPOSITORY ============
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [ -z "$REPO_ROOT" ]; then
  echo "❌ Not inside a git repo" >&2
  exit 1
fi
cd "$REPO_ROOT"

# --- Owner / repo resolution ---
if [ -n "${1:-}" ]; then
  OWNER="$1"
else
  OWNER="${GITHUB_OWNER:-$(git remote get-url origin 2>/dev/null \
    | sed -n 's|.*[:/]\([^/]*\)/\([^./]*\).*|\1|p' \
    | head -1)}"
  [ -n "$OWNER" ] || OWNER="$(basename "$(dirname "$REPO_ROOT")")"
fi

if [ -n "${2:-}" ]; then
  REPO="$2"
else
  REPO="${GITHUB_REPO:-$(basename "$REPO_ROOT")}"
fi

# --- Version resolution ---
if [ -n "${3:-}" ]; then
  VERSION="$3"
elif [ -n "${SRI_VERSION:-}" ]; then
  VERSION="$SRI_VERSION"
else
  VERSION="$(date -u +%Y%m%d%H%M%S)"
fi

[[ "$VERSION" =~ ^[vV] ]] || VERSION="v${VERSION}"

# --- Portable in-place sed ---
if [[ "${OSTYPE:-}" == darwin* ]]; then
  sedi() { sed -i '' "$@"; }
else
  sedi() { sed -i "$@"; }
fi

echo "🔐 Owner:   ${OWNER}"
echo "🔐 Repo:    ${REPO}"
echo "🔐 Version: ${VERSION}"

# ============ ASSETS ============
ASSETS=(
  "css/app.css" "simple.css"
  "js/i18n.js" "js/state.js" "js/processor.js" "js/rules.js"
  "js/editor.js" "js/sandbox.js" "js/batch.js" "js/presets.js" "js/ui.js" "js/app.js" "simple.js"
)

# Check files exist
for f in "${ASSETS[@]}"; do
  if [ ! -f "$f" ]; then
    echo "⚠️  ${f} not found; skipping"
  fi
done

if [ ! -f index.html ]; then
  echo "❌ index.html not found" >&2
  exit 1
fi

# ============ SRI HASHES ============
declare -A SRI

for f in "${ASSETS[@]}"; do
  if [ -f "$f" ]; then
    hash=$(openssl dgst -sha384 -binary "$f" | openssl base64 -A)
    SRI[$f]="sha384-${hash}"
    echo "  ✅ ${f} → sha384-${hash:0:20}..."
  else
    SRI[$f]=""
  fi
done

# ============ UPDATE index.html ============
cp index.html index.html.bak

# --- 1. Version meta ---
sedi "s|<meta name=\"version\" content=\"[^\"]*\">|<meta name=\"version\" content=\"${VERSION}\">|" index.html

# --- 2. CDN owner/repo meta tags ---
sedi "s|<meta name=\"cdn-owner\" content=\"[^\"]*\">|<meta name=\"cdn-owner\" content=\"${OWNER}\">|" index.html
sedi "s|<meta name=\"cdn-repo\" content=\"[^\"]*\">|<meta name=\"cdn-repo\" content=\"${REPO}\">|" index.html

# --- 3. Update version in existing CDN URLs ---
sedi "s|@v[0-9][^/]*/|@${VERSION}/|g" index.html
sedi "s|@[0-9]\{14,\}/|@${VERSION}/|g" index.html

# --- 4. Update CSS integrity (match link tag with stylesheet) ---
CSS_SRI="${SRI[css/app.css]}"
if [ -n "$CSS_SRI" ]; then
  # Escape slashes and special chars for sed
  css_sri_esc="$(printf '%s' "$CSS_SRI" | sed 's|/|\\/|g')"
  sedi "/<link rel=\"stylesheet\"/ s|integrity=\"[^\"]*\"|integrity=\"${css_sri_esc}\"|" index.html
fi

# --- 5. Update each JS integrity (match script tag containing filename) ---
for f in "${ASSETS[@]}"; do
  [ "$f" = "css/app.css" ] && continue
  sri="${SRI[$f]:-}"
  [ -n "$sri" ] || continue
  fname="$(basename "$f")"
  # Escape slashes in SRI for sed
  sri_esc="$(printf '%s' "$sri" | sed 's|/|\\/|g')"
  sedi "/${fname}/ s|integrity=\"[^\"]*\"|integrity=\"${sri_esc}\"|" index.html
done

# --- 6. Update SRI_MAP in inline loader ---
for f in "${ASSETS[@]}"; do
  sri="${SRI[$f]:-}"
  [ -n "$sri" ] || continue
  # Escape for JS string (no slashes issue)
  sedi "s|\"${f}\": \"[^\"]*\"|\"${f}\": \"${sri}\"|" index.html
done

# ============ DIFF SUMMARY ============
echo ""
echo "📝 Changes:"
echo "─────────────────────────────────────────────"
diff -u index.html.bak index.html \
  | grep '^[+-]' \
  | grep -v '^---\|^+++' \
  | head -60 || true
echo "─────────────────────────────────────────────"

rm -f index.html.bak

echo ""
echo "✅ index.html updated → ${OWNER}/${REPO}@${VERSION}"
echo ""
echo "SRI_OWNER=${OWNER}"
echo "SRI_REPO=${REPO}"
echo "SRI_VERSION=${VERSION}"