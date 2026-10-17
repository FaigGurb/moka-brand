# MOKA saytı — yayın öncəsi yoxlama siyahısı

Bu siyahı iki hissədir: **avtomatik yoxlanılanlar** (hər dəyişiklikdən sonra kompüterdə işə salınır) və **əl ilə, real cihazda** yoxlanılmalı olanlar (emulyator bunları tam əvəz etmir).

## 1. Avtomatik (hər deploy-dan əvvəl)

| Yoxlama | Necə | Gözlənilən |
| --- | --- | --- |
| TypeScript | `cd web && npm run typecheck` | 0 xəta |
| ESLint | `npm run lint` | 0 xəta / xəbərdarlıq |
| Build | `npm run build` | bütün səhifələr statik export olunur |
| Üfüqi scroll | hər səhifə 1440, 1024, 390, 375 px enində | `scrollWidth − innerWidth = 0` |
| Konsol xətaları | az / en / ru, reduced-motion daxil | 0 |
| Əlçatanlıq (axe-core, WCAG 2 AA) | ana səhifə, menyu, məxfilik, AR, oyunlar, Club | ciddi (serious/critical) xəta yoxdur |
| Performans | telefon emulyasiyası + 4× zəif CPU, bütün səhifə boyu scroll | ekrandan kənar 3D səhnələr kadr çəkmir; scroll ~60 fps |

## 2. Real cihazda (iPhone Safari + Android Chrome)

**Ümumi**
- [ ] Giriş animasiyası bir dəfə görünür, səhifə yenilənəndə təkrarlanmır.
- [ ] Scroll ilişmir və titrəmir: film (Dəndən fincana), Konsepsiya, Bakıda bir gün, Paket ailəsi. Telefonda bunlar sadələşdirilmiş variantdadır (Paketlər yana swipe, Konsepsiya bir dəfəlik animasiya, rəng panelləri); kompüterdə scroll səhnələridir.
- [ ] Filmdə bir scroll = bir mərhələ; Qovurma və Dəmləmə bələdçisinə bir scroll ilə keçilir.
- [ ] Ünvan zolağı gizlənəndə/görünəndə sticky bölmələr sıçramır.
- [ ] Tətbiqlər bölməsində "3D-də fırlat" stəkanı açır (telefonda düymə ilə, kompüterdə özü); telefon qızmır, batareya sürətlə düşmür.
- [ ] Dil dəyişdirici: AZ / EN / RU; Rus başlıqları Montserrat ilə düzgün görünür; Azərbaycan hərfləri (ə, ğ, ı, ö, ş, ü, ç) hər yerdə düzgündür.
- [ ] Menyu düyməsi, alt menyu, bütün keçidlər; 404 səhifəsi (`/moka-brand/olmayan-sehife/`).
- [ ] Ekran qaraldılmış / "hərəkəti azalt" rejimi: animasiyalar sönür, məzmun oxunur.

**AR**
- [ ] Kartı skan et: kamera görüntüsü görünür, hərflər qalxır, Chemex dolur, xal toast-u çıxır.
- [ ] Masana qoy: iPhone-da Quick Look, Android-də Scene Viewer açılır; stəkanın qol rəngi AR-da da dəyişmiş görünür.
- [ ] Qəhvə selfisi: özünü görürsən, 3 filtr bir-bir dəyişir, şəkil çəkilir, Paylaş / Yadda saxla işləyir.
- [ ] Kamera icazəsi rədd ediləndə izah görünür.

**Oyunlar və Club**
- [ ] Hər oyun sona qədər oynanır, nəticə və xal görünür.
- [ ] Gündəlik limit: eyni oyundan 100 xaldan çox yazılmır.
- [ ] Club: hədiyyə kodu, QR, "Məlumatları sil".

**Paylaşım**
- [ ] Linki WhatsApp / Telegram / Instagram DM-də göndər: şəkil (og-az/en/ru.png) və başlıq çıxır.
- [ ] Telefonda "Ana ekrana əlavə et": ikon və ad (MOKA) düzgündür.

## 3. Rəsmi yayına keçəndə (MOKA təsdiq edərsə)

1. `NEXT_PUBLIC_CONCEPT=false` ilə build et: axtarış sistemləri indeksləməyə başlayır, "konsept" qeydlərini mətndən çıxar.
2. Domen: `web/.env` → `NEXT_PUBLIC_SITE_URL=https://...`, `next.config.ts` → `basePath` boş; repo kökünə `CNAME`.
3. Bütün `[yer tutucu]`ları real məlumatla əvəz et: ünvan, telefon, iş saatları, menyu və qiymətlər, mənşə və dad notları, e-poçt (məxfilik səhifəsi).
4. Loqonun orijinal vektor faylı ilə `web/src/lib/logo.ts` və `ar/shared/moka-art.js` nöqtələrini yenilə.
5. Real fotoşəkillər (kafe, içkilər) — WebP, 1600 px, `loading="lazy"`.
6. Analitika lazımdırsa: cookie-siz xidmət (məs. Plausible / Umami) və məxfilik səhifəsinə qeyd.
7. MOKA Club real olacaqsa: hesab sistemi, kassada kod yoxlaması, saxtakarlığa qarşı limitlər — backend tələb edir.
8. Google Search Console: sitemap (`/moka-brand/sitemap.xml` və ya yeni domen).
