# MOKA — engineering guide

How work on this project is done. Distilled from the owner's master engineering directive and
adapted to what this project actually is. Read this (and `CLAUDE.md`) before changing anything.

## 1. What the project is

- **Purpose:** concept corporate identity + brand experience for MOKA Coffee Roastery (Baku), made as
  a job-application test project. Not the official MOKA site.
- **Hosting:** GitHub Pages, `main` branch root, base path `/moka-brand/`. No backend.
- **Stack:** Next.js 15 static export (`web/`), React 19, TypeScript, Tailwind 4, GSAP + Lenis,
  three.js / R3F; static pages in `ar/` (A-Frame, MindAR, model-viewer — vendored in `vendor/`),
  `game/`, `club/`. Fonts self-hosted.
- **No server-side requirements today.** MOKA Club, codes and "orders" are demos stored in
  `localStorage`. A real loyalty programme would need accounts, server-side validation of codes at
  the till and rate limits — do not fake that on the client.

## 2. Working principles

1. Inspect before modifying; understand before redesigning; measure before optimising.
2. Test before claiming success. Never report a test, a device check or a deployment that did not
   happen. Separate: implemented · verified automatically · verified in a browser · not verified
   (why) · deferred (why).
3. Prefer simple, maintainable changes; no new dependency or infrastructure without a reason.
4. Preserve working features and the owner's changes; never force-push, rewrite history or delete
   branches.
5. Prioritise: **P0** security / broken essentials → **P1** broken navigation, severe mobile issues →
   **P2** accessibility, performance, SEO, code quality → **P3** polish.
6. No invented facts: no fake testimonials, statistics, prices, addresses, partners or claims.
   Unknown data stays as `[placeholder]`; proposals (brand platform, tone of voice) are labelled.
7. Be efficient: targeted searches, batch related changes, don't re-audit what is documented here.

## 3. Commands

```bash
cd web
npm ci                 # install exactly the lockfile
npm run check          # lint + typecheck + unit tests
npm run build          # static export to web/out
npm run deploy         # build + copy the export to the repo root (then commit + push)
```

Unit tests (`web/tests/*.test.ts`, Node's built-in runner, no extra dependency) cover: copy shape
in az/en/ru (site and brand book), logo geometry (and that `ar/shared/moka-art.js` mirrors it),
links and base path, page metadata (canonical/hreflang/OG/robots), the day palette, colour maths
(WCAG contrast, CMYK), and the MOKA Club wallet rules.

Browser checks: `docs/tools/qa/` (responsive + console, link crawler, axe accessibility, scroll
performance, off-screen WebGL draws). Release checklist for real devices: `docs/QA.md`.

Asset generators (reproducible): `docs/tools/sound_logo.py` (sound logo WAV),
`docs/tools/render_logo_video.py` + `logo-animation.html` (MP4/GIF), `docs/tools/render_brand_pdf.py`
(brand book PDFs), `ar/models/source/generate.html` (AR GLB models).

## 4. Definition of done (per change)

- `npm run check` and `npm run build` pass.
- `responsive.py` shows no overflow and no console errors in all languages and with reduced motion.
- `linkcheck.py` shows no broken internal links and nothing outside `/moka-brand/`.
- `a11y.py` shows no serious/critical axe violations on the touched pages.
- For 3D/animation work: `offscreen_draws.py` shows no rendering off screen; `scroll_perf.py`
  doesn't regress.
- The live site is checked after the push (GitHub Pages takes ~1–2 minutes).

## 5. Security notes (static site)

- No secrets in the repo (checked with a grep for keys/tokens). Keep it that way: no API keys in
  client code — anything secret needs a server.
- Third-party code at runtime: AR libraries are vendored (`vendor/`); MindAR face still downloads
  MediaPipe WASM (jsDelivr) and its model (googleapis) — disclosed on the privacy page.
- External links use `rel="noopener noreferrer"`. No `dangerouslySetInnerHTML` with user data.
- GitHub Pages cannot set HTTP security headers (CSP, HSTS is automatic on github.io). A custom
  host or CDN would be needed for a strict CSP.
- `npm audit`: remaining advisories are in build/dev tooling (Next's bundled PostCSS used only on our
  own CSS; ESLint's `braces`) or in server features we don't run (static export). Re-check on
  every dependency update; Next 16 migration is the long-term fix.

## 6. Performance budget

- Every 3D canvas pauses off screen (`frameloop`); three.js in the hero loads on idle.
- Phones / weak devices use `perfTier() === "low"`: DPR ≤ 1.5, standard materials, fewer instances,
  no page-wide WebGL layer, no grain, no backdrop blur. Shader backgrounds run at ⅓–½ resolution and
  20–30 fps and only while visible.
- Text that may be the LCP element is never animated from `opacity: 0`.
- Lab targets (Lighthouse mobile): LCP ≤ 2.5 s on text pages, CLS ≤ 0.1. Lab ≠ field data.

## 7. Final report template

1. Summary of improvements · 2. Important files · 3. Technologies · 4. Decisions · 5. Tests run and
results · 6. Browser/responsive checks · 7. Security, SEO, accessibility, performance findings ·
8. Deployment status · 9. Remaining issues · 10. Next steps.
