/* Panda Pinyin content. Every tone mark below is standard Hanyu Pinyin (GB/T 16159 / 汉语拼音方案).
   Audio: audio/<syllable><tone>.mp3 = real recordings by Chen Wang (audio-cmn, CC BY-SA);
   audio/ma5.mp3 (吗) and audio/c_*.mp3 (characters) = Yue Tan, Shtooka (CC BY-SA). */
(function () {
const MARKS = {
  a: ["a", "ā", "á", "ǎ", "à"], o: ["o", "ō", "ó", "ǒ", "ò"], e: ["e", "ē", "é", "ě", "è"],
  i: ["i", "ī", "í", "ǐ", "ì"], u: ["u", "ū", "ú", "ǔ", "ù"], "ü": ["ü", "ǖ", "ǘ", "ǚ", "ǜ"]
};
// put the tone mark on the right vowel (a/o/e first, else the last of i/u/ü); enough for every syllable in v1
function mark(base, tone) {
  if (!tone || tone === 5) return base;
  let idx = -1;
  for (const v of ["a", "o", "e"]) { idx = base.indexOf(v); if (idx >= 0) break; }
  if (idx < 0) for (let k = base.length - 1; k >= 0; k--) if ("iuü".includes(base[k])) { idx = k; break; }
  return base.slice(0, idx) + MARKS[base[idx]][tone] + base.slice(idx + 1);
}
// written form -> audio file stem (a single final i/u/ü is read like yi/wu/yu)
const AUDIO = { i: "yi", u: "wu", "ü": "yu" };
const audioOf = (base, tone) => "audio/" + (AUDIO[base] || base.replace("ü", "v")) + tone + ".mp3";   // audio-cmn writes nü/lü as nv/lv
// recordings we don't ask about: the pitch check (tools/pitch_check.py) couldn't confirm the tone
const NO_AUDIO = new Set(["la4"]);
const hasAudio = (base, tone) => !NO_AUDIO.has(base + tone);

const TONES = [null,
  { n: 1, zh: "第一声", en: "1st tone: high and flat", shape: "ˉ", hint: "Sing it high and long, like a car going straight ➡️" },
  { n: 2, zh: "第二声", en: "2nd tone: goes up", shape: "ˊ", hint: "Go up, like asking “Huh?” ↗️" },
  { n: 3, zh: "第三声", en: "3rd tone: down then up", shape: "ˇ", hint: "Dip down then come up, like a tick ✔️" },
  { n: 4, zh: "第四声", en: "4th tone: falls down", shape: "ˋ", hint: "Drop down fast, like saying “No!” ↘️" },
  { n: 5, zh: "轻声", en: "Neutral tone: short and light", shape: "·", hint: "Quick and soft, no mark at all 🪶" }
];

// learn: cards to tap & hear. quiz: {kind:"tone"|"syl", pool:[[base,tone],...], opts:...}
const LESSONS = [
  { id: "t1", icon: "🎵", zh: "四个声调", en: "The 4 tones",
    intro: "Chinese has 4 tones. The same sound can mean different things! Tap each card to hear it.",
    learn: [1, 2, 3, 4].map(t => ({ base: "a", tone: t, tip: TONES[t].en })),
    quiz: { kind: "tone", tones: [1, 2, 3, 4], bases: ["a", "o", "e"], n: 6 } },
  { id: "t2", icon: "🐴", zh: "轻声", en: "mā má mǎ mà ma",
    intro: "Five ways to say “ma”. The 5th one, the neutral tone, is short and light and has no mark.",
    learn: [
      { base: "ma", tone: 1, hz: "妈", tip: "mum" }, { base: "ma", tone: 2, hz: "麻", tip: "numb / hemp" },
      { base: "ma", tone: 3, hz: "马", tip: "horse" }, { base: "ma", tone: 4, hz: "骂", tip: "to scold" },
      { base: "ma", tone: 5, hz: "吗", tip: "question word" }],
    quiz: { kind: "tone", tones: [1, 2, 3, 4, 5], bases: ["ma"], n: 6 } },
  { id: "f1", icon: "🅰️", zh: "单韵母 a o e", en: "Simple finals a o e",
    intro: "Open your mouth wide for a, round lips for o, smile a little for e.",
    learn: ["a", "o", "e"].map(b => ({ base: b, tone: 1, tip: { a: "mouth wide open 😮", o: "round lips ⭕", e: "small smile 🙂" }[b] })),
    quiz: { kind: "syl", bases: ["a", "o", "e"], tones: [1, 2, 3, 4], n: 6 } },
  { id: "f2", icon: "🦄", zh: "单韵母 i u ü", en: "Simple finals i u ü",
    intro: "i: smile wide. u: lips like a little tube. ü: say i, then round your lips. (Alone they are written yi, wu, yu.)",
    learn: ["i", "u", "ü"].map(b => ({ base: b, tone: 1, tip: { i: "big smile 😁", u: "little tube 😗", "ü": "say i, round lips 🐟" }[b] })),
    quiz: { kind: "syl", bases: ["i", "u", "ü"], tones: [1, 2, 3, 4], n: 6 } },
  { id: "s1", icon: "🫧", zh: "声母 b p m f", en: "First initials b p m f",
    intro: "We say b, p, m, f as bō, pō, mō, fō. Hold a hand in front of your mouth: p makes a puff of air, b doesn’t!",
    learn: ["bo", "po", "mo", "fo"].map(b => ({ base: b, tone: 1, tip: { bo: "lips pop, no puff", po: "lips pop with a puff 💨", mo: "hum through your nose", fo: "top teeth on bottom lip" }[b] })),
    quiz: { kind: "syl", bases: ["ba", "pa", "ma", "fa"], tones: [1], sameTone: true, n: 6 } },
  { id: "s2", icon: "🧩", zh: "拼一拼", en: "Blend: b p m f + a o",
    intro: "Put an initial and a final together: b + ā → bā. Listen for the sound AND the tone!",
    learn: [1, 2, 3, 4].map(t => ({ base: "ba", tone: t, tip: "b + " + mark("a", t) })),
    quiz: { kind: "syl", bases: ["ba", "pa", "ma", "fa", "bo", "po", "mo", "fo"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "t3", icon: "🏆", zh: "声调大挑战", en: "Tone challenge",
    intro: "Mix of everything! Which tone do you hear?",
    learn: [],
    quiz: { kind: "tone", tones: [1, 2, 3, 4], bases: ["a", "o", "e", "i", "u", "ü", "ba", "pa", "ma", "fa", "bo", "po", "mo", "fo"], n: 8 } },
  { id: "s3", icon: "🥁", zh: "声母 d t n l", en: "Initials d t n l",
    intro: "We say d, t, n, l as dē, tē, nē, lē. Tongue tip touches behind your top teeth. t has a puff of air, d doesn’t!",
    learn: ["de", "te", "ne", "le"].map(b => ({ base: b, tone: 1, tip: { de: "tongue taps, no puff", te: "tongue taps with a puff 💨", ne: "hum through your nose 👃", le: "tongue up, air flows round it" }[b] })),
    quiz: { kind: "syl", bases: ["da", "ta", "na", "la", "du", "tu", "nu", "lu"], tones: [1, 2, 3, 4], sameTone: true, sameFinal: true, n: 6 } },
  { id: "s4", icon: "🐰", zh: "拼一拼 d t n l", en: "Blend: d t n l + a e i u ü",
    intro: "d + à → dà 大! Listen for the sound AND the tone. Tap a card to hear a real word.",
    learn: [
      { base: "da", tone: 4, hz: "大", tip: "big" }, { base: "ta", tone: 1, hz: "他", tip: "he" },
      { base: "ni", tone: 3, hz: "你", tip: "you" }, { base: "lü", tone: 4, hz: "绿", tip: "green" },
      { base: "du", tone: 2, hz: "读", tip: "to read" }, { base: "tu", tone: 4, hz: "兔", tip: "rabbit" },
      { base: "nü", tone: 3, hz: "女", tip: "girl / female" }, { base: "li", tone: 2, hz: "梨", tip: "pear" }],
    quiz: { kind: "syl", bases: ["da", "ta", "na", "la", "de", "te", "ne", "le", "di", "ti", "ni", "li", "du", "tu", "nu", "lu", "nü", "lü"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "s5", icon: "🐸", zh: "声母 g k h", en: "Initials g k h",
    intro: "We say g, k, h as gē, kē, hē. They come from the back of your mouth. k has a puff; h is like fogging up a mirror!",
    learn: ["ge", "ke", "he"].map(b => ({ base: b, tone: 1, tip: { ge: "back of tongue, no puff", ke: "back of tongue with a puff 💨", he: "breathe out like fogging a mirror 🪞" }[b] })),
    quiz: { kind: "syl", bases: ["ga", "ka", "ha", "ge", "ke", "he", "gu", "ku", "hu"], tones: [1, 2, 3, 4], sameTone: true, sameFinal: true, n: 6 } },
  { id: "s6", icon: "🐯", zh: "拼一拼 g k h", en: "Blend: g k h + a e u",
    intro: "h + ǔ → hǔ 虎, a tiger! Tap the cards to hear real words, then find the sound and the tone.",
    learn: [
      { base: "ge", tone: 1, hz: "哥", tip: "big brother" }, { base: "gu", tone: 3, hz: "鼓", tip: "drum" },
      { base: "ku", tone: 1, hz: "哭", tip: "to cry" }, { base: "ke", tone: 3, hz: "渴", tip: "thirsty" },
      { base: "he", tone: 1, hz: "喝", tip: "to drink" }, { base: "hu", tone: 3, hz: "虎", tip: "tiger" }],
    quiz: { kind: "syl", bases: ["ga", "ka", "ha", "ge", "ke", "he", "gu", "ku", "hu"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "t4", icon: "👑", zh: "声母大复习", en: "Big review: b p m f d t n l g k h",
    intro: "Everything so far! Which tone do you hear?",
    learn: [],
    quiz: { kind: "tone", tones: [1, 2, 3, 4], bases: ["ba", "pa", "ma", "fa", "da", "ta", "na", "la", "di", "ni", "li", "du", "tu", "lü", "ga", "ka", "ha", "ge", "ke", "he", "gu", "ku", "hu"], n: 10 } }
];

// stroke tracing (stroke order data: hanzi-writer-data, Make Me a Hanzi / Arphic PL)
const CHARS = [
  { ch: "一", py: "yī", en: "one", audio: "audio/c_yi.mp3", strokes: 1, set: 1 },
  { ch: "二", py: "èr", en: "two", audio: "audio/c_er.mp3", strokes: 2, set: 1 },
  { ch: "三", py: "sān", en: "three", audio: "audio/c_san.mp3", strokes: 3, set: 1 },
  { ch: "人", py: "rén", en: "person", audio: "audio/c_ren.mp3", strokes: 2, set: 1 },
  { ch: "大", py: "dà", en: "big", audio: "audio/c_da.mp3", strokes: 3, set: 1 },
  { ch: "口", py: "kǒu", en: "mouth", audio: "audio/c_kou.mp3", strokes: 3, set: 1 },
  { ch: "十", py: "shí", en: "ten", audio: "audio/c_shi.mp3", strokes: 2, set: 2 },
  { ch: "土", py: "tǔ", en: "soil, earth", audio: "audio/c_tu.mp3", strokes: 3, set: 2 },
  { ch: "上", py: "shàng", en: "up, on", audio: "audio/c_shang.mp3", strokes: 3, set: 2 },
  { ch: "下", py: "xià", en: "down, under", audio: "audio/c_xia.mp3", strokes: 3, set: 2 },
  { ch: "小", py: "xiǎo", en: "small", audio: "audio/c_xiao.mp3", strokes: 3, set: 2 },
  { ch: "山", py: "shān", en: "mountain", audio: "audio/c_shan.mp3", strokes: 3, set: 2 },
  { ch: "中", py: "zhōng", en: "middle", audio: "audio/c_zhong.mp3", strokes: 4, set: 3 },
  { ch: "日", py: "rì", en: "sun, day", audio: "audio/c_ri.mp3", strokes: 4, set: 3 },
  { ch: "月", py: "yuè", en: "moon, month", audio: "audio/c_yue.mp3", strokes: 4, set: 3 },
  { ch: "木", py: "mù", en: "tree, wood", audio: "audio/c_mu.mp3", strokes: 4, set: 3 },
  { ch: "水", py: "shuǐ", en: "water", audio: "audio/c_shui.mp3", strokes: 4, set: 3 },
  { ch: "火", py: "huǒ", en: "fire", audio: "audio/c_huo.mp3", strokes: 4, set: 3 }
];
// a set opens once 3 characters of the set before it have been traced
const CHAR_SETS = [null, { zh: "第一组", en: "Set 1 · first strokes" }, { zh: "第二组", en: "Set 2 · up, down & more" }, { zh: "第三组", en: "Set 3 · nature" }];

const PRAISE = [["真棒！", "Great job!"], ["太好了！", "Awesome!"], ["你真聪明！", "So clever!"], ["好极了！", "Excellent!"], ["对了！", "That’s right!"]];
const KIND = [["没关系！", "That’s okay!"], ["再听一次！", "Let’s listen again!"], ["加油！", "You can do it!"]];

const SKINS = [
  { id: "classic", zh: "竹子熊猫", en: "Bamboo Panda", img: "img/panda_classic.webp", cost: 0 },
  { id: "festive", zh: "新年熊猫", en: "New Year Panda", img: "img/panda_festive.webp", cost: 20 },
  { id: "space", zh: "太空熊猫", en: "Space Panda", img: "img/panda_space.webp", cost: 40 },
  { id: "brush", zh: "书法熊猫", en: "Brush Panda", img: "img/panda_brush.webp", cost: 80 }
];

window.PP = Object.assign(window.PP || {}, { MARKS, mark, audioOf, hasAudio, CHAR_SETS, TONES, LESSONS, CHARS, PRAISE, KIND, SKINS });
})();
