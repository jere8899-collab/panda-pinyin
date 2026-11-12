"""Tone-shape check for every single-character Writing Garden recording (audio/c_*, audio/w_*, syllable files),
using the same pitch tracker as pitch_check.py. Two-character words are skipped (two tones in one file).
Usage: python3 tools/char_pitch_check.py"""
import json, os, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, "pitch_check.py")).read().split("os.chdir(")[0]
exec(src)
os.chdir(os.path.join(here, ".."))
chars = json.loads(subprocess.check_output(["node", "-e", "global.window={};require('./js/data.js');console.log(JSON.stringify(window.PP.CHARS))"]))
MARK = {c: t for t, cs in enumerate(["", "āēīōūǖ", "áéíóúǘ", "ǎěǐǒǔǚ", "àèìòùǜ"]) for c in cs}
bad = 0; n = 0
for c in chars:
    if len(c["ch"]) > 1: continue
    tone = next((MARK[x] for x in c["py"] if x in MARK), 5)
    if tone == 5: continue
    n += 1; f = f0(c["audio"])
    if len(f) < 5 or not fits(tone, f): bad += 1; print("CHECK", c["ch"], c["py"], c["audio"], " ".join(str(int(v)) for v in f))
print(f"{n} single-character recordings checked, {bad} to listen to")
sys.exit(1 if bad else 0)
