---
version: 2.0
name: IEEE-IAS-IES-PES-SMU-joint-chapter
description: "The SMU Student Branch IAS/IES/PES Joint Chapter design system. Structure, typography discipline, 4px spacing grid and flat-square geometry are adapted from IBM's Carbon-based DESIGN.md (original kept in docs/IBM-DESIGN.original.md). Colours come from the chapter's own palette (assets/brand/palette.png): IAS green, IES orange, PES blue, black, white and SMU Student Branch blue (#00629B, also IEEE Blue), which is the single action accent. The chapter logo's three-colour wave is the signature motif: on the home page it becomes a live three-phase waveform, one phase per society."

colors:
  # Brand
  primary: "#00629B"          # IEEE Blue: primary buttons, the one accent
  primary-hover: "#004F7D"
  primary-pressed: "#003B5C"
  on-primary: "#FFFFFF"
  # Chapter fields from the chapter palette (identical in light and dark themes)
  field-black: "#000000"      # The chapter: nav, page headers, the front folder
  on-field-black: "#FFFFFF"
  field-blue: "#00629B"       # SMU Student Branch / IEEE Blue as a field
  on-field-blue: "#FFFFFF"
  field-ias: "#0A792D"        # Industry Applications Society (green)
  on-field-ias: "#FFFFFF"
  field-ies: "#ED5703"        # Industrial Electronics Society (orange)
  on-field-ies: "#000000"
  field-pes: "#093F7A"        # Power & Energy Society (blue)
  on-field-pes: "#FFFFFF"
  # Lighter tints, only for thin lines on dark grounds (hero wave in dark mode, header mark)
  line-ias-on-dark: "#2FAE55"
  line-ies-on-dark: "#FF7A2F"
  line-pes-on-dark: "#5B8FD6"
  # Neutrals, light theme
  light-canvas: "#FFFFFF"
  light-surface-1: "#F2F3F4"
  light-surface-2: "#E3E5E7"
  light-ink: "#000000"
  light-ink-muted: "#4A4F55"
  light-link: "#00629B"
  light-focus: "#00629B"
  # Neutrals, dark theme
  dark-canvas: "#0F1C2E"     # midnight blue: the dark theme is never black
  dark-surface-1: "#172A42"
  dark-surface-2: "#203752"
  dark-ink: "#EEF3F8"
  dark-ink-muted: "#B3C2D3"
  dark-field-black: "#1C3557" # the "black" chapter blocks become deep navy in dark mode
  dark-link: "#5CC3EE"
  dark-focus: "#5CC3EE"
  # Semantic
  semantic-success: "#24A148"
  semantic-error: "#DA1E28"

typography:
  display-xl:   { fontFamily: Montserrat, fontSize: "clamp(56px, 10vw, 160px)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.04em" }
  display-lg:   { fontFamily: Montserrat, fontSize: "clamp(44px, 7vw, 112px)",  fontWeight: 300, lineHeight: 1.0,  letterSpacing: "-0.03em" }
  headline:     { fontFamily: Montserrat, fontSize: "clamp(32px, 3.6vw, 52px)", fontWeight: 400, lineHeight: 1.1,  letterSpacing: "-0.02em" }
  statement:    { fontFamily: Montserrat, fontSize: "clamp(24px, 2.6vw, 36px)", fontWeight: 400, lineHeight: 1.25, letterSpacing: "-0.01em" }
  body:         { fontFamily: Montserrat, fontSize: "clamp(17px, 1.2vw, 19px)", fontWeight: 400, lineHeight: 1.55, letterSpacing: "0.16px" }
  small:        { fontFamily: Montserrat, fontSize: "15px", fontWeight: 400, lineHeight: 1.45, letterSpacing: "0.16px" }
  emphasis:     { fontFamily: Montserrat, fontWeight: 600 }

rounded:
  sm: 10px                    # buttons, inputs, content photos, small panels
  md: 16px                    # cards, tiles, picture frames, panels, footer tiles
  pill: 9999px                # focus-area chips
  none: 0px                   # only full-bleed bands that touch the screen edges, and folder tabs

spacing:                      # 4px base grid (Carbon)
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  xxxl: 64px
  section: "clamp(96px, 14vw, 200px)"
  gutter: "clamp(16px, 3vw, 32px)"   # the one pair of outer page margins

