import asyncio, json, sys
from playwright.async_api import async_playwright
TAG = sys.argv[1] if len(sys.argv)>1 else "run"
JS_SCROLL = """
async () => {
  const frames=[]; let last=performance.now();
  let longT=0, longN=0;
  const po=new PerformanceObserver(l=>{for(const e of l.getEntries()){longT+=e.duration;longN++}}); po.observe({type:'longtask',buffered:false});
  const H=document.documentElement.scrollHeight-innerHeight; const speed=1400; // px/s like a fling
  let y=0;
  await new Promise(res=>{
    function step(now){ const dt=now-last; last=now; frames.push(dt); y+=speed*dt/1000; scrollTo(0,y); if(y<H) requestAnimationFrame(step); else res(); }
    requestAnimationFrame(step);
  });
  po.disconnect();
  const f=frames.slice(2); f.sort((a,b)=>a-b);
  const avg=f.reduce((a,b)=>a+b,0)/f.length;
  return {frames:f.length, avgFps: +(1000/avg).toFixed(1), p95: +f[Math.floor(f.length*.95)].toFixed(0), jank: f.filter(x=>x>50).length, longN, longT: Math.round(longT), seconds: +(f.reduce((a,b)=>a+b,0)/1000).toFixed(1)};
}
"""
async def run(name, vw, vh, mobile, cpu):
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        ctx = await b.new_context(viewport={"width":vw,"height":vh}, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1)
        pg = await ctx.new_page()
        cdp = await ctx.new_cdp_session(pg)
        await cdp.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
        await pg.add_init_script("""window.__lt=0;window.__ln=0;new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__lt+=e.duration;window.__ln++}}).observe({type:'longtask',buffered:true});""")
        await pg.goto("http://localhost:8765/moka-brand/", wait_until="load", timeout=120000)
        await pg.wait_for_timeout(6000)
        load = await pg.evaluate("({longT:Math.round(window.__lt),longN:window.__ln, js: performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script'||r.name.endsWith('.js')).reduce((a,r)=>a+(r.encodedBodySize||0),0), canvases: document.querySelectorAll('canvas').length})")
        sc = await pg.evaluate(JS_SCROLL)
        print(TAG, name, "LOAD", load, "SCROLL", sc, flush=True)
        await b.close()
async def main():
    await run("mobile-4xCPU",390,844,True,4)
    await run("desktop",1440,900,False,1)
asyncio.run(main())
