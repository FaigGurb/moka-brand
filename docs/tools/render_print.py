"""Print-ready files for the MOKA concept (business card, bean card, A3 menu).

The official packaging (bag, cup, labels) stays as it is in MOKA's brand book, so it has no files here.

Each file is drawn as SVG in millimetres, wrapped in an HTML page whose size is the trim size + 3 mm
bleed on every side, and printed to PDF by Chromium (Playwright). Fonts are the self-hosted League
Spartan / Mulish from /fonts. Every page also gets a PNG preview.

Notes for the print shop (also printed on the proof pages):
- PDFs are RGB. CMYK values for every brand colour are in the brand book; the printer converts.
- Bleed 3 mm, keep text 4 mm inside the trim. Proof pages show trim (magenta) and safe area (cyan).
- Contact data comes from MOKA's public Google profile; names, prices and origins stay [placeholders].

Usage (repo root):  python3 docs/tools/render_print.py
Output:             web/public/brand-kit/print/*.pdf  (+ docs/tools/print-preview/*.png)
"""
import asyncio, math, pathlib, io
import qrcode, qrcode.image.svg
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "web/public/brand-kit/print"
PREV = ROOT / "docs/tools/print-preview"
FONTS = (ROOT / "fonts/fonts.css").as_uri()
SITE = "https://faiggurb.github.io/moka-brand/"
BLEED = 3.0

ESP, PAPER, KRAFT, MUTED = "#1B1714", "#F5F1EA", "#C9A882", "#5E5852"
SEHER, GUNORTA, AXSAM, SEHER_CITY, NAR, GLOW = "#C89B6D", "#D9B56A", "#A8643A", "#8E8A84", "#8E2F22", "#FFE2A6"
ROAST = ["#8C9A5B", "#C08A55", "#8A5A3B", "#5E3B26", "#2B1D15"]
INK, WHITE = "#111111", "#FFFFFF"  # the official black and white
ADDRESS = "Əhməd Cavad küçəsi, Bakı AZ1005"
PHONE = "+994 51 244 13 01"
DISPLAY = "'League Spartan','Montserrat',sans-serif"
TEXT = "'Mulish',sans-serif"

# ---- logo geometry (mirrors web/src/lib/logo.ts; units of the 675 x 155 wordmark) ----
LETTERS = {
    "M": ("polygon", "32,4 87,47 145,4 172,149 2,150", (0, 175)),
    "O": ("circle", (266, 77, 76), (188, 344)),
    "K": ("polygon", "381,7 508,7 467,77 508,149 385,149 407,77", (348, 510)),
    "A": ("polygon", "597,4 671,149 522,149", (520, 675)),
}
HANDLE = "M384,20 C364,20 352,36 352,54 C352,74 368,86 386,86 L393,94"
GAP = (74.5, 79.5)
_uid = [0]


def _clip():
    _uid[0] += 1
    cid = f"cut{_uid[0]}"
    return cid, (f'<clipPath id="{cid}"><rect x="-10" y="-10" width="700" height="{GAP[0]+10}"/>'
                 f'<rect x="-10" y="{GAP[1]}" width="700" height="100"/></clipPath>')


def letter(ch, color):
    """One letter in wordmark units, split by the signature line."""
    cid, clip = _clip()
    kind, g, _ = LETTERS[ch]
    shape = (f'<polygon points="{g}"/>' if kind == "polygon" else f'<circle cx="{g[0]}" cy="{g[1]}" r="{g[2]}"/>')
    extra = (f'<path d="{HANDLE}" fill="none" stroke="{color}" stroke-width="8"/>' if ch == "K" else "")
    return f'<defs>{clip}</defs><g clip-path="url(#{cid})" fill="{color}">{shape}</g>{extra}'


def wordmark(x, y, w, color):
    """Whole wordmark with its top-left at (x, y) mm and width w mm."""
    s = w / 675
    body = "".join(letter(c, color) for c in "MOKA")
    return f'<g transform="translate({x:.3f} {y:.3f}) scale({s:.5f})">{body}</g>'


def lockup(x, y, w, color):
    """The official lockup: wordmark over ROASTERY & EATERY at the same width."""
    s = w / 675
    return (wordmark(x, y, w, color)
            + f'<text x="{x + 2 * s:.3f}" y="{y + 200 * s:.3f}" textLength="{671 * s:.3f}" lengthAdjust="spacing" '
              f'font-family="{TEXT}" font-weight="600" font-size="{34 * s:.3f}" fill="{color}">ROASTERY &amp; EATERY</text>')


