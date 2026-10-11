"""Print-ready files for the MOKA concept (business card, cup sleeve, bag label, A3 menu).

Each file is drawn as SVG in millimetres, wrapped in an HTML page whose size is the trim size + 3 mm
bleed on every side, and printed to PDF by Chromium (Playwright). Fonts are the self-hosted League
Spartan / Mulish from /fonts. Every page also gets a PNG preview.

Notes for the print shop (also printed on the proof pages):
- PDFs are RGB. CMYK values for every brand colour are in the brand book; the printer converts.
- Bleed 3 mm, keep text 4 mm inside the trim. Proof pages show trim (magenta) and safe area (cyan).
- Facts that MOKA has not supplied (names, phone, address, prices, origins) are [placeholders].

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


# ------------------------------------------------------------------ business card 90 x 50
def business_card():
    w, h = 90, 50
    front = (f'<rect x="-3" y="-3" width="96" height="56" fill="{ESP}"/>'
             + wordmark(18, 17.6, 54, PAPER)
             + t(45, 39.5, "COFFEE ROASTERY · BAKI", pt(6.2), "#B8B0A6", weight=700, anchor="middle", ls=pt(6.2) * 0.22))
    # back: the signature line runs across at the height of the logo's gap
    line_y = 27
    back = (f'<rect x="-3" y="-3" width="96" height="56" fill="{PAPER}"/>'
            + t(6, 12.5, "[Ad Soyad]", pt(11), ESP, font=DISPLAY, weight=500)
            + t(6, 17.2, "[Vəzifə]", pt(7), MUTED)
            + f'<rect x="-3" y="{line_y}" width="96" height="0.9" fill="{AXSAM}"/>'
            + t(6, 35.5, "[telefon]", pt(7), ESP)
            + t(6, 39.7, "[e-poçt]", pt(7), ESP)
            + t(6, 43.9, "@mokacoffeebaku · [Ünvan], Bakı", pt(7), ESP)
            + qr(SITE + "ar/", 74, 30.5, 12, ESP)
            + t(80, 45.4, "AR", pt(5.5), MUTED, weight=700, anchor="middle", ls=0.4))
    return w, h, [("front", front), ("back", back)]


# ------------------------------------------------------------------ bag label 100 x 150
def bag_label():
    w, h = 100, 150
    roast = 2  # sample: medium-light; the band's height shows the roast (higher = lighter)
    band_top = 114 + roast * 3   # lighter roast = higher line (114 … 126 mm)
    rows = [("Mənşə", "[ölkə, region]"), ("Proses", "[yuyulmuş / natural]"), ("Hündürlük", "[____ m]"),
            ("Qovurma tarixi", "[__.__.____]"), ("Çəki", "[çəki]")]
    s = (f'<rect x="-3" y="-3" width="106" height="156" fill="{KRAFT}"/>'
         + wordmark(8, 10, 46, ESP)
         + t(8, 32, "TƏK MƏNŞƏ · NÜMUNƏ", pt(6.5), ESP, weight=700, ls=pt(6.5) * 0.2)
         + t(8, 44, "[Çeşidin adı]", pt(20), ESP, font=DISPLAY, weight=500)
         + t(8, 52, "[dad notu] · [dad notu] · [dad notu]", pt(8.5), ESP))
    y = 62
    for k, v in rows:
        s += (f'<rect x="8" y="{y}" width="84" height="0.25" fill="{ESP}" opacity="0.35"/>'
              + t(8, y + 5.2, k, pt(7.5), ESP, weight=700) + t(92, y + 5.2, v, pt(7.5), ESP, anchor="end"))
        y += 7.6
    s += f'<rect x="8" y="{y}" width="84" height="0.25" fill="{ESP}" opacity="0.35"/>'
    # roast scale: five steps, the sample's step marked
    sy = y + 6
    s += t(8, sy + 2, "QOVURMA", pt(6.5), ESP, weight=700, ls=pt(6.5) * 0.2)
    for i, c in enumerate(ROAST):
        s += f'<rect x="{34 + i*11.6:.2f}" y="{sy - 2.2}" width="11" height="5" fill="{c}"/>'
    s += f'<rect x="{34 + roast*11.6:.2f}" y="{sy - 3.2}" width="11" height="7" fill="none" stroke="{ESP}" stroke-width="0.5"/>'
    # band: its top edge is the signature line
    s += (f'<rect x="-3" y="{band_top}" width="106" height="{156 - band_top}" fill="{ROAST[roast]}"/>'
          f'<rect x="-3" y="{band_top}" width="106" height="1.2" fill="{PAPER}"/>'
          + t(8, band_top + 8, "Xətt nə qədər yüksəkdirsə,", pt(6.5), PAPER)
          + t(8, band_top + 11.2, "qovurma o qədər açıqdır.", pt(6.5), PAPER)
          + qr(SITE + "ar/", 77, band_top + 4, 15, PAPER)
          + t(8, 140.8, "Skan et: AR-da dənin hekayəsi", pt(6.5), PAPER, weight=700)
          + t(8, 145.4, "MOKA Coffee Roastery · Bakı · @mokacoffeebaku", pt(6.5), PAPER))
    return w, h, [("label", s)]


# ------------------------------------------------------------------ cup sleeve (12 oz sample dieline)
def cup_sleeve():
    D1, D2, H = 86.0, 76.0, 60.0           # sleeve top / bottom diameter, height (sample)
    GLUE = 10.0
    slant = math.hypot(H, (D1 - D2) / 2)
    Ro = slant * D1 / (D1 - D2)
    Ri = Ro - slant
    theta = math.pi * D1 / Ro                # wrap angle
    tot = theta + GLUE / Ro
    cx = 155.0
    top = 12.0
    cy = top + Ro                             # arc centre below the artwork
    W, Hh = 310.0, 110.0                      # page trim area (art sits inside, not a rectangle)

    def P(r, a):
        return cx + r * math.sin(a), cy - r * math.cos(a)

    def band(r1, r2, a0, a1):
        p1, p2, p3, p4 = P(r2, a0), P(r2, a1), P(r1, a1), P(r1, a0)
        large = 1 if a1 - a0 > math.pi else 0
        return (f'M{p1[0]:.3f},{p1[1]:.3f} A{r2:.3f},{r2:.3f} 0 {large} 1 {p2[0]:.3f},{p2[1]:.3f} '
                f'L{p3[0]:.3f},{p3[1]:.3f} A{r1:.3f},{r1:.3f} 0 {large} 0 {p4[0]:.3f},{p4[1]:.3f} Z')

    half = tot / 2
    bl = BLEED / Ro
    art = f'<path d="{band(Ri - BLEED, Ro + BLEED, -half - bl, half + bl)}" fill="{ESP}"/>'
    # signature line: an arc at the logo's gap height
    line_r = Ro - slant * 0.49

    def on_arc(a, r, inner):
        x, y = P(r, a)
        return f'<g transform="translate({x:.3f} {y:.3f}) rotate({math.degrees(a):.4f})">{inner}</g>'

    # front: the four letters, each set on the arc so their split meets the curved line
    lw = 0.1  # mm per logo unit: the wordmark is 67.5 mm wide on the front
    gap_mid = (GAP[0] + GAP[1]) / 2
    front = ""
    for ch, (_, _, (u0, u1)) in LETTERS.items():
        cxu = (u0 + u1) / 2
        dx = (cxu - 337.5) * lw
        a = dx / line_r
        inner = f'<g transform="scale({lw}) translate({-cxu} {-gap_mid})">{letter(ch, PAPER)}</g>'
        front += on_arc(a, line_r, inner)
    art += front
    gap_mm = (GAP[1] - GAP[0]) * lw
    art += f'<path d="{band(line_r - gap_mm / 2, line_r + gap_mm / 2, -half - bl, half + bl)}" fill="{GLOW}"/>'
    # sides: tagline on the left, AR code on the right (quarter turns from the front)
    q = theta / 4
    art += on_arc(-q, line_r + 9, t(0, 0, "XƏTTƏ QƏDƏR.", pt(14), PAPER, font=DISPLAY, weight=500, anchor="middle"))
    art += on_arc(-q, line_r - 10, t(0, 0, "COFFEE ROASTERY · BAKI", pt(6), "#B8B0A6", weight=700, anchor="middle", ls=0.6))
    art += on_arc(q, line_r + 10, f'<rect x="-9.5" y="-9.5" width="19" height="19" fill="{PAPER}"/>' + qr(SITE + "ar/", -8, -8, 16, ESP))
    art += on_arc(q, line_r - 6.5, t(0, 0, "SKAN ET · AR", pt(6), PAPER, weight=700, anchor="middle", ls=0.5))
    # seam: the glue flap carries no art beyond the background
    trim = f'<path d="{band(Ri, Ro, -half, half)}" fill="none" stroke="#E6007E" stroke-width="0.3"/>'
    gx0, gy0 = P(Ri, half - GLUE / Ro)
    gx1, gy1 = P(Ro, half - GLUE / Ro)
    glue = (f'<line x1="{gx0:.3f}" y1="{gy0:.3f}" x2="{gx1:.3f}" y2="{gy1:.3f}" stroke="#E6007E" stroke-width="0.3" stroke-dasharray="1.5 1"/>')
    label = on_arc(half - GLUE / Ro / 2, (Ri + Ro) / 2, t(0, 1, "YAPIŞQAN", pt(5), "#E6007E", anchor="middle", extra='transform="rotate(90)"'))
    info = (t(0, 98, f"Nümunə dieline: 12 oz stəkan, qolun üst Ø {D1:.0f} mm, alt Ø {D2:.0f} mm, hündürlük {H:.0f} mm, yapışqan zolağı {GLUE:.0f} mm. "
                     "Çapdan əvvəl tədarükçünün öz dieline-ı ilə yoxlanılmalıdır.", pt(6.5), ESP)
            + t(0, 103, "Maqenta: kəsim xətti · qırıq maqenta: qatlama / yapışqan. Bu səhifə yalnız yoxlama üçündür.", pt(6.5), ESP))
    return W, Hh, [("proof", art + trim + glue + label + info), ("print", art)]



# ------------------------------------------------------------------ A3 menu 297 x 420
def menu():
    w, h = 297, 420
    s = f'<rect x="-3" y="-3" width="303" height="426" fill="{PAPER}"/>'
    s += wordmark(20, 22, 120, ESP)
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
                                   ("Limitli · Nar seriyası", "[rəssam] · nömrəli tiraj", None)]),
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
    s += t(20, 397, "[Ünvan], Bakı · @mokacoffeebaku", pt(8.5), "#D6D2CB")
    s += t(20, 403, "Nümunə menyu: siyahı və qiymətlər yer tutucudur ([₼]).", pt(7.5), "#B8B0A6")
    s += f'<rect x="242" y="362" width="35" height="35" fill="{PAPER}"/>' + qr(SITE + "menu/", 244.5, 364.5, 30, ESP)
    s += t(259.5, 404, "Menyu və AR", pt(7.5), PAPER, weight=700, anchor="middle")
    return w, h, [("menu", s)]


JOBS = [("moka-business-card-90x50", business_card), ("moka-bag-label-100x150", bag_label),
        ("moka-cup-sleeve-12oz", cup_sleeve), ("moka-menu-a3", menu)]


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    PREV.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, fn in JOBS:
            w, h, pages = fn()
            W, H = w + 2 * BLEED, h + 2 * BLEED
            # the PDF carries no marks (the sleeve's proof page draws its own dieline)
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
