---
version: 1.0
name: IEEE-IES-IAS-PES-joint-chapter
description: "The chapter's design system. Structure, typography discipline, 4px spacing grid and flat-square geometry are adapted from IBM's Carbon-based DESIGN.md (original kept in docs/IBM-DESIGN.original.md). Colour is replaced by IEEE branding: IEEE Blue (#00629B) is the single action accent, IEEE Dark Blue is the hero ground, and three IEEE secondary colours become 'chapter fields', one per society, ordered along the power chain: PES generates and transmits, IES converts and controls, IAS puts energy to work. Light and dark themes share every field colour; only the neutral canvas and ink swap."

colors:
  # Brand
  primary: "#00629B"          # IEEE Blue: primary buttons, the one accent
  primary-hover: "#004F7D"
  primary-pressed: "#003B5C"
  on-primary: "#FFFFFF"
  # Chapter fields (identical in light and dark themes)
  field-navy: "#002855"       # IEEE Dark Blue: hero, page headers
  on-field-navy: "#FFFFFF"
  field-blue: "#00629B"       # IEEE Blue as a field
  on-field-blue: "#FFFFFF"
  field-pes: "#78BE20"        # Power & Energy Society chapter (green)
  on-field-pes: "#0B1620"
  field-ies: "#00B5E2"        # Industrial Electronics Society chapter (cyan)
  on-field-ies: "#0B1620"
  field-ias: "#FFC72C"        # Industry Applications Society chapter (yellow)
  on-field-ias: "#0B1620"
  # Neutrals, light theme
  light-canvas: "#FFFFFF"
  light-surface-1: "#F1F4F6"
  light-surface-2: "#E2E8EC"
  light-ink: "#0B1620"
  light-ink-muted: "#3D4B57"
  light-link: "#00629B"
  light-focus: "#00629B"
  # Neutrals, dark theme
  dark-canvas: "#0B1620"
  dark-surface-1: "#13212D"
  dark-surface-2: "#1C2E3C"
  dark-ink: "#EEF3F6"
  dark-ink-muted: "#B4C2CC"
  dark-link: "#5CC3EE"
  dark-focus: "#5CC3EE"
  # Semantic
  semantic-success: "#24A148"
  semantic-error: "#DA1E28"

typography:
  display-xl:   { fontFamily: IBM Plex Sans, fontSize: "clamp(56px, 10vw, 160px)", fontWeight: 300, lineHeight: 0.95, letterSpacing: "-0.04em" }
  display-lg:   { fontFamily: IBM Plex Sans, fontSize: "clamp(44px, 7vw, 112px)",  fontWeight: 300, lineHeight: 1.0,  letterSpacing: "-0.03em" }
  headline:     { fontFamily: IBM Plex Sans, fontSize: "clamp(32px, 3.6vw, 52px)", fontWeight: 400, lineHeight: 1.1,  letterSpacing: "-0.02em" }
  statement:    { fontFamily: IBM Plex Sans, fontSize: "clamp(24px, 2.6vw, 36px)", fontWeight: 400, lineHeight: 1.25, letterSpacing: "-0.01em" }
  body:         { fontFamily: IBM Plex Sans, fontSize: "clamp(17px, 1.2vw, 19px)", fontWeight: 400, lineHeight: 1.55, letterSpacing: "0.16px" }
  small:        { fontFamily: IBM Plex Sans, fontSize: "15px", fontWeight: 400, lineHeight: 1.45, letterSpacing: "0.16px" }
  emphasis:     { fontFamily: IBM Plex Sans, fontWeight: 600 }

rounded:
  none: 0px                   # everything: buttons, images, tiles, inputs
  full: 9999px                # avatars only

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
  button-primary:   { backgroundColor: "{colors.primary}", textColor: "{colors.on-primary}", rounded: "{rounded.none}", padding: "16px 24px", minHeight: 48px }
  button-inverse:   { backgroundColor: "{ink}", textColor: "{canvas}", rounded: "{rounded.none}", padding: "16px 24px", minHeight: 48px }
  chapter-field:    { backgroundColor: "{colors.field-*}", textColor: "{colors.on-field-*}", minHeight: "90svh on the home page, auto elsewhere" }
  page-header:      { backgroundColor: "page's chapter field", textColor: "matching on-field", padding: "128px gutter 64px" }
  tile:             { backgroundColor: "a field or surface-1", rounded: "{rounded.none}", padding: 24px, border: none, shadow: none }
  text-input:       { backgroundColor: "{surface-1}", textColor: "{ink}", rounded: "{rounded.none}", padding: "12px 16px", borderBottom: "2px solid {ink-muted}", focusBorderBottom: "2px solid {focus}" }
  top-nav:          { backgroundColor: "{colors.field-navy}", textColor: "{colors.on-field-navy}", height: 64px }
  footer:           { layout: "tile board, 8px gaps", wordmarkTile: "{ink} ground", inviteTile: "{colors.primary}" }
---

## Overview

This is the design system for the IEEE IES/IAS/PES Joint Chapter website. It keeps the **structure and discipline** of IBM's Carbon-based marketing system (one typeface, flat square geometry, a strict 4px grid, colour used scarcely and with intent) and replaces IBM's palette with **IEEE branding**.

The idea that drives the look: **the chapter's three societies cover the whole power chain.** PES generates and transmits energy, IES converts and controls it, IAS puts it to work in industry. Each society gets a flat "chapter field" colour from the IEEE secondary palette, and those fields appear floor-to-ceiling, butted edge to edge, like a set of posters. A colour always *means* something: green is PES, cyan is IES, yellow is IAS, dark blue is the chapter itself.