def qr(data, x, y, size, color):
    """QR code as crisp SVG rectangles."""
    q = qrcode.QRCode(border=0, error_correction=qrcode.constants.ERROR_CORRECT_M)
    q.add_data(data)
    q.make(fit=True)
    m = q.get_matrix()
    n = len(m)
    c = size / n
    rects = "".join(f'<rect x="{x + j*c:.3f}" y="{y + i*c:.3f}" width="{c+0.02:.3f}" height="{c+0.02:.3f}"/>'
                    for i, row in enumerate(m) for j, v in enumerate(row) if v)
    return f'<g fill="{color}">{rects}</g>'


def t(x, y, s, size, color, font=TEXT, weight=400, anchor="start", ls=0, extra=""):
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    return (f'<text x="{x:.3f}" y="{y:.3f}" font-family="{font}" font-size="{size}" font-weight="{weight}" '
            f'fill="{color}" text-anchor="{anchor}" letter-spacing="{ls}" {extra}>{s}</text>')


def pt(p):
    """points -> mm"""
    return p * 0.3528


def page(w, h, svg, proof=False, note=""):
    """w, h = trim size in mm. Returns HTML of one page with bleed (and trim/safe marks on proofs)."""
    W, H = w + 2 * BLEED, h + 2 * BLEED
    marks = ""
    if proof:
        marks = (f'<rect x="{BLEED}" y="{BLEED}" width="{w}" height="{h}" fill="none" stroke="#E6007E" stroke-width="0.25"/>'
                 f'<rect x="{BLEED+4}" y="{BLEED+4}" width="{w-8}" height="{h-8}" fill="none" stroke="#00AEEF" '
                 f'stroke-width="0.2" stroke-dasharray="1 1"/>')
    return (f'<section style="width:{W}mm;height:{H}mm"><svg xmlns="http://www.w3.org/2000/svg" '
            f'width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}"><g transform="translate({BLEED} {BLEED})">{svg}</g>'
            f'<g>{marks}</g></svg></section>')


def doc(pages, W, H, title):
    return f"""<!doctype html><html lang="az"><head><meta charset="utf-8"><title>{title}</title>
<link rel="stylesheet" href="{FONTS}">
<style>@page{{size:{W}mm {H}mm;margin:0}}html,body{{margin:0;padding:0}}section{{position:relative;overflow:hidden;break-after:page}}
section:last-child{{break-after:auto}}svg{{display:block}}</style></head><body>{''.join(pages)}</body></html>"""


# ------------------------------------------------------------------ business card 90 x 50 (the brand book's layout)
def business_card():
    w, h = 90, 50
    front = f'<rect x="-3" y="-3" width="96" height="56" fill="{INK}"/>' + lockup(17, 16.5, 56, WHITE)
    line_y = 25
    k = letter("K", INK)
    back = (f'<rect x="-3" y="-3" width="96" height="56" fill="{WHITE}"/>'
            + f'<g transform="translate({84 - 162 * 0.07:.3f} 6) scale(0.07) translate(-348 0)">{k}</g>'
            + f'<rect x="-3" y="{line_y}" width="96" height="0.35" fill="{INK}"/>'
            + t(6, line_y - 2.4, "[AD SOYAD]", pt(9.5), INK, font=DISPLAY, weight=600, ls=0.2)
            + t(42, line_y - 2.4, "[VƏZİFƏ]", pt(6.5), MUTED, weight=600, ls=0.3)
            + t(6, 31.5, "[e-poçt]", pt(7), INK)
            + t(6, 35.6, PHONE, pt(7), INK)
            + t(6, 39.7, ADDRESS, pt(7), INK)
            + t(6, 43.8, "@mokacoffeebaku", pt(7), MUTED))
    return w, h, [("front", front), ("back", back)]


