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
- **Idea:** on this site, *the power chain the three societies cover (PES generates, IES converts,
  IAS applies)* becomes *a stack of coloured folders and chapter fields, always in that order*.
- **Live thing:** the hero folder stack. Each folder lifts when you point at it, and the Events
  folder always shows the next event and its date, straight from the content files.
- **Signature move:** index with preview on the past-events archive (CSS only, no JavaScript).
- **Moving picture:** slow drift on the stats photo and on page-header photos (still under
  reduced motion). No honest footage was good enough: the one open-licence turbine clip was a
  phone video of a car park.

## Final critique (home page, production build)

```
ROUND 3
Seen in one second: "IES · IAS · PES" in large light type on IEEE dark blue, above a stack of
  green, cyan, yellow and blue folders.
Idea (one sentence): the three societies are the three links of the power chain, so each is a
  coloured folder and chapter field, in chain order.
Live thing: folder stack in the hero; the Events folder shows the next event from the content.
Layout words by section: hero=folder stack / about=statement split / societies=specimen tiles /
  events=card deck / stats=photo mosaic / close=inverted statement / footer=tile board
Scores: design 7.5 · usability 8 · creativity 7.5 · content 5 → overall 7.3.
Caps applied: content ≤ 5 (bracketed placeholders such as [University name] are visible).
Top three problems (most visible first), each with the screenshot it shows in and the fix:
1. Bracketed placeholders on every first screen (desktop-fold, mobile-fold): fill in
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
