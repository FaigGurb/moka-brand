import asyncio, json
from playwright.async_api import async_playwright
AXE=open(__import__('os').environ.get('AXE_JS','node_modules/axe-core/axe.min.js')).read()
PAGES=["","menu/","brand/","privacy/","en/","ru/menu/","ar/","ar/table/","ar/card/","ar/selfie/","game/","game/line/","game/rain/","game/memory/","club/","nope/"]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--disable-webgl"])
        for vw,vh,mob in [(1280,800,False),(390,800,True)]:
            ctx=await b.new_context(viewport={"width":vw,"height":vh},is_mobile=mob,has_touch=mob,reduced_motion="reduce")
            for path in PAGES:
                pg=await ctx.new_page()
                async def route(r):
                    if any(h in r.request.url for h in ["jsdelivr","fonts.g"]): return await r.abort()
                    return await r.continue_()
                await pg.route("**/*",route)
                await pg.goto("http://localhost:8765/moka-brand/"+path, wait_until="domcontentloaded"); await pg.wait_for_timeout(1500)
                await pg.add_script_tag(content=AXE)
                res=await pg.evaluate("axe.run(document,{runOnly:['wcag2a','wcag2aa','best-practice']}).then(r=>r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,t:v.nodes.slice(0,2).map(n=>n.target.join(' ')+' :: '+(n.failureSummary||'').split('\\n')[1])})))")
                print(vw, path or "/", [ (v['id'],v['impact'],v['n']) for v in res])
                for v in res:
                    if v['impact'] in ('serious','critical'): print("   ", v['id'], v['t'])
                await pg.close()
            await ctx.close()
        await b.close()
asyncio.run(main())
