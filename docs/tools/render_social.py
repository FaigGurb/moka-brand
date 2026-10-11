"""Instagram Story / Reels templates for the MOKA concept (1080 x 1920 PNG).

Every template keeps Instagram's interface areas clear: nothing important in the top 250 px
(profile row) or the bottom 340 px (reply bar / caption). Reels covers keep the title inside the
centre 1080 x 1440 that the profile grid shows. [Bracketed] text is a placeholder for the SMM team.

Usage (repo root):  python3 docs/tools/render_social.py
Output:             web/public/brand-kit/social/*.png  (+ a guide image with the safe areas)
"""
import asyncio, pathlib, sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from render_print import letter, wordmark, ESP, PAPER, KRAFT, SEHER, GUNORTA, AXSAM, SEHER_CITY, NAR, GLOW, ROAST, FONTS  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "web/public/brand-kit/social"
W, H = 1080, 1920
D = "font-family:'League Spartan','Montserrat',sans-serif;font-weight:500"
T = "font-family:'Mulish',sans-serif"


def logo(w, color):
    return f'<svg viewBox="0 0 675 155" width="{w}" height="{w*155/675:.1f}" style="display:block">{wordmark(0, 0, 675, color)}</svg>'


def big_letter(ch, color, h):
    units = {"M": (0, 175), "O": (188, 344), "K": (348, 510), "A": (520, 675)}[ch]
    w = (units[1] - units[0]) * h / 155
    return (f'<svg viewBox="{units[0]} 0 {units[1]-units[0]} 155" width="{w:.1f}" height="{h}" style="display:block">'
            f'{letter(ch, color)}</svg>')


def frame(bg, color, body, line_y=None, line_color=None):
    line = (f'<div style="position:absolute;left:0;right:0;top:{line_y}px;height:8px;background:{line_color}"></div>'
            if line_y else "")
    return (f'<div class="f" style="background:{bg};color:{color}">{line}{body}</div>')


def story_bean():
    body = (f'<div style="position:absolute;left:96px;top:290px">{logo(300, ESP)}</div>'
            f'<p style="position:absolute;left:96px;top:520px;margin:0;{T};font-weight:700;font-size:34px;letter-spacing:.22em">BU HƏFTƏNİN DƏNİ</p>'
            f'<h1 style="position:absolute;left:96px;right:96px;top:590px;margin:0;{D};font-size:150px;line-height:.95">[Mənşə]</h1>'
            f'<p style="position:absolute;left:96px;right:96px;top:800px;margin:0;{T};font-size:46px;line-height:1.35">[dad notu] · [dad notu] · [dad notu]</p>'
            f'<div style="position:absolute;left:0;right:0;top:1180px;bottom:0;background:{ROAST[1]}"></div>'
            f'<p style="position:absolute;left:96px;top:1240px;margin:0;{T};font-weight:700;font-size:34px;letter-spacing:.22em;color:{ESP}">AÇIQ QOVURMA</p>'
            f'<p style="position:absolute;left:96px;right:96px;top:1310px;margin:0;{T};font-size:40px;line-height:1.4;color:{ESP}">Xətt yüksəkdir: qovurma açıqdır.<br>V60 və Chemex-də sına.</p>')
    return frame(KRAFT, ESP, body, 1172, PAPER)


def story_poll():
    letters = "".join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:22px">{big_letter(c, PAPER, 170)}'
                      f'<span style="{T};font-weight:700;font-size:30px;letter-spacing:.12em;color:#D6D2CB">{n}</span></div>'
                      for c, n in [("M", "MOKA POT"), ("O", "FİNCAN"), ("K", "CHEMEX"), ("A", "V60")])
    body = (f'<p style="position:absolute;left:96px;top:290px;margin:0;{T};font-weight:700;font-size:34px;letter-spacing:.22em;color:{GUNORTA}">SORĞU</p>'
            f'<h1 style="position:absolute;left:96px;right:96px;top:350px;margin:0;{D};font-size:120px;line-height:1">Bu gün hansı hərf?</h1>'
            f'<div style="position:absolute;left:96px;right:96px;top:700px;display:flex;justify-content:space-between;align-items:flex-end">{letters}</div>'
            f'<div style="position:absolute;left:96px;right:96px;top:1120px;height:300px;border:4px dashed rgba(245,241,234,.35);display:flex;align-items:center;justify-content:center">'
            f'<span style="{T};font-size:32px;color:#B8B0A6">Instagram sorğu stikeri bura</span></div>'
            f'<div style="position:absolute;left:96px;bottom:360px">{logo(220, PAPER)}</div>')
    return frame(ESP, PAPER, body, 640, GLOW)


