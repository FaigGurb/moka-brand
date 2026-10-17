#!/usr/bin/env python3
# Upscales film frames 4x with Real-ESRGAN realesr-general-x4v3 (CPU, torch) and resizes them to a target width.
# usage: upscale.py realesr-general-x4v3.pth <png dir> <out dir> <width>   (weights: github.com/xinntao/Real-ESRGAN, release v0.2.5.0)
# then:  ffmpeg -framerate 18 -i <out>/%04d.png -vf scale=W:-2:flags=lanczos -c:v libwebp -quality 72..80 -compression_level 6 -preset photo web/public/film/<id>/W/%04d.webp
# Real-ESRGAN realesr-general-x4v3 (SRVGGNetCompact, BSD-3, xinntao/Real-ESRGAN) on CPU.
import sys, time, torch, numpy as np
from torch import nn
from torch.nn import functional as F
from PIL import Image
class SRVGGNetCompact(nn.Module):
    def __init__(s, nf=64, nc=32, up=4):
        super().__init__(); s.up = up
        s.body = nn.ModuleList([nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(nf)])
        for _ in range(nc): s.body += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(nf)]
        s.body.append(nn.Conv2d(nf, 3 * up * up, 3, 1, 1)); s.ups = nn.PixelShuffle(up)
    def forward(s, x):
        o = x
        for l in s.body: o = l(o)
        return s.ups(o) + F.interpolate(x, scale_factor=s.up, mode="nearest")
torch.set_num_threads(4)
m = SRVGGNetCompact(); sd = torch.load(sys.argv[1], map_location="cpu"); m.load_state_dict(sd.get("params", sd)); m.eval()
src, dst, outw = sys.argv[2], sys.argv[3], int(sys.argv[4])
import os, glob
files = sorted(glob.glob(os.path.join(src, "*.png")))
os.makedirs(dst, exist_ok=True)
t0 = time.time()
for k, f in enumerate(files):
    out = os.path.join(dst, os.path.basename(f))
    if os.path.exists(out): continue
    im = np.asarray(Image.open(f).convert("RGB"), dtype=np.float32) / 255
    x = torch.from_numpy(im).permute(2, 0, 1)[None]
    with torch.inference_mode(): y = m(x).clamp(0, 1)
    y = F.interpolate(y, size=(round(outw * im.shape[0] / im.shape[1]), outw), mode="area")
    Image.fromarray((y[0].permute(1, 2, 0).numpy() * 255 + 0.5).astype(np.uint8)).save(out, compress_level=1)
    if k % 20 == 0: print(k, len(files), round(time.time() - t0, 1), flush=True)
print("done", round(time.time() - t0, 1))
