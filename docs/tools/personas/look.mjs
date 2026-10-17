// Browse helper for synthetic users (personas.json). One run = one visit: open a page on a phone or
// desktop, run steps in order, save a screenshot after every step and print what a visitor would see.
//
//   node docs/tools/personas/look.mjs --device phone --out /tmp/p/leyla --url https://faiggurb.github.io/moka-brand/ \
//     --step "wait:2500" --step "scroll:900" --step "click:Menyu" --step "text" --step "links"
//
// Steps:  wait:<ms> · scroll:<px> (relative, may be negative) · to:<css selector> · bottom ·
//         click:<visible text or css=selector> · key:<Key> · back · goto:<url> · text · links · full (full-page shot)
// Every step prints a JSON line; screenshots are <out>/<nn>-<step>.png. Console errors are reported at the end.
import { chromium, devices } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : d;
};
const steps = args.flatMap((a, i) => (a === "--step" ? [args[i + 1]] : []));
const device = opt("device", "desktop");
const out = opt("out", "./look-out");
const url = opt("url", "https://faiggurb.github.io/moka-brand/");
mkdirSync(out, { recursive: true });

const ctxOpt =
  device === "phone"
    ? { ...devices["iPhone 13"], locale: "az-AZ" }
    : { viewport: { width: 1440, height: 900 }, locale: "en-US" };
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext(ctxOpt);
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));

let n = 0;
const log = (o) => console.log(JSON.stringify(o));
const shot = async (name, full = false) => {
  const f = `${out}/${String(n++).padStart(2, "0")}-${name.replace(/[^a-z0-9]+/gi, "_").slice(0, 40)}.png`;
  await p.screenshot({ path: f, fullPage: full }).catch(() => {});
  return f;
};
// what is on screen right now: headings and readable text in the viewport
const visible = () =>
  p.evaluate(() => {
    const out = [];
    const seen = new Set();
    for (const el of document.querySelectorAll("h1,h2,h3,p,li,a,button,figcaption,dt,dd,address,small")) {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      if (r.bottom < 0 || r.top > innerHeight || r.width === 0 || s.visibility === "hidden" || +s.opacity < 0.1) continue;
      const t = el.innerText?.trim().replace(/\s+/g, " ");
      if (!t || seen.has(t) || t.length > 300) continue;
      seen.add(t);
      out.push(`${el.tagName.toLowerCase()}: ${t}`);
    }
    return out.slice(0, 60);
  });

const t0 = Date.now();
await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForTimeout(2500);
log({ step: "open", url: p.url(), title: await p.title(), ms: Date.now() - t0, shot: await shot("open"), see: await visible() });

for (const s of steps) {
  const [cmd, ...rest] = s.split(":");
  const arg = rest.join(":");
  const res = { step: s };
  try {
    if (cmd === "wait") await p.waitForTimeout(+arg);
    else if (cmd === "scroll") {
      if (device === "phone") {
        // finger swipes, as a phone visitor scrolls (one swipe ≈ 400 px of finger travel)
        const cdp = await ctx.newCDPSession(p);
        const dy = +arg;
        for (let left = Math.abs(dy); left > 0; left -= 400) {
          const d = Math.sign(dy) * Math.min(400, left);
          const y0 = d > 0 ? 650 : 250;
          await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 200, y: y0 }] });
          for (let k = 1; k <= 6; k++) {
            await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 200, y: y0 - (d * k) / 6 }] });
            await p.waitForTimeout(16);
          }
          await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          await p.waitForTimeout(900);
        }
      } else await p.mouse.wheel(0, +arg);
      await p.waitForTimeout(2600);
    } else if (cmd === "to") {
      await p.locator(arg).first().scrollIntoViewIfNeeded();
      await p.waitForTimeout(2000);
    } else if (cmd === "bottom") {
      await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(2500);
    } else if (cmd === "click") {
      const loc = arg.startsWith("css=") ? p.locator(arg.slice(4)) : p.getByText(arg, { exact: false });
      const el = loc.filter({ visible: true }).first();
      await el.click({ timeout: 8000 });
      await p.waitForTimeout(2500);
    } else if (cmd === "key") {
      await p.keyboard.press(arg);
      await p.waitForTimeout(2200);
    } else if (cmd === "back") {
      await p.goBack();
      await p.waitForTimeout(2500);
    } else if (cmd === "goto") {
      await p.goto(arg, { waitUntil: "domcontentloaded", timeout: 60000 });
      await p.waitForTimeout(2500);
    } else if (cmd === "links") {
      res.links = await p.evaluate(() =>
        [...document.querySelectorAll("a[href]")]
          .filter((a) => a.getBoundingClientRect().width > 0)
          .map((a) => `${a.innerText.trim().replace(/\s+/g, " ").slice(0, 60) || a.getAttribute("aria-label") || "?"} → ${a.getAttribute("href")}`)
          .filter((v, i, all) => all.indexOf(v) === i)
          .slice(0, 120),
      );
    } else if (cmd === "text") {
      res.text = (await p.evaluate(() => document.body.innerText)).replace(/\n{2,}/g, "\n").slice(0, 12000);
    } else if (cmd === "full") {
      res.shot = await shot("full", true);
    } else throw new Error(`unknown step ${cmd}`);
    res.url = p.url();
    res.y = await p.evaluate(() => Math.round(scrollY));
    if (!res.shot) res.shot = await shot(s);
    if (!["text", "links"].includes(cmd)) res.see = await visible();
  } catch (e) {
    res.error = String(e.message).split("\n")[0];
    res.shot = await shot(`${s}-error`);
  }
  log(res);
}
log({ step: "end", errors: errors.slice(0, 20) });
await b.close();
