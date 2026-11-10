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
const audioOf = (base, tone) => "audio/" + (AUDIO[base] || base) + tone + ".mp3";

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
    quiz: { kind: "syl", bases: ["ba", "pa", "ma", "fa", "bo", "po", "mo", "fo"], tones: [1, 2, 3, 4], n: 8 } },
  { id: "t3", icon: "🏆", zh: "声调大挑战", en: "Tone challenge",
    intro: "Mix of everything! Which tone do you hear?",
    learn: [],
    quiz: { kind: "tone", tones: [1, 2, 3, 4], bases: ["a", "o", "e", "i", "u", "ü", "ba", "pa", "ma", "fa", "bo", "po", "mo", "fo"], n: 8 } }
];

// stroke tracing (stroke order data: hanzi-writer-data, Make Me a Hanzi / Arphic PL)
const CHARS = [
  { ch: "一", py: "yī", en: "one", audio: "audio/c_yi.mp3", strokes: 1 },
  { ch: "二", py: "èr", en: "two", audio: "audio/c_er.mp3", strokes: 2 },
  { ch: "三", py: "sān", en: "three", audio: "audio/c_san.mp3", strokes: 3 },
  { ch: "人", py: "rén", en: "person", audio: "audio/c_ren.mp3", strokes: 2 },
  { ch: "大", py: "dà", en: "big", audio: "audio/c_da.mp3", strokes: 3 },
  { ch: "口", py: "kǒu", en: "mouth", audio: "audio/c_kou.mp3", strokes: 3 }
];

const PRAISE = [["真棒！", "Great job!"], ["太好了！", "Awesome!"], ["你真聪明！", "So clever!"], ["好极了！", "Excellent!"], ["对了！", "That’s right!"]];
const KIND = [["没关系！", "That’s okay!"], ["再听一次！", "Let’s listen again!"], ["加油！", "You can do it!"]];

const SKINS = [
  { id: "classic", zh: "竹子熊猫", en: "Bamboo Panda", img: "img/panda_classic.webp", cost: 0 },
  { id: "festive", zh: "新年熊猫", en: "New Year Panda", img: "img/panda_festive.webp", cost: 20 },
  { id: "space", zh: "太空熊猫", en: "Space Panda", img: "img/panda_space.webp", cost: 40 }
];

window.PP = Object.assign(window.PP || {}, { MARKS, mark, audioOf, TONES, LESSONS, CHARS, PRAISE, KIND, SKINS });
})();
