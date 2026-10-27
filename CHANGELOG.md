# Changelog

All notable changes to this project are recorded here. Versions follow
[semantic versioning](https://semver.org/); the published single-file build is
`纸环的两面.html` at the repository root.

## [1.18.0] — 2026-10-27

### Changed
- Added selective red, blue, gold and blended accents to narrative phrases,
  model headings and the three practices while preserving the paper-white base.
- Fit the complete paper geometry to its viewport throughout the Möbius film
  and inline installation. Separate film captions and controls from the stage,
  including a side-by-side composition on short landscape screens.
- Unified opacity transitions for reading groups, interactive copy, numbers,
  charts, dialogs, reader mode and expandable content. Rapid changes settle on
  the latest choice; reduced motion retains brief opacity-only transitions.
- Fade the existing opening copy before replay and restore unfinished title
  lines smoothly when skipping. Preserve original music levels and pacing.
- Added independent projection coverage and browser regressions for text fades,
  rapid choices, menu/reader transitions and opening replay/skip.

## [1.17.1] — 2026-10-26

### Changed
- Restored warm paper white as the base for titles and quotations throughout the
  exhibition and film; removed chapter-wide blue/red title inheritance.
- Kept color on selected narrative phrases: blue/red fears, a blended shared
  perspective, and warm gold for walking together and the screen lighting up.
- Preserved type sizes, alignment, body colors and the dedication's serif voice;
  updated four-width typography checks for the new accent hierarchy.

## [1.17.0] — 2026-10-25

### Added
- An optional 22-second Möbius film: paper close-ups, two colored seam lights,
  a slow half-turn, a warm joining halo and a continuous light path over both sides.
- Modal playback with pause, replay, Escape/exit, background suspension and a
  static alternative for reduced motion or unavailable WebGL.
- Reuse the existing renderer; retain the original installation, its controls,
  text and selected state. No soundtrack changes or scroll-driven progression.
- Desktop/mobile playback and fallback checks in the deployment workflow.

## [1.16.4] — 2026-10-25

### Changed
- Restored the dedication paragraphs to their original serif typeface as a
  deliberate exception to body typography.
- Softened white titles with a gold base palette, blue for the avoidant chapter,
  red for the anxious chapter and warm ivory on the cover.
- Updated typography checks to preserve the dedication and section palettes.

## [1.16.3] — 2026-10-25

### Fixed
- Unified font families, weights and base colors across titles, body paragraphs,
  quotations, explanations, notes and equations. Red/blue semantic markers remain
  consistent; the complete-text reading mode keeps its readable paper palette.
- Added four-width typography consistency checks to deployment.
- Use the newest visibility notification when several shelter transitions arrive
  in one batch. A visible scene no longer stays paused because an older entry
  was read first. Offscreen suspension and reduced motion remain covered.
- Added a regression that reproduces an older and current visibility entry
  arriving together, alongside the envelope/music and closing-title fixes below.

## [1.16.2] — 2026-10-24

### Fixed
- Keep music silent behind the sealed envelope. Opening the envelope starts the
  soundtrack and opening sequence from the same action; outside clicks no longer
  consume an unrelated first-gesture music listener. Saved mute is respected.
- Restored the original sizes of the conclusion, dedication and book-end titles
  while retaining the revised spacing.
- Added mouse, touch and muted keyboard entry checks to the deployment checks.

## [1.16.1] — 2026-10-24

### Changed
- Restored the original fixed music level (0.30) throughout reading and scenes.
- Restored the original full-size Möbius composition, paper rendering and ending
  text. Step descriptions and controls stay visible; morphing remains button-only.
- Removed the return-time mini-scene and its unused interaction code.
- Applied a common spacing scale to chapter boundaries, headings, quotations,
  illustrations, reading, model explanations and practice sections.
- Gave mobile Möbius controls consistent space on short and tall screens.

## [1.16.0] — 2026-10-24

### Changed
- Connected the shelter, renewed conflict, practical agreements and final paper
  transformation through quieter transitions and a clearer ending hierarchy.
- Kept both original statements and private spaces. Repeated one shared crease
  pattern across the defensive folds, roof and final strip; added four seam
  stitches and retained distinct red/blue paths after reconnection.
- Added a simple return-time comparison: private space remains while a specific
  next conversation gives the waiting person an expectation.
- Separated model definitions, equations and derivation into readable units,
  simplified source labels and varied chapter/title spacing without changing
  any of the 71 corrected article blocks or the author's personal narrative.
- Removed the compulsory Möbius scrolling gate. Morphing remains button-only;
  the primary action leads, light follows connection, and optional tools sit
  in an expandable panel. The opening's scroll lock remains unchanged.
- Gave the existing music a scene-sensitive volume envelope: quieter during
  reading, present in major scenes, silent for the final dedication and while
  the page is hidden. Manual mute remains authoritative.
- Added responsive narrative/keyboard/audio checks to deployment, refreshed
  playback checks, and prepared a first-reader observation sheet. Actual human
  reader sessions have not yet been conducted.

## [1.15.0] — 2026-10-23

### Changed
- Moved the complete model explanation and derivation before the interactive
  sandbox, followed by a short guide to the red/blue curves and distance controls.
- Replaced scientific notation with grouped decimal numbers throughout chart
  ticks and result captions, without changing the underlying calculations.
- Reserved space for longer axis labels and made the time chart adapt to narrow
  screens so its labels stay readable. The phase chart and model assumptions
  now remain visible together on phones and tablets.
- Added formatting tests and responsive browser checks for reading order,
  unclipped labels, large values, model modes, reset and window resizing.

## [1.14.0] — 2026-10-23

### Changed
- Redrew the shared chairs with full backrests, seat planes and front/rear legs,
  adding a small table and two cups between them.
- Furnished the private spaces with a writing desk, open book and stool on one
  side, and a substantial potted plant on the other. Both remain after connection.
- Replaced the three isolated circular platforms with adjoining paper floor
  panels using one perspective, and moved the space labels below the furniture.
- Kept the approved roof, original statements, one-click interaction, continuous
  rain and visibility-based animation scheduling unchanged.

## [1.13.0] — 2026-10-22

### Changed
- Tightened the spacing between the Chapter 06 statements and the paper roof
  on desktop and mobile while preserving both original statements.
- Rain now continues after the roof connects. Added distant rain, paper folds,
  surface runoff, eave drips, ground ripples, seat shadows and subtle warm light.
- Separated the unfolding sequence from ambient weather, so replay remains
  available. Only weather updates once the roof settles; all motion pauses
  offscreen, in the background, in reading mode or with reduced motion enabled.
- Updated browser and performance checks to require continued rain when visible
  and zero scene writes / paused light animations while offscreen.

## [1.12.0] — 2026-10-22

### Changed
- Replaced the overlapping circles in Chapter 06 with two folded paper wings
  that form a shared roof. One click closes the exposed gap, keeps rain outside,
  and lights a shared place with two seats while both private spaces stay intact.
- Preserved the exact blue/red statements throughout the interaction and replay.
- Rain clipping and impact marks use the same roof geometry. The 5.7-second
  sequence stops updating when settled, offscreen, hidden, or in reading mode;
  reduced motion applies the completed scene synchronously.
- Updated responsive, keyboard, touch, geometry and standalone checks for the
  new shelter. The full article and other exhibition scenes are unchanged.

## [1.11.1] — 2026-10-21

### Fixed
- Reduced-motion mode now shows the shared word synchronously. The global
  0.01ms transition duration was creating an opacity transition, leaving it
  hidden until the next painted frame on some browsers. This scene explicitly
  disables those CSS transitions while retaining its normal animation.
- Added a same-task activation/visibility check so the issue cannot be hidden
  by test timing or a faster display refresh rate.

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
