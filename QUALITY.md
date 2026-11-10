# Quality checklist (self-review, run before every deploy)
1. `node tools/test/e2e.js` green locally, then `BASE=<live> CLOUD=1` green on the live site.
2. Live link loads at 390×844 and 320×640 with no console errors and no failed requests.
3. Every audio file used loads (200) and decodes; `tools/pitch_check.py` clean except listed NO_AUDIO; `tools/verify_pinyin.py` 0 bad.
8. A v1-shaped old save still loads with stars, crowns and skins intact (e2e "Old v1 save").
4. Profiles stay separate; progress survives a reload; cloud round trip works on a 2nd device.
5. No sideways scroll; every visible button ≥ 44 px.
6. Pinyin/tone marks/stroke data come from a cited source (README "Audio & data sources").
7. Never touch Word Realms files, repo, localStorage keys (wordRealms.*), caches (wr-*) or its cloud rows.

# Feature map
Picker (start) → Add child / tap child → Home: pet (tap = hop, 🎋 Feed, 👕 Skins), Pinyin Park nodes → learn cards → 我准备好了 → quiz → result (Next / Again / Home);
Writing Garden node → character grid → trace screen (👀 Watch, ✍️ Trace, ⬅ ➡); ☁️ chip or "Grown-ups" link → sum gate → cloud login/sign-up, remove player.

# Lessons learned
* GitHub Pages can return a one-off 503 when the test fires ~800 audio fetches at once; recheck the failed file(s) one by one with curl before calling it a bug (v5).
* New lessons change hard-coded lesson/locked counts in e2e.js (Xiao Long 27→29, old kid 20→22); search the test for the old total before running (v5).
* Tests must not guess the answer from the audio file name (wei/you/ye are both finals and whole syllables); read the question via PP._q (v4).
* Check lesson indexes in tests against PP.LESSONS order, not by counting by hand (v4).
* audio-cmn naming is not always regular (jù is `jv4`); check the file list, don't assume (v3).
* Pitch tracker octave jumps at the end of falling tones: cut only jumps > 1.6×, or real rises get cut too (v3).
* Playwright won't click aria-disabled tiles; use force:true to test the locked-tile toast (v2).
* Several toasts can be on screen; test any toast, not the first (v2).
* HanziWriter: the quiz message overwrote "Your turn" instantly; tests must wait for the text the screen really shows (2026-11-10).
* Cloud sync tests: wait for "saving" then "saved"; status may already read "saved" from an earlier push (2026-11-10).
* Same github.io origin as Word Realms: always use own storage keys (pandaPinyin.*, pp-auth) and pp-* caches.

# Self-score v1 (2026-11-10): 9/10
Passed 1–7. Minus 1: ma5 neutral tone is a different speaker; the gate is a simple sum.

# Self-score v5 (2026-11-10): 9/10
Passed 1–8 (live run 99/102: the 3 misses were one transient 503 on die3.mp3; all 775 audio files then rechecked 200 live). Minus 1: the live suite didn't pass in one clean run.
