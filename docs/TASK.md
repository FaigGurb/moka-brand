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
- **Status:** Süni istifadəçi testi (`docs/tools/personas/`): 6 persona canlı saytı gəzdi (ballar 4–7/10). Ortaq problem — kafelər tapılmır. Düzəldi: `Cafes` (zəng/xəritə düymələri) telefon menyusunun başında, footer `#kafeler`, nav-da "Kafelər", hero-da saatlar; menyu açıqkən səhifə/film sürüşmür; ilk girişdə brauzer dili en/ru → həmin versiya; menyuda "[₼]" → "qiymət kafedə"; paket şüarı mətndən uzaqlaşdı; "Xəttə qədər." təklif kimi qeyd olundu.
- **Verification:** check (16/16) + build; Playwright: en-US/ru-RU ilk giriş → /en/, /ru/, az-AZ qalır; menyu açıq swipe → səhifə y=0, menyu scroll olur; ekran şəkilləri yoxlandı. Konsol xətası (Rasim) təkrarlanmadı. Real telefon yoxlanmayıb.
- **Next step:** Qalan persona iradları: brend rəngləri (qəhvəyi vs MOKA qara-ağ) — istifadəçi qərarı; hero loop/film kəskinliyi; ikinci yarının "şablon" görünüşü; nav aktiv vəziyyəti. Düzəlişdən sonra personaları təkrar işlət və balları müqayisə et.

## Recent decisions (newest first, max 5)
- 2026-10-17: "Süni bazar": AI personalar (docs/tools/personas) canlı saytı yoxlayır, nəticəyə görə düzəliş, sonra təkrar.
- 2026-10-17: Enky üslubu hibrid şəkildə, pulsuz: tünd MOKA filmi qalır, üstünə nəhəng söz, fəsil indeksi, fakt etiketləri.
- 2026-10-14: Davamlı scroll filmi: Kling start→end kadr keçidləri bizim still-lər arasında; fincanın K-sı generatora verilmir (boş fincan → vektor K still).
- 2026-10-14: Video kliplər Higgsfield (Kling 3.0 Std) ilə; Pro rejim Basic planda yoxdur. Scroll-scrub əvəzinə loop video (donmasın).
- 2026-10-13: Video modelləri ödənişli olduğundan foto-real still + kinematik keçid (CinemaStage) seçildi; K loqosu vektordan qoyulur.
