# MOKA Brand Experience

Konsept / test işi: MOKA Coffee Roastery (Bakı) üçün korporativ kimlik təklifi və interaktiv brend saytı.
MOKA Coffee Roastery-nin rəsmi saytı deyil. Dizayn və kod: Faig Gurbanli.

**Canlı:** https://faiggurb.github.io/moka-brand/

| Yol | Nədir |
| --- | --- |
| `/` | Yeni sayt (v2): 3D hero, scroll hekayəsi, interaktiv qovurma xətti — `web/` qovluğundan build olunur |
| `/ar/` | WebAR demo (A-Frame + MindAR): AR kartını skan edəndə Chemex-ə qəhvə tökülür |
| `/ar/target.png` | AR kartı (stəkan qolu dizaynı) |
| `/game/` | "Xətti tut" mini oyunu |
| `/v1/` | Saytın əvvəlki, tək fayllı versiyası |

## Layihə quruluşu

```
web/                      Next.js layihəsi (mənbə kodu)
  src/app/                layout, səhifə, qlobal stillər və dizayn tokenləri (globals.css)
  src/components/hero/    Hero və 3D səhnə (HeroScene.tsx)
  src/components/sections Konsepsiya, Bakıda bir gün, Qovurma, Paket ailəsi, Kafedə, Təcrübə
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
- **Mətnlər:** hər bölmə öz faylındadır, məsələn `sections/Roast.tsx` içindəki `LEVELS` (mənşə, dad notları, xətt hündürlüyü).
- **Linklər:** `web/src/lib/site.ts`.
- **Loqo:** `web/src/lib/logo.ts` — həm SVG, həm də 3D eyni həndəsədən qurulur. Orijinal vektor fayl gəlsə, nöqtələri buradan dəyişin.

## 3D səhnə necə işləyir

`HeroScene.tsx` loqonun hər hərfini imza xətti boyunca iki yarıya bölür (`clipY`), hər yarını `ExtrudeGeometry` ilə həcmə çevirir və keramika materialı ilə işıqlandırır. Əks olunmalar xarici HDR faylı olmadan `Lightformer` panelləri ilə yaradılır. Hərflər açılışda yerinə düşür, siçana yumşaq reaksiya verir; scroll edəndə yarılar xətt boyunca aralanır və isti işıq güclənir. Three.js yalnız brauzerdə və yalnız hero üçün yüklənir (`next/dynamic`). WebGL yoxdursa, eyni loqo SVG kimi göstərilir. `prefers-reduced-motion` aktivdirsə, səhnə hərəkətsiz qalır.

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
