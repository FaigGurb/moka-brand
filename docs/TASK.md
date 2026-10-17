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
- **Status:** Redizayn mərhələ 2 + istinadlar (cafe scroll story, Tabasco, Cumulus, Pendragon; MOKA Instagram): yeni "Barda" bölməsi MOKA-nın öz reel kadrları ilə, hero-da "Filmi izlə" avtomatik tur, şablon izləri təmizləndi (böyük hərfli etiketlər, '·' zəncirləri), başlıqlar böyüdü. Lokal commit; push/deploy icazəsiz edilmir.
- **Verification:** check (16/16) + build; Playwright: step/nav/swipe (bir dəfə vaxt səbəbli fərq, təkrarda keçdi), CLS 0.002, tur 0→6 və dayandırma, az/en/ru Bar video oynayır, xəta yoxdur; responsive.py overflow 0; axe ana səhifələr təmiz (ru/menu köhnə link-in-text-block qalır); linkcheck 0 sınıq. Real telefon yoxlanmayıb.
- **Next step:** İstifadəçi baxsın → icazə ilə push/DEPLOY. Sonra: Store-un konsept divar şəklini real fasad kadrı ilə əvəz etmək (MOKA-dan icazəli fotolar), kiçik linklərin ölçüsü.

## Recent decisions (newest first, max 5)
- 2026-10-17: Enky üslubu hibrid şəkildə, pulsuz: tünd MOKA filmi qalır, üstünə nəhəng söz, fəsil indeksi, fakt etiketləri.
- 2026-10-14: Davamlı scroll filmi: Kling start→end kadr keçidləri bizim still-lər arasında; fincanın K-sı generatora verilmir (boş fincan → vektor K still).
- 2026-10-14: Video kliplər Higgsfield (Kling 3.0 Std) ilə; Pro rejim Basic planda yoxdur. Scroll-scrub əvəzinə loop video (donmasın).
- 2026-10-13: Video modelləri ödənişli olduğundan foto-real still + kinematik keçid (CinemaStage) seçildi; K loqosu vektordan qoyulur.
- 2026-10-13: Real-time 3D səyahət rədd → foto-real scroll video ardıcıllığı + tünd luxury.
