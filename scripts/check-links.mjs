/**
 * Checks every internal link, image and asset referenced by the built site
 * (dist/) and lists external links. Run after `npm run build`:
 *   node scripts/check-links.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = 'dist';
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const pages = [];
const walk = (dir) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) pages.push(p);
  }
};
walk(root);

const broken = [];
const external = new Set();
for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const pageUrl = '/' + relative(root, page).split(sep).join('/').replace(/index\.html$/, '');
  for (const [, attr, value] of html.matchAll(/\s(href|src|srcset)="([^"]+)"/g)) {
    const urls = attr === 'srcset' ? value.split(',').map((s) => s.trim().split(/\s+/)[0]) : [value];
    for (const raw of urls) {
      if (/^(mailto:|tel:|data:|#)/.test(raw)) continue;
      if (/^https?:/.test(raw)) {
        external.add(raw);
        continue;
      }
      const resolved = new URL(raw, `http://x${base}${pageUrl}`).pathname;
      let path = decodeURIComponent(resolved);
      if (base && path.startsWith(base)) path = path.slice(base.length);
      const file = join(root, path);
      const ok = existsSync(file) && statSync(file).isFile() ? true : existsSync(join(file, 'index.html'));
      if (!ok) broken.push(`${pageUrl} → ${raw}`);
    }
    // in-page anchors: check that the id exists
  }
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${id}"`)) broken.push(`${pageUrl} → #${id} (missing id)`);
  }
}
console.log(`${pages.length} pages checked.`);
console.log(broken.length ? `BROKEN (${broken.length}):\n  ${broken.join('\n  ')}` : 'No broken internal links.');
console.log(`External links (${external.size}):\n  ${[...external].sort().join('\n  ')}`);
process.exitCode = broken.length ? 1 : 0;