def story_day():
    sw = "".join(f'<div style="flex:1;display:flex;flex-direction:column;gap:18px"><div style="height:220px;background:{c}"></div>'
                 f'<span style="{T};font-weight:700;font-size:30px">{n}</span><span style="{T};font-size:26px;opacity:.7">{h}</span></div>'
                 for c, n, h in [(SEHER, "Səhər", "06–11"), (GUNORTA, "Günorta", "11–16"), (AXSAM, "Axşam", "16–20"), (SEHER_CITY, "Şəhər", "20–06")])
    body = (f'<div style="position:absolute;left:96px;top:290px">{logo(300, ESP)}</div>'
            f'<p style="position:absolute;left:96px;top:520px;margin:0;{T};font-weight:700;font-size:34px;letter-spacing:.22em">BAKIDA İNDİ</p>'
            f'<h1 style="position:absolute;left:96px;right:96px;top:590px;margin:0;{D};font-size:170px;line-height:.95">Axşam</h1>'
            f'<p style="position:absolute;left:96px;right:96px;top:790px;margin:0;{T};font-size:46px;line-height:1.35">[Bu axşam barda: içki / tədbir]</p>'
            f'<div style="position:absolute;left:96px;right:96px;top:1130px;display:flex;gap:24px">{sw}</div>')
    return frame("#EADBC8", ESP, body)


def reels_cover():
    # profile grid shows the centre 1080 x 1440 (y 240 … 1680): the title sits there
    body = (f'<div style="position:absolute;inset:0;background:radial-gradient(60% 40% at 50% 46%, rgba(255,226,166,.18), transparent 70%)"></div>'
            f'<p style="position:absolute;left:96px;top:560px;margin:0;{T};font-weight:700;font-size:34px;letter-spacing:.22em;color:{GUNORTA}">[SERİYA · №]</p>'
            f'<h1 style="position:absolute;left:96px;right:96px;top:630px;margin:0;{D};font-size:140px;line-height:.98">[Reels<br>başlığı]</h1>'
            f'<div style="position:absolute;left:96px;right:96px;top:1180px">{logo(260, PAPER)}</div>')
    return frame(ESP, PAPER, body, 1000, GLOW)


def guide():
    zones = ('<div style="position:absolute;left:0;right:0;top:0;height:250px;background:rgba(230,0,126,.25)"></div>'
             '<div style="position:absolute;left:0;right:0;bottom:0;height:340px;background:rgba(230,0,126,.25)"></div>'
             '<div style="position:absolute;left:0;right:0;top:240px;height:1440px;border:6px dashed #00AEEF"></div>'
             f'<p style="position:absolute;left:60px;top:90px;margin:0;{T};font-size:36px;font-weight:700">Profil sətri: boş saxla (250 px)</p>'
             f'<p style="position:absolute;left:60px;bottom:140px;margin:0;{T};font-size:36px;font-weight:700">Cavab sətri / mətn: boş saxla (340 px)</p>'
             f'<p style="position:absolute;left:60px;top:300px;margin:0;{T};font-size:36px;font-weight:700;color:#0077A8">Reels qapağı: profil şəbəkəsində görünən 1080 × 1440</p>')
    return frame(PAPER, ESP, zones)


JOBS = [("moka-story-bean", story_bean), ("moka-story-poll", story_poll), ("moka-story-day", story_day),
        ("moka-reels-cover", reels_cover), ("moka-social-safe-areas", guide)]


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": W, "height": H})
        for name, fn in JOBS:
            html = (f'<!doctype html><html lang="az"><head><meta charset="utf-8"><link rel="stylesheet" href="{FONTS}">'
                    f'<style>html,body{{margin:0}}.f{{position:relative;width:{W}px;height:{H}px;overflow:hidden}}</style></head>'
                    f'<body>{fn()}</body></html>')
            tmp = OUT / f"_{name}.html"
            tmp.write_text(html, encoding="utf-8")
            await pg.goto(tmp.as_uri())
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(200)
            await pg.screenshot(path=str(OUT / f"{name}.png"))
            tmp.unlink()
            print("ok", name)
        await b.close()


if __name__ == "__main__":
    asyncio.run(main())
