#!/usr/bin/env python3
"""Cuts a source photo into the WebP sizes the cinema stage loads (web/public/cinema/<name>-<w>.webp).

usage: python3 docs/tools/film/stills.py <source image> <name> [widths=960,1600,2400] [quality=80]
Widths larger than the source are skipped (the largest one is always written).
"""
import sys
from pathlib import Path
from PIL import Image

src, name = sys.argv[1], sys.argv[2]
widths = [int(w) for w in (sys.argv[3] if len(sys.argv) > 3 else "960,1600,2400").split(",")]
q = int(sys.argv[4]) if len(sys.argv) > 4 else 80
out = Path(__file__).resolve().parents[3] / "web/public/cinema"
out.mkdir(parents=True, exist_ok=True)
im = Image.open(src).convert("RGB")
done = []
for w in widths:
    if w > im.width and done:
        continue
    w = min(w, im.width)
    h = round(im.height * w / im.width)
    im.resize((w, h), Image.LANCZOS).save(out / f"{name}-{w}.webp", "WEBP", quality=q, method=6)
    done.append(w)
print(f'{{ name: "{name}", widths: [{", ".join(map(str, done))}], aspect: {im.width / im.height:.4f} }}')
