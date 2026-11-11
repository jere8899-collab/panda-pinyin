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

## Next ideas (in order)
1. Whole syllables ye yue yuan yin yun ying + finals ian uan üan iang uang iong.
2. "Spell it" game: drag initial + final, then pick the tone.
3. Tracing set 7 (2e).
4. A grown-ups progress view per child (which tones are tricky).
5. Daily goal / streak with the panda (no punishment for missed days).
6. Consider a fully separate free Supabase project if Jeremy wants (see README).

## Known limits
* ma5 (吗) is a different speaker from mā/má/mǎ/mà.
* A grown-up gate is a simple sum, not a real lock.
* No real recording for every neutral-tone syllable; only "ma" uses the neutral tone.
* audio-cmn records all 4 tones of every syllable, including a few that are not real words (e.g. tē, nē); they are used only as tone drill sounds, never shown as words.
* la4 qi4 se4 shu4 zhe4 lve2 miu4 niu2 nve4 tie2 xue2 pin2 ren4 shan2 zhen2 leng2 rong2 are not used as answers (pitch check unclear).