**Key characteristics**
- **One typeface: IBM Plex Sans** (variable, self-hosted). Display sizes at weight 300 (IBM's light display signature), body 400, emphasis 600. No second face, no italics for emphasis, no monospace.
- **One accent: IEEE Blue `#00629B`** carries primary buttons and links. It is never used as decoration.
- **Flat fields, hard edges.** Sections change colour at a hard horizontal edge. No gradients, no shadows at rest, no glass, no hairline dividers.
- **Square corners everywhere** (`rounded.none`). Only member portraits may be circular.
- **Two themes.** Light and dark swap only the neutrals (canvas, surfaces, ink). Chapter fields keep their colours in both themes so the brand stays recognisable.

## Colors

### Brand
- **IEEE Blue** (`primary`, #00629B): primary buttons, links in light theme, focus ring in light theme. White text on it passes WCAG AA (6.5:1).
- **Hover / pressed** (#004F7D / #003B5C): darker steps of the same blue.

### Chapter fields
| Field | Hex | Text on it | Contrast | Meaning |
|---|---|---|---|---|
| Navy | #002855 | white | 15:1 | The chapter: hero, page headers, nav |
| Blue | #00629B | white | 6.5:1 | IEEE as a whole |
| PES green | #78BE20 | ink #0B1620 | 8.0:1 | Power & Energy Society |
| IES cyan | #00B5E2 | ink #0B1620 | 7.4:1 | Industrial Electronics Society |
| IAS yellow | #FFC72C | ink #0B1620 | 11.9:1 | Industry Applications Society |

Text on a field is always its assigned ink, white or near-black, never grey. PES green and IES cyan have similar lightness, so **never place those two fields next to each other** as full sections.

> TODO: confirm the field colours against the current IEEE Brand Experience guidelines (brand-experience.ieee.org) and each society's style guide before printing anything.

### Neutrals
| Token | Light | Dark | Use |
|---|---|---|---|
| canvas | #FFFFFF | #0B1620 | Page background |
| surface-1 | #F1F4F6 | #13212D | Alternate bands, inputs, tiles |
| surface-2 | #E2E8EC | #1C2E3C | Pressed / selected surfaces |
| ink | #0B1620 | #EEF3F6 | All running text and headings |
| ink-muted | #3D4B57 | #B4C2CC | Secondary notes only (dates, captions) |
| link | #00629B | #5CC3EE | Inline links |
| focus | #00629B | #5CC3EE | 3px focus outline |

## Typography

**IBM Plex Sans** (SIL Open Font License), self-hosted via `@fontsource-variable/ibm-plex-sans` so no third-party font request is made. Fallback: `"Helvetica Neue", Arial, sans-serif`.

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
- `rounded.none` (0px) on buttons, tiles, images, inputs and containers.
- `rounded.full` only on member portrait photos.
- The **folder tab** (a trapezoid cut with `clip-path`) is the one signature shape: hero folders and page-header tabs.

## Components

**Buttons.** `button-primary`: IEEE Blue, white text, 48px minimum height, square. `button-inverse`: ink ground, canvas text, used on coloured fields where blue would clash. One primary action per screen. Hover darkens; press darkens further and moves 1px down; focus shows the 3px outline.

**Links.** Inline links are underlined (2px, offset 3px) in the link colour. Navigation links are not underlined at rest and underline on hover/focus.

**Page header.** Every inner page opens with a chapter field in that page's colour holding the `h1` at display-lg and one supporting sentence. Pages: About blue, Events navy, Team IES cyan, News IAS yellow, Join PES green, Contact navy.

**Tiles.** Flat colour or surface-1 rectangles, no border, no shadow, no hover lift. Text that describes a picture tile sits *under* the tile, not on it.

**Text inputs.** surface-1 ground, 2px bottom rule in ink-muted (form fields keep their lines; this is the one place a rule is allowed), focus turns the rule to the focus colour and adds the outline. Labels sit above fields; errors are announced with `aria-live`.

**Navigation.** Navy bar, 64px tall: wordmark left, five plain links, one "Join" action, theme toggle. Below 900px the links collapse into a full-screen menu opened by a labelled button.

**Footer.** A board of flat tiles with 8px gaps: statement, navigation, location, email, then the wordmark set large on an ink tile and a "Join the chapter" tile in IEEE Blue.

## Imagery
1. The chapter's own photographs (events, visits, team). **TODO: replace all placeholders.**
2. Real, credited pictures of the field (substations, motors, converters, factories) from Wikimedia Commons, credited on the Credits page. They show the *world* of the societies, never the chapter's own people or events.
3. Square corners, one treatment, `loading="lazy"` except the first image on screen, explicit `width`/`height`.

## Motion
- Section parts enter once as they scroll into view: heading, then text, then picture, staggered 60–90ms, rising 24px with opacity. Content is visible without JavaScript.
- Signature move: **index with preview.** On the Events archive, pointing at a row shows its photo in a fixed frame and dims the other rows. On touch screens the photo is inline.
- Transform and opacity only. Everything respects `prefers-reduced-motion: reduce` (travel removed, content kept).

## Do's and Don'ts

### Do
- Give each section one flat field or surface, and change it at a hard edge.
- Use the society colour whenever content belongs to one society (tags, tiles, page fields).
- Keep body text at the full ink colour, 17px or more.
- Keep headings to two lines at every width.

### Don't
- Don't round corners, add shadows to resting elements, or use gradients.
- Don't add a second accent colour or a second typeface.
- Don't use hairline dividers, 1px outlined cards, eyebrow labels, emoji or icon-topped card rows.
- Don't put green (PES) and cyan (IES) full-width fields next to each other.
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
