# Changelog

All notable changes to this project are recorded here. Versions follow
[semantic versioning](https://semver.org/); the published single-file build is
`纸环的两面.html` at the repository root.

## [1.11.0] — 2026-10-21

### Changed
- Restored the original Chapter 06 statements: blue “不能失去自己” and red
  “不能没有你”. Both remain prominent throughout the interaction and replay.
- Simplified the scene to one gesture. Two translucent circles approach without
  shrinking; their actual intersection lights up as “我们”, while “我” and “你”
  remain in the two private regions. Tap again to replay.
- Removed the multi-step room, door and courtyard mechanics. The animation is
  finite, honors reduced motion and stops rendering at rest or offscreen.

### Added
- Browser regression checks for both required statements, one-action operation,
  four viewport widths, native touch scrolling, replay and idle rendering.
- Geometry checks for constant circle size and the exact shared lens; one new
  self-hosted glyph for the simplified interaction.

## [1.10.0] — 2026-10-21

### Changed
- Rebuilt Chapter 06 as a paper pop-up courtyard: two private rooms retain
  their own floors, walls and belongings. Each owner opens their own door and
  unfolds one concertina leaf; together the leaves create a third space with
  an arch, a table and two cups.
- Returning home does not move the other person or dismantle the shared
  courtyard. Empty chairs retain their places, making boundaries and belonging
  simultaneously visible. A full restart is an explicit separate action.
- Direct room clicks and native keyboard/touch controls share the same state.
  The mobile view reprojects the physical geometry into a diagonal composition.
  Door motion, walking through the opening and folding run in order, including
  when actions are interrupted. Rendering stops at rest and offscreen.

### Added
- Tests for independent choices, shared-space persistence, doorway routes and
  private-floor preservation. Browser coverage includes four widths, touch
  scrolling, rapid reversal, reduced motion and idle rendering.
- A static no-JavaScript illustration and four additional self-hosted glyphs.

## [1.9.0] — 2026-10-20

### Changed
- Replaced Chapter 06's tension metaphor with two separate paper spaces and
  an illuminated route through their openings. Safe connection is expressed
  through actions: blue can take space without breaking the route or drawing
  red after them; red can call and receive a reply without forcing reunion.
- Requests travel from red to blue and replies return along the same physical
  path. The receiving space warms with light; taking space and responding
  remain independent choices. The mobile composition follows a diagonal.
- Replaced the former drag affordance with direct touchable lights, keyboard
  actions and replay. Animation remains finite and sleeps offscreen.

### Added
- Geometry tests across both layouts and 21 separation states verify that
  the bridge meets the openings and never cuts through either room.
- Browser checks for autonomy, replies while apart, native touch scrolling,
  interrupted actions and motion preferences. Four new self-hosted glyphs.

## [1.8.0] — 2026-10-20

### Changed
- Chapter 06 keeps the opposing blue/red words and replaces its divider and
  slider with a folded sheet under tension. Pull its central knot to deform
  both halves; release or tap to open a warm space for the shared need.
- Either voice can be selected directly: needing space and needing a response
  produce different pulls and captions. Two brief light traces converge as
  the paper opens; the original article and flip-side coin remain intact.
- Geometry updates only during transitions or input, with time-based damping,
  and stops when settled, offscreen, or in a background tab. Reduced motion,
  keyboard actions and vertical touch scrolling are supported.

### Added
- `qa-mirror.mjs`: four-width layout, tap/drag/keyboard, actual touch gestures,
  preserved selection, rapid input, offscreen settling and reduced-motion checks.
- Seven missing interface glyphs in the self-hosted fonts.

## [1.7.1] — 2026-10-19

### Changed
- The Möbius replay is now 9 seconds instead of 14 (the opening is 7.8 s, so it
  runs about a second longer than the opening and no longer outstays it).
- The paper letter answers the hand: a pull under 64 px springs back with a
  visible overshoot (past its resting spot, then settles), and a real throw
  recoils about 20 px first, then flies.

## [1.7.0] — 2026-10-19

Six interaction details, all in the exhibition's own language.

### Changed
- Envelope: paper grain, an address line, wax mottling, a pointer parallax, a
  springier flap and a hairline on the letter; the opened flap now steps aside
  instead of pressing on the letter.
- The paper letter: a short pull springs back with an overshoot instead of
  being read as a click; sending gets a tiny anticipation first.
- The hero ring and the "next" ring keep their two walkers moving (red leads,
  blue trails), drawn at about 30 fps and paused with reduced motion.
- Chapter 4's light now slides and narrows as the folds close, and turns with
  the object when the visitor walks to the inner side.
- 07.6: the shield really fades (visibility is delayed now); the loop and its
  caption fade in instead of appearing on one frame.
- The Möbius dots glide to their closed-surface positions via a parameter-space
  blend, so nothing snaps when the seam closes.

### Added
- The Möbius act gates the page: while the section is on screen and the two
  sides are not yet reconnected, scrolling down is refused (up still works),
  the ♪-style hint appears and the play button pulses.

### Fixed
- QA: the opening is settled explicitly, the Möbius stage is scrolled into view
  before tapping, and a drag's click suppression no longer goes stale.

## [1.6.0] — 2026-10-19

### Changed
- The single file now carries the soundtrack: `pnpm release` base64-embeds
  `theme.mp3` as `window.__paperTrack`, and `audio.ts` turns it into a blob URL
  at runtime. One HTML is enough to share — no sibling mp3, no folder.
  The site keeps streaming the external file, so its first paint stays light.
- The share bundle is now just the HTML and the PDF; the mp3 left it.
- The root `theme.mp3` build copy is gone (and removed if an old one exists).

## [1.5.1] — 2026-10-19

### Added
- Every release now also publishes `paper-ring-<tag>-share.zip`: the single
  file, the article PDF and `theme.mp3` in one folder, so an offline copy sent
  to someone else keeps its music. (A lone HTML file never had the soundtrack.)

## [1.5.0] — 2026-10-19

### Added
- The soundtrack is now part of the site: G.E.M. 邓紫棋《唯一》 lives at
  `website/public/theme.mp3` (10.2 MB, 4:13) and ships with the Pages build.
  It starts when the envelope is opened, fades in over 2.4 s to 30% and loops.

### Changed
- The track preloads metadata only, so nothing large is fetched before the
  visitor breaks the seal; playback is the download.
- The `<audio>` element is part of the document (`#theme-audio`, hidden), which
  makes its state inspectable in QA.
- Volume tuned for the master (peak 1.0, RMS 0.198): 30% ≈ −24 dBFS.

The recording belongs to its rights holders and is not covered by the MIT
licence; it is included with the exhibition at the author's request.

## [1.4.0] — 2026-10-18

### Added
- An envelope gate before the exhibition: a sealed letter with a wax seal opens
  on one click — flap turns, paper rises — and that same gesture starts the
  soundtrack and releases the opening animation.
- `?nogate=1`, `#`-deep links and back/forward navigation skip the gate; the
  gate is `hidden` in the markup, so it never blocks reading without
  JavaScript.
- `qa-browser` now opens the gate for real (letter leaves, opening runs, track
  plays) and every other browser check uses `?nogate=1` to drive the
  exhibition directly.

### Changed
- The envelope is the only required gesture, so the soundtrack can start at
  full volume on the same beat as the opening instead of waiting for an
  unrelated click.
- `qa-defense` compares the settled transform to three decimals instead of
  failing on a mid-transition frame.

## [1.3.0] — 2026-10-18

### Added
- Optional background music. A track dropped at `website/public/theme.mp3` (or
  `theme.mp3` beside the single file) starts on the same beat as the opening,
  loops, fades in to 32%, and can be switched off with the ♪ control in the
  header; the choice is remembered in `localStorage`.
- When the browser blocks sound before a gesture, playback starts on the first
  click or key press and seeks into the opening if it is still running.
- Without a track the control stays hidden and the exhibition remains silent.

The recording is never bundled with the repository: drop in a file you have the
right to publish, and `pnpm release` copies it beside the single file.

## [1.2.1] — 2026-10-18

### Removed
- Chapter 11's screen bloom (`.screen-bloom`) and the extra reply entrance it
  brought. The phone scene is back to the calmer 1.1.0 timing, where only the
  existing soft glow fades in behind the reply; no new light source is drawn.

## [1.2.0] — 2026-10-18

Six experience and delivery changes; no article text was touched.

### Changed
- The sandbox now opens at the model's own critical distance (`D=9`, i.e.
  `αγ/βδ`), so the first view is the coexistence line and the "临界" state
  instead of a curve running to 5×10³. The growth regime moved to a preset
  (`放大区`, `D=3`); unit and browser tests follow the new default.
