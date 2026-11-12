"""Check every Vietnamese word meaning against CVDICT (Chinese-Vietnamese, CC BY-SA, github.com/ph0ngp/CVDICT).
Usage: python3 tools/vi_meaning_check.py [/tmp/cvdict.u8]. Prints items whose Vietnamese isn't found in the dictionary entry (review by hand)."""
import json, re, subprocess, sys, unicodedata
cv = sys.argv[1] if len(sys.argv) > 1 else "/tmp/cvdict.u8"
TONE = {"ā":"a1","á":"a2","ǎ":"a3","à":"a4","ē":"e1","é":"e2","ě":"e3","è":"e4","ī":"i1","í":"i2","ǐ":"i3","ì":"i4","ō":"o1","ó":"o2","ǒ":"o3","ò":"o4","ū":"u1","ú":"u2","ǔ":"u3","ù":"u4","ǖ":"v1","ǘ":"v2","ǚ":"v3","ǜ":"v4"}
items = json.loads(subprocess.check_output(["node", "-e", """
const fs=require('fs'),vm=require('vm');const c={localStorage:{getItem:()=>null,setItem(){}}};c.window=c;vm.createContext(c);
for(const f of ['js/data.js','js/i18n.js','js/i18n/vi.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
const P=c.PP,d=P.LANGS.vi.strings,out=[];
P.CHARS.forEach(x=>out.push([x.ch,x.en,d[x.en]]));
P.LESSONS.forEach(L=>L.learn.forEach(x=>x.hz&&out.push([x.hz,x.tip,d[x.tip]])));
console.log(JSON.stringify(out));"""]))
dic = {}
for line in open(cv, encoding="utf8"):
    if line.startswith("#"): continue
    m = re.match(r"(\S+) (\S+) \[([^\]]+)\] /(.*)/", line)
    if m: dic.setdefault(m.group(2), []).append(m.group(4).lower())
STRIP = r"^(con|cái|màu|quả|bông|ngọn|hòn|cây|bàn|trái|đám|ngôi|phía|bên|ở|bầu|chữ|từ|xe|khúc)\s+"
seen, bad = set(), []
for hz, en, vi in items:
    if (hz, en) in seen: continue
    seen.add((hz, en))
    defs = " / ".join(dic.get(hz, []))
    parts = [re.sub(r"\(.*?\)", "", p).strip().lower() for p in re.split(r"[,/;]", vi or "")]
    parts = [p for p in parts if p]
    hit = [p for p in parts if p in defs or re.sub(STRIP, "", p) in defs]
    status = "OK " if hit else "?? "
    if not hit: bad.append(hz)
    print(f"{status}{hz}  {en} → {vi}  | {defs[:110]}")
print(f"\n{len(seen)} meanings, {len(bad)} to review by hand: {' '.join(bad)}")
