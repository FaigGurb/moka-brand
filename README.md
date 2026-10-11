# MOKA Brand Experience

Konsept / test işi: MOKA Coffee Roastery (Bakı) üçün korporativ kimlik təklifi və interaktiv brend saytı.
MOKA Coffee Roastery-nin rəsmi saytı deyil. Dizayn və kod: Faig Gurbanli.

**Canlı:** https://faiggurb.github.io/moka-brand/

| Yol | Nədir |
| --- | --- |
| `/menu/` · `/en/menu/` · `/ru/menu/` | Menyu konsepti: espresso bar, dəmləmə, soyuq, dənlər, yemək, məkan (qiymət və ünvan yer tutucudur) |
| `/brand/` (+ en, ru) | Brend kitabı: platforma, loqo qaydaları, rənglər və kontrast, tipoqrafiya, foto, danışıq tonu, motion, səs loqosu, yükləmələr (PDF, SVG, MP4, WAV) |
| `/privacy/` (+ en, ru) | Məxfilik: nə saxlanılır, kamera necə işlənir |
| `/` · `/en/` · `/ru/` | Yeni sayt (v2) üç dildə: 3D hero, scroll hekayəsi, interaktiv qovurma xətti — `web/` qovluğundan build olunur |
| `/ar/` | AR mərkəzi: üç WebAR təcrübəsinə keçid (`?lang=en|ru`) |
| `/ar/card/` | Kartı skan et (A-Frame + MindAR image): dörd hərf kartdan qalxır, Chemex peyda olur və qəhvə imza xəttinə qədər dolur |
| `/ar/table/` | Masana qoy (model-viewer): stəkan, Chemex, paket və 3D loqo real ölçüdə; iPhone-da Quick Look, Android-də Scene Viewer |
| `/ar/selfie/` | Qəhvə selfisi (MindAR face): köpük bığ, imza xətti, hərflərdən tac; şəkil çəkmə və paylaşma |
| `/ar/target.png` | AR kartı (stəkan qolu dizaynı) |
| `/game/` | Oyun mərkəzi: üç mini oyun və MOKA Club balansı |
| `/game/line/` | Xətti tut: fincanı imza xəttinə qədər doldur (5 raund, seriya bonusu) |
| `/game/rain/` | Dən yağışı: 45 saniyəlik "Bakıda bir gün", stəkanla qovrulmuş və qızıl dənləri tut |
| `/game/memory/` | Hərf yaddaşı: hərfi aləti ilə, günün rəngini adı ilə cütlə (16 kart) |
| `/club/` | MOKA Club (konsept): xallar, Dəmləmə pasportu (6 möhür), QR-lı endirim kodları |
| `/v1/` | Saytın əvvəlki, tək fayllı versiyası |

## Layihə quruluşu

```
web/                      Next.js layihəsi (mənbə kodu)
  src/app/                layout, səhifə, qlobal stillər və dizayn tokenləri (globals.css)
  src/components/hero/    Hero və 3D səhnə (HeroScene.tsx)
  src/components/sections Konsepsiya, Dəndən fincana, Bakıda bir gün, Qovurma, Paket ailəsi, Kafedə, Təcrübə
  src/components/beans/   "Dəndən fincana" səhnəsi, bütün saytda üzən dənlər (BeanField)
  src/components/apps/    3D stəkan (CupScene.tsx)
  public/brand/           dizayn lövhələrinin WebP şəkilləri (Tətbiqlər bölməsi)
  src/components/ui/      MagneticButton
  src/lib/                loqo həndəsəsi (logo.ts), GSAP qeydiyyatı, hook-lar, linklər
  scripts/deploy.mjs      statik exportu repo kökünə köçürür
ar/                       AR mərkəzi: card/, table/, selfie/, shared/ (rəsm və dil köməkçiləri), models/ (.glb + generator)
game/                     oyun mərkəzi + line/, rain/, memory/; shared/game.css, shared/sound.js (səslər)
club/                     MOKA Club: club.js (ortaq xal modulu, localStorage), index.html, vendor/qrcode.js (MIT)
v1/                       köhnə sayt (build bu qovluqlara toxunmur)
index.html, _next/, 404*  web/-dən generasiya olunan fayllar — əllə redaktə etməyin
```

## Texnologiyalar (hamısı pulsuz, açıq mənbəli)

