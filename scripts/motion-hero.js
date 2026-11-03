// Captures the hero motion (phasor wheel, rolling word), a pointer tilt and the
// scroll meter, with motion ON.
//   playwright-cli open http://127.0.0.1:4322/
//   playwright-cli run-code --filename=scripts/motion-hero.js
async (page) => {
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(new URL('/', page.url()).href);
  await page.waitForTimeout(2200);
  const out = [];
  for (let i = 0; i < 3; i++) {
    const file = `screenshots/hero-motion-${i}.png`;
    await page.screenshot({ path: file, clip: { x: 0, y: 380, width: 1440, height: 420 } });
    out.push(file);
    await page.waitForTimeout(2500);
  }
  // Tilt: hover a society tile off-centre
  await page.evaluate(() => document.querySelector('#societies')?.scrollIntoView());
  await page.waitForTimeout(1500);
  const tile = page.locator('.tile').nth(1);
  const box = await tile.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2);
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: 'screenshots/tilt.png' });
  out.push('screenshots/tilt.png');
  // Meter: halfway down the page
  await page.evaluate(() => scrollTo(0, (document.body.scrollHeight - innerHeight) / 2));
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/meter.png', clip: { x: 0, y: 0, width: 1440, height: 90 } });
  out.push('screenshots/meter.png');
  return out.join('\n');
}
