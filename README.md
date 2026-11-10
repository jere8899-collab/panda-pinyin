# 🐼 熊猫拼音 Panda Pinyin

A cute, phone-first web game for learning Chinese (Simplified), for Jeremy Ng's students and children.
It follows the Singapore MOE path: preschool (K1–K2, NEL framework) then Primary 1–6 (欢乐伙伴).
v1 covers the very start: **Hanyu Pinyin** and a first taste of **stroke order**.

**Live:** https://jere8899-collab.github.io/panda-pinyin/
**Repo:** https://github.com/jere8899-collab/panda-pinyin (GitHub Pages, free)

## What's in v1
* **Profile picker**: one profile per child (first name or nickname only, nothing else). Each child has their own stars, panda, lessons and characters. Tap 👤 to switch child.
* **Panda pet**: grows (Lv 1–10, gets a little bigger, new title) from XP earned in lessons; ❤️ happiness goes up when you play or feed bamboo (2⭐). If a child hasn't played yet today the panda is sleepy ("I missed you!") and wakes up on the first activity; it is never sad or punished.
* **Skins**: 竹子熊猫 Bamboo (free), 新年熊猫 New Year (20⭐), 太空熊猫 Space (40⭐), 书法熊猫 Brush Panda (80⭐, v2).
* **🌈 拼音乐园 Pinyin Park**, 12 lessons, each opens after the one before:
  1. 四个声调 The 4 tones (ā á ǎ à) → listen and pick the tone
  2. 轻声 mā 妈 má 麻 mǎ 马 mà 骂 ma 吗 → pick the tone (5 choices)
  3. 单韵母 a o e → listen and pick the sound
  4. 单韵母 i u ü (alone written yi wu yu) → pick the sound
  5. 声母 b p m f (said bō pō mō fō) → pick bā / pā / mā / fā
  6. 拼一拼 blend b p m f + a o, all tones → pick the syllable (sound AND tone)
  7. 声调大挑战 tone challenge
  8. 声母 d t n l (said dē tē nē lē) → pick dā / tā / nā / lā (only the initial differs) *(v2)*
  9. 拼一拼 d t n l + a e i u ü, all tones; real words 大 dà, 他 tā, 你 nǐ, 绿 lǜ, 读 dú, 兔 tù, 女 nǚ, 梨 lí *(v2)*
  10. 声母 g k h (said gē kē hē) *(v2)*
  11. 拼一拼 g k h + a e u; real words 哥 gē, 鼓 gǔ, 哭 kū, 渴 kě, 喝 hē, 虎 hǔ *(v2)*
  12. 声母大复习 big tone review of all 11 initials (10 questions) *(v2)*
  Each lesson: tap-to-hear learn cards, then 6–10 questions. Right first time = +1⭐; a wrong answer gets kind feedback (没关系！再听一次！) and the sound plays again. 1–3 ⭐ crowns per lesson, +5⭐ the first time a lesson is finished, +2⭐ for a new best.
* **🌸 写字花园 Writing Garden**: stroke-order tracing for 18 characters in 3 sets: 一 二 三 人 大 口 · 十 土 上 下 小 山 · 中 日 月 木 水 火 (v2 added sets 2–3). Each shows pinyin with tone mark + meaning and has a 🔊 real recording. A set opens after tracing any 3 characters of the set before. The panda first shows the strokes (👀 Watch), then the child traces with a finger; a wrong stroke gets "再试试！ Try again", and after 2 misses the right stroke is highlighted. 3/2/1 ⭐ by mistakes, +3⭐ each time (+3 more the first time).
* **👪 Grown-ups** (☁️ button or link on the picker; a small multiplication question keeps children out): family cloud save, remove a player, credits.
* Works offline after the first visit (service worker caches all files; cloud sync resumes when online). Can be added to the home screen.

