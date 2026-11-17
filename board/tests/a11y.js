// axe-core (WCAG 2.1 A/AA and best practice) on every screen of the board app, light and dark,
// signed in to the demo as an admin. The demo starts with the committee alone, so the empty
// screens are checked first, then a task, an event and a meeting are added and every screen is
// checked again with data. Run against a build:
//   playwright-cli open http://127.0.0.1:4322/board/
//   playwright-cli run-code --filename=board/tests/a11y.js
async (page) => {
  const start = new URL(page.url());
  const root = start.origin + start.pathname;
  const out = [];
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.addInitScript(() => { window.confirm = () => true; });

  async function scan(label) {
    await page.waitForTimeout(150);
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    const violations = await page.evaluate(async () => {
      const r = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
      return r.violations.map((v) => `${v.id} (${v.impact}, ${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
    });
    out.push(`${violations.length ? 'FAIL' : 'PASS'}  ${label}${violations.length ? `\n      ${violations.join('\n      ')}` : ''}`);
  }
  const open = async (route) => {
    await page.goto(`${root}?as=m-6#${route}`);
    await page.locator('h1').first().waitFor();
  };
  const screens = ['/', '/tasks', '/events', '/meetings', '/team'];

  // a fresh board
  await page.goto(root);
  await page.evaluate(() => { localStorage.clear(); indexedDB.deleteDatabase('board-demo-files'); });
  for (const theme of ['light', 'dark']) {
    await page.goto(root);
    await page.evaluate((t) => { localStorage.setItem('board-theme', t); localStorage.removeItem('board-demo-session'); }, theme);
    await page.goto(root);
    await page.locator('h1').first().waitFor();
    await scan(`${theme} sign-in`);
    for (const route of screens) { await open(route); await scan(`${theme} empty #${route}`); }
  }

  // add a task, an event and a meeting with attendance
  await open('/');
  await page.getByLabel('New task', { exact: true }).fill('Send the sponsorship letter');
  await page.getByRole('button', { name: 'Add' }).click();
  await open('/events');
  await page.getByRole('button', { name: 'Add event' }).click();
  await page.locator('dialog[open]').getByLabel('Event name', { exact: true }).fill('Build a buck converter in one afternoon');
  await page.locator('dialog[open]').getByLabel('Date', { exact: true }).fill('2030-01-15');
  await page.locator('dialog[open]').getByRole('button', { name: 'Add event' }).click();
  await open('/meetings');
  await page.getByRole('button', { name: 'Add meeting' }).click();
  await page.locator('dialog[open]').getByRole('button', { name: 'Add meeting' }).click();
  await page.getByRole('heading', { name: 'Attendance' }).waitFor();
  const meeting = new URL(page.url()).hash.slice(1);
  await page.getByRole('button', { name: /Mark the other/ }).click();

  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => localStorage.setItem('board-theme', t), theme);
    for (const route of [...screens, meeting]) { await open(route); await scan(`${theme} #${route}`); }
    // the install steps dialog, from the account menu
    await open('/');
    await page.locator('.account-button').click();
    await page.getByRole('button', { name: 'Add to home screen' }).click();
    await page.locator('dialog[open]').waitFor();
    await scan(`${theme} install steps`);
  }
  return out.join('\n');
}
