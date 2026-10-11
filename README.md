# MOKA Brand Experience

Konsept / test işi: MOKA Coffee Roastery (Bakı) üçün korporativ kimlik təklifi və interaktiv brend saytı.
MOKA Coffee Roastery-nin rəsmi saytı deyil. Dizayn və kod: Faig Gurbanli.

**Canlı:** https://faiggurb.github.io/moka-brand/

| Yol | Nədir |
| --- | --- |
| `/` · `/en/` · `/ru/` | Yeni sayt (v2) üç dildə: 3D hero, scroll hekayəsi, interaktiv qovurma xətti — `web/` qovluğundan build olunur |
| `/ar/` | WebAR demo (A-Frame + MindAR): AR kartını skan edəndə Chemex-ə qəhvə tökülür; `?lang=en|ru` |
| `/ar/target.png` | AR kartı (stəkan qolu dizaynı) |
| `/game/` | "Xətti tut" mini oyunu (seriya bonusu, vibrasiya, nəticəni paylaşma); `?lang=en|ru` |
| `/v1/` | Saytın əvvəlki, tək fayllı versiyası |

## Layihə quruluşu

```
web/                      Next.js layihəsi (mənbə kodu)
  src/app/                layout, səhifə, qlobal stillər və dizayn tokenləri (globals.css)
  src/components/hero/    Hero və 3D səhnə (HeroScene.tsx)
  src/components/sections Konsepsiya, Dəndən fincana, Bakıda bir gün, Qovurma, Paket ailəsi, Kafedə, Təcrübə
  src/components/beans/   "Dəndən fincana" 3D səhnəsi (BeanStoryScene.tsx) və mərhələ sərhədləri (phases.ts)
  src/components/ui/      MagneticButton
  src/lib/                loqo həndəsəsi (logo.ts), GSAP qeydiyyatı, hook-lar, linklər
  scripts/deploy.mjs      statik exportu repo kökünə köçürür
ar/  game/  v1/           ayrıca statik səhifələr (build onlara toxunmur)
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

## Animasiyalar

Hamısı GSAP + ScrollTrigger ilə, `useGSAP` və `gsap.matchMedia()` daxilində (avtomatik təmizlənir):
- Konsepsiya: pinned hekayə, hərflər bir-bir işıqlanır, imza xətti çəkilir.
- Bakıda bir gün: pinned rəng hekayəsi (Səhər → Günorta → Axşam → Şəhər → Nar).
- Paket ailəsi: şaquli scroll ilə üfüqi qalereya.
- Kafedə: clip-path ilə açılan vizual və çəkilən LED xətti.
Bütün bu hekayələr telefonda da işləyir; yalnız reduced-motion rejimində pin və scrub söndürülür və məzmun adi siyahı kimi görünür. Telefonda 3D hero siçan əvəzinə özü yavaş-yavaş yellənir.

## Problemlər

- **Pinned bölmələr sürüşür:** şriftlər yükləndikdən sonra `ScrollRefresh` ölçüləri yeniləyir; yenə də olarsa, səhifəni yeniləyin.
- **3D görünmür:** brauzerdə WebGL söndürülüb ola bilər — sayt SVG loqo ilə işləməyə davam edir.
- **GitHub Pages-də CSS/JS yüklənmir:** `.nojekyll` faylının kökdə olduğunu yoxlayın (`_next` qovluğu üçün lazımdır).