# ------------------------------------------------------------------ bean card 55 x 85 (given with every bag)
def bean_card():
    w, h = 55, 85
    roast = 2   # sample: medium; the band's top edge is the signature line — higher = lighter roast
    band_top = 50 + roast * 4
    hole = f'<circle cx="{w - 7}" cy="7" r="2.2" fill="none" stroke="#E6007E" stroke-width="0.25" stroke-dasharray="0.6 0.4"/>'
    front = (f'<rect x="-3" y="-3" width="{w + 6}" height="{h + 6}" fill="{WHITE}"/>'
             + t(5, 9, "DƏN KARTI", pt(5.5), AXSAM, weight=700, ls=0.5)
             + lockup(5, 13, 30, INK)
             + t(5, 31, "[Mənşə]", pt(15), INK, font=DISPLAY, weight=500)
             + t(5, 37, "[dad notu] · [dad notu]", pt(6.5), INK)
             + t(5, 41.5, "[çəki] · MOKA-da qovrulub", pt(6), MUTED)
             + f'<rect x="-3" y="{band_top}" width="{w + 6}" height="{h + 3 - band_top}" fill="{ROAST[roast]}"/>'
             + f'<rect x="-3" y="{band_top}" width="{w + 6}" height="0.8" fill="{INK}"/>'
             + t(5, band_top + 6, "ORTA QOVURMA", pt(6), WHITE, weight=700, ls=0.5)
             + "".join(f'<rect x="{5 + i * 4.2:.2f}" y="{h - 9}" width="3.2" height="3.2" fill="{WHITE if i <= roast else "none"}" stroke="{WHITE}" stroke-width="0.35"/>' for i in range(5))
             + hole)
    rows = [("Proses", "[____]"), ("Hündürlük", "[____ m]"), ("Qovrulub", "[__.__.____]"), ("Partiya", "[№ ___]")]
    back = f'<rect x="-3" y="-3" width="{w + 6}" height="{h + 6}" fill="{WHITE}"/>' + t(5, 9, "XƏTTƏ QƏDƏR.", pt(7), INK, font=DISPLAY, weight=600)
    y = 15
    for k_, v in rows:
        back += f'<rect x="5" y="{y}" width="{w - 10}" height="0.2" fill="{INK}" opacity="0.4"/>' + t(5, y + 4, k_, pt(6), INK, weight=700) + t(w - 5, y + 4, v, pt(6), INK, anchor="end")
        y += 6
    back += f'<rect x="5" y="{y}" width="{w - 10}" height="0.2" fill="{INK}" opacity="0.4"/>'
    back += t(5, y + 6.5, "Hansı alətdə?", pt(6), INK, weight=700)
    for i, ch in enumerate("MOKA"):
        _, _, (u0, u1) = LETTERS[ch]
        sc = 5.5 / 155
        back += f'<g transform="translate({5 + i * 8} {y + 9}) scale({sc}) translate({-u0} 0)">{letter(ch, INK)}</g>'
    back += qr(SITE + "ar/", w - 19, h - 24, 14, INK) + t(w - 12, h - 6.5, "AR", pt(5.5), MUTED, weight=700, anchor="middle")
    back += t(5, h - 6.5, "@mokacoffeebaku", pt(5.5), MUTED) + hole
    return w, h, [("front", front), ("back", back)]


