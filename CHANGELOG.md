# Changelog

All notable changes to this project are recorded here. Versions follow
[semantic versioning](https://semver.org/); the published single-file build is
`纸环的两面.html` at the repository root.

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
