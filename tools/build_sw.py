"""Fill sw.js with the file list + a content hash. Run before every deploy: python3 tools/build_sw.py"""
import hashlib, json, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(root)
# every language file in js/i18n/ gets a <script> tag (adding a language = adding one file)
langs = sorted(f for f in os.listdir("js/i18n") if f.endswith(".js"))
html = open("index.html").read()
tags = "".join(f'<script defer src="js/i18n/{f}"></script>\n' for f in langs)
html = re.sub(r"(<!-- i18n:[^>]*-->\n).*?(<!-- /i18n -->)", lambda m: m.group(1) + tags + m.group(2), html, flags=re.S)
open("index.html", "w").write(html)
files, h = ["./"], hashlib.sha1()
for d in ["", "css", "js", "js/i18n", "img", "audio", "vendor", "vendor/hanzi-data"]:
    pre = d != "audio"   # sounds are cached the first time they play (keeps the first visit small)
    for f in sorted(os.listdir(d or ".")):
        p = os.path.join(d, f)
        if os.path.isfile(p) and not f.startswith(".") and not f.endswith((".md", ".py", ".txt", ".sh", ".json") if d == "" else (".md", ".py", ".txt")) and f not in ("sw.js", "sw.template.js"):
            h.update(open(p, "rb").read())
            if pre: files.append(p)
tpl = open("tools/sw.template.js").read()
open("sw.js", "w").write(tpl.replace("__HASH__", h.hexdigest()[:10]).replace("__FILES__", json.dumps(files, ensure_ascii=False)))
print(len(files), "files, cache pp-" + h.hexdigest()[:10])
