# Quality checklist (self-review, run before every deploy)
1. `node tools/test/e2e.js` green locally, then `BASE=<live> CLOUD=1` green on the live site.
2. Live link loads at 390×844 and 320×640 with no console errors and no failed requests.
3. Every audio file used loads (200) and decodes; `tools/pitch_check.py` clean except listed NO_AUDIO; `tools/verify_pinyin.py` 0 bad.
8. A v1-shaped old save still loads with stars, crowns and skins intact (e2e "Old v1 save").
4. Profiles stay separate; progress survives a reload; cloud round trip works on a 2nd device.
5. No sideways scroll; every visible button ≥ 44 px.
6. Pinyin/tone marks/stroke data come from a cited source (README "Audio & data sources").
9. Both helper languages: `UI=vi node tools/test/e2e.js` green, `node tools/i18n_check.js vi` 0 missing, no text overflow at 390 px (the test checks every main screen).
7. Never touch Word Realms files, repo, localStorage keys (wordRealms.*), caches (wr-*) or its cloud rows.

# Feature map
Picker (start) → Add child / tap child → Home: pet (tap = hop, 🎋 Feed, 👕 Skins), Pinyin Park nodes → learn cards → 我准备好了 → quiz → result (Next / Again / Home);
🌐 (home top bar / player screen / Grown-ups per child) → language list → screen redraws in that language;
Writing Garden node → sets 1–28 (locked ones folded) → trace screen (👀 Watch, ✍️ Trace, 🧠 默写 from memory, ⬅ ➡; words traced char by char); ☁️ chip or "Grown-ups" link → sum gate → cloud login/sign-up, remove player.

# Lessons learned
* A test seed can quietly pre-trace the character you then test (猫 was seeded, so "first trace" paid 2⭐ not 5⭐); pick a test character the seed doesn't touch (v8).
* A test that adds a made-up i18n key must run after the "all keys translated" check, or it reports its own key (v8).
* `order: 0` is falsy: use `??` not `||` for numeric defaults (English sorted after Vietnamese) (v8).
* pitch_check.py only checks syllable files; single-character word files need tools/char_pitch_check.py (v8).
* A new badge kind (🧠 memory, no `set`) crashed the badge shelf's "how to earn" line; when adding a badge type, open the shelf in the test with it locked (v7).
* Never force-move a release tag that is already pushed (v6 was moved by mistake, then restored to 57b0539); make a new tag (pre-v7) instead (v7).
* Folding locked sets changes every `.chars.locked` count in e2e; count what is actually rendered (v7).
* Two-character words: CEDICT gives the neutral tone (大人 dà ren, 木头 mù tou); verify_pinyin now checks whole words, not just characters (v7).
* Longer syllables (chēng, zhōng) overflowed the 3-answer row at 390 px; grid columns need minmax(0,1fr) and labels > 4 letters get a smaller font. e2e now fails if any answer button leaves the screen (v6).
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

# Self-score v6 (2026-11-11): 9/10
Passed 1–8: local 102/102, live + cloud 109/109 in one clean run; pitch_check clean (leng2 rong2 → NO_AUDIO); verify_pinyin 121/121. Minus 1: caught the long-syllable button overflow only from a screenshot, not a test (now a test).

# Self-score v7 (2026-11-12): 9/10
Passed 1–8: live + cloud 139/139 in one clean run at 390×844 (+320×640), offline check OK; verify_pinyin 187/187; pitch_check 937 files, 0 new problems. Minus 1: the badge-shelf crash for the new 🧠 badge was only caught by the full test run, and the two-syllable word recordings can't be pitch-checked by the tool.
