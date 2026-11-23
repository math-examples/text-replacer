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

# ============ AUTO-DISCOVER ASSETS ============
ASSETS=()

# Discover all CSS files in css/ directory
if [ -d "css" ]; then
  while IFS= read -r -d '' f; do
    # Strip leading ./ if present, keep relative path like css/app.css
    f="${f#./}"
    ASSETS+=("$f")
  done < <(find css -maxdepth 1 -type f -name '*.css' -print0 | sort -z)
fi

# Discover all JS files in js/ directory
if [ -d "js" ]; then
  while IFS= read -r -d '' f; do
    f="${f#./}"
    ASSETS+=("$f")
  done < <(find js -maxdepth 1 -type f -name '*.js' -print0 | sort -z)
fi

if [ ${#ASSETS[@]} -eq 0 ]; then
  echo "⚠️  No CSS or JS assets found in css/ or js/" >&2
fi

echo "📦 Discovered ${#ASSETS[@]} asset(s): ${ASSETS[*]}"

# ============ SRI HASHES ============
declare -A SRI

for f in "${ASSETS[@]}"; do
  if [ -f "$f" ]; then
    hash=$(openssl dgst -sha384 -binary "$f" | openssl base64 -A)
    SRI[$f]="sha384-${hash}"
    echo "  ✅ ${f} → sha384-${hash:0:20}..."
  else
    SRI[$f]=""
    echo "  ⚠️  ${f} not found; skipping"
  fi
done

if [ ! -f index.html ]; then
  echo "❌ index.html not found" >&2
  exit 1
fi

# ============ HELPER: escape string for sed address/regex ============
# Escapes dots, slashes, and other regex special chars for use in sed patterns
sed_escape() {
  printf '%s' "$1" | sed 's|\\|\\\\|g; s|/|\\/|g; s|\.|\\.|g; s|*|\\*|g; s|+|\\+|g'
}

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

# --- 4 & 5. Update integrity for each asset (CSS link tags + JS script tags) ---
for f in "${ASSETS[@]}"; do
  sri="${SRI[$f]:-}"
  [ -n "$sri" ] || continue

  f_esc="$(sed_escape "$f")"
  sri_esc="$(printf '%s' "$sri" | sed 's|/|\\/|g')"

  if [[ "$f" == css/* ]]; then
    # Match <link> tags referencing this CSS file
    sedi "/<link.*${f_esc}/ s|integrity=\"[^\"]*\"|integrity=\"${sri_esc}\"|" index.html
  elif [[ "$f" == js/* ]]; then
    # Match <script> tags referencing this JS file
    sedi "/<script.*${f_esc}/ s|integrity=\"[^\"]*\"|integrity=\"${sri_esc}\"|" index.html
  fi
done

# --- 6. Update SRI_MAP in inline loader (if present) ---
for f in "${ASSETS[@]}"; do
  sri="${SRI[$f]:-}"
  [ -n "$sri" ] || continue
  # Escape quotes and slashes for JS string context
  f_esc_json="$(printf '%s' "$f" | sed 's|"|\\"|g')"
  sedi "s|\"${f_esc_json}\": \"[^\"]*\"|\"${f_esc_json}\": \"${sri}\"|" index.html
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