# 🐼 熊猫拼音 Panda Pinyin

A cute, phone-first web game for learning Chinese (Simplified), for Jeremy Ng's students and children.
It follows the Singapore MOE path: preschool (K1–K2, NEL framework) then Primary 1–6 (欢乐伙伴).
v1 covers the very start: **Hanyu Pinyin** and a first taste of **stroke order**.

**Live:** https://jere8899-collab.github.io/panda-pinyin/
**Repo:** https://github.com/jere8899-collab/panda-pinyin (GitHub Pages, free)

## What's in v1
* **Profile picker**: one profile per child (first name or nickname only, nothing else). Each child has their own stars, panda, lessons and characters. Tap 👤 to switch child.
* **Panda pet**: grows (Lv 1–10, gets a little bigger, new title) from XP earned in lessons; ❤️ happiness goes up when you play or feed bamboo (2⭐). If a child hasn't played yet today the panda is sleepy ("I missed you!") and wakes up on the first activity; it is never sad or punished. **v9:** on the home screen the Bamboo Panda gently bobs (animated WebP made with sprite-gen, see CREDITS); other skins stay still, and phones set to "reduce motion" see the still picture.
* **Skins** (16; prices raised about 2.5× in v8 because stars came too easily; skins a child already owns are never taken away): 竹子熊猫 Bamboo (free), 新年熊猫 New Year 20⭐, 太空熊猫 Space 60⭐, 小画家熊猫 Little Artist 120⭐ *(v8)*, 书法熊猫 Brush 200⭐, 舞狮熊猫 Lion Dance 300⭐, 中秋灯笼熊猫 Mid-Autumn Lantern 400⭐, 小学生熊猫 School Uniform 450⭐, 小厨师熊猫 Little Chef 550⭐, 龙舟熊猫 Dragon Boat 650⭐, 胡姬花熊猫 Orchid 750⭐ *(v8)*, 超级熊猫 Super Panda 850⭐, 咖啡店熊猫 Kopitiam 1000⭐ *(v8)*, 鱼尾狮熊猫 Merlion 1200⭐, 武术熊猫 Wushu 1400⭐ *(v8)*, 小皇帝熊猫 Little Emperor 1800⭐ *(v8)*.
* **⭐ Star balance (v8)**: lesson first finish = 1⭐ per right-first-time answer + 5⭐ bonus; replaying a finished lesson pays half (rounded up) + 2⭐ for a new best. Tracing: first time 5⭐, a better score 2⭐, otherwise 1⭐ once a day per character (no endless farming on 一). 🧠 first memory write 3⭐. Badges 5⭐ (Memory Star 15⭐, Graduate 20⭐). Feeding costs 2⭐. Roughly 2,000⭐ can be earned by doing everything once, so the top skins need real effort.
* **🌐 Language** (v8): the helper language (everything that isn't Chinese or pinyin: buttons, instructions, meanings, praise) can be English or Tiếng Việt. Students tap 🌐 on the home screen or on the player screen; grown-ups can set it per child in 👪 Grown-ups. The choice is saved per child and syncs with the family cloud save. Chinese and pinyin never change. Any text without a translation shows in English, never blank.
* **🌈 拼音乐园 Pinyin Park**, 34 lessons, each opens after the one before:
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
  13. 声母 j q x (said jī qī xī) + the ü-dots rule: ju qu xu are really jü qü xü *(v3)*
  14. 拼一拼 j q x + i ü; 鸡 jī, 七 qī, 西 xī, 洗 xǐ, 去 qù, 橘 jú *(v3)*
  15. 声母 zh ch sh r (curled tongue; said zhī chī shī rì) *(v3)*
  16. 拼一拼 zh ch sh r + a e i u; 猪 zhū, 纸 zhǐ, 吃 chī, 茶 chá, 书 shū, 十 shí, 日 rì, 热 rè *(v3)*
  17. 声母 z c s (flat tongue; said zī cī sī) *(v3)*
  18. 拼一拼 z c s + a e i u; 字 zì, 四 sì, 词 cí, 足 zú, 擦 cā *(v3)*
  19. 平舌还是翘舌？ review: z / zh / j look-alikes side by side (10 questions) *(v3)*
  20. 声母 y w ("i and u wearing a hat"); 鸭 yā, 爷 yé, 鱼 yú, 蛙 wā, 五 wǔ *(v4)*
  21. 整体认读音节 whole syllables zhi chi shi ri zi ci si yi wu yu: read as one sound, don't blend → pick the tone *(v4)*
  22. 复韵母 ai ei ui *(v4)*
  23. 拼一拼 ai ei ui; 爱 ài, 白 bái, 来 lái, 杯 bēi, 黑 hēi, 飞 fēi, 水 shuǐ, 贵 guì (+ the tone-mark rule) *(v4)*
  24. 复韵母 ao ou iu *(v4)*
  25. 拼一拼 ao ou iu; 猫 māo, 包 bāo, 好 hǎo, 狗 gǒu, 走 zǒu, 牛 niú, 六 liù, 球 qiú *(v4)*
  26. 复韵母 ie üe er *(v4)*
  27. 拼一拼 ie üe er; 姐 jiě, 写 xiě, 鞋 xié, 月 yuè, 雪 xuě, 耳 ěr, 二 èr, 儿 ér *(v4)*
  28. 复韵母大复习 review: same initial, different glide (bai / bei / bao …) *(v4)*
  29. 前鼻韵母 an en in un ün (alone: yin wen yun) *(v5)*
  30. 拼一拼 an en in un ün; 山 shān, 饭 fàn, 门 mén, 很 hěn, 心 xīn, 林 lín, 春 chūn, 裙 qún (j q x + ün hides the dots) *(v5)*
  31. 后鼻韵母 ang eng ing ong (ing alone = ying; ong never stands alone → dōng); quiz: an or ang? en or eng? in or ing? *(v6)*
  32. 拼一拼 ang eng ing ong; 糖 táng, 灯 dēng, 风 fēng, 星 xīng, 冰 bīng, 红 hóng, 龙 lóng, 虫 chóng *(v6)*
  33. 前鼻还是后鼻？ review: n or ng (ban/bang, xin/xing …, 10 questions) *(v6)*
  34. 整体认读音节 ye yue yuan yin yun ying: the last 6 of the 16 whole syllables; 椰 yē, 月 yuè, 圆 yuán, 音 yīn, 云 yún, 鹰 yīng; quiz pits look-alikes (yin/ying/yun, ye/yue, yue/yuan) *(v10)*
  Each lesson: tap-to-hear learn cards, then 6–10 questions. Right first time = +1⭐; a wrong answer gets kind feedback (没关系！再听一次！) and the sound plays again. 1–3 ⭐ crowns per lesson, +5⭐ the first time a lesson is finished, +2⭐ for a new best.
* **🌸 写字花园 Writing Garden**: stroke-order tracing for 36 characters in 6 sets: 一 二 三 人 大 口 · 十 土 上 下 小 山 · 中 日 月 木 水 火 · 目 耳 手 足 头 门 · 天 田 王 云 白 不 · 子 女 马 牛 羊 鸟 (v2 added sets 2–3, v3 sets 4–5, v4 set 6). **v7** added sets 7–17 (66 more, 102 in total): 四五六七八九 (numbers) · 爸妈哥姐弟妹 (family) · 石禾竹花草雨 · 红黄蓝绿黑金 (colours) · 走跑飞吃看听 (actions) · 书本文字笔学 (school) · 米饭菜瓜果茶 (food) · 东西南北左右 · 出入来去多少, and two 词语 word sets traced one character after the other: 大人 上学 妈妈 木头 山水 火山 · 白天 水果 书本 中文 米饭 白菜. Locked sets after the next one fold into a single "🔒 N more sets to discover" line so the page stays short. **🧠 默写 From memory** (v7): after a character is traced once, the child can write it with the outline hidden; a wrong stroke gets "再想想！", after 3 misses the right stroke is highlighted; the first memory write of each character gives +2⭐ and a 🧠 on its card. Each shows pinyin with tone mark + meaning and has a 🔊 real recording. **v8** added sets 18–28 (66 more, **168 in total**): 鱼虫狗猫鸡兔 (animals) · 我你他她男友 (people) · 年早晚今明星 (day & night) · 春夏秋冬冷热 (seasons) · 好新长高开关 (describing) · 家车船衣灯床 (at home) · 坐站说笑哭玩 (doing things), and four more 词语 word sets: 爸爸 哥哥 姐姐 弟弟 妹妹 朋友 · 今天 明天 春天 夏天 秋天 冬天 · 老师 同学 学生 学校 上课 下课 · 谢谢 再见 大家 开心 熊猫 好吃. A set opens after tracing any 3 characters of the set before. The panda first shows the strokes (👀 Watch), then the child traces with a finger; a wrong stroke gets "再试试！ Try again", and after 2 misses the right stroke is highlighted. 3/2/1 crowns by mistakes; stars as in Star balance above.
* **🏅 Badges** (v4): a badge shelf on the home screen. 7 Pinyin Park world badges (tones, simple finals, b p m f, d t n l g k h, j q x/zh ch sh r/z c s, y w + whole syllables, compound finals, 👃 nose sounds (v6)), 28 Writing Garden set badges (trace every character of a set; v7 added 11, v8 11 more), 🧠 Memory Writer (10 from memory, v7), 🧠 Memory Star (50 from memory, +15⭐, v8) and 👑 Pinyin Park Graduate: 39 badges. +5⭐ each (Memory Star +15⭐, Graduate +20⭐), paid once. Older saves get the badges they already earned the first time they open the home screen.
* **👪 Grown-ups** (☁️ button or link on the picker; a small multiplication question keeps children out): family cloud save, remove a player, credits.
* Works offline after the first visit: the service worker caches the game, art and stroke data at once, and each sound the first time it plays (so the first visit stays small); cloud sync resumes when online. Can be added to the home screen.

## Audio & data sources (real recordings, no guessing)
* Syllables `audio/<syllable><tone>.mp3` (ü is written v in file names: `lv4.mp3` = lǜ; audio-cmn names jù `jv4`, saved here as `ju4.mp3`): native-speaker recordings by Chen Wang, [audio-cmn](https://github.com/hugolpz/audio-cmn) (CC BY-SA). Single finals said alone play the spelled-out recordings: i/u/ü → yi/wu/yu, ui → wei, iu → you, ie → ye, üe → yue, in → yin, un → wen, ün → yun, ing → ying.
* Neutral-tone ma (`ma5.mp3` = 吗) and the characters (耳 uses Chen Wang's ěr syllable recording `er3.mp3`) (`c_*.mp3`): Yue Tan, Shtooka, via audio-cmn (CC BY-SA). (A different voice from the other ma recordings.)
* Tone labels are checked with `python3 tools/pitch_check.py` (tone 1 flat, 2 rising, 3 low/dipping, 4 falling). Recordings it couldn't confirm (`la4 qi4 se4 shu4 zhe4 lve2 miu4 niu2 nve4 tie2 xue2 pin2 ren4 shan2 zhen2 leng2 rong2`) are never used as answers; the 牛 niú learn card plays the word recording instead (`NO_AUDIO` in `js/data.js`).
* Every character + pinyin is checked against CC-CEDICT with `python3 tools/verify_pinyin.py` (253/253 OK in v8, including the 36 two-character words). Tone-mark placement (a, then o, then e; in iu/ui the last letter: guì, liú) is unit-checked in `PP.mark` with 24 cases (see PLAN v4)..
* Single-character recordings are tone-checked too: `python3 tools/char_pitch_check.py` (132/132 OK in v8). Two-character word recordings can't be checked this way. v8 characters without a Yue Tan recording use Chen Wang's syllable: 虫 chong2, 兔 tu4, 友 you3, 今 jin1, 明 ming2, 衣 yi1, 玩 wan2.
* Vietnamese word meanings are checked against [CVDICT](https://github.com/ph0ngp/CVDICT) (Chinese–Vietnamese, CC BY-SA, translated from CC-CEDICT and hand-reviewed by its author): `python3 tools/vi_meaning_check.py /tmp/cvdict.u8` (download CVDICT.u8 first). 211 meanings: 202 match the dictionary wording; the other 9 were reviewed by hand (two are pronunciation tips, not meanings).
* Stroke order: [Hanzi Writer](https://hanziwriter.org) 3.7.3 (MIT) + hanzi-writer-data 2.0.1 (copy `<char>.json` from the npm package into `vendor/hanzi-data/`) (Make Me a Hanzi / Arphic PL), vendored in `vendor/`. No hand-drawn stroke data.
* If a sound file ever can't play, the device's zh-CN voice says it instead (fallback only).
* See `CREDITS.md`.

## ☁️ Cloud save: how it works
* Progress is **always** saved on the device (`localStorage` key `pandaPinyin.save.v1`).
* Optional **family account**: in 👪 Grown-ups, choose a family name (3–20 letters/numbers/_) + password (6+). No email. All the family's children sync together. Log in with the same name on another phone to continue there. Write the password down: it can't be reset.
* Backend: the free Supabase project already used by Word Realms (`aoqfqopzycowbnjshzvg`), **in a separate namespace**: Panda Pinyin accounts are their own users (`<family>@family.pandapinyin.app`), each with its own row in `public.saves` (`username` = `pp:<family>`, `data.app = "panda-pinyin"`), protected by row-level security. Word Realms accounts and saves are never read or written: the code refuses to write unless the signed-in user is a `@family.pandapinyin.app` account, and it keeps its session under its own key `pp-auth` (both games share the `jere8899-collab.github.io` origin, so this matters). No schema change was needed.
* Sync: pulled on log-in and on every load with a session; pushed 2 s after any change and when the app is hidden. Children are merged one by one (the copy with more progress wins), so two devices don't wipe each other. Removing a child is remembered.
* Want a completely separate Supabase project later? Create a free project at supabase.com, run `supabase/schema.sql` from Word Realms (same `saves` table), turn off "Confirm email" in Auth settings, and put its URL + publishable key in `js/cloud.js` `CFG`.

## 🌐 Add a new language (one file)
1. Copy `js/i18n/vi.js` to `js/i18n/<code>.js` (e.g. `ms.js` for Malay, `ta.js` for Tamil).
2. Change the first line to `PP.addLang("<code>", { name: "<name in that language>", flag: "<flag emoji>", order: 2 }, {` and translate every right-hand text. Keep `{n}`, `{name}`, `{ch}` etc. exactly as they are. Leave a text out and the game shows English there.
3. Check it: `node tools/i18n_check.js <code>` lists anything missing or with a broken `{…}`.
4. `./deploy.sh "add <language>"`: the deploy step adds the new file to `index.html` and the offline cache by itself, and it appears in every 🌐 picker.
The keys are the English texts themselves, so when English text in the game changes, `tools/i18n_check.js` shows which translations need updating.

## 🧹 House rule: tidy first, then build (Jeremy, 2026-11-12)
Before adding a feature, first clean up the code that feature touches: remove dead code, simplify, tidy.
* Keep each cleanup **small** and limited to the files the feature touches.
* Run the tests after the cleanup and make sure they pass **before** building the feature.
* Mention the cleanup briefly in the report.

## Run / test / deploy
```bash
cd /workspace/panda-pinyin
python3 -m http.server 8765          # open http://localhost:8765
node tools/test/e2e.js               # full phone playthrough (390×844 + 320×640, all 34 lessons, badges, tracing incl. all 28 sets, words, memory mode, skins + prices, star balance, language switch, text-overflow checks, old-save check); screenshots in shots/
UI=vi node tools/test/e2e.js         # the same whole game with Vietnamese as the helper language; screenshots in shots/vi/
node tools/i18n_check.js vi          # every helper text has a Vietnamese translation
BASE=https://jere8899-collab.github.io/panda-pinyin/ CLOUD=1 node tools/test/e2e.js   # live site + live cloud round trip
node tools/test/namebox_webkit.js    # iPhone-size WebKit: name box takes English keys, Vietnamese diacritics, Chinese IME (needs WebKit: npx playwright-core install webkit)
BASE=https://jere8899-collab.github.io/panda-pinyin/ node tools/test/kid_check.js   # "play it like a kid": fresh phone, real key presses, one lesson, one tracing, shop, reload (Linux WebKit crashes on real mp3 playback, so its later steps use a dummy sound)
./deploy.sh "message"                # rebuilds sw.js (cache hash), commits, pushes to GitHub Pages
```
No build step; plain HTML/CSS/JS. (Test deps: `cd tools/test && npm i` for playwright-core; Chrome at /opt/google/chrome/chrome.)

## Files
`index.html` · `css/style.css` · `js/data.js` (all lessons, tone marks, praise) · `js/store.js` (profiles, save, merge) · `js/app.js` (screens, quiz, pet, tracing) · `js/cloud.js` (family cloud + grown-ups) · `js/i18n.js` (language switch) + `js/i18n/*.js` (one file per language) · `tools/sw.template.js` → `sw.js` via `tools/build_sw.py` · `audio/` · `img/` · `vendor/` · `PLAN.md` (learning path, done/next)

**Never** touch Word Realms (`/workspace/word-realms-deploy`, `/workspace/cefr-quest`) from this project.

## Backups
Before each upgrade: `tar czf /workspace/backups/panda-pinyin-<version>-<date>.tgz` of the project and a git tag (`v1`, `v2`, … = releases). Restore: `git checkout v1` or untar.
