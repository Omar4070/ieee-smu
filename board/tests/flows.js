// End-to-end checks of the board app in demo mode. The demo starts with the committee alone, so
// every task, event and meeting here is created through the app first. Run against a build
// (see board/README.md → Checks):
//   playwright-cli open http://127.0.0.1:4322/board/
//   playwright-cli run-code --filename=board/tests/flows.js
async (page) => {
  const start = new URL(page.url());
  const root = start.origin + start.pathname; // …/board/
  const results = [];
  const errors = [];
  const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  // the confirm() before a delete or a reset: answer yes (playwright-cli holds native dialogs)
  await page.addInitScript(() => { window.confirm = () => true; });

  /** A calendar day `n` days from today, in local time ("2026-11-21"). */
  const day = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; // taste-skill-ignore: a date
  };
  const as = async (id, route = '/') => {
    await page.goto(`${root}?as=${id}#${route}`);
    await page.locator('h1').first().waitFor();
  };
  const toast = (re) => page.locator('.toast').filter({ hasText: re }).first().waitFor({ timeout: 4000 }).then(() => true, () => false);
  const dlg = () => page.locator('dialog[open]');

  await page.setViewportSize({ width: 1440, height: 900 });

  // fresh demo: the committee and nothing else
  await page.goto(root);
  await page.evaluate(() => { localStorage.clear(); indexedDB.deleteDatabase('board-demo-files'); });
  await page.goto(root);

  // ---- sign-in: the demo picker lists the committee
  await page.locator('.picker button').first().waitFor();
  check('the picker lists the seven committee members', (await page.locator('.picker button').count()) === 7);
  await page.getByRole('button', { name: /Hedi Ennaifer/ }).click();
  await page.getByRole('heading', { level: 1, name: 'This week' }).waitFor();
  check('a fresh board starts empty', await page.getByText('Nothing on your list.').isVisible() && await page.getByText('Nothing planned yet').isVisible());

  // ---- This week: add a task for yourself, see it late, tick it off
  const mine = page.locator('section', { has: page.locator('#mine-h') });
  await mine.getByLabel('New task', { exact: true }).fill('Send the sponsorship letter');
  await mine.getByLabel('Due', { exact: true }).fill(day(-1));
  await mine.getByRole('button', { name: 'Add' }).click();
  const letter = mine.locator('.task').filter({ hasText: 'Send the sponsorship letter' });
  check('quick add puts the task on your list', await letter.isVisible());
  check('a task past its date shows as late', (await letter.locator('.task-due').textContent()).includes('late') && (await letter.locator('.task-due.late').count()) === 1);
  await letter.getByRole('checkbox').click();
  check('a ticked task stays, struck through', await mine.locator('.task.is-done').filter({ hasText: 'Send the sponsorship letter' }).isVisible());

  // ---- Tasks: give one to someone else, filter, edit, delete
  await page.getByRole('link', { name: 'Tasks' }).first().click();
  await page.getByRole('heading', { level: 1, name: 'Tasks' }).waitFor();
  const todo = page.locator('section', { has: page.locator('#todo-h') });
  await todo.getByLabel('New task', { exact: true }).fill('Print the workshop handouts');
  await todo.getByLabel('For', { exact: true }).selectOption({ label: 'Walid Fakhfakh' });
  await todo.getByLabel('Due', { exact: true }).fill(day(3));
  await todo.getByRole('button', { name: 'Add' }).click();
  const row = todo.locator('.task').filter({ hasText: 'Print the workshop handouts' });
  check('a task can be given to someone else', (await row.locator('.task-owner').textContent()).includes('Walid'));
  await page.getByLabel('Show', { exact: true }).selectOption({ label: 'Walid Fakhfakh' });
  check('the Show filter narrows to one person', (await todo.locator('.task').count()) === 1);
  await page.getByLabel('Show', { exact: true }).selectOption({ label: 'Everyone' });
  await row.getByRole('button', { name: 'Print the workshop handouts' }).click();
  await dlg().getByLabel('Due', { exact: true }).fill(day(5));
  await dlg().getByRole('button', { name: 'Save' }).click();
  check('editing a task saves it', await toast(/Task saved/));
  await row.getByRole('button', { name: 'Print the workshop handouts' }).click();
  await dlg().getByRole('button', { name: 'Delete' }).click();
  check('deleting a task removes it', await toast(/Task deleted/) && (await row.count()) === 0);

  // ---- Events: add one close to its date, see the flag, announce it
  await page.getByRole('link', { name: 'Events' }).first().click();
  await page.getByRole('heading', { level: 1, name: 'Events' }).waitFor();
  await page.getByRole('button', { name: 'Add event' }).click();
  await dlg().getByLabel('Event name', { exact: true }).fill('Build a buck converter in one afternoon');
  await dlg().getByLabel('Date', { exact: true }).fill(day(2));
  await dlg().getByLabel('Ambassador', { exact: true }).selectOption({ label: 'Zayneb Sassi' });
  await dlg().getByRole('button', { name: 'Add event' }).click();
  const ev = page.locator('tr').filter({ hasText: 'Build a buck converter' });
  check('a new event is listed', await ev.isVisible());
  check('a close, unannounced event is flagged', (await page.locator('.title-row .late').textContent()).includes('Announce') && (await ev.locator('.pill').textContent()) === 'Not announced');
  await ev.getByRole('button', { name: /Build a buck converter/ }).click();
  await dlg().getByRole('button', { name: 'Announced' }).click();
  await dlg().getByRole('button', { name: 'Save' }).click();
  check('announcing it clears the flag', (await ev.locator('.pill').textContent()) === 'Announced' && (await page.locator('.title-row .late').count()) === 0);

  // ---- Meetings: add one, take attendance, upload the PV; a past one without PV is flagged
  await as('m-5', '/meetings');
  check('no meetings yet on a fresh board', await page.getByText('No meetings yet').isVisible());
  await page.getByRole('button', { name: 'Add meeting' }).click();
  await dlg().getByRole('button', { name: 'Add meeting' }).click();
  await page.getByRole('heading', { name: 'Attendance' }).waitFor();
  const meetingRoute = new URL(page.url()).hash.slice(1);
  check('a new meeting opens its page', /^\/meetings\//.test(meetingRoute), meetingRoute);
  await page.getByRole('button', { name: /Mark the other 7 present/ }).click();
  check('one tap marks everyone present', (await page.locator('.segmented.presence button.present[aria-pressed="true"]').count()) === 7);
  const walid = page.getByRole('group', { name: 'Walid Fakhfakh: attendance' });
  await walid.getByRole('button', { name: 'Absent' }).click();
  check('a mark can be changed', (await walid.getByRole('button', { name: 'Absent' }).getAttribute('aria-pressed')) === 'true');
  await page.locator('input[type=file]').setInputFiles({ name: 'PV board meeting.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 test') });
  check('the PV uploads', await toast(/PV uploaded/) && await page.getByText('PV board meeting.pdf').isVisible());
  await page.locator('a.back').click();
  await page.getByRole('heading', { level: 1, name: 'Meetings' }).waitFor();
  await page.getByRole('button', { name: 'Add meeting' }).click();
  await dlg().getByLabel('Date', { exact: true }).fill(day(-7));
  await dlg().getByRole('button', { name: 'Add meeting' }).click();
  await page.getByRole('heading', { name: 'Attendance' }).waitFor();
  await page.locator('a.back').click();
  await page.getByRole('heading', { level: 1, name: 'Meetings' }).waitFor();
  check('the list shows who was missing', await page.locator('td.hide-sm').filter({ hasText: 'Walid (absent)' }).isVisible());
  check('a past meeting without a PV is flagged', await page.locator('.pill.warn', { hasText: 'Missing' }).isVisible());
  const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export attendance' }).click()]);
  check('the attendance export downloads a CSV', /board-attendance-.*\.csv$/.test(file.suggestedFilename()), file.suggestedFilename());

  // ---- Team: an admin adds someone and gets an invite code; a member cannot
  await as('m-6', '/team');
  check('no invented emails: a dash until one is added', (await page.locator('tbody tr').first().locator('td').nth(1).textContent()).trim() === '–');
  await page.getByRole('button', { name: 'Add member' }).click();
  await dlg().getByLabel('Full name', { exact: true }).fill('Test Person');
  await dlg().getByLabel('Role', { exact: true }).fill('Sponsorship officer');
  await dlg().getByLabel('Email', { exact: true }).fill('test.person@example.org');
  await dlg().getByRole('button', { name: 'Add member' }).click();
  await page.locator('dialog[open] .code').waitFor({ timeout: 4000 }).catch(() => {});
  const code = ((await page.locator('dialog[open] .code').textContent().catch(() => '')) ?? '').trim();
  check('adding a member gives an invite code', /^[A-Z0-9]{8}$/.test(code), code);
  await dlg().getByRole('button', { name: 'Done' }).click();
  check('the new member is listed', await page.locator('tr').filter({ hasText: 'Test Person' }).isVisible());
  await page.locator('tr').filter({ hasText: 'Youssef Bousnina' }).getByRole('button', { name: 'Youssef Bousnina' }).click();
  await dlg().getByRole('button', { name: /Reset login/ }).click();
  check('a login reset gives a new code', await page.locator('dialog[open] .code').isVisible());
  await page.keyboard.press('Escape');
  await as('m-4', '/team');
  check('members do not see Add member', (await page.getByRole('button', { name: 'Add member' }).count()) === 0);

  // ---- account menu: dark mode
  await page.locator('.account-button').click();
  await page.getByRole('button', { name: 'Dark mode' }).click();
  check('dark mode switches', (await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark');
  await page.getByRole('button', { name: 'Light mode' }).click(); // the menu stays open

  // ---- phone: the bottom bar, the install line, no sideways scroll anywhere
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.removeItem('board-install-hint'));
  await as('m-1', '/');
  const bar = await page.locator('.nav').boundingBox();
  check('on a phone the screens sit in a bottom bar', bar && bar.y > 700, bar ? `y=${Math.round(bar.y)}` : 'none');
  check('on a phone This week offers to install the app', await page.locator('.install-hint').isVisible());
  await page.getByRole('button', { name: 'Add it' }).click();
  check('without a browser prompt it shows the steps', await dlg().getByRole('heading', { name: /home screen/ }).isVisible());
  await dlg().getByRole('button', { name: 'Done' }).click();
  for (const route of ['/', '/tasks', '/events', '/meetings', meetingRoute, '/team']) {
    await as('m-6', route);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(`no sideways scroll on #${route}`, over <= 0, `${over}px`);
  }

  check('no script errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  return results.join('\n');
}
