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
- **Status:** Dünya müqayisəsi (Lighthouse + Awwwards meyarlı münsif + beynəlxalq müştəri paneli; MOKA 7.2 — 1-ci, amma "Günün saytı" həddi 7.5) əsasında: ana səhifə qısaldı (28.6k → 21.9k px), Rəng/Tətbiqlər/AR-oyun-Club `/system/` səhifəsinə köçdü, menyu 6 keçid, bölmə mətnləri iri və parlaq, dən kartı yapışqan, "Yuxarı qayıt" yalnız yuxarı sürüşəndə, film kadrlarının qalanı ilk hərəkətdən sonra yüklənir. Lokal commit; deploy icazə ilə.
- **Verification:** check 16/16 + build; lokal desktop Lighthouse: performans 60→94, TBT 5006→61 ms, film kadrları açılışda 9.9→1.2 MB; telefon swipe izi (11 sürüşdürmə, hər biri bir fəsil) və desktop wheel testi keçdi; tam səhifə şəkilləri. Real iPhone yoxlanmayıb.
- **Next step:** Deploy (icazə ilə) → müqayisə testini canlı saytda təkrarla. MOKA-dan: zal fotoları, satılan dənlər və qiymətlər, B2B forma/e-poçt, ISA loqosu, "konsept" qeydinin taleyi.

## Recent decisions (newest first, max 5)
- 2026-10-17: "Süni bazar": AI personalar (docs/tools/personas) canlı saytı yoxlayır, nəticəyə görə düzəliş, sonra təkrar.
- 2026-10-17: Enky üslubu hibrid şəkildə, pulsuz: tünd MOKA filmi qalır, üstünə nəhəng söz, fəsil indeksi, fakt etiketləri.
- 2026-10-14: Davamlı scroll filmi: Kling start→end kadr keçidləri bizim still-lər arasında; fincanın K-sı generatora verilmir (boş fincan → vektor K still).
- 2026-10-14: Video kliplər Higgsfield (Kling 3.0 Std) ilə; Pro rejim Basic planda yoxdur. Scroll-scrub əvəzinə loop video (donmasın).
- 2026-10-13: Video modelləri ödənişli olduğundan foto-real still + kinematik keçid (CinemaStage) seçildi; K loqosu vektordan qoyulur.
