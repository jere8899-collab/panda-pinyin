# Panda Pinyin — learning path & plan

Aligned with Singapore MOE: preschool **NEL framework (K1–K2)** for listening/speaking and early literacy, then **Primary 1–6 欢乐伙伴 (Huanle Huoban)**. Simplified Chinese, Hanyu Pinyin with tone marks.
Rule for every future run: verify pinyin, tones, stroke order and vocabulary against a reliable source (audio-cmn/Shtooka recordings, Hanzi Writer data, the MOE 欢乐伙伴 word lists, 现代汉语词典); never guess. Test at 390×844 and 320×640 and keep `tools/test/e2e.js` green before deploying.

## Full path
| # | World | Content | Status |
|---|---|---|---|
| 1 | 🌈 拼音乐园 Pinyin Park | 4 tones + neutral tone; simple finals a o e i u ü; initials b p m f; blending | ✅ v1 (7 lessons) |
| 1b | | initials d t n l, g k h, j q x (+ ü rule: ju qu xu yu), zh ch sh r, z c s; y w | ⏭ next |
| 1c | | compound finals ai ei ui ao ou iu ie üe er; nasal finals an en in un ün, ang eng ing ong; whole syllables (整体认读音节 zhi chi shi ri zi ci si yi wu yu ye yue yuan yin yun ying) | later |
| 1d | | tone-mark placement rules, 3rd-tone sandhi (nǐ hǎo → ní hǎo), 一/不 tone changes, two-syllable words, spelling games (drag initial + final + tone) | later |
| 2 | 🌸 写字花园 Stroke-order tracing | Hanzi Writer tracing: 一 二 三 人 大 口 | ✅ v1 (6 characters) |
| 2b | | more P1 characters: 十 木 山 水 火 日 月 上 下 中 小 | ⏭ next |
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

## Next ideas (in order)
1. Lessons for d t n l and g k h (audio files exist for all syllables in audio-cmn 64k/syllabs; download only what's used).
2. "Spell it" game: drag initial + final, then pick the tone.
3. 10 more tracing characters (2b) + a sticker page for written characters.
4. A grown-ups progress view per child (which tones are tricky).
5. Daily goal / streak with the panda (no punishment for missed days).
6. Consider a fully separate free Supabase project if Jeremy wants (see README).

## Known limits
* ma5 (吗) is a different speaker from mā/má/mǎ/mà.
* A grown-up gate is a simple sum, not a real lock.
* No real recording for every neutral-tone syllable; v1 only uses neutral tone on "ma".
