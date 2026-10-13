# Current task (single source of truth)

Shared between the planning chat (Claude, cloud) and Claude Code (local). Both read it before work and
update it at the end; git is the only channel between them. Keep it short — replace, don't append.

- **Objective:** Bütün səhifə boyu BİR davamlı 3D səyahət: yaşıl dən → qovurma → üyütmə → dəmləmə → fincan. Aşağı scroll irəli aparır, yuxarı scroll geri qaytarır (tam geri çevrilən, scrub). Hazırkı yalnız-bir-bölmə "Bean Story" və səpələnmiş `BeanField` bu səyahətə çevrilir. Məqsəd: sayt "premium 3D təcrübə" kimi hiss olunsun.
- **Qərarlar (istifadəçi, 2026-10-13):** (1) Bir davamlı səhnə: ekranda sabit bir canvas, bölmələrin mətni yanından axır, bölmələr səyahətin fəsillərinə bağlanır. (2) Mobildə də davamlı, yüngül (CLAUDE.md-dəki "mobildə daimi tam-ekran qat yoxdur" qaydasına bu layihə üçün istisna; CLAUDE.md-ni yenilə).
- **Fəsil xəritəsi (Site.tsx sırası: Hero, Concept, BeanStory, DayPalette, Roast, BrewGuide, Partners, Tiers, Store, Marquee, Apps, Experience, FinalCta):** Hero (loqo, toxunma) → Concept + BeanStory: yaşıl dən, qovurma (rəng + çat) → DayPalette/Roast: qovurma dərəcələri → Roast sonu/BrewGuide başı: üyütmə → BrewGuide: dəmləmə (maye) → Tiers/Store/Apps: tamamlanmış fincan (rəsmi ağ fincan, qara K, qara qapaq, `Packs.tsx`-dən; qablaşdırmanı yenidən dizayn ETMƏ) → FinalCta: fincan + parıltı xətti. Sərhədlər tək faylda (`beans/phases.ts` kimi, three importsuz); mətn və səhnə eyni yerdən oxusun.
- **Files:** `components/beans/*` (BeanField, BeanFieldScene, BeanStoryScene, phases.ts), `sections/BeanStory.tsx`, `Site.tsx`, `lib/bean.ts`, `lib/beanPhysics.ts`, `lib/perf.ts`; yeni: `journey/`. Mətn: `i18n/dict.ts` (az mənbə; en/ru eyni shape; böyük fayl, hissə-hissə oxu).
- **Constraints:**
  - CLAUDE.md: Three.js yalnız `next/dynamic` `ssr:false`, statik fallback; GSAP yalnız `useGSAP` + `gsap.matchMedia()`; Lenis + `scrub:1`; reduced-motion-da hərəkət yox (hər fəsil üçün statik kadr); `ignoreMobileResize:true`.
  - Yalnız bir Canvas; `frameloop` görünürlükdən; `perfTier()` lite yol (DPR ≤1.5, MeshStandard, az instance, aşağı fps).
  - Oxunaqlıq: obyekt mətnlə toqquşmasın (sağ/sol növbələşir, telefonda arxa planda azaldılmış kontrast). `lib/pointer.ts` + `beanPhysics` təkrar istifadə.
  - Hero loqosu, telefon tilt-i, `CremaBackground` pozulmasın. Uydurma fakt yox (mənşə, dad nümunə/`[placeholder]`).
  - Rədd olunmuş cəhd: "cream/video redesign və /flow/" (2026-10-12). Yeni ayrı səhifə yaratma, ana səhifəni təkmilləşdir.
- **Mərhələlər (hər biri ayrı commit; sonunda skrinşot + `npm run check`):**
  1. Memarlıq: tək canvas, səhifə progress-i, fəsil pəncərələri; köhnə BeanField/BeanStory canvas-ı əvəz olunur; dən → qovrulmuş dən.
  2. Üyütmə (hissəciklər) + dəmləmə (maye/damcı) + fincan; fəsillər arası kamera keçidləri.
  3. Mobil lite yol, perf ölçümü (`docs/tools/qa/scroll_perf.py`, `offscreen_draws.py`), reduced-motion fallback.
  4. Cilalama: işıq/material, mətn kontrastı, az/en/ru, `docs/QA.md` yenilə.
- **Acceptance:**
  1. Aşağı/yuxarı scroll səyahəti dəqiq irəli/geri oynadır (scrub, atlama yox), 5 fəsil görünür.
  2. 360/390/768/1440: mətn oxunur, üfüqi overflow yox, konsolda xəta yox.
  3. Mobildə scroll lag-sız (lite yol); canvas ekrandan kənarda render etmir.
  4. Reduced-motion: statik, mətn oxunur. WebGL yoxdursa: statik fallback.
  5. `npm run check` + `npm run build` + `docs/tools/qa/` keçir; əvvəl/sonra skrinşotlar.
- **Status:** M1–M4 hazırdır (M4 PR #2-də commit olundu, deploy olunmayıb); real telefon yoxlaması gözləyir
- **Verification:** M4: check+build keçdi; responsive.py (az/en/ru × 4 ölçü + reduced-motion): overflow 0, xəta yox. 390 px skrinşotlar: yoldaş mətn/şəkil üstündə ~0.14 şəffaflığa enir, boş yerdə tam görünür; R3F kanvası toxunuşları tuturdu (pointer-events auto) — düzəldildi, `elementFromPoint` indi altdakı elementi qaytarır. Final: bağlı fincan başlıq gedəndən sonra ortada qalır, Paketlər qalxanda küncə kiçilir (boş qara ekran yox). Headless-də desktop 3D adaptiv rejimlə sönür (M3 qeydi), real cihaz yoxlanmayıb.
- **Blockers:** —
- **Next step:** İstifadəçi PR #2-ni real telefonda yoxlasın (docs/QA.md → 3D səyahət); razıdırsa "DEPLOY: yes" ilə deploy, sonra "Merge et".

## İcra qeydləri (model və alətlər)
- **Opus**: səhnə memarlığı, material, kamera/keçidlər. **Sonnet**: i18n sinxronu, lint/typecheck, QA skriptləri.
- Skill-lər: `high-end-visual-design` (vizual), `review` (commitdən əvvəl), `headroom` (böyük fayllar). `qa-only` yalnız deploydan sonra. Figma/Canva MCP lazım deyil.

## Recent decisions (newest first, max 5)
- 2026-10-13: M4: yoldaş mətnin üstündə solğun iz olur (gizlənmir); final fincan Paketlərə qədər ortada qalır.
- 2026-10-13: Səhifə-miqyaslı 3D səyahət planı: bir davamlı canvas, mobildə də lite davamlı.
- 2026-10-13: Hero canlı fon + gün işığı tozu deploy olundu (PR #1 merged).
- 2026-10-13: Workflow set up — plan in chat, implement in local Claude Code, review via git.
- 2026-10-13: Hero phone tilt shipped (letters follow the device, the line stays level).
