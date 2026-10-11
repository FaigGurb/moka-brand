"""Render the logo animation to MP4 (H.264 + AAC with the sound logo) and a GIF.
Needs: playwright (chromium), imageio-ffmpeg. Serve the repo root at http://localhost:8765/moka-brand/ first.
"""
import asyncio, base64, os, subprocess, sys, tempfile
import imageio_ffmpeg
from playwright.async_api import async_playwright

BASE = os.environ.get("MOKA_URL", "http://localhost:8765/moka-brand")
OUT = sys.argv[1] if len(sys.argv) > 1 else "."
FPS, DUR = 30, 3.0
FF = imageio_ffmpeg.get_ffmpeg_exe()
SOUND = os.path.join(os.path.dirname(__file__), "..", "..", "web", "public", "brand-kit", "moka-sound-logo.wav")

async def frames(w, h, tag, d):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": w, "height": h})
        await pg.goto(f"{BASE}/docs/tools/logo-animation.html?w={w}&h={h}&static=1&tag={tag}")
        await pg.wait_for_function("window.ready === true")
        for i in range(int(FPS * DUR)):
            data = await pg.evaluate(f"(render({i / FPS}), document.getElementById('c').toDataURL('image/png'))")
            open(os.path.join(d, f"f{i:04d}.png"), "wb").write(base64.b64decode(data.split(",")[1]))
        await b.close()

def encode(d, out_mp4, gif=None):
    # the pour starts 0.35 s in, so the "tink" lands as the halves close on the line
    subprocess.run([FF, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(d, "f%04d.png"),
                    "-itsoffset", "0.35", "-i", SOUND, "-map", "0:v", "-map", "1:a",
                    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-movflags", "+faststart",
                    "-c:a", "aac", "-b:a", "160k", "-t", str(DUR), out_mp4], check=True)
    if gif:
        subprocess.run([FF, "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", os.path.join(d, "f%04d.png"),
                        "-vf", "fps=20,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse",
                        gif], check=True)

async def main():
    for w, h, name, tag in [(1080, 1080, "moka-logo-animation-1x1", "4 hərf · 4 dəmləmə · 1 xətt"),
                            (1080, 1920, "moka-logo-animation-9x16", "4 hərf · 4 dəmləmə · 1 xətt")]:
        with tempfile.TemporaryDirectory() as d:
            await frames(w, h, tag, d)
            encode(d, os.path.join(OUT, name + ".mp4"), os.path.join(OUT, name + ".gif") if h == w else None)
            print("wrote", name)

asyncio.run(main())
