# Current task (single source of truth)

Shared between the planning chat (Claude, cloud) and Claude Code (local). Both read it before work and
update it at the end; git is the only channel between them. Keep it short — replace, don't append.

- **Objective:** Real-time 3D səyahəti (PR #2) istifadəçi bəyənmədi: "buglu, donur, sönük". Hədəf istinad videosu kimi (enkywebstudio, "Wake the beans"): **fotorealistik, scroll ilə idarə olunan video kadr ardıcıllıqları** (Apple texnikası), donmadan, kəsintisiz; ümumi dizayn **tünd luxury** (qara/espresso, studiya işığı, böyük zərif başlıqlar, qızılı imza xətti — MOKA-nın qara-ağ brendi ilə uyğun).
- **Qərarlar (istifadəçi, 2026-10-13):** (1) Videolar: Weave (Figma AI) ilə yaradılacaq, yalnız pulsuz/kredit daxilində; hər run əvvəl qiymət + təsdiq. (2) Üslub: tünd luxury. (3) "Qırıntı, kəsinti, donma olmasın."
- **Blokerlər:** Weave pulsuz plan = 2 run (istifadə olundu); video modelləri yalnız ödənişli. Canva pulsuz AI limiti bitdi. `media.canva.com` şəbəkədə bloklanır → Canva-da hazır 4 şəkil (tünd dən MAHX5dMjmTU, çatlayan dən MAHX5k1hoIA, üyütmə MAHX5pFq5tU, Chemex tökmə MAHX5nDDBlk, dolu Chemex MAHX5kOHdw8) yüklənə bilmir.
- **Plan:**
  - A. Mühərrik (asset-dən asılı deyil): `components/film/ScrollFilm.tsx` — sticky səhnə, canvas, scroll → kadr; bütün kadrlar əvvəlcə kodlanmış (WebP blob) yüklənir (açar kadrlar birinci), cari pəncərə ±N `createImageBitmap` ilə fon rejimində dekod olunur, qalanı bağlanır (yaddaş); mobil üçün ayrıca kiçik kadr dəsti; reduced-motion → poster. Çıxarma skripti `docs/tools/film/extract.sh` (ffmpeg → webp 1280/720).
  - B. Kliplər (Weave): 1 dən yaxın plan (qara fon, düşən dənlər), 2 qovurma (yaşıl→tünd, tüstü), 3 üyütmə (Mazzer, axan toz), 4 Chemex/V60 tökmə + bloom, 5 MOKA ağ fincanı (rəsmi qablaşdırma dəyişməz), qızılı xətt. 5–6 s, sabit kamera, loop-suz, qara studiya.
  - C. Dizayn: hero + səyahət fəsilləri ScrollFilm ilə; köhnə real-time Journey çıxarılır; qalan bölmələr tünd luxury tipoqrafiya ilə yenilənir.
- **Status:** Yeni dizayn qurulub (commit, deploy yox): foto-real hero + kinematik 'Bir fincanın yolu' (CinemaStage); real-time 3D silindi. Üyütmə/Dəmləmə fəsilləri müvəqqəti hero şəkli ilə — Canva şəkilləri gələndə dəyişiləcək.
- **Verification:** check+build keçdi; Chromium 1440/390 skrinşotları (hero + 5 fəsil), xəta yox. scroll_perf: mobil 4× CPU 44.7 fps (3D səyahət 30, ilkin 48), desktop 37 (3D 16, ilkin 42).
- **Next step:** Canva şəkillərini al (istifadəçi göndərir və ya media.canva.com açılır) → stills.py → Üyütmə (grind), Dəmləmə (pour + chemex), Qovurma (light→dark→crack). Sonra qalan bölmələrin tünd luxury cilası. **DEPLOY: no**.

## Recent decisions (newest first, max 5)
- 2026-10-13: Video modelləri ödənişli olduğundan foto-real still + kinematik keçid (CinemaStage) seçildi; K loqosu vektordan qoyulur.
- 2026-10-13: Real-time 3D səyahət rədd → foto-real scroll video ardıcıllığı + tünd luxury.
- 2026-10-13: Səhifə-miqyaslı 3D səyahət deploy olundu (PR #2).
- 2026-10-13: Hero canlı fon + gün işığı tozu deploy olundu (PR #1 merged).
- 2026-10-13: Workflow set up — plan in chat, implement in local Claude Code, review via git.