# ------------------------------------------------------------------ A3 menu 297 x 420
def menu():
    w, h = 297, 420
    s = f'<rect x="-3" y="-3" width="303" height="426" fill="{PAPER}"/>'
    s += lockup(20, 20, 120, INK)
    s += t(277, 30, "MENYU", pt(11), ESP, weight=700, anchor="end", ls=pt(11) * 0.24)
    s += t(277, 37.5, "Hər içkinin öz hərfi var", pt(10), MUTED, anchor="end")
    s += f'<rect x="-3" y="60" width="303" height="1.6" fill="{AXSAM}"/>'
    sections = [
        ("Espresso bar", AXSAM, "O", [("Espresso", "Qısa və sıx. Bütün barın bazası."), ("Doppio", "İkiqat espresso."),
                                       ("Americano", "Espresso və isti su."), ("Cappuccino", "Espresso, süd və qalın köpük."),
                                       ("Flat white", "Daha çox qəhvə, nazik süd köpüyü."), ("Latte", "Yumşaq, südlü, böyük fincanda.")]),
        ("Dəmləmə", SEHER, None, [("V60", "Dənin dad notlarını ən aydın göstərən damla üsulu.", "A"),
                                  ("Chemex · 2 nəfər", "Təmiz, şəffaf fincan; paylaşmaq üçün.", "K"),
                                  ("Moka pot", "Ocaqda dəmlənən güclü, sıx qəhvə.", "M")]),
        ("Soyuq", SEHER_CITY, "O", [("Cold brew", "Soyuq suda uzun dəmləmə."), ("Iced latte", "Buz, süd və espresso."),
                                    ("Espresso tonik", "Tonik üzərində espresso.")]),
        ("Dənlər", GUNORTA, None, [("Əsas · orta qovurma", "[mənşə] · [dad notları] · [çəki]", None),
                                   ("Tək mənşə · açıq qovurma", "[mənşə] · [dad notları] · [çəki]", None),
                                   ("Mövsümi · [ad]", "[mənşə] · [dad notları] · [çəki]", None)]),
        ("Yemək", NAR, None, [("Kruasan", "[təsvir]", None), ("Çizkeyk", "[təsvir]", None), ("Səhər yeməyi", "[təsvir]", None)]),
    ]
    cols = [(20, [0, 2]), (158.5, [1, 3, 4])]
    for x0, idxs in cols:
        y = 82
        for i in idxs:
            name, color, deflt, items = sections[i]
            s += f'<rect x="{x0}" y="{y - 7}" width="16" height="3" fill="{color}"/>'
            s += t(x0, y + 4.5, name, pt(26), ESP, font=DISPLAY, weight=500)
            y += 18
            for it in items:
                nm, desc = it[0], it[1]
                lt = it[2] if len(it) > 2 else deflt
                if lt:
                    _, _, (u0, u1) = LETTERS[lt]
                    sc = 8 / 155
                    s += f'<g transform="translate({x0} {y - 6.4}) scale({sc}) translate({-u0} 0)">{letter(lt, ESP)}</g>'
                else:
                    s += f'<circle cx="{x0 + 2.5}" cy="{y - 2}" r="1.3" fill="{color}"/>'
                s += t(x0 + 12, y, nm, pt(13.5), ESP, font=DISPLAY, weight=500)
                s += t(x0 + 118.5, y, "[₼]", pt(12), ESP, weight=700, anchor="end")
                s += t(x0 + 12, y + 6, desc, pt(9.5), MUTED)
                y += 18
            y += 12
    s += f'<rect x="-3" y="352" width="303" height="71" fill="{ESP}"/>'
    s += f'<rect x="-3" y="352" width="303" height="1.6" fill="{GLOW}"/>'
    s += t(20, 372, "Hərf alətdir, xətt səviyyədir.", pt(16), PAPER, font=DISPLAY, weight=500)
    s += t(20, 381, "O fincan · M moka pot · K Chemex · A V60", pt(9), "#D6D2CB")
    s += t(20, 397, f"{ADDRESS} · {PHONE} · hər gün, 24 saat · @mokacoffeebaku", pt(8.5), "#D6D2CB")
    s += t(20, 403, "Nümunə menyu: siyahı və qiymətlər yer tutucudur ([₼]).", pt(7.5), "#B8B0A6")
    s += f'<rect x="242" y="362" width="35" height="35" fill="{PAPER}"/>' + qr(SITE + "menu/", 244.5, 364.5, 30, ESP)
    s += t(259.5, 404, "Menyu və AR", pt(7.5), PAPER, weight=700, anchor="middle")
    return w, h, [("menu", s)]


JOBS = [("moka-business-card-90x50", business_card), ("moka-bean-card-55x85", bean_card), ("moka-menu-a3", menu)]


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREV.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, fn in JOBS:
            w, h, pages = fn()
            W, H = w + 2 * BLEED, h + 2 * BLEED
            # the PDF carries no trim marks; the bean card's punch hole is drawn as a dashed magenta die line
            html = doc([page(w, h, svg) for _, svg in pages], W, H, name)
            tmp = PREV / f"{name}.html"
            tmp.write_text(html, encoding="utf-8")
            pg = await b.new_page(device_scale_factor=2.5)
            await pg.goto(tmp.as_uri())
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(300)
            await pg.pdf(path=str(OUT / f"{name}.pdf"), width=f"{W}mm", height=f"{H}mm", print_background=True,
                         margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
            # previews: each page with trim + safe marks
            for i, (k, svg) in enumerate(pages):
                ph = doc([page(w, h, svg, proof=(k != "print"))], W, H, name)
                tmp.write_text(ph, encoding="utf-8")
                await pg.goto(tmp.as_uri())
                await pg.evaluate("document.fonts.ready")
                await pg.set_viewport_size({"width": int(W * 3.7795), "height": int(H * 3.7795)})
                await pg.screenshot(path=str(PREV / f"{name}-{k}.png"), full_page=True, scale="device")
            tmp.unlink()
            await pg.close()
            print("ok", name, f"{w}x{h} mm + {BLEED} mm bleed, {len(pages)} page(s)")
        await b.close()


if __name__ == "__main__":
    asyncio.run(main())
