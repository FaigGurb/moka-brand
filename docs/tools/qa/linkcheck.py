import asyncio, urllib.request, urllib.parse
from playwright.async_api import async_playwright
ROOT="http://localhost:8765"
START=["/moka-brand/","/moka-brand/brand/","/moka-brand/en/brand/","/moka-brand/en/","/moka-brand/ru/","/moka-brand/menu/","/moka-brand/en/menu/","/moka-brand/ru/menu/","/moka-brand/privacy/","/moka-brand/ar/","/moka-brand/ar/?lang=ru","/moka-brand/ar/card/","/moka-brand/ar/table/","/moka-brand/ar/selfie/","/moka-brand/game/","/moka-brand/game/line/","/moka-brand/game/rain/","/moka-brand/game/memory/","/moka-brand/club/","/moka-brand/club/?lang=en","/moka-brand/v1/"]
def status(u):
    try:
        r=urllib.request.urlopen(urllib.request.Request(u,method="GET"),timeout=10); return r.status
    except urllib.error.HTTPError as e: return e.code
    except Exception as e: return str(e)[:40]
async def main():
    seen={}; bad=[]; ext=set(); rootbad=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--disable-webgl"])
        pg=await b.new_page()
        await pg.route("**/*", lambda r: r.abort() if not r.request.url.startswith(ROOT) else r.continue_())
        for s in START:
            await pg.goto(ROOT+s, wait_until="domcontentloaded"); await pg.wait_for_timeout(900)
            urls=await pg.evaluate("[...document.querySelectorAll('a[href],img[src],script[src],link[href],source[src]')].map(e=>e.href||e.src)")
            for u in urls:
                if not u or u.startswith(("mailto:","tel:","javascript:","data:","blob:")): continue
                u=u.split('#')[0]
                if not u: continue
                if u.startswith(ROOT):
                    path=urllib.parse.urlparse(u).path
                    if not path.startswith("/moka-brand"): rootbad.append((s,u))
                    if u not in seen: seen[u]=status(u)
                    if seen[u]!=200: bad.append((s,u,seen[u]))
                else: ext.add(u.split('?')[0])
        await b.close()
    print("checked internal URLs:", len(seen))
    print("broken:", sorted(set(bad))[:30])
    print("outside base path:", sorted(set(rootbad))[:10])
    print("external:", sorted(ext))
asyncio.run(main())
