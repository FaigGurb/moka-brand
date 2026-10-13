# Current task (single source of truth)

Shared between the planning chat (Claude, cloud) and Claude Code (local). Both read it before work and
update it at the end; git is the only channel between them. Keep it short — replace, don't append.

- **Objective:** Hero-nun görünüşünü (bütün ekranlarda, ilk növbədə telefon) premium 3D səviyyəsinə qaldır və hero-ya canlı, dinamik arxa fon əlavə et. Hazırkı hero səhifənin ilk təəssüratıdır: 3D loqo/fincan sığmalı, mətnlə toqquşmamalı, hərəkət "bahalı" hiss olunmalı.
- **Files:** `web/src/components/hero/Hero.tsx`, `hero/HeroScene.tsx`; arxa fon: mövcud `fx/DayAmbient.tsx` (`--day`/`--day-rgb`, Bakı vaxtı) və `fx/CremaBackground.tsx` (WebGL shader) təkrar istifadə et, yeni sistem yazma. Mətn lazım olsa `i18n/dict.ts` (az/en/ru eyni shape; böyük fayl — hissə-hissə oxu). `globals.css` yalnız token/klass üçün.
- **Constraints:**
  - CLAUDE.md qaydaları: yalnız League Spartan + Mulish; rənglər `@theme`-dən; Three.js yalnız `next/dynamic` `ssr:false`, SVG fallback işləməlidir; GSAP yalnız `useGSAP` + `gsap.matchMedia()`; `prefers-reduced-motion`-da hərəkət söndürülür (statik kadr).
  - Performans: `frameloop` görünürlükdən; `perfTier()` ilə lite yol (DPR ≤1.5, MeshStandard, az instance); mobildə daimi tam-ekran qat əlavə etmə — arxa fon mobildə yüngül (aşağı res/fps və ya CSS gradient + `--day`).
  - Mövcud telefon tilt (hərflər cihazı izləyir, xətt düz qalır) və `lib/pointer.ts` pozulmasın. Qablaşdırma (Packs) və partner loqolarına toxunma.
  - Yeni uydurma fakt/mətn yox.
- **Acceptance:**
  1. 360×640, 390×844, 768×1024, 1440×900-də hero kəsilmir, mətn oxunur, 3D obyekt kadrda mərkəzlənib (`100svh`).
  2. Arxa fon canlıdır (gün vaxtına görə rəng + yumşaq hərəkət), mətn kontrastı qorunur; reduced-motion-da statik.
  3. Mobildə hiss olunan lag yoxdur (lite yol); desktop-da tam keyfiyyət.
  4. `npm run check` + `npm run build` keçir; `docs/tools/qa/` brauzer yoxlamaları və `docs/QA.md` hero bəndləri.
  5. Əvvəl/sonra skrinşotlar (mobil + desktop) hesabata.
- **Status:** code done, vizual yoxlama gözləyir (PR #1)
- **Verification:** `npm run check` (lint+typecheck+16 test) və `npm run build` keçdi. Brauzer skrinşotları (360/390/768/1440) ALINMADI — əl ilə və ya `docs/tools/qa/responsive.py` ilə yoxlanmalıdır.
- **Blockers:** —
- **Next step:** Mobil+desktop skrinşotla baxıb layout/kontrastı dəqiqləşdir (Hero.tsx: aspect-[675/400] mobil, scrim qatları). **DEPLOY: no** — "DEPLOY: yes" yazılana qədər yalnız commit.

## İcra qeydləri (model və alətlər)
- **Opus**: 3D səhnə, shader/fon, layout dizaynı (əsas iş). **Sonnet**: lint/typecheck düzəlişləri, i18n sinxronu, QA skriptləri.
- Skill-lər: `high-end-visual-design` (vizual dəyişiklik — lazımdır), `review` (commitdən əvvəl), `headroom` yalnız `dict.ts` kimi böyük faylda. `qa-only` yalnız deploydan sonra. Qalanlarını işlətmə.

## Recent decisions (newest first, max 5)
- 2026-10-13: Hero redesign planlandı (bütün ekranlar + dinamik fon), deploy hələ yox.
- 2026-10-13: Workflow set up — plan in chat, implement in local Claude Code, review via git.
- 2026-10-13: Hero phone tilt shipped (letters follow the device, the line stays level).
- 2026-10-12: Cream/video redesign and /flow/ rejected and reverted; video idea parked.
