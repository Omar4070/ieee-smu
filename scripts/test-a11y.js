// Runs axe-core (WCAG 2.1 A/AA rules) on every page in light and dark themes.
//   playwright-cli open http://127.0.0.1:4322/
//   playwright-cli run-code --filename=scripts/test-a11y.js
async (page) => {
  const base = new URL(page.url()).origin;
  const paths = [
    '/', '/about/', '/events/', '/events/2026-04-robotics-automation-challenge/', '/events/2026-11-power-electronics-workshop/',
    '/team/', '/news/', '/news/2026-06-design-contest/', '/join/', '/contact/', '/credits/', '/404.html',
  ];
  const out = [];
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const theme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    for (const p of paths) {
      await page.goto(base + p);
      await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
      const violations = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
        });
        return r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')} ${n.failureSummary?.split('\n')[1]?.trim() ?? ''}`),
          count: v.nodes.length,
        }));
      });
      out.push(`${violations.length ? 'FAIL' : 'PASS'}  ${theme.padEnd(5)} ${p}`);
      for (const v of violations) out.push(`      [${v.impact}] ${v.id} ×${v.count}\n        ${v.nodes.join('\n        ')}`);
    }
  }
  return out.join('\n');
}
