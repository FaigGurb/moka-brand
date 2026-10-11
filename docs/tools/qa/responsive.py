import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        for lang in ["","en/","ru/","menu/","en/menu/","ru/menu/","brand/","ru/brand/","privacy/"]:
            for name,vw,vh,mob,rm in [("desk",1440,900,False,"no-preference"),("tab",1024,768,True,"no-preference"),("mob",375,740,True,"no-preference"),("rm",390,800,True,"reduce")]:
                ctx = await b.new_context(viewport={"width":vw,"height":vh}, is_mobile=mob, has_touch=mob, reduced_motion=rm)
                pg = await ctx.new_page()
                errs=[]
                pg.on("console", lambda m: m.type=="error" and "ERR_TUNNEL" not in m.text and "Failed to load resource" not in m.text and errs.append(m.text[:200]))
                pg.on("pageerror", lambda e: errs.append("PAGEERR "+str(e)[:300]))
                await pg.goto("http://localhost:8765/moka-brand/"+lang, wait_until="domcontentloaded")
                await pg.wait_for_timeout(2000)
                H = await pg.evaluate("document.documentElement.scrollHeight")
                y=0; maxov=0
                while y < H:
                    y += vh*0.8
                    await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(250)
                    maxov=max(maxov, await pg.evaluate("document.documentElement.scrollWidth-innerWidth"))
                    H = await pg.evaluate("document.documentElement.scrollHeight")
                # find elements wider than viewport
                wide = await pg.evaluate("""[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1 && getComputedStyle(e).position!=='fixed' && !e.closest('.no-scrollbar,[class*=overflow-x],.t-track')}).slice(0,3).map(e=>e.tagName+'.'+(e.className.baseVal??e.className).toString().slice(0,60))""")
                print(lang or "az", name, "H", H, "overflow", maxov, errs[:4], wide if maxov else "")
                await ctx.close()
        await b.close()
asyncio.run(main())
