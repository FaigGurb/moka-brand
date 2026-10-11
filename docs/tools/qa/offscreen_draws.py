import asyncio, sys
from playwright.async_api import async_playwright
TAG=sys.argv[1] if len(sys.argv)>1 else ""
HOOK="""
window.__draws=new Map();
for (const C of [WebGLRenderingContext, typeof WebGL2RenderingContext!=='undefined'?WebGL2RenderingContext:null].filter(Boolean)){
  for (const fn of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){
    const o=C.prototype[fn]; if(!o) continue;
    C.prototype[fn]=function(...a){const k=this.canvas.parentElement?.closest('section')?.id||this.canvas.parentElement?.className?.toString().slice(0,30)||'?';window.__draws.set(k,(window.__draws.get(k)||0)+1);return o.apply(this,a)}
  }
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        for name,vw,vh,mob in [("mobile",390,844,True),("desktop",1280,800,False)]:
            ctx = await b.new_context(viewport={"width":vw,"height":vh}, is_mobile=mob, has_touch=mob)
            pg = await ctx.new_page(); await pg.add_init_script(HOOK)
            await pg.goto("http://localhost:8765/moka-brand/", wait_until="load"); await pg.wait_for_timeout(5000)
            for sel in ["#top","#qovurma","#paket","#tetbiq","#tecrube"]:
                await pg.evaluate(f"document.querySelector('{sel}').scrollIntoView()"); await pg.wait_for_timeout(1500)
                await pg.evaluate("window.__draws.clear()"); await pg.wait_for_timeout(3000)
                d = await pg.evaluate("Object.fromEntries(window.__draws)")
                print(TAG, name, sel, d, flush=True)
            await ctx.close()
        await b.close()
asyncio.run(main())
