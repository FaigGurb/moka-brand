# QA scripts

Browser checks used before every deploy. They expect the repository root served at
`http://localhost:8765/moka-brand/` (e.g. `python3 -m http.server 8765` from the folder that
contains a `moka-brand` symlink/checkout) and Python Playwright with Chromium.

| Script | What it checks |
| --- | --- |
| `responsive.py` | every page × 4 viewports × 3 languages (+ reduced motion): horizontal overflow, console and page errors |
| `linkcheck.py` | crawls all pages, requests every internal link/asset, flags anything outside `/moka-brand/` |
| `a11y.py` | axe-core WCAG 2 A/AA + best practices (set `AXE_JS` to `axe.min.js`) |
| `scroll_perf.py` | phone emulation with 4× CPU throttling: load long tasks and full-page scroll frame times |
| `offscreen_draws.py` | counts WebGL draw calls per scene while other sections are on screen (should be 0) |

Lighthouse (lab): `npx lighthouse http://localhost:8765/moka-brand/ --only-categories=performance,accessibility,best-practices,seo`.
SEO shows "blocked from indexing" on purpose while `NEXT_PUBLIC_CONCEPT` is on.
