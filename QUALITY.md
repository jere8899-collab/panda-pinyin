# Quality checklist (self-review, run before every deploy)
1. `node tools/test/e2e.js` green locally, then `BASE=<live> CLOUD=1` green on the live site.
2. Live link loads at 390×844 and 320×640 with no console errors and no failed requests.
3. Every audio file used loads (200) and decodes; `tools/pitch_check.py` clean except listed NO_AUDIO; `tools/verify_pinyin.py` 0 bad.
8. A v1-shaped old save still loads with stars, crowns and skins intact (e2e "Old v1 save").
4. Profiles stay separate; progress survives a reload; cloud round trip works on a 2nd device.
5. No sideways scroll; every visible button ≥ 44 px.
6. Pinyin/tone marks/stroke data come from a cited source (README "Audio & data sources").
9. Both helper languages: `UI=vi node tools/test/e2e.js` green, `node tools/i18n_check.js vi` 0 missing, no text overflow at 390 px (the test checks every main screen).
10. `node tools/test/namebox_webkit.js` green on live (iPhone-size WebKit name box: English keys, Vietnamese, Chinese IME).
11. `BASE=<live> node tools/test/kid_check.js` ("play it like a kid", fresh phone, Chromium + WebKit) green before saying an update is live; WebKit's known Linux audio crash (real mp3 playback) is reported, not hidden.
7. Never touch Word Realms files, repo, localStorage keys (wordRealms.*), caches (wr-*) or its cloud rows.

# Feature map
Picker (start) → Add child / tap child → Home: pet (tap = hop, 🎋 Feed, 👕 Skins), Pinyin Park nodes → learn cards → 我准备好了 → quiz → result (Next / Again / Home);
🌐 (home top bar / player screen / Grown-ups per child) → language list → screen redraws in that language;
Writing Garden node → sets 1–28 (locked ones folded) → trace screen (👀 Watch, ✍️ Trace, 🧠 默写 from memory, ⬅ ➡; words traced char by char); ☁️ chip or "Grown-ups" link → sum gate → cloud login/sign-up, remove player.

# Lessons learned
* Read the lesson total from PP.LESSONS in tests instead of hard-coding it; then a new lesson needs no count edits (v11).
* A recording can fail the pitch check even for a common word (mian4, so 面 miàn): run pitch_check on the downloaded files BEFORE choosing the word cards, and swap the word rather than ship an unclear sound (v11).
* The skill files live in /home/box/sand-data/workflows/ (self-review-loop, play-it-like-a-kid); v10's "missing" note was wrong (v11).
* AI animation frames can quietly change size or face between frames (sprite-gen frame 2 was 15% bigger with smaller eyes): size every frame to the same width, compare faces side by side, and drop a frame that drifts (v9).
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
* Tidy first, then build (Jeremy's rule, 2026-11-12): small cleanup limited to the files the feature touches, tests green after the cleanup, then build the feature; mention the cleanup in the report.
* Never return false from an on… key handler (`inp.onkeydown = e => e.key === "Enter" && ok()` cancelled every key press, so the name box ignored the iPhone English keyboard from v1 to v8; only the Chinese IME got through). Tests must type with real key presses (keyboard.type), not fill() (2026-11-12).

# Self-score v1 (2026-11-10): 9/10
Passed 1–7. Minus 1: ma5 neutral tone is a different speaker; the gate is a simple sum.

# Self-score v5 (2026-11-10): 9/10
Passed 1–8 (live run 99/102: the 3 misses were one transient 503 on die3.mp3; all 775 audio files then rechecked 200 live). Minus 1: the live suite didn't pass in one clean run.

# Self-score v6 (2026-11-11): 9/10
Passed 1–8: local 102/102, live + cloud 109/109 in one clean run; pitch_check clean (leng2 rong2 → NO_AUDIO); verify_pinyin 121/121. Minus 1: caught the long-syllable button overflow only from a screenshot, not a test (now a test).

# Self-score v7 (2026-11-12): 9/10
Passed 1–8: live + cloud 139/139 in one clean run at 390×844 (+320×640), offline check OK; verify_pinyin 187/187; pitch_check 937 files, 0 new problems. Minus 1: the badge-shelf crash for the new 🧠 badge was only caught by the full test run, and the two-syllable word recordings can't be pitch-checked by the tool.

# Self-score v8 (2026-11-13): 9/10
Passed 1–10 on live: e2e + cloud 191/191 in English and 191/191 in Vietnamese (390×844 + 320×640), WebKit name-box check 27/27, i18n 523/523, verify_pinyin 253/253. Minus 1: the iPhone name-box bug (English keys ignored since v1) was found by Jeremy, not by a test; tests now type with real key presses in Chromium and WebKit.

# Self-score v9 (2026-11-13): 9/10
Bamboo Panda idle bob on the home screen. Passed 1–11 on live: e2e + cloud 195/195 (390×844 + 320×640), local e2e 187/187 in English and 187/187 in Vietnamese, i18n 523/523, WebKit name-box 27/27, offline check 3/3, play-it-like-a-kid all steps pass in Chromium and WebKit except WebKit's learn-card sound (known Linux WebKit test crash on real mp3 playback; the rest of that run uses a dummy sound). Animation checked by eye frame by frame: same panda, clean edges, no cyan halo; reduce-motion shows the still picture; other skins still. Minus 1: the animated panda is a slightly different drawing from the still one (sprite-gen redraw), and real iPhone sound is still unconfirmed by a person.


# Self-score v10 (2026-11-13): 9/10
Lesson 34 整体认读音节 ye yue yuan yin yun ying. Local e2e 190/190 in English and 190/190 in Vietnamese; i18n 529/529; verify_pinyin 259/259; pitch_check 953 files, 0 new; live e2e + cloud 195/198 (the 3 misses were one GitHub Pages 503 on wa4.mp3, an unchanged file; rechecked 200 with curl); WebKit name-box all pass; play-it-like-a-kid on live: every step passes in Chromium and WebKit except WebKit's learn-card sound (known Linux test crash). Minus 1: the live suite didn't pass in one clean run, and the play-it-like-a-kid skill file is missing from the skills folder (kid_check.js covers its steps).

# Self-score v11 (2026-11-14): 9/10
Lessons 35–36: finals ian uan üan iang uang iong + blending (天 脸 船 圈 香 床 黄 熊). Tidy first, e2e 190/190 en + vi before building. After: local e2e 198/198 in English and 198/198 in Vietnamese; i18n 543/543 (0 missing); verify_pinyin 267/267; vi meanings: all 4 new ones match CVDICT; pitch_check 1084 files, 0 new (guan2 huan4 mian4 → NO_AUDIO); live e2e + cloud 206/206 in one clean run; WebKit name box 27/27 on live; play-it-like-a-kid on live: every step passes in Chromium and WebKit, including the new lesson played in full by touch and kept after reload, except WebKit's learn-card sound (known Linux test crash, not a game bug). Screenshots checked at 390 px in both languages. Minus 1: real iPhone sound still unconfirmed by a person, and the kid check reaches lesson 35 by marking earlier lessons done in the test child's save (a real new child would play 34 lessons first).

