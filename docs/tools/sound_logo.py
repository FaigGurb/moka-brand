"""MOKA sound logo: a short pour that rises like coffee filling a cup, then a light glass "tink"
when it reaches the line. Deterministic (fixed seed). Writes a 44.1 kHz 16-bit stereo WAV.
Usage: python3 sound_logo.py out.wav
"""
import sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(7)

def biquad_bandpass(x, f0, q):
    # time-varying band-pass (RBJ cookbook), f0 may be an array
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    f0 = np.broadcast_to(f0, x.shape)
    for i in range(len(x)):
        w = 2 * np.pi * f0[i] / SR; a = np.sin(w) / (2 * q); c = np.cos(w)
        b0, b2, a0, a1, a2 = a, -a, 1 + a, -2 * c, 1 - a
        yi = (b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1 = x1, x[i]; y2, y1 = y1, yi; y[i] = yi
    return y

def pour(dur=0.95):
    n = int(SR * dur); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # the resonance rises as the cup fills (smaller air column -> higher pitch)
    f = 380 + 1100 * (t / dur) ** 1.6
    body = biquad_bandpass(noise, f, 6.0) * 0.9 + biquad_bandpass(noise, f * 2.1, 9.0) * 0.35
    env = np.minimum(1, t / 0.08) * np.clip(1 - (t - dur + 0.12) / 0.12, 0, 1)
    # a few bubbles
    bub = np.zeros(n)
    for k in range(9):
        s = int(rng.uniform(0.15, dur - 0.1) * SR); m = int(0.025 * SR)
        tt = np.arange(m) / SR; fb = rng.uniform(900, 1800) * (1 + 3 * tt)
        bub[s:s + m] += np.sin(2 * np.pi * np.cumsum(fb) / SR) * np.exp(-tt * 140) * 0.25
    return (body * env + bub * env) * 1.0

def tink(dur=1.4):
    n = int(SR * dur); t = np.arange(n) / SR
    parts = [(1318.5, 1.0, 3.2), (1975.5, 0.55, 3.8), (5140.0, 0.12, 9.0)]  # E6, B6, glassy partial
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in parts)
    return s * np.minimum(1, t / 0.002) * 0.5

def main(out):
    p = pour(); k = tink()
    start = int(0.9 * SR)
    total = np.zeros(start + len(k))
    total[: len(p)] += p
    total[start:] += k
    # soft stereo: the tink sits slightly right, like a cup set down on the counter
    L = total.copy(); R = total.copy()
    R[start:] *= 1.0; L[start:] *= 0.82
    st = np.stack([L, R], axis=1)
    st = np.tanh(st * 1.2)
    st = st / np.max(np.abs(st)) * 0.89  # about -1 dBFS
    fade = int(0.05 * SR); st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())
    print(out, round(len(st) / SR, 2), "s")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "moka-sound-logo.wav")
