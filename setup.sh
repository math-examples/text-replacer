#!/usr/bin/env bash
# setup.sh — Bump version, compute sha384 SRI, rewrite index.html
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

INDEX="index.html"
BAK="${INDEX}.bak"

ASSETS=(
  "css/app.css"
  "js/i18n.js" "js/state.js" "js/processor.js" "js/rules.js"
  "js/editor.js" "js/sandbox.js" "js/batch.js" "js/presets.js" "js/ui.js" "js/app.js"
)

# Check files
for f in "${ASSETS[@]}"; do
  [ -f "$f" ] || { echo "❌ Missing: $f" >&2; exit 1; }
done
[ -f "$INDEX" ] || { echo "❌ Missing: $INDEX" >&2; exit 1; }

# ─── Repo / Version resolution ───
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$SCRIPT_DIR")"
cd "$REPO_ROOT"

CHECK_MODE=0
if [[ "${1:-}" == "--check" ]]; then
  CHECK_MODE=1
else
  if [ -n "${1:-}" ] && [[ "$1" != v* ]]; then OWNER="$1"; shift || true; else
    OWNER="${GITHUB_OWNER:-$(git remote get-url origin 2>/dev/null | sed -n 's|.*[:/]\([^/]*\)/\([^./]*\).*|\1|p' | head -1)}"
    [ -n "$OWNER" ] || OWNER="$(basename "$(dirname "$REPO_ROOT")")"
  fi
  if [ -n "${1:-}" ] && [[ "$1" != v* ]]; then REPO="$1"; shift || true; else
    REPO="${GITHUB_REPO:-$(basename "$REPO_ROOT")}"
  fi
  if [ -n "${1:-}" ]; then VERSION="${1#v}"
  elif [ -n "${SRI_VERSION:-}" ]; then VERSION="$SRI_VERSION"
  else
    if command -v openssl &>/dev/null; then
      VERSION=$(cat "${ASSETS[@]}" 2>/dev/null | openssl dgst -sha256 | awk '{print $NF}' | cut -c1-12)
    else VERSION="$(date -u +%Y%m%d%H%M%S)"; fi
  fi
fi
URL_VERSION="$VERSION"
[[ "$URL_VERSION" =~ ^[vV] ]] || URL_VERSION="v${VERSION}"

# ─── Portable sed ───
if [[ "${OSTYPE:-}" == darwin* ]]; then
  sedi() { sed -i '' "$@"; }
else
  sedi() { sed -i "$@"; }
fi

# ─── sha384 base64 ───
sha384_base64() {
  local file="$1"
  if command -v openssl &>/dev/null; then
    openssl dgst -sha384 -binary "$file" | openssl base64 -A
  else
    shasum -a 384 -b "$file" | awk '{print $1}' | xxd -r -p | base64
  fi
}

declare -A SRI_B64    # just base64 (for JS map)
declare -A SRI_FULL   # sha384-<base64> (for integrity attributes)

for f in "${ASSETS[@]}"; do
  if [ -f "$f" ]; then
    b64="$(sha384_base64 "$f")"
    SRI_B64[$f]="$b64"
    SRI_FULL[$f]="sha384-${b64}"
  else
    SRI_B64[$f]=""
    SRI_FULL[$f]=""
  fi
done

# ─── CHECK MODE ───
if [ ${CHECK_MODE:-0} -eq 1 ]; then
  echo "🔍 Verifying sha384 hashes in index.html..."
  FAIL=0
  for f in "${ASSETS[@]}"; do
    expected="${SRI_B64[$f]}"
    if grep -q "'$f':'${expected}'" "$INDEX" 2>/dev/null; then
      echo "  ✅ $f"
    else
      echo "  ❌ $f — hash mismatch"
      FAIL=1
    fi
  done
  [ $FAIL -eq 0 ] && echo "✅ All hashes current" || echo "❌ Mismatch"
  exit $FAIL
fi

# ─── UPDATE index.html ───
echo "🔐 Owner: ${OWNER}  Repo: ${REPO}  Version: ${URL_VERSION}"
cp "$INDEX" "$BAK"

# 1. Version meta
sedi "s|<meta name=\"version\" content=\"[^\"]*\">|<meta name=\"version\" content=\"${URL_VERSION}\">|" "$INDEX"

# 2. CDN URLs
sedi "s|https://cdn\\.jsdelivr\\.net/gh/[^/]*/[^/@]*/@[^/]*/|https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${URL_VERSION}/|g" "$INDEX"
sedi "s|/gh/[^/]*/[^/]*/|/gh/${OWNER}/${REPO}@${URL_VERSION}/|g" "$INDEX"