## Audio & data sources (real recordings, no guessing)
* Syllables `audio/<syllable><tone>.mp3` (ü is written v in file names: `lv4.mp3` = lǜ): native-speaker recordings by Chen Wang, [audio-cmn](https://github.com/hugolpz/audio-cmn) (CC BY-SA). Single finals i/u/ü play the yi/wu/yu recordings.
* Neutral-tone ma (`ma5.mp3` = 吗) and the 18 characters (`c_*.mp3`): Yue Tan, Shtooka, via audio-cmn (CC BY-SA). (A different voice from the other ma recordings.)
* Tone labels are checked with `python3 tools/pitch_check.py` (tone 1 flat, 2 rising, 3 low/dipping, 4 falling). The one recording it couldn't confirm (`la4`) is never used as an answer (`NO_AUDIO` in `js/data.js`).
* Every character + pinyin is checked against CC-CEDICT with `python3 tools/verify_pinyin.py` (37/37 OK in v2).
* Stroke order: [Hanzi Writer](https://hanziwriter.org) 3.7.3 (MIT) + hanzi-writer-data 2.0.1 (copy `<char>.json` from the npm package into `vendor/hanzi-data/`) (Make Me a Hanzi / Arphic PL), vendored in `vendor/`. No hand-drawn stroke data.
* If a sound file ever can't play, the device's zh-CN voice says it instead (fallback only).
* See `CREDITS.md`.

## ☁️ Cloud save: how it works
* Progress is **always** saved on the device (`localStorage` key `pandaPinyin.save.v1`).
* Optional **family account**: in 👪 Grown-ups, choose a family name (3–20 letters/numbers/_) + password (6+). No email. All the family's children sync together. Log in with the same name on another phone to continue there. Write the password down: it can't be reset.
* Backend: the free Supabase project already used by Word Realms (`aoqfqopzycowbnjshzvg`), **in a separate namespace**: Panda Pinyin accounts are their own users (`<family>@family.pandapinyin.app`), each with its own row in `public.saves` (`username` = `pp:<family>`, `data.app = "panda-pinyin"`), protected by row-level security. Word Realms accounts and saves are never read or written: the code refuses to write unless the signed-in user is a `@family.pandapinyin.app` account, and it keeps its session under its own key `pp-auth` (both games share the `jere8899-collab.github.io` origin, so this matters). No schema change was needed.
* Sync: pulled on log-in and on every load with a session; pushed 2 s after any change and when the app is hidden. Children are merged one by one (the copy with more progress wins), so two devices don't wipe each other. Removing a child is remembered.
* Want a completely separate Supabase project later? Create a free project at supabase.com, run `supabase/schema.sql` from Word Realms (same `saves` table), turn off "Confirm email" in Auth settings, and put its URL + publishable key in `js/cloud.js` `CFG`.

## Run / test / deploy
```bash
cd /workspace/panda-pinyin
python3 -m http.server 8765          # open http://localhost:8765
node tools/test/e2e.js               # full phone playthrough (390×844 + 320×640, all 12 lessons, tracing, old-save check); screenshots in shots/
BASE=https://jere8899-collab.github.io/panda-pinyin/ CLOUD=1 node tools/test/e2e.js   # live site + live cloud round trip
./deploy.sh "message"                # rebuilds sw.js (cache hash), commits, pushes to GitHub Pages
```
No build step; plain HTML/CSS/JS. (Test deps: `cd tools/test && npm i` for playwright-core; Chrome at /opt/google/chrome/chrome.)

## Files
`index.html` · `css/style.css` · `js/data.js` (all lessons, tone marks, praise) · `js/store.js` (profiles, save, merge) · `js/app.js` (screens, quiz, pet, tracing) · `js/cloud.js` (family cloud + grown-ups) · `tools/sw.template.js` → `sw.js` via `tools/build_sw.py` · `audio/` · `img/` · `vendor/` · `PLAN.md` (learning path, done/next)

**Never** touch Word Realms (`/workspace/word-realms-deploy`, `/workspace/cefr-quest`) from this project.

## Backups
Before each upgrade: `tar czf /workspace/backups/panda-pinyin-<version>-<date>.tgz` of the project and a git tag (`v1` = first release). Restore: `git checkout v1` or untar.
