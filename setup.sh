#!/usr/bin/env bash
# setup.sh — Bump version, compute SRI hashes, rewrite jsDelivr CDN URLs + SRI in index.html
#
# Usage:
#   ./setup.sh                          # auto-detect owner/repo; content-hash version
#   ./setup.sh user repo                # specify owner + repo
#   ./setup.sh user repo v1.2.3         # specify owner + repo + version
#   ./setup.sh --check                  # verify hashes only, don't modify
#
# Does NOT commit or push.

set -euo pipefail

# ============ PATHS ============
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

INDEX="index.html"
BAK="${INDEX}.bak"

# ============ ASSET LIST (matches your project) ============
ASSETS=(
  "css/app.css"
  "js/i18n.js"
  "js/state.js"
  "js/processor.js"
  "js/rules.js"
  "js/editor.js"
  "js/sandbox.js"
  "js/batch.js"
  "js/presets.js"
  "js/ui.js"
  "js/app.js"
)

# Check files exist
missing=0
for f in "${ASSETS[@]}"; do
  [ -f "$f" ] || { echo "❌ Missing: $f" >&2; missing=1; }
done
[ -f "$INDEX" ] || { echo "❌ Missing: $INDEX" >&2; missing=1; }
[ $missing -eq 1 ] && exit 1

# ============ REPOSITORY RESOLUTION ============
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$SCRIPT_DIR")"
cd "$REPO_ROOT"

if [[ "${1:-}" == "--check" ]]; then
  MODE="check"
  OWNER=""; REPO=""; VERSION=""
else
  # --- Owner ---
  if [ -n "${1:-}" ] && [[ "$1" != v* ]]; then
    OWNER="$1"
    shift || true
  else
    OWNER="${GITHUB_OWNER:-$(git remote get-url origin 2>/dev/null \
      | sed -n 's|.*[:/]\([^/]*\)/\([^./]*\).*|\1|p' | head -1)}"
    [ -n "$OWNER" ] || OWNER="$(basename "$(dirname "$REPO_ROOT")")"
  fi

  # --- Repo ---
  if [ -n "${1:-}" ] && [[ "$1" != v* ]]; then
    REPO="$1"
    shift || true
  else
    REPO="${GITHUB_REPO:-$(basename "$REPO_ROOT")}"
  fi

  # --- Version ---
  if [ -n "${1:-}" ]; then
    VERSION="${1#v}"
  elif [ -n "${SRI_VERSION:-}" ]; then
    VERSION="$SRI_VERSION"
  else
    # Content hash of all assets → 12-char prefix
    if command -v openssl &>/dev/null; then
      HASH=$(cat "${ASSETS[@]}" 2>/dev/null | openssl dgst -sha256 | awk '{print $NF}' | cut -c1-12)
    elif command -v shasum &>/dev/null; then
      HASH=$(cat "${ASSETS[@]}" | shasum -a 256 | awk '{print $1}' | cut -c1-12)
    else
      HASH="$(date -u +%Y%m%d%H%M%S)"
    fi
    VERSION="${HASH:-$(date -u +%Y%m%d%H%M%S)}"
  fi
fi

URL_VERSION="$VERSION"
[[ "$URL_VERSION" =~ ^[vV] ]] || URL_VERSION="v${VERSION}"

# ============ PORTABLE SED ============
if [[ "${OSTYPE:-}" == darwin* ]]; then
  sedi() { sed -i '' "$@"; }
else
  sedi() { sed -i "$@"; }
fi

# ============ COMPUTE SRI (sha384) ============
sri_hash() {
  local file="$1"
  if command -v openssl &>/dev/null; then
    openssl dgst -sha384 -binary "$file" | openssl base64 -A
  else
    # Fallback: use shasum + perl for base64
    shasum -a 384 -b "$file" | awk '{print $1}' | xxd -r -p | base64
  fi
}

declare -A SRI
for f in "${ASSETS[@]}"; do
  if [ -f "$f" ]; then
    SRI[$f]="sha384-$(sri_hash "$f")"
  else
    SRI[$f]=""
  fi
done

# ============ CHECK MODE ============
if [ "${MODE:-}" = "check" ]; then
  echo "🔍 Verifying hashes in index.html..."
  FAIL=0
  for f in "${ASSETS[@]}"; do
    short="${SRI[$f]:8:20}"
    if grep -q "$short" "$INDEX" 2>/dev/null; then
      echo "  ✅ $f"
    else
      echo "  ❌ $f — hash not found"
      FAIL=1
    fi
  done
  [ $FAIL -eq 0 ] && echo "✅ All hashes current" || echo "❌ Mismatch"
  exit $FAIL
