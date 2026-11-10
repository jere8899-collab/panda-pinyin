"""Sanity-check that every syllable recording audio/<syl><tone>.mp3 has the pitch shape of its tone label.
Usage: python3 tools/pitch_check.py   (needs ffmpeg + numpy). Prints only files that don't fit; exit 1 if any."""
import glob, os, re, subprocess, sys
import numpy as np
def f0(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float); fr, hop, out = 640, 160, []
    rms = np.sqrt(np.mean(x ** 2))
    for i in range(0, len(x) - fr, hop):
        w = x[i:i + fr]; w = w - w.mean()
        if np.sqrt(np.mean(w ** 2)) < rms * 0.6: continue
        ac = np.correlate(w, w, "full")[fr - 1:]; lo, hi = 16000 // 400, 16000 // 70
        k = lo + np.argmax(ac[lo:hi])
        if ac[k] / ac[0] > 0.45: out.append(16000 / k)
    f = np.array(out); m = np.median(f); f = f[(f > m * 0.6) & (f < m * 1.6)]
    while len(f) > 5 and f[-1] > f[-2] * 1.25: f = f[:-1]   # creaky end: tracker jumps an octave
    f = list(f)
    while len(f) > 5 and f[-1] > 1.25 * np.median(f[-6:-1]): f.pop()
    f = np.array(f)
    return f[len(f) // 5:] if len(f) > 8 else f   # skip the consonant onset (m/n/l)
def fits(t, f):
    s, e, lo, hi = np.median(f[:3]), np.median(f[-3:]), f.min(), f.max()
    if t == 1: return hi - lo < 70
    if t == 2: return e - lo > 40 and np.argmin(f) < len(f) * 0.7
    if t == 3: return np.median(f) < 230 or (lo < s - 15)
    if t == 4: return np.argmax(f) < len(f) * 0.6 and hi - e > 25
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "audio"))
bad = []
for p in sorted(glob.glob("*.mp3")):
    m = re.fullmatch(r"([a-z]+)([1-4])\.mp3", p)
    if not m: continue
    f = f0(p)
    if len(f) < 5 or not fits(int(m.group(2)), f): bad.append(p); print("CHECK", p, " ".join(str(int(v)) for v in f))
print(f"{len(glob.glob('*[1-4].mp3'))} files checked, {len(bad)} to listen to")
sys.exit(1 if bad else 0)
