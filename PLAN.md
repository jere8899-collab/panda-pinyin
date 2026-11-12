# Panda Pinyin — learning path & plan

Aligned with Singapore MOE: preschool **NEL framework (K1–K2)** for listening/speaking and early literacy, then **Primary 1–6 欢乐伙伴 (Huanle Huoban)**. Simplified Chinese, Hanyu Pinyin with tone marks.
Rule for every future run: verify pinyin, tones, stroke order and vocabulary against a reliable source (audio-cmn/Shtooka recordings, Hanzi Writer data, the MOE 欢乐伙伴 word lists, 现代汉语词典); never guess. Test at 390×844 and 320×640 and keep `tools/test/e2e.js` green before deploying.

## Full path
| # | World | Content | Status |
|---|---|---|---|
| 1 | 🌈 拼音乐园 Pinyin Park | 4 tones + neutral tone; simple finals a o e i u ü; initials b p m f; blending | ✅ v1 (7 lessons) |
| 1b | | initials d t n l, g k h + blending | ✅ v2 (5 lessons) |
| 1b+ | | initials j q x (+ ü rule), zh ch sh r, z c s + blending + look-alike review | ✅ v3 (7 lessons) |
| 1b++ | | y w as initials; 整体认读音节 zhi chi shi ri zi ci si yi wu yu | ✅ v4 |
| 1c | | compound finals ai ei ui ao ou iu ie üe er + blending + review | ✅ v4 (7 lessons) |
| 1c+ | | nasal finals an en in un ün + blending | ✅ v5 (2 lessons) |
| 1c++ | | ang eng ing ong + blending; n / ng review + 🏅 Nose Sounds badge | ✅ v6 (3 lessons) |
| 1c+++ | | whole syllables ye yue yuan yin yun ying; ian uan üan iang uang iong | ⏭ next |
| 1d | | tone-mark placement rules, 3rd-tone sandhi (nǐ hǎo → ní hǎo), 一/不 tone changes, two-syllable words, spelling games (drag initial + final + tone) | later |
| 2 | 🌸 写字花园 Stroke-order tracing | Hanzi Writer tracing: 一 二 三 人 大 口 | ✅ v1 (6 characters) |
| 2b | | 十 土 上 下 小 山 · 中 日 月 木 水 火, in sets that unlock | ✅ v2 (18 characters) |
| 2c | | 目 耳 手 足 头 门 · 天 田 王 云 白 不 | ✅ v3 (30 characters) |
| 2d | | 子 女 马 牛 羊 鸟 | ✅ v4 (36 characters) |
| 2e | | 石 禾 竹 米 刀 力 · 文 方 夕 心 | ⏭ next |
| 3 | 🧱 Basic strokes & radicals | 基本笔画 (横 竖 撇 捺 点 提 横折 竖钩 …) with names; common radicals 亻 口 木 氵 扌 女 日 … | later |
| 4 | 📚 MOE characters / vocab by level | K1–K2 NEL themes (family, body, colours, numbers, food) → P1–P6 欢乐伙伴 识读字 / 识写字 per unit: picture ↔ word, hear ↔ word, write it | later |
| 5 | 💬 Phrases & sentences | 你好、谢谢、我是…、这是… ; P1–P2 sentence patterns; word-order tiles | later |
| 6 | 👂 Listening & reading | short stories with pinyin on/off, listen-and-answer, read-aloud | later |

## v1 done (2026-11-10)
* Profiles per child (nickname only), panda pet (levels, happiness, feeding), 3 skins, stars & 1–3 crowns.
* 7 pinyin lessons with real recordings; listen-pick-tone and listen-pick-syllable; gentle bilingual feedback.
* Writing Garden: 6 characters, watch + finger tracing, hints after 2 misses.
* Family cloud save (Supabase free tier, separate namespace) + local fallback; offline cache; add to home screen.
* README, CREDITS, e2e test (37 checks).

## v2 done (2026-11-10)
* 5 new Pinyin Park lessons after the tone challenge: d t n l, blend d t n l, g k h, blend g k h, big review (12 lessons total).
* 12 new tracing characters in Writing Garden sets 2–3 (unlock after 3 traced in the set before), each with pinyin, meaning and a real recording.
* New skin 书法熊猫 Brush Panda (80⭐) so the extra stars have something to buy.
* Old saves work unchanged (same save format; lessons/characters are keyed by id/character). Tested with a v1-shaped save.
* New tools: `tools/pitch_check.py` (tone shape of every recording), `tools/verify_pinyin.py` (CC-CEDICT check).

## v3 done (2026-11-10)
* 7 new Pinyin Park lessons after the big review: j q x (ü-dots rule), blend j q x, zh ch sh r, blend zh ch sh r, z c s, blend z c s, look-alike review z / zh / j (19 lessons).
* Writing Garden sets 4 (my body) and 5 (sky & field): 12 more characters, 30 in total.
* New skin 舞狮熊猫 Lion Dance Panda (120⭐).
* Pitch check: octave-jump tails cut; 4 more unclear recordings excluded from answers (qi4 se4 shu4 zhe4). Unused audio files removed (smaller offline cache).
* Old v1/v2 saves unchanged and tested.

## v4 done (2026-11-10)
* 9 new Pinyin Park lessons after the z/zh/j review: y w, whole syllables, ai ei ui (+blend), ao ou iu (+blend), ie üe er (+blend), compound-finals review (28 lessons).
* Writing Garden set 6 (people & animals): 子 女 马 牛 羊 鸟 (36 characters).
* 🏅 Badge shelf: 14 badges (7 worlds, 6 writing sets, graduate), +5⭐ each, graduate +20⭐; older saves get earned badges on first open.
* Tone-mark rule unit check (24 cases: guì liú duì jiǔ xué yuè lǜ nǚ ài hǎo gǒu ér shuǐ uī iū üē iē nüè huì niú xiū lüè měi zhōu). 6 more unclear recordings excluded from answers.

