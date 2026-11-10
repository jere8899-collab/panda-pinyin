# Quality checklist (self-review, run before every deploy)
1. `node tools/test/e2e.js` green locally, then `BASE=<live> CLOUD=1` green on the live site.
2. Live link loads at 390×844 and 320×640 with no console errors and no failed requests.
3. Every audio file used loads (200) and decodes; tone labels match the pitch check.
4. Profiles stay separate; progress survives a reload; cloud round trip works on a 2nd device.
5. No sideways scroll; every visible button ≥ 44 px.
6. Pinyin/tone marks/stroke data come from a cited source (README "Audio & data sources").
7. Never touch Word Realms files, repo, localStorage keys (wordRealms.*), caches (wr-*) or its cloud rows.

# Feature map
Picker (start) → Add child / tap child → Home: pet (tap = hop, 🎋 Feed, 👕 Skins), Pinyin Park nodes → learn cards → 我准备好了 → quiz → result (Next / Again / Home);
Writing Garden node → character grid → trace screen (👀 Watch, ✍️ Trace, ⬅ ➡); ☁️ chip or "Grown-ups" link → sum gate → cloud login/sign-up, remove player.

# Lessons learned
* HanziWriter: the quiz message overwrote "Your turn" instantly; tests must wait for the text the screen really shows (2026-11-10).
* Cloud sync tests: wait for "saving" then "saved"; status may already read "saved" from an earlier push (2026-11-10).
* Same github.io origin as Word Realms: always use own storage keys (pandaPinyin.*, pp-auth) and pp-* caches.

# Self-score v1 (2026-11-10): 9/10
Passed 1–7. Minus 1: ma5 neutral tone is a different speaker; the gate is a simple sum.
