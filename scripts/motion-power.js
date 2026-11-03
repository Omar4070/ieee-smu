// Captures the power-on opening, the hero resonance and a click surge (motion ON).
//   playwright-cli open about:blank
//   playwright-cli run-code --filename=scripts/motion-power.js
async (page) => {
  const base = 'http://127.0.0.1:4322/';
  await page.emulateMedia({ reducedMotion: 'no-preference', colorScheme: 'light' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('about:blank');
  await page.evaluate(() => { try { sessionStorage.clear(); } catch {} });
  await page.goto(base);
  const out = [];
  const t0 = Date.now();
  for (const at of [250, 800, 1400, 1800, 2250, 2700, 3300]) {
    await page.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
    const file = `screenshots/power-${String(at).padStart(4, '0')}.png`;
    await page.screenshot({ path: file });
    out.push(file);
  }
  // Resonance: sweep the mouse quickly back and forth over the hero wave.
  const wave = await page.locator('.hero .wave').boundingBox();
  if (wave) {
    const y = wave.y + wave.height / 2;
    for (let k = 0; k < 6; k++) {
      await page.mouse.move(wave.x + 400, y - 30, { steps: 4 });
      await page.mouse.move(wave.x + 900, y + 30, { steps: 4 });
    }
    await page.mouse.move(wave.x + 700, y, { steps: 2 });
    await page.screenshot({ path: 'screenshots/resonance.png', clip: { x: 0, y: wave.y - 120, width: 1440, height: wave.height + 240 } });
    out.push('screenshots/resonance.png');
  }
  // Click surge on empty canvas
  await page.mouse.click(1200, 560);
  await page.waitForTimeout(260);
  await page.screenshot({ path: 'screenshots/surge.png', clip: { x: 1000, y: 380, width: 400, height: 360 } });
  out.push('screenshots/surge.png');
  return out.join('\n');
}
