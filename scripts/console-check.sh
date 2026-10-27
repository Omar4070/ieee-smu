#!/usr/bin/env bash
# Opens each page with playwright-cli and prints browser console errors/warnings.
# Usage: scripts/console-check.sh [base-url] [path ...]
set -uo pipefail
BASE="${1:-http://127.0.0.1:4321}"; shift || true
PATHS=("$@"); [ ${#PATHS[@]} -eq 0 ] && PATHS=(/)
S="-s=console"
playwright-cli $S open "$BASE${PATHS[0]}" >/dev/null
for p in "${PATHS[@]}"; do
  playwright-cli $S goto "$BASE$p" >/dev/null
  out=$(playwright-cli $S console warning 2>&1 | grep -E "Errors:|^\[(error|warning)\]|^- \[" )
  echo "$p  $(echo "$out" | head -1)"
  echo "$out" | tail -n +2 | head -10
done
playwright-cli $S close >/dev/null
