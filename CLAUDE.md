# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Static website (Astro 7 + Tailwind CSS 4, no backend) for the IEEE IAS/IES/PES joint chapter of the SMU Student Branch, deployed to GitHub Pages. Content is edited by non-developer chapter officers, so content files and `README.md` recipes must keep working.

## Commands

```bash
npm run dev            # dev server, http://localhost:4321
npm run build          # astro check (types + content schemas) then astro build → dist/
npm run preview        # serve dist/
npm run check:links    # after a build: every internal href/src/srcset/#anchor in dist/ must exist
                       # (set BASE_PATH=/repo when the build used a base path)
node .claude/skills/design-taste-frontend/scripts/lint.mjs src          # banned design patterns in source
node .claude/skills/design-taste-frontend/scripts/inspect.mjs <url>     # real-browser design gate, 1440/768/390
bash scripts/screenshots.sh http://127.0.0.1:4321 /path/ [/path2/ …]   # full-page shots, 3 widths × light/dark → screenshots/
node scripts/slice-screenshots.mjs screenshots/<file>.png               # cut long shots into readable sheets
bash scripts/console-check.sh http://127.0.0.1:4321 /path/              # browser console errors
playwright-cli open <url> && playwright-cli run-code --filename=scripts/test-mobile-nav.js   # nav/keyboard/theme/overflow
playwright-cli open <url> && playwright-cli run-code --filename=scripts/test-a11y.js         # axe-core, both themes (loads axe from cdnjs)
```

There is no unit-test suite; the tests are the playwright-cli scripts above (run one by opening a browser on the page, then `run-code` with that file). Run the final design/a11y gates against `npm run preview` (production build), not the dev server.

On Windows Git Bash, prefix commands that pass a path-like env var with `MSYS_NO_PATHCONV=1` (e.g. `BASE_PATH=/repo npx astro build`), otherwise Bash rewrites it to `C:/Program Files/Git/repo`.

## Architecture

- **Content collections** (`src/content.config.ts`, Zod from `astro/zod`, Zod 4 so `z.url()` not `z.string().url()`): `events/*.md`, `news/*.md`, `team/*.json` (one file per committee year; the file sorting last by id is the "current" committee). Images in frontmatter use the `image()` helper with paths relative to the content file (`../../assets/...`). Schema enums (event `type`, `societies`, news `category`) are documented in README, so update both together.
- **`src/lib/utils.ts`** is the shared data layer: `getEvents()` splits upcoming/past using *build time* "today" (the deploy workflow rebuilds nightly so events roll into the archive), `getNews()`, `getTeams()`, date formatting via `Intl` in UTC, `fieldFor(society)` → colour class.
- **Base path:** the site may be served from `https://user.github.io/<repo>/`. `astro.config.mjs` reads `SITE_URL`/`BASE_PATH` (set by the workflow from `actions/configure-pages`). Every internal link in `.astro` files must go through `url('/path/')` from `utils.ts`; never write a bare `href="/..."`. Links inside Markdown content must be relative (`../../team/`).
- **Config, not code, for chapter facts:** `src/config/settings.json` (names, email, socials, stats, map, `formspreeId`, About-page `history`), spread into `site` by `src/config/site.ts` (which adds logo paths and nav), and `src/config/societies.ts` (societies, texts). Remaining placeholders: example email/links, `TODO_FORMSPREE_ID`.
- **Dashboard:** Sveltia CMS at `/admin/` (`public/admin/index.html` loads it from unpkg at a pinned version; `public/admin/config.yml`). Its fields mirror `src/content.config.ts` and `settings.json`: change a schema, enum or settings key and update `config.yml` too. `output.omit_empty_optional_fields` drops empty optional fields, so code must tolerate missing optional keys (see `mapEmbedUrl` in `site.ts`). `backend.repo` is a TODO until the repo is on GitHub; locally it works via "Work with local repository" (Chrome/Edge, `npm run dev` → `/admin/index.html`).
- **Layout:** `BaseLayout.astro` (SEO/OG meta, pre-paint theme script setting `html[data-theme]`, font preload, reveal script) → `Header` / page / `Footer`. Inner pages start with `PageHeader` (props `field`, `size: 'lg'|'md'`, optional `image`). Home sections live in `src/components/home/`.
- **Event extras:** `src/pages/events/[slug].ics.ts` generates an all-day calendar file per event; the past-events "index with preview" on `events/index.astro` is CSS-only (`:has()`), no JS.
- **Contact form:** posts to Formspree; the inline script progressively enhances it and shows a fallback message while `formspreeId` still starts with `TODO`.
- **Found photos** in `src/assets/found/` are open-licence Wikimedia Commons images; their credits are in `src/data/image-credits.json` and rendered on `/credits/`. Adding or removing a found photo means updating that JSON.

## Styling gotchas

- Design tokens are CSS variables in `src/styles/global.css` (`:root` and `:root[data-theme='dark']`), exposed to Tailwind via `@theme inline` (`bg-canvas`, `text-ink`, `text-ink-muted`…). Field classes `.field-black/.field-blue/.field-ias/.field-ies/.field-pes/.field-ink/.field-surface` set background and their own text colour; they are identical in both themes. Add the class `field` too when focus rings should follow the field's text colour.
- **Astro scoped `<style>` is unlayered, Tailwind utilities are layered, so scoped CSS always wins.** Don't combine a responsive Tailwind display utility (`hidden`, `md:…`) with a scoped rule that sets the same property on the same element; put the breakpoint in the scoped CSS instead.
- **Tailwind's dev scanner can miss classes in newly created files** (e.g. `md:col-span-6` silently absent). If a new page's layout looks wrong in `npm run dev`, restart the dev server before debugging; `npm run build` is unaffected.
- **Entrance motion:** add `data-reveal` (optional `style="--i: n"` for stagger). The attribute goes `""` → `"in"` → `"done"`, and the CSS only applies while not `done`, so components can keep their own `transform` hover effects. Containers with `data-reveal-children` (Markdown bodies) get each child tagged at runtime. Hero folders use a CSS keyframe with `animation-fill-mode: backwards` instead, for the same reason. Everything is visible without JS and under `prefers-reduced-motion`.

