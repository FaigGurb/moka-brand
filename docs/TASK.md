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
- **Status:** Persona raund 2: sayt MOKA-nın qara-ağ boz şkalasına keçdi (tokenlər, brend kitabı, gün slaydları qara + rəngli xətt, crema boz, bölmələr öz fonu ilə); "Filmi ötür", "Yuxarı qayıt", telefonda başlıqda AZ/EN/RU, hero-da kafelər birinci, kafelərə ani keçid, Instagram menyuda, AR kartı rəsmi lockup, ritual "konsept təklifi", oyun "Yeni rekord". Ballar raund 1→2: Leyla 6→8, Sergey 6→7, Anna 6→7, Rasim 4→7, brend meneceri 7→7, münsif 6→7. Lokal commit-lər; deploy icazə ilə.
- **Verification:** check 16/16 + build; Playwright: desktop/telefon tam səhifə şəkilləri, kafelər keçidi (top 72), film nişanları məzmun üstündə gizli, menyu kilidi, dil yönləndirmə. Real iPhone yoxlanmayıb.
- **Next step:** Deploy (icazə ilə) → raund 3 personalar canlı saytda. MOKA-dan lazım: real qiymətlər, satılan dənlər (bar şəklində "Brazil Mogiana dark" görünür), götür pəncərəsinin hansı kafədə olduğu, ISA loqosu, real xəritə icazəsi.

## Recent decisions (newest first, max 5)
- 2026-10-17: "Süni bazar": AI personalar (docs/tools/personas) canlı saytı yoxlayır, nəticəyə görə düzəliş, sonra təkrar.
- 2026-10-17: Enky üslubu hibrid şəkildə, pulsuz: tünd MOKA filmi qalır, üstünə nəhəng söz, fəsil indeksi, fakt etiketləri.
- 2026-10-14: Davamlı scroll filmi: Kling start→end kadr keçidləri bizim still-lər arasında; fincanın K-sı generatora verilmir (boş fincan → vektor K still).
- 2026-10-14: Video kliplər Higgsfield (Kling 3.0 Std) ilə; Pro rejim Basic planda yoxdur. Scroll-scrub əvəzinə loop video (donmasın).
- 2026-10-13: Video modelləri ödənişli olduğundan foto-real still + kinematik keçid (CinemaStage) seçildi; K loqosu vektordan qoyulur.
