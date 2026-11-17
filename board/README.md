# Chapter board

A small app to run the board: who has to do what, which events are coming, who came to the
meetings, and who is on the board. Every board member signs in; everyone sees and edits the same
lists.

| Screen | What it is for |
|---|---|
| **This week** | Your tasks (tick them off, add one in a line) and what is coming up: the next meeting and the next events. |
| **Tasks** | Everyone's tasks, with who and when. Late ones are in red. Filter by person. |
| **Events** | Incoming events with date, ambassador and status (Planning, Announced, Cancelled). An event less than 4 days away and still not announced is flagged. |
| **Meetings** | Every meeting with who was missing and its PV. One tap per person for attendance, one button to export the attendance for HR. |
| **Team** | The board with each person's attendance and open tasks. Admins add people and give out invite codes. |

It costs nothing: the app is published with the website on GitHub Pages (at `<site>/board/`), and
the data lives in a free [Supabase](https://supabase.com) project (database, logins and PV files).

---

## Try it now (demo)

Until it is connected to Supabase, the app runs as a demo saved only in your browser. It starts
with the committee and their roles (from the website's Team page) and nothing else: add tasks,
events and meetings to try it. Pick anyone on the first screen.

```bash
cd board
npm install
npm run dev          # http://localhost:5174
```

Add `?as=m-3` to the address to open the demo as one person (`m-1` Chair … `m-7`).
**Account menu → Reset the demo** empties it again.

---

## Connect it for real (once, about 15 minutes)

**Already done for the chapter (November 2026):** the Supabase project is `ieee-smu-board`
(Frankfurt), its address and public key are in `.github/workflows/deploy.yml`, and the live app
is at <https://omar4070.github.io/ieee-smu/board/>. The steps below are for setting it up again
(a new project, or another chapter).

1. **Create the project.** Sign up at <https://supabase.com> (free plan) → **New project**. Pick the
   region closest to Tunisia (Frankfurt or Paris) and save the database password somewhere safe.
2. **Create the tables.** In the project: **SQL editor → New query**, paste the whole of
   [`supabase/schema.sql`](supabase/schema.sql) and press **Run**. It should end with "Success".
3. **Switch off email confirmation.** **Authentication → Sign In / Providers → Email**: turn off
   **Confirm email** and save. (The app uses invite codes instead of emails.)
4. **Make yourself the first admin.** Open [`supabase/first-admin.sql`](supabase/first-admin.sql),
   put your email and name in it, paste it in a new SQL query and run it.
5. **Give the app its address and key.** **Project settings → API** (or **API keys**): copy the
   **Project URL** and the **anon** (or **publishable**) key.
   - On GitHub: **Settings → Secrets and variables → Actions → Variables → New repository variable**:
     `SUPABASE_URL` and `SUPABASE_ANON_KEY`. The next deploy publishes the connected app.
   - On your computer: copy `board/.env.example` to `board/.env` and fill in the same two values.
   The anon key is meant to be public: what each person may do is enforced by the rules in
   `schema.sql`, not by hiding the key.
   - **Without GitHub:** put the two values in `board/.env`, run `npm run build` in `board/`, then
     drag the `board/dist` folder onto <https://app.netlify.com/drop> (free account). You get an
     address like `your-name.netlify.app` (rename it under Site settings). To update the app later,
     build again and drag the new `dist` folder onto the site's **Deploys** page.
6. **Sign in.** Open `<site>/board/` → **First time here?** → your email, the code `BOARD2026` and a
   password.
7. **Add the board.** **Team → Add member** for each person, with the email they will use. The app
   shows their invite code and a message to send them privately.

### Everyone sees the same board

The app reloads the board by itself when someone comes back to it (phone unlocked, tab reopened,
connection back) and every minute while it is open, so other people's changes show up without a
refresh.

### On everyone's phone

The app installs like a phone app, with its own icon, full screen and no browser bar. Each person
opens the link once and either taps **Add it** on the line that appears on **This week**, or uses
**account menu → Add to home screen**. Android and computers get the browser's install prompt;
iPhones get the steps (Safari → Share → Add to Home Screen). Only people an admin added can sign
in; anyone else who finds the address sees the sign-in screen and nothing more.

### Who can do what

Everyone on the board can add and change tasks, events, meetings, attendance and PVs.
**Admins** (tick "Admin" on a person) can also add people, change them and reset logins.
Someone who leaves: open them on **Team** and tick **Has left the board**. They can no longer sign
in, and their history stays.

### Forgotten password

**Team** → the person → **Reset login**, then send them the new invite code. Their tasks and
attendance are kept. (If the reset ever fails, delete their user in Supabase under
**Authentication → Users**, then use **New code** on the same screen.)

---

## Day to day

- **At each meeting:** open it on **Meetings**, tap Present / Excused / Absent for each person
  (or **Mark the other … present**), and upload the PV afterwards.
- **For HR:** **Meetings → Export attendance** gives a spreadsheet of the whole mandate (opens in
  Excel and Google Sheets).
- **The free project sleeps** after a week with no activity. The nightly deploy sends it one small
  request to keep it awake; if it is ever paused anyway, open the Supabase dashboard and press
  **Restore**.
- **New mandate:** mark the leaving members as "Has left the board", add the new ones.

---

## For the next webmaster

```
board/
  src/
    App.tsx              sign-in and the screens (hash routes: #/tasks, #/meetings/<id>…)
    store.tsx            the board's data in memory and every action (save, tick, mark, upload…)
    lib/
      types.ts           one interface per table, matching supabase/schema.sql
      rules.ts           the few rules: late tasks, the 4-day announcement flag, attendance counts
      supabase-backend.ts / demo-backend.ts   the same interface, live or in the browser
      demo-data.ts       what the demo starts with: the committee and their roles
    pages/               one file per screen
    components/          the top bar, task rows and the shared pieces
    styles.css           every style (dark mode is the chapter's navy, never black)
    lib/install.ts, components/Install.tsx   "Add to home screen"
  public/
    manifest.webmanifest the app's name, icon and full-screen mode on phones
    sw.js                makes it installable and lets it open offline (network first, so
                         every upload is live at once)
    icons/               drawn by scripts/icons.mjs (run from the repository root)
  supabase/schema.sql    tables, access rules, sign-up check, PV storage
  tests/                 browser checks (below)
```

To change a table: update `supabase/schema.sql` (and run the change in the SQL editor),
`src/lib/types.ts`, and the sample data in `src/lib/demo-data.ts`.

### Checks

```bash
npx tsc --noEmit                                # types
BOARD_OUT_DIR=../dist/board npm run build       # into the website's build, as the deploy does
```

With the website built and served (`npm run build && npx astro preview --port 4322` in the root,
after building the board into `dist/board`). The tests run on the demo, so when `board/.env` holds
the live values, build with them blanked:
`VITE_SUPABASE_URL= VITE_SUPABASE_ANON_KEY= BOARD_OUT_DIR=../dist/board npx vite build`

```bash
playwright-cli open http://127.0.0.1:4322/board/
playwright-cli run-code --filename=board/tests/flows.js   # every screen's job, the phone bar, no sideways scroll
playwright-cli run-code --filename=board/tests/a11y.js    # axe-core on every screen, light and dark
```