## Society logos and motion

- No phasor wheel or other rotating dial in the hero (owner rejected it as ugly).
- **Never print the acronyms IAS, IES or PES as visible text** (chapter owner's rule). Use `<SocietyLogo society="IAS" height={40} variant="auto|field|white" />` for labels, and full society names in sentences. Content data keeps the acronyms as values (`societies: [IAS]`, `"society": "IES"`); components turn them into logos.
- The Team page board (`src/components/team/Board.astro`) is a single-line diagram: `lead: true` members on top, a trunk and busbar, a feeder per officer. Current is three dashed SVG lines (one per society colour) offset by a third of the dash pattern and animated with `stroke-dashoffset`; no CSS gradients. Members without `photo` get a coloured standby panel; `name` is optional in the schema.
- A fixed `BackgroundWaves` layer (z-index -1) sits behind every page: sections on the plain canvas must stay transparent (don't add `bg-canvas` to them, or the waves disappear) and `.field-surface` is a translucent tint for the same reason; the owner dislikes static wave lines, so every wave must move; give a section a solid background only on purpose (the home hero does).
- Hero extras: a rolling word (`.roll-track`, each word box taller than the window so underlines never peek). The hero phase draw-in sets `stroke-dasharray` only inside its keyframes (fill-mode backwards): with stretched viewBoxes a permanent dash leaves a gap at the line end.
- Header `.meter`: three scroll-progress lines (scroll timeline). `[data-tilt]` elements lean towards the pointer (BaseLayout script; mouse + motion allowed only).
- Showpiece motion: `PowerOn.astro` opening (first page of a session only: the BaseLayout head script adds `html.intro` and sets `sessionStorage.powered`; pointer-events none, any input skips it), hero "resonance" script in `Hero.astro` (with a mouse it takes over the CSS flow and redraws the paths each frame, swelling around the pointer), and click-surge rings (BaseLayout script, `.surge`). All skipped under reduced motion.
- On the home societies tiles the logo/title header sits ABOVE each photo (owner's request).
- Motion layer: `photo-reveal` class (scroll-timeline curtain reveal, uses the `scale` property so `transform` hovers still work), `Filmstrip.astro`, hero phase draw-in, count-up script in `Stats.astro`, cross-document view transitions in `global.css`. All scroll-driven effects sit inside `@supports (animation-timeline: view())` and `prefers-reduced-motion: no-preference`. Check motion with `scripts/motion-frames.js` (the regular screenshot script disables motion).

## Design rules (enforced by the taste-skill lint/inspector)

Read `DESIGN.md` before visual work; `docs/design-critique.md` records the art direction ("colour chapters": each society is a colour field, always in power-chain order). Rules the inspector fails on and that are easy to break:

- One typeface (Montserrat Variable, self-hosted via `@fontsource-variable/montserrat`; it is wide, so watch the two-line heading rule), one accent (`--primary` IEEE blue) for buttons/links. Keep to the existing type steps (`t-display-lg`, `t-headline`, `t-statement`, `t-title`, body, `t-small`), about five sizes per page.
- No eyebrows/small labels directly above a heading (put category/date/society tags *after* the title), no gradients, no shadows on resting elements, no hairline dividers or 1px outlined boxes (form fields excepted), no monospace, no icon-topped rows of identical cards.
- Every heading ≤ 2 lines at 1440/768/390 px; statements set large stay ≤ 30px.
- Corners are softly rounded (owner's choice, overrides the taste skill's square rule): `var(--radius)` 16px for cards/tiles/frames/panels, `var(--radius-sm)` 10px for buttons/inputs/photos; full-bleed bands and folder tabs stay square.
- Sentence case for headings and buttons (deliberate deviation from the web-design-guidelines' Title Case rule).
- **Dark mode is never black** (owner's rule): canvas `#0f1c2e`, surfaces `#172a42`/`#203752`, and `--black` is overridden to navy `#1c3557` so every `.field-black` block turns navy. Don't hard-code `#000` backgrounds.
- The header is SMU blue (`.field-blue`) with coloured menu tabs (`--tab`, `--tab-ink`, `--tab-line` per `li:nth-child(3n+k)` in `Header.astro`); the Join button there is white (`.header-join`).
- Colours come from the chapter palette (`assets/brand/palette.png`): IAS green `#0a792d` (white text), IES orange `#ed5703` (black text: white fails contrast), PES blue `#093f7a`, black, SMU blue `#00629b` (= `--primary`). Societies always appear in logo order IAS, IES, PES (`src/config/societies.ts` order drives the hero folders, waveform and lists).
- Thin lines on dark grounds (hero waveform in dark mode, favicon) use lighter tints (`#2fae55`, `#ff7a2f`, `#5b8fd6`); fills always use true palette colours.
- The home hero waveform (`src/components/home/Hero.astro`) is pre-computed SVG paths animated with CSS; folder hover/focus highlights a phase via `.hero:has(.folder.field-xxx:hover)`. Society logos for the hero tabs are cut from the chapter logo (`public/logos/{ias,ies,pes}-{white,black}.webp`). Logos: `site.logoColour` / `site.logoWhite` (WebP; the colour logo is the home page h1, with sr-only heading text because the image swaps per theme); regenerate icons with `node scripts/generate-icons.mjs`.
- Found photos show the societies' world and must never be presented as the chapter's own people or events.
