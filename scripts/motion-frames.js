// Captures the home page with motion ON at several scroll positions, to check
// scroll-driven animations (photo reveals, filmstrip, wave dividers, count-up).
//   playwright-cli open http://127.0.0.1:4321/
//   playwright-cli run-code --filename=scripts/motion-frames.js
async (page) => {
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL('/', page.url()).href);
  await page.waitForTimeout(2600); // hero entrance: logo, phases drawing in
  await page.screenshot({ path: 'screenshots/motion-0-hero.png' });
  const targets = ['#societies', '#film-title', '#upcoming-title', '#stats-title'];
  const out = ['screenshots/motion-0-hero.png'];
  for (let i = 0; i < targets.length; i++) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 120);
    }, targets[i]);
    await page.waitForTimeout(1600);
    const file = `screenshots/motion-${i + 1}.png`;
    await page.screenshot({ path: file });
    out.push(file);
  }
  return out.join('\n');
}
