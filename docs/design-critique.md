# Design notes and final critique

Written with the design-taste-frontend skill (`.claude/skills/design-taste-frontend`).

## Direction

- **Direction dealt:** Colour chapters (seed 844634270), sector "education", with the brand's
  palette and type kept (`--keep palette,type`). Chosen over "Type only" and "Dressed as something
  else" because the chapter really is three societies, and each can own a colour.
- **Adjustments to the sheet:**
  - The hero's heavy condensed capitals became IBM Plex Sans Light, to follow DESIGN.md.
  - The "cards that fold into spines" pinned deck became a plain wrapping deck, because there are
    only two or three upcoming events at a time.
  - The intro paragraph is a 30px statement, not a 76px paragraph (house rule on statements).
- **Idea (revised with the chapter logo, November 2026):** on this site, *the logo's three-colour
  wave* becomes *a live three-phase current*: three sines 120° apart, one per society (IAS green,
  IES orange, PES blue), flowing above the folder stack. Pointing at a society's folder brings its
  phase forward. Colours were switched from IEEE secondary colours to the chapter's own palette.
- **Live thing:** the three-phase wave and folder stack together. Each folder lifts when you point
  at it and its phase thickens while the others fade; the Events folder always shows the next
  event and its date, straight from the content files.
- **Signature move:** index with preview on the past-events archive (CSS only, no JavaScript).
- **Moving picture:** slow drift on the stats photo and on page-header photos (still under
  reduced motion). No honest footage was good enough: the one open-licence turbine clip was a
  phone video of a car park.

## Final critique (home page, production build)

```
ROUND 3
Seen in one second: "IAS · IES · PES" in large light type on white, a flowing green, orange and
  blue three-phase wave, then a stack of folders in the same colours ending in the black logo folder.
Idea (one sentence): the three societies are the three phases of one current, so the logo's
  wave becomes a live three-phase waveform and each society keeps its phase colour everywhere.
Live thing: the three-phase wave; pointing at a society folder brings its phase forward.
Layout words by section: hero=folder stack / about=statement split / societies=specimen tiles /
  events=card deck / stats=photo mosaic / close=inverted statement / footer=tile board
Scores: design 7.5 · usability 8 · creativity 7.5 · content 5 → overall 7.3.
Caps applied: content ≤ 5 (bracketed placeholders such as [University name] are visible).
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Remaining bracketed placeholders ([City], [Country], address) (desktop-fold, mobile-fold): fill in
   src/config/site.ts.
2. Every photograph is a credited stand-in from Wikimedia Commons; none shows the chapter's own
   people (all pages): add event photos to the event files and portraits to the team files.
3. The offshore wind-turbine photo appears twice on the home page, as a societies tile and in the
   stats mosaic (desktop-page-01, desktop-page-02): use a chapter group photo in the stats mosaic.
```

## Inspector results that depend on content

`inspect.mjs` reports "few pictures" on the Team, Contact, 404 and single news pages. These clear up
once real member portraits and news photos are added (Contact's picture is the map; the 404 page is
deliberately minimal). The "no footage" warning is explained above.

## Motion inspired by another chapter (November 2026)

Studied https://cs-smu.ieee.tn/ (rotating text ring around its logo, typed hero word, constellation canvas, custom cursor, scroll progress bar, glowing tilt cards). Took the principles, not the look:

- living centrepiece → a phasor wheel generating the wave was tried and removed at the owner's request (it read as ugly); the flowing three-phase wave alone carries the hero;
- changing word → a **rolling counter** of activities, not a typewriter;
- scroll progress → a **three-phase power meter**, not a single bar;
- reactive cards → gentle **pointer tilt** on photographs, without glow or neon.

Not taken: dark space theme, starfield/constellation canvas, custom cursor, glitch titles, sound, guided tour.
