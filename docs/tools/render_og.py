"""Open Graph images (1200 × 630) for the three languages: web/public/og-{az,en,ru}.png.

Usage (repo root): python3 docs/tools/render_og.py
"""
import asyncio, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from render_print import letter, lockup, FONTS  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "web/public"
COPY = {
    "az": ("BAKI · KORPORATİV KİMLİK KONSEPTİ", ["4 hərf.", "4 dəmləmə.", "1 xətt."]),
    "en": ("BAKU · BRAND IDENTITY CONCEPT", ["4 letters.", "4 brews.", "1 line."]),
    "ru": ("БАКУ · КОНЦЕПТ ФИРМЕННОГО СТИЛЯ", ["4 буквы.", "4 способа.", "1 линия."]),
}


def html(lang):
    eyebrow, lines = COPY[lang]
    k = letter("K", "#C89B6D")
    s = 260 / 155
    gap_y = 190 + 77 * s
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">'
           f'<defs><radialGradient id="g" cx="0.5" cy="0.55" r="0.6"><stop offset="0" stop-color="#3a2a1c"/><stop offset="1" stop-color="#1B1714"/></radialGradient></defs>'
           f'<rect width="1200" height="630" fill="url(#g)"/>'
           + lockup(72, 64, 300, "#F5F1EA")
           + f'<g transform="translate({1010 - 430 * s:.2f} 190) scale({s:.4f})">{k}</g>'
           + f'<rect x="870" y="{gap_y - 3:.1f}" width="250" height="6" fill="#FFE2A6"/>'
           + '<rect x="0" y="560" width="1200" height="4" fill="#FFE2A6"/><rect x="0" y="552" width="1200" height="20" fill="#FFE2A6" opacity="0.12"/>'
           + '</svg>')
    text = "".join(f"<div>{l}</div>" for l in lines)
    return f"""<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><link rel="stylesheet" href="{FONTS}">
<style>html,body{{margin:0}}.f{{position:relative;width:1200px;height:630px;overflow:hidden;color:#F5F1EA}}
.f svg{{position:absolute;inset:0}}.e{{position:absolute;left:72px;top:182px;font:700 17px Mulish,sans-serif;letter-spacing:.2em;color:#C89B6D}}
.h{{position:absolute;left:66px;top:222px;font:500 84px 'League Spartan','Montserrat',sans-serif;line-height:.98;letter-spacing:-.01em}}</style>
</head><body><div class="f">{svg}<div class="e">{eyebrow}</div><div class="h">{text}</div></div></body></html>"""


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1200, "height": 630})
        for lang in COPY:
            tmp = OUT / f"_og-{lang}.html"
            tmp.write_text(html(lang), encoding="utf-8")
            await pg.goto(tmp.as_uri())
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(OUT / f"og-{lang}.png"))
            tmp.unlink()
            print("ok", lang)
        await b.close()


if __name__ == "__main__":
    asyncio.run(main())
