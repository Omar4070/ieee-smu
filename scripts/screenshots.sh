#!/usr/bin/env bash
# Screenshot pages at 1440 / 768 / 390 px in light and dark themes with playwright-cli.
# Usage: scripts/screenshots.sh [base-url] [path ...]
#   scripts/screenshots.sh http://127.0.0.1:4321 / /about/ /events/
set -euo pipefail
BASE="${1:-http://127.0.0.1:4321}"; shift || true
PATHS=("$@"); [ ${#PATHS[@]} -eq 0 ] && PATHS=(/)
OUT="screenshots"; mkdir -p "$OUT"
S="-s=shots"
playwright-cli $S open "$BASE${PATHS[0]}" >/dev/null
# Reduced motion keeps scroll-reveal content visible in full-page captures.
playwright-cli $S set-reduced-motion reduce >/dev/null
for p in "${PATHS[@]}"; do
  name=$(echo "$p" | sed 's#^/##; s#/$##; s#/#-#g'); name=${name:-home}
  for w in 1440 768 390; do
    playwright-cli $S resize "$w" 900 >/dev/null
    for scheme in light dark; do
      playwright-cli $S set-color-scheme "$scheme" >/dev/null
      playwright-cli $S goto "$BASE$p" >/dev/null
      playwright-cli $S eval "document.fonts.ready.then(() => true)" >/dev/null
      # Scroll through the page so lazy-loaded images load before the capture.
      playwright-cli $S run-code "async page => { const h = await page.evaluate(() => document.body.scrollHeight); for (let y = 0; y < h; y += 700) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(80); } await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300); }" >/dev/null
      playwright-cli $S screenshot --full-page --filename="$OUT/$name-$w-$scheme.png" >/dev/null
      echo "$OUT/$name-$w-$scheme.png"
    done
  done
done
playwright-cli $S close >/dev/null