Next.js 15 (statik export) · React 19 · TypeScript · Tailwind CSS 4 · Three.js + React Three Fiber + Drei · GSAP + ScrollTrigger (@gsap/react) · Google Fonts: League Spartan və Mulish (Azərbaycan əlifbasının bütün hərfləri, ₼ daxil).

## Lokal işə salmaq

Tələb: Node.js 20+ və npm.

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # statik export: web/out (basePath /moka-brand)
npm run deploy     # build + export-u repo kökünə köçürür
```

Sonra `git add -A && git commit && git push` — GitHub Pages `main` budağının kökündən yayımlayır.

## Fərdiləşdirmə

- **Rənglər və şriftlər:** `web/src/app/globals.css` içindəki `@theme` bloku (dizayn sistemindəki tokenlərlə eynidir).
- **Mətnlər (3 dil):** hamısı `web/src/i18n/dict.ts` faylındadır — `az`, `en`, `ru` obyektləri eyni quruluşdadır. Rəng və ölçülər isə komponentlərdə qalır (məs. `sections/Roast.tsx` içindəki `LEVEL_STYLE`).
- **Rus şrifti:** League Spartan-da Kiril yoxdur; başlıqlarda Rus hərfləri avtomatik Montserrat-dan götürülür.
- **Linklər:** `web/src/lib/site.ts`.
- **Loqo:** `web/src/lib/logo.ts` — həm SVG, həm də 3D eyni həndəsədən qurulur. Orijinal vektor fayl gəlsə, nöqtələri buradan dəyişin.

## 3D səhnə necə işləyir

`HeroScene.tsx` loqonun hər hərfini imza xətti boyunca iki yarıya bölür (`clipY`), hər yarını `ExtrudeGeometry` ilə həcmə çevirir və keramika materialı ilə işıqlandırır. Əks olunmalar xarici HDR faylı olmadan `Lightformer` panelləri ilə yaradılır. Hərflər açılışda yerinə düşür, siçana yumşaq reaksiya verir; scroll edəndə yarılar xətt boyunca aralanır və isti işıq güclənir. Arxa planda qovrulmuş qəhvə dənələri üzür və scroll edəndə kənarlara dağılır. Three.js yalnız brauzerdə yüklənir (`next/dynamic`). WebGL yoxdursa, eyni loqo SVG kimi göstərilir. `prefers-reduced-motion` aktivdirsə, səhnə hərəkətsiz qalır.

### Dəndən fincana (`sections/BeanStory.tsx`)

Pinned 3D hekayə, bir scroll dəyəri (0–1) ilə idarə olunur: yaşıl dənlər üzür → qovrulur (rəng yaşıldan tünd qəhvəyiyə, `lib/bean.ts`) → spiral ilə Chemex-ə düşüb üyüdülür (hissəciklər filtrdə yığılır) → su tökülür, qəhvə aşağı kameraya damcılayır və imza xəttinə çatanda xətt işıqlanır. Dənlər `InstancedMesh`, üyüdülmüş qəhvə `Points`, maye isə clipping plane ilə dolur. Telefonda dən və hissəcik sayı azdır; səhnə yalnız ekranda görünəndə render olunur. Reduced-motion rejimində son kadr statik göstərilir, WebGL yoxdursa SVG "K" hərfi.

### Bütün saytda dənlər

`beans/BeanField.tsx` səhifənin üstündə yüngül, şəffaf bir 3D qat açır: dənlər kənarlarda üzür, scroll ilə dərinliyə görə hərəkət edir, siçana doğru azca əyilir və siçan/barmaq toxunanda itələnir (klik/toxunuş dənləri dağıdır). Hero və "Dəndən fincana" ekrandaykən bu qat gizlənir (onların öz dənləri var, eyni itələmə fizikası `lib/beanPhysics.ts` ilə). Göstərici `lib/pointer.ts`-dədir: telefonda `touchmove` scroll zamanı da işləyir.

### Tətbiqlər və Dəmləmə bələdçisi

- **Tətbiqlər** (`sections/Apps.tsx`): 3D götür stəkanı (sürüşdürüb fırlatmaq, S/M/L ölçü, günün rəngləri ilə qol) və Instagram profili kimi qurulmuş qalereya. Lövhələr dizayn kanvasından render olunub (`public/brand/*.webp`); şəkilə basanda böyüdülür.
- **Dəmləmə bələdçisi** (`sections/BrewGuide.tsx`): M/O/K/A = Moka pot, Espresso, Chemex, V60. Porsiyaya görə qəhvə və su hesablanır, taymer addımları göstərir və hərf qəhvə ilə imza xəttinə qədər dolur. Rəqəmlər ümumi tövsiyədir.

### MOKA Club (konsept loyallıq)

`club/club.js` oyunlar, AR səhifələri və saytın paylaşdığı kiçik moduldur (`window.MokaClub`). Xallar yalnız brauzerdə (`localStorage['moka-club-v1']`) saxlanılır:
- oyunlar: nəticə xala çevrilir, gündə hər oyundan ən çox 100 xal;
- AR: kart tapılanda, AR-da masaya qoyanda, selfi çəkəndə +25 (sessiyada bir dəfə);
- Dəmləmə pasportu: 6 təcrübənin hamısı → +100 bonus;
- hədiyyələr: 150 ölçü artımı, 300 — 10% endirim, 600 — filtr qəhvə; kod `MOKA-XXXX-XX` formatında, QR ilə, 7 gün.
Hamısı demo: real proqramda hesab, kassa yoxlaması və saxtakarlıq limitləri lazımdır.

### Effektlər

Preloader (sessiyada bir dəfə: imza xətti çəkilir və ekran xətt boyunca açılır), siçan üçün izləyici halqa (`data-cursor` etiketi ilə), yuxarıda oxuma xətti, yüngül "film grain", scroll sürətinə reaksiya verən marquee. Hamısı `components/fx/`-dədir; reduced-motion rejimində söndürülür.

### Hamar scroll

`SmoothScroll.tsx` — Lenis (təkərlə scroll üçün inertsiya), GSAP ticker-i ilə sinxron. Telefonda təbii scroll qalır; reduced-motion rejimində söndürülür.

## Animasiyalar

Hamısı GSAP + ScrollTrigger ilə, `useGSAP` və `gsap.matchMedia()` daxilində (avtomatik təmizlənir):
- Konsepsiya: pinned hekayə, hərflər bir-bir işıqlanır, imza xətti çəkilir.
- Bakıda bir gün: pinned rəng hekayəsi (Səhər → Günorta → Axşam → Şəhər → Nar).
- Paket ailəsi: şaquli scroll ilə üfüqi qalereya.
- Kafedə: clip-path ilə açılan vizual və çəkilən LED xətti.
Bütün bu hekayələr telefonda da işləyir; yalnız reduced-motion rejimində pin və scrub söndürülür və məzmun adi siyahı kimi görünür. Telefonda 3D hero siçan əvəzinə özü yavaş-yavaş yellənir.

## Performans

- Ekrandan kənar 3D səhnələr kadr çəkmir (`frameloop`), three.js hero-da brauzer boş olanda yüklənir.
- Telefon və zəif cihazlar (`lib/perf.ts` → `perfTier()`) yüngül yolla işləyir: aşağı DPR, sadə materiallar, az dən/hissəcik; bütün səhifəyə yayılan dən qatı, "grain" və bulanıq menyu fonu yalnız kompüterdədir.
- Şriftlər lokaldır (`@fontsource-variable/*`; statik səhifələr üçün `fonts/`), Google-a sorğu yoxdur.
- Ölçmə (telefon emulyasiyası, 4× zəif CPU, bütün səhifə scroll): ~1.5 fps → ~47 fps (3D proqram renderi ilə); 3D-siz ~59 fps.

## Testlər

`cd web && npm run check` (lint + typecheck + unit testlər) · brauzer yoxlamaları `docs/tools/qa/`-də · iş qaydası `docs/ENGINEERING.md`-də · GitHub Actions hər push-da `check` və `build` işə salır.

## Yayın

- `web/src/lib/meta.ts`: `NEXT_PUBLIC_CONCEPT` (default `true` → `noindex`), `NEXT_PUBLIC_SITE_URL`.
- Hər səhifədə canonical, hreflang, Open Graph şəkli (`public/og-*.png`), ikonlar, `manifest.webmanifest`, `sitemap.xml`, brendli 404.
- Yoxlama siyahısı: [`docs/QA.md`](docs/QA.md).

## Problemlər

- **Pinned bölmələr sürüşür:** şriftlər yükləndikdən sonra `ScrollRefresh` ölçüləri yeniləyir; yenə də olarsa, səhifəni yeniləyin.
- **3D görünmür:** brauzerdə WebGL söndürülüb ola bilər — sayt SVG loqo ilə işləməyə davam edir.
- **GitHub Pages-də CSS/JS yüklənmir:** `.nojekyll` faylının kökdə olduğunu yoxlayın (`_next` qovluğu üçün lazımdır).