# 3. CSS integrity (uses FULL sha384- prefix)
CSS_SRI="${SRI_FULL[css/app.css]}"
CSS_B64="${SRI_B64[css/app.css]}"
if [ -n "$CSS_SRI" ]; then
  if grep -q 'rel="stylesheet".*integrity=' "$INDEX"; then
    sedi "s|integrity=\"[^\"]*\" crossorigin=\"anonymous\"|integrity=\"${CSS_SRI}\" crossorigin=\"anonymous\"|g" "$INDEX"
  else
    sedi "/rel=\"stylesheet\"/ s|href=\"\([^\"]*\)\"|href=\"\1\" integrity=\"${CSS_SRI}\" crossorigin=\"anonymous\"|" "$INDEX"
  fi
  echo "  ✅ css/app.css → ${CSS_SRI:0:40}..."
fi

# 4. JS SRI attributes (uses FULL sha384- prefix, pure sed)
for f in "${ASSETS[@]}"; do
  [ "$f" = "css/app.css" ] && continue
  sri="${SRI_FULL[$f]}"
  [ -n "$sri" ] || continue
  fname="$(basename "$f")"

  # Escape slashes and plus signs for sed safety
  sri_esc="$(printf '%s' "$sri" | sed 's|/|\\/|g; s|&|\\&|g; s|+|\\+|g')"

  if grep -q "src=\"[^\"]*${fname}\"" "$INDEX"; then
    if grep "src=\"[^\"]*${fname}\"" "$INDEX" | grep -q 'integrity="'; then
      sedi "s/src=\"\([^\"]*${fname}\)\" integrity=\"[^\"]*\"/src=\"\1\" integrity=\"${sri_esc}\" crossorigin=\"anonymous\"/g" "$INDEX"
    else
      sedi "/src=\"[^\"]*${fname}\"/ s/src=\"\([^\"]*${fname}\)\"/src=\"\1\" integrity=\"${sri_esc}\" crossorigin=\"anonymous\"/" "$INDEX"
    fi
  fi
  echo "  ✅ ${f} → ${sri:0:40}..."
done

# 5. Update inline JS checks map — uses BASE64 WITHOUT prefix (matches JS hashStr)
for f in "${ASSETS[@]}"; do
  h="${SRI_B64[$f]}"
  [ -n "$h" ] || continue
  # Escape single quotes and special chars
  h_esc="$(printf '%s' "$h" | sed "s/'/'\\\\''/g")"
  sedi "s|'${f}':[[:space:]]*null|'${f}':'${h_esc}'|g" "$INDEX"
  sedi "s|'${f}':'[^']*'|'${f}':'${h_esc}'|g" "$INDEX"
done

# 6. Update fetch cache-busting
sedi "s|fetch('\([^']*\)?v=[^']*'|fetch('\1?v=${URL_VERSION}'|g" "$INDEX"
sedi "s|fetch(\"\([^\"]*\)?v=[^\"]*\"|fetch(\"\1?v=${URL_VERSION}\"|g" "$INDEX"

# 7. Patch inline JS: replace hashStr with async sha384 version
#    Match the exact original one-liner
sedi 's|function hashStr(s){var h=0;for(var i=0;i<s\.length;i++){h=((h<<5)-h+s\.charCodeAt(i))|0}return h\.toString(36)}|async function hashStr(s){const buf=new TextEncoder().encode(s);const hash=await crypto.subtle.digest("SHA-384",buf);const arr=Array.from(new Uint8Array(hash));return btoa(String.fromCharCode(...arr))}|g' "$INDEX"

# 8. Make the .then callback async and add await
#    Original: .then(function(r){return r.text()}).then(function(t){
sedi 's|\.then(function(r){return r\.text()})\.then(function(t){|.then(function(r){return r.text()}).then(async function(t){|g' "$INDEX"
sedi 's|checks\[f\]=hashStr(t)|checks[f]=await hashStr(t)|g' "$INDEX"

# ─── DIFF (safe from SIGPIPE) ───
echo ""
echo "📝 Changes:"
echo "─────────────────────────────────────────────"
set +e
diff -u "$BAK" "$INDEX" > /tmp/sri_diff.txt 2>&1
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "(no changes)"
elif [ $EXIT_CODE -eq 1 ]; then
  grep '^[+-]' /tmp/sri_diff.txt | grep -v '^---\|^+++' | head -50
else
  echo "⚠️ diff failed with code $EXIT_CODE"
fi
set -e
rm -f "$BAK" /tmp/sri_diff.txt

echo "─────────────────────────────────────────────"
echo ""
echo "✅ Done → ${OWNER}/${REPO}@${URL_VERSION}"
echo "SRI_OWNER=${OWNER}"
echo "SRI_REPO=${REPO}"
echo "SRI_VERSION=${URL_VERSION}"