## v5 done (2026-11-10, daily run)
* 2 new Pinyin Park lessons: 前鼻韵母 an en in un ün (alone yin wen yun) and blending with 8 real words (山 饭 门 很 心 林 春 裙). 30 lessons.
* 192 new Chen Wang recordings (audio-cmn 64k/syllabs), only the ones used. pin2 ren4 shan2 zhen2 failed the pitch check, so they are never answers.
* pitch_check now matches NO_AUDIO names written with ü (lüe2 = lve2.mp3).
* No new badge yet: a nasal-finals badge comes with ang eng ing ong + review.

## v6 done (2026-11-11, daily run)
* 3 new Pinyin Park lessons: 后鼻韵母 ang eng ing ong (ing alone = ying; ong shown as dōng since it never stands alone; quiz pits an/ang, en/eng, in/ing), blending with 8 real words (糖 灯 风 星 冰 红 龙 虫), and 前鼻还是后鼻？ n-or-ng review (10 questions). 33 lessons.
* 👃 Nose Sounds badge (s21–s24 + t7), 15 badges.
* 180 new Chen Wang recordings; leng2 rong2 failed the pitch check → NO_AUDIO.
* Fix: long syllables (chēng, zhōng) no longer push the 3rd answer button off a phone screen; e2e now checks every answer button fits.

## v7 done (2026-11-12): more writing + more skins
* Writing Garden sets 7–17: 54 more characters (numbers, family, plants & weather, colours, actions, school, food, directions, opposites) + 12 two-character words in 2 词语 sets (traced one character after the other). 102 entries in total. Stroke data from hanzi-writer-data 2.0.1; pinyin checked against CC-CEDICT (187/187); recordings from audio-cmn (Yue Tan HSK words/characters; Chen Wang syllables for 爸 妈 哥 姐 弟 妹 石 禾 竹 果, which have no HSK file). All 54 single-character recordings pass the pitch check.
* 🧠 默写 From-memory mode: outline hidden, gentle "再想想！", hint after 3 misses, +2⭐ the first time per character.
* Locked sets after the next one fold into one "🔒 N more sets to discover" line.
* 12 new badges: Writing Set 7–17 + 🧠 Memory Writer (10 characters from memory). 27 badges.
* 6 new skins: Mid-Autumn Lantern 150, School Uniform 180, Little Chef 220, Dragon Boat 260, Super Panda 320, Merlion 400⭐ (made with the built-in free image tool from the Bamboo Panda picture).

## v8 done (2026-11-12): more words, harder skins, 🌐 language switch
* Writing Garden sets 18–28: 42 more characters (animals, people, day & night, seasons, describing, at home, doing things) + 24 more two-character words in 4 词语 sets (family, time & seasons, school, everyday). 168 entries. Pinyin 253/253 vs CC-CEDICT; 132/132 single-character recordings pass the tone check (new tools/char_pitch_check.py). 11 set badges + 🧠 Memory Star (50, +15⭐): 39 badges.
* Star balance: replaying a finished lesson pays half; trace replays pay 1⭐ once a day per character (first trace 5⭐, better 2⭐); first memory write 3⭐. Skin prices ~2.5× (top Merlion 400→1200⭐), cheap starters kept (New Year 20, Space 60, Little Artist 120). 5 new skins: Little Artist, Orchid (胡姬花), Kopitiam, Wushu, Little Emperor (1800⭐). About 1,970⭐ can be earned by doing everything once.
* 🌐 Helper language: English + Tiếng Việt. One file per language in js/i18n/ (keys = English text, fallback to English). Saved per child (p.lang), synced with the cloud save; device default before a child is picked. 🌐 on the home top bar and the player screen; per-child 🌐 in Grown-ups. Vietnamese word meanings checked against CVDICT (tools/vi_meaning_check.py). tools/i18n_check.js lists missing translations; the e2e test plays the whole game in both languages (UI=vi) and fails on any text overflow.

## 🧹 House rule: tidy first, then build (Jeremy, 2026-11-12)
Before adding a feature, first clean up the code that feature touches: remove dead code, simplify, tidy.
* Keep each cleanup **small** and limited to the files the feature touches.
* Run the tests after the cleanup and make sure they pass **before** building the feature.
* Mention the cleanup briefly in the report.

## Next ideas (in order)
1. Whole syllables ye yue yuan yin yun ying + finals ian uan üan iang uang iong.
2. "Spell it" game: drag initial + final, then pick the tone.
3. A 'pick the right character' reading game using the Writing Garden words (meanings already translated).
3b. More helper languages on request (Malay, Tamil, Burmese…): one file each, see README.
4. A grown-ups progress view per child (which tones are tricky).
5. Daily goal / streak with the panda (no punishment for missed days).
6. Consider a fully separate free Supabase project if Jeremy wants (see README).

## Known limits
* ma5 (吗) is a different speaker from mā/má/mǎ/mà.
* A grown-up gate is a simple sum, not a real lock.
* No real recording for every neutral-tone syllable; only "ma" uses the neutral tone.
* audio-cmn records all 4 tones of every syllable, including a few that are not real words (e.g. tē, nē); they are used only as tone drill sounds, never shown as words.
* la4 qi4 se4 shu4 zhe4 lve2 miu4 niu2 nve4 tie2 xue2 pin2 ren4 shan2 zhen2 leng2 rong2 are not used as answers (pitch check unclear).