components:
  button-primary:   { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", rounded: "{rounded.sm}", padding: "16px 24px", minHeight: 48px }
  button-inverse:   { backgroundColor: "{ink}", textColor: "{canvas}", rounded: "{rounded.sm}", padding: "16px 24px", minHeight: 48px }
  chapter-field:    { backgroundColor: "{colors.field-*}", textColor: "{colors.on-field-*}", minHeight: "90svh on the home page, auto elsewhere" }
  page-header:      { backgroundColor: "page's chapter field", textColor: "matching on-field", padding: "128px gutter 64px" }
  tile:             { backgroundColor: "a field or surface-1", rounded: "{rounded.md}", padding: 24px, border: none, shadow: none }
  text-input:       { backgroundColor: "{surface-1}", textColor: "{ink}", rounded: "{rounded.sm} top corners", padding: "12px 16px", borderBottom: "2px solid {ink-muted}", focusBorderBottom: "2px solid {focus}" }
  top-nav:          { backgroundColor: "{colors.field-blue}", textColor: "#FFFFFF", height: 72px, logo: "white chapter logo", tabs: "society colours, filled when current" }
  footer:           { layout: "tile board, 8px gaps", logoTile: "white chapter logo on {colors.field-black}", inviteTile: "{colors.primary}" }
---

## Overview

This is the design system for the IEEE IAS/IES/PES Joint Chapter of the SMU Student Branch. It keeps the **structure and discipline** of IBM's Carbon-based marketing system (one typeface, flat square geometry, a strict 4px grid, colour used scarcely and with intent) and uses **the chapter's own palette and logo**.

The idea comes from the logo: **three societies, like the three phases of an AC supply, carrying one current.** The logo's wave changes colour from IAS green to IES orange to PES blue. On the home page it becomes a live three-phase waveform (three sines, 120° apart) above a stack of coloured folders, and pointing at a society's folder brings its phase forward. A colour always *means* something: green is IAS, orange is IES, blue is PES, black is the chapter itself. Societies always appear in logo order: IAS, IES, PES.

**Key characteristics**
- **One typeface: Montserrat** (variable, self-hosted). Display sizes at weight 300, body 400, emphasis 500–600. No second face, no italics for emphasis, no monospace. Montserrat is wide: keep headings short so they stay within two lines.
- **One accent: IEEE Blue `#00629B`** carries primary buttons and links. It is never used as decoration.
- **Flat fields, hard edges.** Sections change colour at a hard horizontal edge. No gradients, no shadows at rest, no glass, no hairline dividers.
- **Softly rounded corners** (chapter owner's choice): 16px (`--radius`) on cards, tiles, picture frames and panels; 10px (`--radius-sm`) on buttons, inputs and content photos. Full-bleed bands that touch the screen edges stay square, and so do the folder tabs.
- **Two themes.** Light and dark swap only the neutrals (canvas, surfaces, ink). Chapter fields keep their colours in both themes so the brand stays recognisable.

## Colors

### Brand
- **IEEE Blue** (`primary`, #00629B): primary buttons, links in light theme, focus ring in light theme. White text on it passes WCAG AA (6.5:1).
- **Hover / pressed** (#004F7D / #003B5C): darker steps of the same blue.

### Chapter fields
| Field | Hex | Text on it | Contrast | Meaning |
|---|---|---|---|---|
| Black | #000000 | white | 21:1 | The chapter: nav, page headers, front folder, logo tile |
| SMU blue | #00629B | white | 6.5:1 | SMU Student Branch / IEEE; events |
| IAS green | #0A792D | white | 5.6:1 | Industry Applications Society |
| IES orange | #ED5703 | black | 6.0:1 | Industrial Electronics Society (white text would fail at 3.5:1) |
| PES blue | #093F7A | white | 10.5:1 | Power & Energy Society |

Text on a field is always its assigned ink, white or black, never grey. PES blue and SMU blue are both blues: separate them with another colour where you can.

**Thin lines on dark grounds** (the hero wave in dark mode, the header mark) use lighter tints of the society colours (`#2FAE55`, `#FF7A2F`, `#5B8FD6`), because a 4px line in PES blue disappears on black. Fields and fills always use the true palette colours.

### Logo
- `public/logos/chapter-logo.png` is the colour logo for light backgrounds; `public/logos/chapter-logo-white.png` is the white logo for black backgrounds (made from the black original). The original files are in `assets/brand/`.
- The colour logo is the home page's headline (the white logo replaces it in dark mode); the white logo also closes every page in the footer. The page uses WebP copies (`chapter-logo.webp`, `chapter-logo-white.webp`); the PNGs feed the icon script. The white logo also sits top left in the black header (56px tall in a 72px bar).
- The three society logos are cut from the chapter logo (`public/logos/{ias,ies,pes}-{white,black}.webp`) and sit on the hero folder tabs: white on IAS green and PES blue, black on IES orange.

### Society logos instead of acronyms
The acronyms IAS, IES and PES are never printed as text. Wherever a society is named as a label (tags, cards, event details, team roles, headings), the site shows its logo through `SocietyLogo.astro`; in running sentences it uses the full name. Variants: `auto` (colour on light pages, white in dark mode), `field` (on the society's own colour: white, or black on IES orange) and `white` (dark cards, photos). Files: `public/logos/{ias,ies,pes}-{colour,white,black}.webp`, cut from the chapter logo.

### Neutrals
| Token | Light | Dark | Use |
|---|---|---|---|
| canvas | #FFFFFF | #0F1C2E (midnight blue) | Page background |
| surface-1 | #F2F3F4 | #172A42 | Alternate bands, inputs, tiles |
| surface-2 | #E3E5E7 | #203752 | Pressed / selected surfaces |
| ink | #000000 | #EEF3F8 | All running text and headings |
| ink-muted | #4A4F55 | #B3C2D3 | Secondary notes only (dates, captions) |
| field-black | #000000 | #1C3557 (deep navy) | Chapter blocks: banners, front folder, filmstrip, logo tile |

**The dark theme never uses black** (chapter owner's rule): its grounds are midnight and navy blues from the PES blue family.
| link | #00629B | #5CC3EE | Inline links |
| focus | #00629B | #5CC3EE | 3px focus outline |

## Typography

**Montserrat** (SIL Open Font License), self-hosted via `@fontsource-variable/montserrat` so no third-party font request is made. Fallback: `"Helvetica Neue", Arial, sans-serif`.

| Token | Size | Weight | Leading | Tracking | Use |
|---|---|---|---|---|---|
| display-xl | clamp(56px, 10vw, 160px) | 300 | 0.95 | -0.04em | Hero headline only |
| display-lg | clamp(44px, 7vw, 112px) | 300 | 1.0 | -0.03em | Page titles, chapter headings |
| headline | clamp(32px, 3.6vw, 52px) | 400 | 1.1 | -0.02em | Section headings |
| statement | clamp(24px, 2.6vw, 36px) | 400 | 1.25 | -0.01em | Intro paragraphs set large (≤ 3 lines) |
| body | 17–19px | 400 | 1.55 | 0.16px | Running text |
| small | 15px | 400 | 1.45 | 0.16px | Dates, captions, meta |

**Principles**
- Five sizes is the ceiling on any page. Two or three do the visible work: one very large, one small.
- Every heading fits in **two lines or fewer at every width.** Cut words before shrinking type.
- Left-aligned by default. The hero headline is the one centred moment.
- Keep Carbon's `letter-spacing: 0.16px` on body sizes.
- Sentence case everywhere. No uppercase letter-spaced labels and no small "eyebrow" label above headings.

## Layout

### Spacing
- **Base unit 4px.** All spacing tokens are multiples of 4.
- **One pair of outer margins** (`gutter`, 16–32px) on every section at every width.
- **Section gap** 96–200px; always clearly larger than any gap inside a section.

### Grid
- A 12-column grid with `gutter` margins; collapses to 4 columns below 768px.
- Max content width 1440px; colour fields themselves always run full-bleed.

### Rhythm
Neighbouring sections never share a layout. Separate sections by a change of field colour or surface tone, never by a line.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat, no border | Default for everything |
| 1 | Tone step (canvas → surface-1) | Tiles, alternate bands, inputs |
| 2 | Field colour | Chapters, page headers, CTA |
| float | `0 12px 32px rgb(0 0 0 / .25)` | Only things that truly float: the open mobile menu |

## Shapes
- `--radius` (16px) on cards, tiles, picture frames, panels and footer tiles; `--radius-sm` (10px) on buttons, inputs and content photos (`.photo-reveal`); 6px on tags; pills only for focus-area chips.
- Square (0px) only where a band touches the screen edge, and on the folder-tab shapes.
- The **folder tab** (a trapezoid cut with `clip-path`) is the one signature shape: hero folders and page-header tabs.

## Components

**Buttons.** `button-primary`: IEEE Blue, white text, 48px minimum height, square. `button-inverse`: ink ground, canvas text, used on coloured fields where blue would clash. One primary action per screen. Hover darkens; press darkens further and moves 1px down; focus shows the 3px outline.

**Links.** Inline links are underlined (2px, offset 3px) in the link colour. Navigation links are not underlined at rest and underline on hover/focus.

**Page header.** Every inner page opens with a chapter field in that page's colour holding the `h1` at display-lg and one supporting sentence. Pages: About SMU blue, Events black, Team IES orange, News IAS green, Join PES blue, Contact black.

**Tiles.** Flat colour or surface-1 rectangles, no border, no shadow, no hover lift. Text that describes a picture tile sits *under* the tile, not on it.

**Text inputs.** surface-1 ground, 2px bottom rule in ink-muted (form fields keep their lines; this is the one place a rule is allowed), focus turns the rule to the focus colour and adds the outline. Labels sit above fields; errors are announced with `aria-live`.

**Navigation.** SMU-blue bar (both themes), 72px tall: white chapter logo left. Menu links are coloured tabs cycling IAS green, IES orange, PES blue: each carries a short bar in a light tint of its colour, hover tints the tab and stretches the bar, the current page fills the tab (black text on orange). White Join button; five plain links, one "Join" action, theme toggle. Below 900px the links collapse into a full-screen menu opened by a labelled button.

**Footer.** A board of flat tiles with 8px gaps: statement, navigation, location, email, then the wordmark set large on an ink tile and a "Join the chapter" tile in IEEE Blue.

## Imagery
1. The chapter's own photographs (events, visits, team). **TODO: replace all placeholders.**
2. Real, credited pictures of the field (substations, motors, converters, factories) from Wikimedia Commons, credited on the Credits page. They show the *world* of the societies, never the chapter's own people or events.
3. Rounded corners (`--radius-sm` / `--radius`), one treatment, `loading="lazy"` except the first image on screen, explicit `width`/`height`.

## Motion
- Section parts enter once as they scroll into view: heading, then text, then picture, staggered 60–90ms, rising 24px with opacity. Content is visible without JavaScript.
- Live thing: **the three-phase waveform** in the home hero. Three sines 120° apart flow continuously (CSS translate of a pre-computed path); pointing at or focusing a society's folder thickens its phase and fades the other two. Still under reduced motion.
- Second signature move: **index with preview.** On the Events archive, pointing at a row shows its photo in a fixed frame and dims the other rows. On touch screens the photo is inline.
- **Rolling word:** "Join us for workshops / industrial visits / competitions / talks" rolls like an analog counter, underlined in the society colours.
- **Power meter:** three thin lines along the bottom of the header fill as the page scrolls, each easing differently like three phases.
- **Tilt:** society tiles, filmstrip photos, board portraits and event pictures lean towards the mouse (pointer devices only).
- **Hero entrance:** the logo rises in, then the three phases draw themselves one after another before they start flowing.
- **Curtain reveal:** content photos (class `photo-reveal`) open from a horizontal slit and settle from a slight zoom as they scroll into view (CSS scroll timeline).
- **Living background** (`BackgroundWaves.astro`, in the base layout): four faint bands of the three-phase wave, spread evenly over the viewport, flow behind every page in alternating directions. Canvas sections are transparent and grey sections (`.field-surface`) are a 5% ink tint, so the waves show through both; colour fields, photos, tiles and the home hero stay solid. Opacity 18% light, 20% dark; still under reduced motion. There are no static wave lines anywhere.
- **Filmstrip** (`Filmstrip.astro`): two rows of photographs on black slide in opposite directions with the scroll.
- **Count-up:** the home page figures count up from zero when they appear.
- **Page transitions:** cross-document view transitions cross-fade pages; the header stays still.
- Scroll-driven effects degrade gracefully: browsers without scroll timelines show everything in place (the filmstrip drifts slowly on a timer instead). Everything respects `prefers-reduced-motion: reduce` (motion removed, content kept).

## Do's and Don'ts

### Do
- Give each section one flat field or surface, and change it at a hard edge.
- Use the society colour whenever content belongs to one society (tags, tiles, page fields).
- Keep body text at the full ink colour, 17px or more.
- Keep headings to two lines at every width.

### Don't
- Don't add shadows to resting elements or use gradients; don't invent new corner radii beyond `--radius` and `--radius-sm`.
- Don't add a second accent colour or a second typeface.
- Don't use hairline dividers, 1px outlined cards, eyebrow labels, emoji or icon-topped card rows.
- Don't change the society order (IAS, IES, PES) or swap their colours.
- Don't present a found picture as the chapter's own event or member.

## Responsive Behavior

| Name | Width | Changes |
|---|---|---|
| Desktop | ≥ 1100px | Full 12-column layouts, index-with-preview |
| Tablet | 768–1099px | 2-column tiles, nav still inline above 900px |
| Phone | < 768px | Single column, full-screen menu, inline previews |

Touch targets are at least 48px. Display type scales with `clamp()` and never overflows at 320px.

## Iteration Guide
1. Change tokens in `src/styles/global.css` (`:root` and `[data-theme="dark"]`), never hard-coded hex values in components.
2. New sections pick a field or surface first, then a layout that differs from their neighbours.
3. Run the screenshot loop (README → "Quality checks") at 1440 / 768 / 390px in both themes after any visual change.
