// Mobile navigation, keyboard and theme checks, run with playwright-cli:
//   playwright-cli open http://127.0.0.1:4322/
//   playwright-cli run-code --filename=scripts/test-mobile-nav.js
async (page) => {
  const base = new URL(page.url()).origin;
  const results = [];
  const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);

  await page.setViewportSize({ width: 390, height: 844 });
  const links = ['Home', 'About', 'Events', 'Team', 'News', 'Contact', 'Join the chapter'];
  const paths = ['/', '/about/', '/events/', '/team/', '/news/', '/contact/', '/join/'];

  for (let i = 0; i < links.length; i++) {
    await page.goto(base + '/');
    const toggle = page.locator('[data-menu-toggle]');
    await toggle.click();
    const menu = page.locator('#mobile-menu');
    const open = (await toggle.getAttribute('aria-expanded')) === 'true' && (await menu.isVisible());
    await menu.getByRole('link', { name: links[i], exact: true }).click();
    // The wave page change navigates about half a second after the click.
    await page.waitForURL((u) => u.pathname === paths[i], { timeout: 5000 }).catch(() => {});
    await page.waitForLoadState('domcontentloaded');
    const path = new URL(page.url()).pathname;
    const current = await page.locator('#mobile-menu [aria-current="page"]').evaluateAll((els) => els.map((e) => e.textContent.trim()));
    check(`menu → ${links[i]}`, open && path === paths[i] && current.includes(links[i]), `${path}, current: ${current.join(',') || 'none'}`);
  }

  // Escape closes the menu and returns focus to the button.
  await page.goto(base + '/events/');
  await page.locator('[data-menu-toggle]').click();
  await page.keyboard.press('Escape');
  const closed = (await page.locator('[data-menu-toggle]').getAttribute('aria-expanded')) === 'false' && !(await page.locator('#mobile-menu').isVisible());
  const focused = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-toggle'));
  check('Escape closes menu, focus back on button', closed && focused);

  // Menu disappears when the window grows to desktop width.
  await page.locator('[data-menu-toggle]').click();
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.waitForTimeout(100);
  check('menu hidden at desktop width', !(await page.locator('#mobile-menu').isVisible()));
  await page.setViewportSize({ width: 390, height: 844 });

  // First Tab lands on the skip link, which moves focus to <main>.
  await page.goto(base + '/about/');
  await page.keyboard.press('Tab');
  const skip = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.keyboard.press('Enter');
  const mainFocused = await page.evaluate(() => document.activeElement?.id === 'main' || location.hash === '#main');
  check('skip link first, jumps to main', skip === 'Skip to content' && mainFocused, `first focus: ${skip}`);

  // Theme toggle switches and persists across reloads.
  await page.goto(base + '/');
  const before = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.locator('[data-theme-toggle]').click();
  const after = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.reload();
  const persisted = await page.evaluate(() => document.documentElement.dataset.theme);
  check('theme toggle switches and persists', before !== after && after === persisted, `${before} → ${after}, after reload ${persisted}`);
  await page.evaluate(() => localStorage.removeItem('theme'));

  // No horizontal scrolling at phone width on any page.
  for (const p of [...paths, '/credits/', '/events/2026-04-robotics-automation-challenge/', '/news/2026-06-design-contest/']) {
    await page.goto(base + p);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no sideways scroll ${p}`, overflow <= 0, overflow > 0 ? `${overflow}px` : '');
  }

  return results.join('\n');
}
