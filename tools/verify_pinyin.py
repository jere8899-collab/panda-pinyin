"""Check every character + pinyin in js/data.js against CC-CEDICT (MDBG, CC BY-SA).
Usage: python3 tools/verify_pinyin.py   (downloads cedict to /tmp the first time; needs node)"""
import json, os, re, subprocess, sys, gzip, urllib.request
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CE = "/tmp/cedict.txt"
if not os.path.exists(CE):
    raw = urllib.request.urlopen("https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz").read()
    open(CE, "wb").write(gzip.decompress(raw))
js = """global.window={};require('./js/data.js');const P=window.PP;const o=[];
P.LESSONS.forEach(L=>L.learn.filter(c=>c.hz).forEach(c=>o.push([c.hz,P.mark(c.base,c.tone),c.tip])));
P.CHARS.forEach(c=>o.push([c.ch,c.py,c.en]));console.log(JSON.stringify(o))"""
items = json.loads(subprocess.run(["node", "-e", js], cwd=root, capture_output=True, text=True).stdout)
M = {'a': 'āáǎàa', 'o': 'ōóǒòo', 'e': 'ēéěèe', 'i': 'īíǐìi', 'u': 'ūúǔùu', 'ü': 'ǖǘǚǜü'}
def mark(s):
    s = s.lower().replace('u:', 'ü'); m = re.fullmatch(r'([a-zü]+)([1-5])', s)
    if not m: return s
    b, t = m.group(1), int(m.group(2))
    i = next((b.index(v) for v in 'aoe' if v in b), max(b.rfind(v) for v in 'iuü'))
    return s if i < 0 else b[:i] + M[b[i]][t - 1] + b[i + 1:]
D = {}
for line in open(CE, encoding='utf8'):
    m = re.match(r'(\S+) (\S+) \[([^\]]+)\] /(.*)/', line)
    if m and len(m.group(2)) == 1 and ' ' not in m.group(3): D.setdefault(m.group(2), []).append((mark(m.group(3)), m.group(4)[:70]))
bad = 0
for hz, py, en in items:
    g = [r[1] for r in D.get(hz, []) if r[0] == py][:1]; bad += not g
    print('OK ' if g else 'BAD', hz, py, '(' + en + ')', '|', g or D.get(hz, [])[:3])
print(len(items), "checked,", bad, "bad"); sys.exit(1 if bad else 0)