fi

# ============ UPDATE index.html ============
echo "🔐 Owner:   ${OWNER}"
echo "🔐 Repo:    ${REPO}"
echo "🔐 Version: ${URL_VERSION}"
echo ""

cp "$INDEX" "$BAK"

# --- 1. Update <meta name="version"> ---
sedi "s|<meta name=\"version\" content=\"[^\"]*\">|<meta name=\"version\" content=\"${URL_VERSION}\">|" "$INDEX"

# --- 2. Rewrite jsDelivr CDN base URL ---
# Matches: https://cdn.jsdelivr.net/gh/owner/repo@oldversion/...
sedi "s|https://cdn\\.jsdelivr\\.net/gh/[^/]*/[^/@]*/@[^/]*/|https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${URL_VERSION}/|g" "$INDEX"
# Also handle unversioned: /gh/owner/repo/...
sedi "s|/gh/[^/]*/[^/]*/|/gh/${OWNER}/${REPO}@${URL_VERSION}/|g" "$INDEX"

# --- 3. Update CSS integrity ---
CSS_SRI="${SRI[css/app.css]}"
if [ -n "$CSS_SRI" ]; then
  # Add or replace integrity + crossorigin on the stylesheet link
  if grep -q 'rel="stylesheet".*integrity=' "$INDEX"; then
    sedi "s|integrity=\"[^\"]*\"|integrity=\"${CSS_SRI}\"|g" "$INDEX"
  else
    sedi "/rel=\"stylesheet\"/ s|href=\"\([^\"]*\)\"|href=\"\1\" integrity=\"${CSS_SRI}\" crossorigin=\"anonymous\"|" "$INDEX"
  fi
  echo "  ✅ css/app.css → SRI ${CSS_SRI:0:24}..."
fi

# --- 4. Update JS SRI + crossorigin on each <script> tag ---
for f in "${ASSETS[@]}"; do
  [ "$f" = "css/app.css" ] && continue
  sri="${SRI[$f]}"
  [ -n "$sri" ] || continue

  fname="$(basename "$f")"
  # Match: src=".../fname"  → add/replace integrity + crossorigin
  if grep -q "src=\"[^\"]*${fname}\"" "$INDEX"; then
    # If integrity already present on that line, replace it
    if grep "src=\"[^\"]*${fname}\"" "$INDEX" | grep -q 'integrity='; then
      sedi "/src=\"[^\"]*${fname}\"/ s|integrity=\"[^\"]*\"|integrity=\"${sri}\"|" "$INDEX"
    else
      sedi "/src=\"[^\"]*${fname}\"/ s|\"$|& integrity=\"${sri}\" crossorigin=\"anonymous\"|" "$INDEX"
    fi
  fi
  echo "  ✅ ${f} → SRI ${sri:0:24}..."
done

# --- 5. Update the inline hash-check map ---
# Replace 'path/to/file': null  or  'path/to/file': 'oldhash'
for f in "${ASSETS[@]}"; do
  h="${SRI[$f]}"
  short="${h:8:16}"   # skip "sha384-" prefix for the JS map
  sedi "s|'${f}':[[:space:]]*null|'${f}':'${short}'|g" "$INDEX"
  sedi "s|'${f}':'[^']*'|'${f}':'${short}'|g" "$INDEX"
done

# --- 6. Update cache-busting fetch() calls ---
sedi "s|fetch('\([^']*\)?v=[^']*'|fetch('\1?v=${URL_VERSION}'|g" "$INDEX"
sedi "s|fetch(\"\([^\"]*\)?v=[^\"]*\"|fetch(\"\1?v=${URL_VERSION}\"|g" "$INDEX"

# ============ DIFF SUMMARY ============
echo ""
echo "📝 Changes:"
echo "─────────────────────────────────────────────"
diff -u "$BAK" "$INDEX" | grep '^[+-]' | grep -v '^---\|^+++' | head -50 || true
echo "─────────────────────────────────────────────"

rm -f "$BAK"

echo ""
echo "✅ index.html → ${OWNER}/${REPO}@${URL_VERSION}"
echo ""
echo "CDN URLs will be:"
echo "  https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${URL_VERSION}/index.html"
echo ""
echo "SRI_OWNER=${OWNER}"
echo "SRI_REPO=${REPO}"
echo "SRI_VERSION=${URL_VERSION}"