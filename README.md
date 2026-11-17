# IEEE IAS/IES/PES Joint Chapter website (SMU Student Branch)

The website of the IEEE Industry Applications (IAS), Industrial Electronics (IES) and Power & Energy
(PES) societies joint chapter of the SMU Student Branch.

It is a static site built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
All content (events, news, the team) lives in plain text files in `src/content/`. You can update the
site without touching any code, and every push to `main` publishes it automatically to GitHub Pages.

**The easiest way to edit is the dashboard at `/admin/`** (see below): forms for events, news, the
team and the chapter details, with photo upload. The sections after it explain the same files for
editing by hand.

---

## Contents

0. [The dashboard: edit without code](#the-dashboard-edit-without-code)
1. [Run the site on your computer](#1-run-the-site-on-your-computer)
2. [Where things are](#2-where-things-are)
3. [Add an event](#3-add-an-event)
4. [Add news](#4-add-news)
5. [Update the team / add a new year's committee](#5-update-the-team--add-a-new-years-committee)
6. [Change chapter details, links and texts](#6-change-chapter-details-links-and-texts)
7. [Publish your changes](#7-publish-your-changes)
8. [First-time deployment to GitHub Pages](#8-first-time-deployment-to-github-pages)
9. [Quality checks](#9-quality-checks)
10. [Design rules](#10-design-rules)
11. [Troubleshooting](#11-troubleshooting)
12. [The board app](#12-the-board-app)

---

## The dashboard: edit without code

The site has a dashboard ([Sveltia CMS](https://github.com/sveltia/sveltia-cms), free, nothing to
install on a server) at **`/admin/`**, for example `https://<your-site>/admin/`. The menu on the
left has the content first, then one page per group of chapter facts:

| Section | What you can do |
|---|---|
| **Events** | Add, edit or delete events: name, dates, time, place, kind, societies, short description, cover photo, registration link, full description and the photos from the event. Newest first, with photo and date; filter by kind or group by year |
| **News** | Add, edit or delete news items; filter by category |
| **Team** | One entry per mandate: role, name, photo and LinkedIn of each person; drag people to reorder. For a new mandate, open last year’s entry, choose **Duplicate** in its menu (⋮) and change the names |
| **Chapter details** | Chapter name, short name, tagline, university, student branch, IEEE section and region, city, country, founding year |
| **Contact details** | Chapter email, social media links, postal address and the place the Contact page map shows |
| **Home page numbers** | Members and events last year |
| **Our history** | The milestones on the About page |
| **Website setup** | Rarely needed: the description for search engines, the time zone and the contact form ID |

Fields marked `*` are required; the hint under each field says what to enter, and the dashboard
refuses to save a field it cannot accept (for example a link without `https://`). Press **Save** or
`Ctrl + S`. Photos you upload go into the right folder (`src/assets/events`, `news` or `team`)
automatically. The buttons follow your browser’s language; change it under your profile icon
(top right) → **Settings**.

**Two ways to sign in**

1. **Online (after the site is on GitHub).** Open `/admin/` on the published site, choose
   **Sign in with access token**, and paste a GitHub token:
   GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** →
   *Generate new token* → *Only select repositories* → this repository → *Repository permissions* →
   **Contents: Read and write**. Every **Save** becomes a commit on `main`, and the site is rebuilt and
   published about two minutes later (watch the **Actions** tab). Each officer who edits the site
   needs to be a collaborator on the repository and make their own token.
2. **On your computer (works now).** Run `npm run dev`, open <http://localhost:4321/admin/index.html>
   in **Chrome or Edge**, choose **Work with local repository** and select the project folder. Saves
   write straight into the files; the site at <http://localhost:4321> updates immediately. Publish
   them as usual ([section 7](#7-publish-your-changes)).

**One-time setup:** once the repository is on GitHub, put its name in `public/admin/config.yml`
(`repo: your-account/your-repository`, replacing the `TODO` line) and push.

Pages with longer fixed texts (mission, vision, the Join steps, the society descriptions) and the
design are still edited in the code (see [section 6](#6-change-chapter-details-links-and-texts)).

## 1. Run the site on your computer

You need **Node.js 22.23 or newer** (version 24 LTS recommended: <https://nodejs.org>) and **Git**
(<https://git-scm.com>).

```bash
git clone https://github.com/<your-account>/<repository>.git
cd <repository>
npm install        # once, downloads the tools (takes a minute)
npm run dev        # starts the site at http://localhost:4321
```

Leave `npm run dev` running: the page in your browser reloads every time you save a file. Stop it
with `Ctrl + C`.

To see exactly what will be published:

```bash
npm run build      # checks for mistakes and builds the site into dist/
npm run preview    # serves dist/ at http://localhost:4321
```

## 2. Where things are

```
src/
  content/
    events/        one .md file per event        ← you edit these
    news/          one .md file per news item    ← and these
    team/          one .json file per committee year
  config/
    chapter.json   chapter name, university, IEEE section and region, founding year (dashboard: Chapter details)
    contact.json   email, social links, address, map (dashboard: Contact details)
    numbers.json   the home page numbers (dashboard: Home page numbers)
    history.json   the About page milestones (dashboard: Our history)
    website.json   search description, time zone, Formspree ID (dashboard: Website setup)
    site.ts        reads the five files above; logo paths and the menu
    societies.ts   texts about IES, IAS and PES, their logos
  assets/          photos (put new ones in assets/events, assets/news, assets/team)
  pages/           one file per page (About, Join, Contact…)
  components/      building blocks shared by pages (header, footer…)
  styles/global.css  colours, type sizes, buttons
public/            files copied as-is (favicon, logos in public/logos/, the dashboard in public/admin/)
board/             the board's own app (events, tasks, meetings, attendance, PVs), published at /board/
DESIGN.md          the design system: colours, type, spacing, rules
```

## 3. Add an event

1. Put the cover photo in `src/assets/events/` (create the folder the first time). Use a JPG at least
   1600 px wide. The site resizes and compresses it automatically.
2. Create a new file in `src/content/events/`. The file name becomes the web address, so use the date
   and a few words, lowercase with dashes: `2027-03-smart-grid-talk.md` becomes `/events/2027-03-smart-grid-talk/`.
3. Copy this template into it and fill it in:

```markdown
---
title: "Smart grids explained"
date: 2027-03-14
time: "18:00–19:30"            # optional
type: Talk                     # Workshop, Conference, Industrial visit, Competition, Talk or Social
societies: [PES]               # one or more of PES, IES, IAS, Joint
location: "Amphitheatre B, Faculty of Electrical Engineering"
summary: "One or two sentences shown on cards and in search results (220 characters at most)."
cover: ../../assets/events/smart-grid-talk.jpg
coverAlt: "Describe what the photo shows, for people who cannot see it"
registrationUrl: "https://forms.gle/..."   # optional, shows a Register button while the event is upcoming
# endDate: 2027-03-15          # optional, for events over several days
---

Write the description here in normal text.

## A heading

- A list item
- Another one with **bold** words and a [link](https://example.com)
```

**After the event**, add photos to the same file to build its gallery:

```yaml
gallery:
  - src: ../../assets/events/smart-grid-talk-1.jpg
    alt: "Students around the demo grid model"
  - src: ../../assets/events/smart-grid-talk-2.jpg
    alt: "The speaker answering questions"
```

Events move from "Upcoming" to "Past events" automatically the day after they end (the site is rebuilt
every night). Each upcoming event also gets an "Add to calendar" button.

## 4. Add news

Create `src/content/news/2027-04-award-name.md`:

```markdown
---
title: "Short headline, one line if possible"
date: 2027-04-02
category: Award                # Award, Competition or Announcement
summary: "One or two sentences for the news list."
cover: ../../assets/news/award-photo.jpg     # optional
coverAlt: "What the photo shows"             # needed if there is a cover
---

The full story, in normal text.
```

The newest item is featured at the top of the News page.

**Linking to another page of the site from an event or news text:** use a relative link that starts
from the page's own address, for example `[our team](../../team/)` or `[the workshop](../../events/2027-03-smart-grid-talk/)`.
A link starting with `/` would break when the site lives at `github.io/<repository>/`.

## 5. Update the team / add a new year's committee

Each committee year is one file in `src/content/team/`, for example `2027-2028.json`. The newest file is
shown as the current board, drawn as a power-system diagram (Chair and Vice-Chair at the top, the
other officers hanging from a busbar with live current). Older files stay on the page as "Past committees".

**To fill a seat that is waiting for a photo:** put the photo in `src/assets/team/` (portrait, 4:5, at
least 800 px wide, face in the upper half), then add `name` and `photo` to that member in the JSON
file. Until then the seat shows a coloured "Photo coming soon" panel.

To start a new year, copy last year's file, rename it, and edit it:

```json
{
  "year": "2027–2028",
  "members": [
    {
      "name": "First Last",
      "role": "Chair",
      "lead": true,
      "society": "PES",
      "photo": "../../assets/team/first-last.jpg",
      "linkedin": "https://www.linkedin.com/in/their-profile"
    }
  ]
}
```

- `role` is required. `name`, `photo`, `society` (PES, IES or IAS, shown as the society's logo) and
  `linkedin` are optional; leave `name` out while a seat is not announced yet.
- `"lead": true` puts the member at the top of the diagram (use it for the Chair and Vice-Chair).
- Photos: portrait (4:5), at least 800 px wide. Ask each member's permission before publishing
  their photo.
- Watch the commas: every member block except the last ends with `},`.

## 6. Change chapter details, links and texts

| What | Where |
|---|---|
| Chapter name, university, city, founding year | Dashboard → Chapter details (file `src/config/chapter.json`) |
| Email, social links, postal address, map location (Contact page) | Dashboard → Contact details (`src/config/contact.json`) |
| Home page numbers | Dashboard → Home page numbers (`src/config/numbers.json`) |
| Contact form ID | Dashboard → Website setup (`src/config/website.json`), see below |
| Chapter logo | `public/logos/chapter-logo.png` (colour) and `chapter-logo-white.png` (for black backgrounds); originals in `assets/brand/` |
| Society logos and texts | `src/config/societies.ts`, logo files in `public/logos/` |
| About page history milestones | Dashboard → Our history (`src/config/history.json`) |
| About page texts (mission, vision) | `src/pages/about.astro` |
| Join page texts | `src/pages/join.astro` |
| Colours, fonts, spacing | `src/styles/global.css` (read `DESIGN.md` first) |
| Favicon and social preview image | run `node scripts/generate-icons.mjs` after changing the logo or colours |

**Contact form (Formspree).** The form needs a free [Formspree](https://formspree.io) account:

1. Sign up with the chapter email and create a new form.
2. Copy its ID: the part after `https://formspree.io/f/`, for example `xyzabcd`.
3. Paste it into **Contact form ID** in the dashboard (Website setup), or set `"formspreeId": "xyzabcd"` in `src/config/website.json`.

Until then, the form tells visitors to email you instead.

**Photos from Wikimedia Commons.** The current photos of turbines, motors and robots are openly
licensed pictures credited on `/credits/` (data in `src/data/image-credits.json`). If you remove one,
also remove its entry from that file; if you add a found photo, add its credit.

## 7. Publish your changes

```bash
git add .
git commit -m "Add smart grid talk"
git push
```

That's all. GitHub builds and publishes the site in about two minutes (watch the **Actions** tab). If
the build fails, the old site stays online, and the Actions log says which file has the problem.

No Git on your computer? You can also edit or upload files directly on github.com (open the file,
click the pencil icon, then **Commit changes**). The site is rebuilt the same way.

## 8. First-time deployment to GitHub Pages

Done once, by whoever sets up the repository:

1. Create a new repository on <https://github.com/new> (public, without a README).
2. Push this project to it:
   ```bash
   git remote add origin https://github.com/<your-account>/<repository>.git
   git push -u origin main
   ```
3. On GitHub, open **Settings → Pages**, and under **Build and deployment → Source** choose
   **GitHub Actions**.
4. Open the **Actions** tab. If the first "Deploy to GitHub Pages" run failed because Pages was not
   enabled yet, click it and choose **Re-run all jobs**.
5. The site appears at `https://<your-account>.github.io/<repository>/`.

The workflow (`.github/workflows/deploy.yml`) reads the address from GitHub, so links work at that
address and on a custom domain alike.

**Custom domain (optional):** in **Settings → Pages → Custom domain**, enter for example
`ieee-pes.university.edu`, then ask your university IT to point that name to GitHub Pages
([instructions](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)).

## 9. Quality checks

| Command | What it checks |
|---|---|
| `npm run build` | TypeScript/template errors, content mistakes (missing date, wrong society…), then builds |
| `npm run check:links` | after a build: every internal link, image and anchor exists |
| `bash scripts/screenshots.sh http://127.0.0.1:4321 / /events/` | screenshots at 1440, 768 and 390 px in light and dark themes (needs `playwright-cli`) |
| `node scripts/slice-screenshots.mjs screenshots/*.png` | cuts long screenshots into readable sheets |
| `bash scripts/console-check.sh http://127.0.0.1:4321 / /about/` | browser console errors |
| `playwright-cli run-code --filename=scripts/test-mobile-nav.js` | mobile menu, keyboard, theme toggle, no sideways scroll |
| `playwright-cli run-code --filename=scripts/test-a11y.js` | axe-core accessibility audit, both themes |

The two `run-code` tests need a browser open on the site first:
`playwright-cli open http://127.0.0.1:4321/`. Install the CLI with `npm install -g @playwright/cli@latest`.

## 10. Design rules

The look is described in `DESIGN.md`. The short version:

- One typeface (Montserrat), one accent colour (IEEE Blue `#00629B`) for buttons and links.
- Each society has its colour from the chapter palette: **IAS green** `#0a792d`, **IES orange**
  `#ed5703`, **PES blue** `#093f7a`; the chapter itself is black, and SMU blue `#00629b` is for
  buttons and links. Societies always appear in the logo's order: IAS, IES, PES.
- The logo's three-colour wave is the chapter's motif (header mark, home page waveform).
- Flat colours and softly rounded corners (16px cards, 10px buttons): no gradients, no shadows, no thin divider lines.
- Headings stay short: two lines at most, on a phone too.
- Every photo needs a real `alt` description.

## 11. Troubleshooting

- **`npm run build` fails with a content error.** Read the message: it names the file and field, for
  example `events → 2027-03-smart-grid-talk.md: date: Invalid date`. Dates are `YYYY-MM-DD`;
  `societies` must be in square brackets; the photo path must point to an existing file.
- **A photo does not appear.** Check the path is relative to the content file
  (`../../assets/events/...`) and the file name matches exactly, including upper/lower case.
- **Styles look wrong in `npm run dev` after adding a new page.** Stop the dev server (`Ctrl + C`)
  and start it again.
- **The site works locally but not on GitHub Pages.** Make sure every internal link in a page uses the
  `url()` helper (`href={url('/events/')}`), never a bare `href="/events/"`.

---

Built with Astro, Tailwind CSS and Montserrat (SIL Open Font License). Photographs from Wikimedia
Commons are credited on the Image credits page. IEEE and the society names are trademarks of IEEE.

## 12. The board app

Next to the website, the board has its own small app at `<site>/board/` to run the team: everyone's
tasks with deadlines, the incoming events with their ambassador and whether they are announced,
meeting attendance with each meeting's PV, and the list of board members. Board members sign in with
the invite code an admin gives them. It runs as a demo on sample data until it is connected to its
free database; setup and day-to-day use are in [`board/README.md`](board/README.md).
