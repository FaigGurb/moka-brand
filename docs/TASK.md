# Current task (single source of truth)

Shared between the planning chat (Claude, cloud) and Claude Code (local). Both read it before work and
update it at the end; git is the only channel between them. Keep it short — replace, don't append.

- **Objective:** Real-time 3D səyahəti (PR #2) istifadəçi bəyənmədi: "buglu, donur, sönük". Hədəf istinad videosu kimi (enkywebstudio, "Wake the beans"): **fotorealistik, scroll ilə idarə olunan video kadr ardıcıllıqları** (Apple texnikası), donmadan, kəsintisiz; ümumi dizayn **tünd luxury** (qara/espresso, studiya işığı, böyük zərif başlıqlar, qızılı imza xətti — MOKA-nın qara-ağ brendi ilə uyğun).
- **Qərarlar (istifadəçi, 2026-10-13):** (1) Videolar: Weave (Figma AI) ilə yaradılacaq, yalnız pulsuz/kredit daxilində; hər run əvvəl qiymət + təsdiq. (2) Üslub: tünd luxury. (3) "Qırıntı, kəsinti, donma olmasın."
- **Blokerlər:** — (Canva şəkilləri köməkçi dizayn 'Desktop wallpaper for coffee photos' (DAHX5rFVxFU) vasitəsilə export olundu; istəsən Canva-da silə bilərsən).
- **Plan:**
  - A. Mühərrik (asset-dən asılı deyil): `components/film/ScrollFilm.tsx` — sticky səhnə, canvas, scroll → kadr; bütün kadrlar əvvəlcə kodlanmış (WebP blob) yüklənir (açar kadrlar birinci), cari pəncərə ±N `createImageBitmap` ilə fon rejimində dekod olunur, qalanı bağlanır (yaddaş); mobil üçün ayrıca kiçik kadr dəsti; reduced-motion → poster. Çıxarma skripti `docs/tools/film/extract.sh` (ffmpeg → webp 1280/720).
  - B. Kliplər (Weave): 1 dən yaxın plan (qara fon, düşən dənlər), 2 qovurma (yaşıl→tünd, tüstü), 3 üyütmə (Mazzer, axan toz), 4 Chemex/V60 tökmə + bloom, 5 MOKA ağ fincanı (rəsmi qablaşdırma dəyişməz), qızılı xətt. 5–6 s, sabit kamera, loop-suz, qara studiya.
  - C. Dizayn: hero + səyahət fəsilləri ScrollFilm ilə; köhnə real-time Journey çıxarılır; qalan bölmələr tünd luxury tipoqrafiya ilə yenilənir.
- **Status:** Lighthouse düzəlişləri: CoverFrame ölçülənə qədər gizli (CLS), h2→h3 ardıcıllığı, hero videosu səhifə yükləndikdən sonra (zəif cihazda 720). Commit olunub, push/deploy olunmayıb.
- **Verification:** check + build; Lighthouse (lokal) mobil perf 8→43, CLS 0.638→0.021, TBT 5.4→1.2 s, LCP 9.1→7.0 s, a11y 99→100; desktop perf 82→87, CLS 0.143→0.012. step/swipe/nav/cls skriptləri keçdi. Instagram reels Firecrawl/Exa ilə oxunmadı (dəstəklənmir). Real telefon yoxlanmayıb.
- **Next step:** İstifadəçi icazə verərsə DEPLOY; sonra mobil LCP (hero still/JS yükü) üzərində işləmək.

## Recent decisions (newest first, max 5)
- 2026-10-14: Davamlı scroll filmi: Kling start→end kadr keçidləri bizim still-lər arasında; fincanın K-sı generatora verilmir (boş fincan → vektor K still).
- 2026-10-14: Video kliplər Higgsfield (Kling 3.0 Std) ilə; Pro rejim Basic planda yoxdur. Scroll-scrub əvəzinə loop video (donmasın).
- 2026-10-13: Video modelləri ödənişli olduğundan foto-real still + kinematik keçid (CinemaStage) seçildi; K loqosu vektordan qoyulur.
- 2026-10-13: Real-time 3D səyahət rədd → foto-real scroll video ardıcıllığı + tünd luxury.
- 2026-10-13: Səhifə-miqyaslı 3D səyahət deploy olundu (PR #2).
