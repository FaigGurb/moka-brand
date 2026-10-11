"""Print the brand book page to PDF (one per language) with Chromium.
Serve the repo root at http://localhost:8765/moka-brand/ first (after `npm run deploy`)."""
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = os.environ.get("MOKA_URL", "http://localhost:8765/moka-brand")
OUT = sys.argv[1] if len(sys.argv) > 1 else "."

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for lang, path in [("az", "/brand/"), ("en", "/en/brand/"), ("ru", "/ru/brand/")]:
            ctx = await b.new_context(viewport={"width": 1200, "height": 1600}, reduced_motion="reduce")
            pg = await ctx.new_page()
            await pg.add_init_script("try{sessionStorage.setItem('moka-intro','1')}catch(e){}")
            await pg.goto(BASE + path, wait_until="networkidle")
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(800)
            out = os.path.join(OUT, f"moka-brand-book-{lang}.pdf")
            await pg.pdf(path=out, format="A4", print_background=True, margin={"top": "12mm", "bottom": "12mm", "left": "10mm", "right": "10mm"})
            print("wrote", out, os.path.getsize(out) // 1024, "KB")
            await ctx.close()
        await b.close()

asyncio.run(main())
