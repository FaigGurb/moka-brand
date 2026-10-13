# Current task (single source of truth)

Shared between the planning chat (Claude, cloud) and Claude Code (local). Both read it before work and
update it at the end; git is the only channel between them. Keep it short — replace, don't append.

- **Objective:** Real-time 3D səyahəti (PR #2) istifadəçi bəyənmədi: "buglu, donur, sönük". Hədəf istinad videosu kimi (enkywebstudio, "Wake the beans"): **fotorealistik, scroll ilə idarə olunan video kadr ardıcıllıqları** (Apple texnikası), donmadan, kəsintisiz; ümumi dizayn **tünd luxury** (qara/espresso, studiya işığı, böyük zərif başlıqlar, qızılı imza xətti — MOKA-nın qara-ağ brendi ilə uyğun).
- **Qərarlar (istifadəçi, 2026-10-13):** (1) Videolar: Weave (Figma AI) ilə yaradılacaq, yalnız pulsuz/kredit daxilində; hər run əvvəl qiymət + təsdiq. (2) Üslub: tünd luxury. (3) "Qırıntı, kəsinti, donma olmasın."
- **Blokerlər:** Weave hesabı Figma-ya bağlı deyil (istifadəçi: app.weavy.ai → profile → link Figma). Şəbəkə siyasəti `21st.dev` və `www.getlayers.ai`-ni bloklayır (environment → Network access → Allowed domains).
- **Plan:**
  - A. Mühərrik (asset-dən asılı deyil): `components/film/ScrollFilm.tsx` — sticky səhnə, canvas, scroll → kadr; bütün kadrlar əvvəlcə kodlanmış (WebP blob) yüklənir (açar kadrlar birinci), cari pəncərə ±N `createImageBitmap` ilə fon rejimində dekod olunur, qalanı bağlanır (yaddaş); mobil üçün ayrıca kiçik kadr dəsti; reduced-motion → poster. Çıxarma skripti `docs/tools/film/extract.sh` (ffmpeg → webp 1280/720).
  - B. Kliplər (Weave): 1 dən yaxın plan (qara fon, düşən dənlər), 2 qovurma (yaşıl→tünd, tüstü), 3 üyütmə (Mazzer, axan toz), 4 Chemex/V60 tökmə + bloom, 5 MOKA ağ fincanı (rəsmi qablaşdırma dəyişməz), qızılı xətt. 5–6 s, sabit kamera, loop-suz, qara studiya.
  - C. Dizayn: hero + səyahət fəsilləri ScrollFilm ilə; köhnə real-time Journey çıxarılır; qalan bölmələr tünd luxury tipoqrafiya ilə yenilənir.
- **Status:** A hazır (mühərrik + çıxarma skripti); B (kliplər) Weave bağlantısını gözləyir
- **Verification:** A: ffmpeg test ardıcıllığı (120 kadr, commit olunmayıb) ilə: scroll → düzgün kadr və başlıq; telefon emulyasiyası 4× CPU: kadr ort. 18 ms / p95 20 ms (canvas arxa ölçüsü kadr keyfiyyətinə bərabərləşdirildikdən sonra; əvvəl 52 ms). Real 3D səyahət hələ saytdadır.
- **Next step:** İstifadəçi Weave-i bağlasın → B: klip promptları (dən, qovurma, üyütmə, tökmə, MOKA fincanı), hər run üçün qiymət təsdiqi; sonra C. **DEPLOY: no**.

## Recent decisions (newest first, max 5)
- 2026-10-13: Real-time 3D səyahət rədd → foto-real scroll video ardıcıllığı + tünd luxury.
- 2026-10-13: Səhifə-miqyaslı 3D səyahət deploy olundu (PR #2).
- 2026-10-13: Hero canlı fon + gün işığı tozu deploy olundu (PR #1 merged).
- 2026-10-13: Workflow set up — plan in chat, implement in local Claude Code, review via git.
- 2026-10-12: Cream/video redesign and /flow/ rejected and reverted; video idea parked.
