# Changelog

All notable changes to this project are recorded here. Versions follow
[semantic versioning](https://semver.org/); the published single-file build is
`纸环的两面.html` at the repository root.

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