- Chapter 12's notes no longer read as an errata sheet. It is now "校订与模型说明"
  and links to `content/corrections.json` instead of describing a mistyped
  attachment type inline.
- Chapter 4's folded paper rests at 56° instead of 64° (closing to 6°), and the
  vertical labels lose tracking (0.18em) and a point of size, so the three
  folds occlude each other less.

### Added
- Open Graph / Twitter card metadata plus a 1200×630 `og.jpg`, and a
  `CITATION.cff`.
- Chapter 11: the phone now wakes with a one-shot cool bloom (`.screen-bloom`)
  before the reply settles; it is hidden under reduced motion.
- CI runs the browser suite on every deploy: `qa-offline` and
  `qa-alignment --offline` against the packaged single file, using a bundled
  Chromium when Edge is unavailable (`scripts/browser.mjs`).

## [1.1.0] — 2026-10-18

First public release. This version is the 1.0.0 exhibition plus the engineering
cleanup below; the visual result is pixel-identical to 1.0.0.

### Fixed
- The packaged single file, the README and five `--offline` QA scripts each
  hard-coded a different name (`纸环的两面_网站.html`); the file had been
  renamed to `纸环的两面.html`, so repackaging and offline verification were
  broken. File names now come from one module, `website/scripts/paths.mjs`.

### Removed
- 85 CSS rules (≈6.6 KB) whose selectors never match the rendered page:
  the retired wall/resonance/rhythm-slider controls, the old Möbius overlay
  sliders, and the never-rendered per-block editorial note. Verified by an
  automated selector audit against the live DOM and by 28 pixel-identical
  before/after screenshots.

### Added
- `pnpm release`: re-render, repackage the single file, then verify both.
- `check:content` now also checks the packaged HTML: 71 blocks × 2 reading
  modes, every correction applied, 12 chapters, the PDF link beside it, and no
  references to site-root assets.
- Root `README.md`, `LICENSE` (code MIT; article text all rights reserved),
  this changelog, GitHub Actions for Pages and for release assets.

## [1.0.0] — 2026-10-18

Internal, unreleased build. Twelve-chapter exhibition with the opening
sequence, the Möbius twist, the six hands-on installations, the relationship
simulator, the complete-text reading mode, and the full QA suite.
