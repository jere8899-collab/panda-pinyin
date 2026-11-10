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
const AUDIO = { i: "yi", u: "wu", "ü": "yu", ui: "wei", iu: "you", ie: "ye", "üe": "yue", in: "yin", un: "wen", "ün": "yun" };   // finals said alone
const audioOf = (base, tone) => "audio/" + (AUDIO[base] || base.replace("ü", "v")) + tone + ".mp3";   // audio-cmn writes nü/lü as nv/lv
// recordings we don't ask about: the pitch check (tools/pitch_check.py) couldn't confirm the tone
const NO_AUDIO = new Set(["la4", "qi4", "se4", "shu4", "zhe4", "lüe2", "miu4", "niu2", "nüe4", "tie2", "xue2", "pin2", "ren4", "shan2", "zhen2"]);
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
,
  { id: "s7", icon: "🐔", zh: "声母 j q x", en: "Initials j q x",
    intro: "We say j, q, x as jī, qī, xī: smile and keep your tongue low. 🤫 A little secret: j q x never go with u. When you see ju, qu, xu, it is really jü, qü, xü! The two dots hide, but you still say ü (round lips 🐟).",
    learn: [{ base: "ji", tone: 1, tip: "smile, no puff" }, { base: "qi", tone: 1, tip: "smile with a puff 💨" }, { base: "xi", tone: 1, tip: "smile and hiss softly 🐍" },
      { base: "ju", tone: 1, tip: "j + ü → ju: the dots hide! 👀" }],
    quiz: { kind: "syl", bases: ["ji", "qi", "xi", "ju", "qu", "xu"], tones: [1, 2, 3, 4], sameTone: true, sameFinal: true, n: 6 } },
  { id: "s8", icon: "🍊", zh: "拼一拼 j q x", en: "Blend: j q x + i ü",
    intro: "j + ī → jī 鸡. And remember: in ju qu xu the ü has hidden its dots, so say it with round lips!",
    learn: [
      { base: "ji", tone: 1, hz: "鸡", tip: "chicken" }, { base: "qi", tone: 1, hz: "七", tip: "seven" },
      { base: "xi", tone: 1, hz: "西", tip: "west" }, { base: "xi", tone: 3, hz: "洗", tip: "to wash" },
      { base: "qu", tone: 4, hz: "去", tip: "to go (q + ü)" }, { base: "ju", tone: 2, hz: "橘", tip: "tangerine (j + ü)" }],
    quiz: { kind: "syl", bases: ["ji", "qi", "xi", "ju", "qu", "xu"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "s9", icon: "🐷", zh: "声母 zh ch sh r", en: "Initials zh ch sh r",
    intro: "Curl your tongue up a little (翘舌)! We say them zhī, chī, shī, rì. ch has a puff of air; zh doesn’t.",
    learn: [{ base: "zhi", tone: 1, tip: "tongue curled, no puff" }, { base: "chi", tone: 1, tip: "tongue curled, with a puff 💨" },
      { base: "shi", tone: 1, tip: "tongue curled, soft shhh 🤫" }, { base: "ri", tone: 4, hz: "日", tip: "tongue curled, buzz (said rì, like 日)" }],
    quiz: { kind: "syl", bases: ["zha", "cha", "sha", "zhu", "chu", "shu", "ru", "zhi", "chi", "shi", "ri", "zhe", "che", "she", "re"], tones: [1, 2, 3, 4], sameTone: true, sameFinal: true, n: 6 } },
  { id: "s10", icon: "🍵", zh: "拼一拼 zh ch sh r", en: "Blend: zh ch sh r + a e i u",
    intro: "zh + ū → zhū 猪, a pig! In zhi, chi, shi, ri the i is not “ee”: just keep the buzzy sound going.",
    learn: [
      { base: "zhu", tone: 1, hz: "猪", tip: "pig" }, { base: "zhi", tone: 3, hz: "纸", tip: "paper" },
      { base: "chi", tone: 1, hz: "吃", tip: "to eat" }, { base: "cha", tone: 2, hz: "茶", tip: "tea" },
      { base: "shu", tone: 1, hz: "书", tip: "book" }, { base: "shi", tone: 2, hz: "十", tip: "ten" },
      { base: "ri", tone: 4, hz: "日", tip: "sun, day" }, { base: "re", tone: 4, hz: "热", tip: "hot" }],
    quiz: { kind: "syl", bases: ["zha", "cha", "sha", "zhu", "chu", "shu", "ru", "zhi", "chi", "shi", "ri", "zhe", "che", "she", "re"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "s11", icon: "🐝", zh: "声母 z c s", en: "Initials z c s",
    intro: "Keep your tongue flat (平舌), tip behind your teeth. We say them zī, cī, sī. c has a puff of air; s buzzes like a bee 🐝",
    learn: [{ base: "zi", tone: 1, tip: "flat tongue, no puff" }, { base: "ci", tone: 1, tip: "flat tongue, with a puff 💨" }, { base: "si", tone: 1, tip: "flat tongue, sss like a snake 🐍" }],
    quiz: { kind: "syl", bases: ["za", "ca", "sa", "zu", "cu", "su", "zi", "ci", "si", "ze", "ce", "se"], tones: [1, 2, 3, 4], sameTone: true, sameFinal: true, n: 6 } },
  { id: "s12", icon: "✏️", zh: "拼一拼 z c s", en: "Blend: z c s + a e i u",
    intro: "z + ì → zì 字, a character! Tap the cards to hear real words.",
    learn: [
      { base: "zi", tone: 4, hz: "字", tip: "character, word" }, { base: "si", tone: 4, hz: "四", tip: "four" },
      { base: "ci", tone: 2, hz: "词", tip: "word" }, { base: "zu", tone: 2, hz: "足", tip: "foot" },
      { base: "ca", tone: 1, hz: "擦", tip: "to wipe" }],
    quiz: { kind: "syl", bases: ["za", "ca", "sa", "zu", "cu", "su", "zi", "ci", "si", "ze", "ce", "se"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "t5", icon: "🦁", zh: "平舌还是翘舌？", en: "Review: z c s, zh ch sh or j q x?",
    intro: "These sound alike! Flat tongue z c s, curled tongue zh ch sh, smiley j q x. Listen carefully 👂",
    learn: [],
    quiz: { kind: "syl", bases: ["zi", "ci", "si", "zhi", "chi", "shi", "ji", "qi", "xi", "zu", "cu", "su", "zhu", "chu", "shu", "ju", "qu", "xu", "za", "ca", "sa", "zha", "cha", "sha"], tones: [1, 2, 3, 4], sameTone: true,
      confuse: { zi: ["zhi", "ji"], ci: ["chi", "qi"], si: ["shi", "xi"], zhi: ["zi", "ji"], chi: ["ci", "qi"], shi: ["si", "xi"], ji: ["zhi", "zi"], qi: ["chi", "ci"], xi: ["shi", "si"],
        zu: ["zhu", "ju"], cu: ["chu", "qu"], su: ["shu", "xu"], zhu: ["zu", "ju"], chu: ["cu", "qu"], shu: ["su", "xu"], ju: ["zhu", "zu"], qu: ["chu", "cu"], xu: ["shu", "su"],
        za: ["zha", "ca"], ca: ["cha", "za"], sa: ["sha", "ca"], zha: ["za", "cha"], cha: ["ca", "zha"], sha: ["sa", "cha"] }, n: 10 } }
,
  { id: "s13", icon: "🦆", zh: "声母 y w", en: "Initials y w",
    intro: "y and w are like i and u wearing a little hat 🎩. They start a syllable: y sounds like i, w sounds like u.",
    learn: [{ base: "ya", tone: 1, hz: "鸭", tip: "duck" }, { base: "ye", tone: 2, hz: "爷", tip: "grandpa (爷爷)" }, { base: "yu", tone: 2, hz: "鱼", tip: "fish" },
      { base: "wa", tone: 1, hz: "蛙", tip: "frog (青蛙)" }, { base: "wu", tone: 3, hz: "五", tip: "five" }],
    quiz: { kind: "syl", bases: ["ya", "wa", "ye", "yi", "wu", "yu"], tones: [1, 2, 3, 4], twin: true, n: 6 } },
  { id: "s14", icon: "🌟", zh: "整体认读音节", en: "Whole syllables",
    intro: "Some syllables are read as ONE sound. Don’t blend them (not z + i!), just say them whole: zhi chi shi ri zi ci si yi wu yu. In zhi chi shi ri zi ci si the i is only a buzz.",
    learn: ["zhi", "chi", "shi", "ri", "zi", "ci", "si", "yi", "wu", "yu"].map(b => ({ base: b, tone: b === "ri" ? 4 : 1, tip: "say it as one sound" })),
    quiz: { kind: "tone", tones: [1, 2, 3, 4], bases: ["zhi", "chi", "shi", "ri", "zi", "ci", "si", "yi", "wu", "yu"], n: 8 } },
  { id: "s15", icon: "🍎", zh: "复韵母 ai ei ui", en: "Finals ai ei ui",
    intro: "Two vowels glide together like a slide 🛝: a → i makes ai, e → i makes ei, u → i makes ui.",
    learn: [{ base: "ai", tone: 1, tip: "a slides to i" }, { base: "ei", tone: 1, tip: "e slides to i" }, { base: "ui", tone: 1, tip: "u slides to i (alone: wei)" }],
    quiz: { kind: "syl", bases: ["ai", "ei", "ui"], tones: [1, 2, 3, 4], n: 6 } },
  { id: "s16", icon: "💧", zh: "拼一拼 ai ei ui", en: "Blend: ai ei ui",
    intro: "b + ái → bái 白. Tone-mark tip: the mark sits on a, then o, then e. In ui it goes on the last letter: guì, shuǐ.",
    learn: [
      { base: "ai", tone: 4, hz: "爱", tip: "love" }, { base: "bai", tone: 2, hz: "白", tip: "white" },
      { base: "lai", tone: 2, hz: "来", tip: "to come" }, { base: "bei", tone: 1, hz: "杯", tip: "cup" },
      { base: "hei", tone: 1, hz: "黑", tip: "black" }, { base: "fei", tone: 1, hz: "飞", tip: "to fly" },
      { base: "shui", tone: 3, hz: "水", tip: "water" }, { base: "gui", tone: 4, hz: "贵", tip: "expensive" }],
    quiz: { kind: "syl", bases: ["bai", "mai", "lai", "hai", "tai", "dai", "gai", "bei", "mei", "fei", "hei", "lei", "gei", "dui", "gui", "hui", "shui", "tui"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "s17", icon: "🐱", zh: "复韵母 ao ou iu", en: "Finals ao ou iu",
    intro: "More gliding vowels: a → o makes ao, o → u makes ou, i → u makes iu.",
    learn: [{ base: "ao", tone: 1, tip: "a slides to o" }, { base: "ou", tone: 1, tip: "o slides to u" }, { base: "iu", tone: 1, tip: "i slides to u (alone: you)" }],
    quiz: { kind: "syl", bases: ["ao", "ou", "iu"], tones: [1, 2, 3, 4], n: 6 } },
  { id: "s18", icon: "🐶", zh: "拼一拼 ao ou iu", en: "Blend: ao ou iu",
    intro: "m + āo → māo 猫, a cat! In iu the tone mark goes on the last letter: liù, niú.",
    learn: [
      { base: "mao", tone: 1, hz: "猫", tip: "cat" }, { base: "bao", tone: 1, hz: "包", tip: "bag, bun" },
      { base: "hao", tone: 3, hz: "好", tip: "good" }, { base: "gou", tone: 3, hz: "狗", tip: "dog" },
      { base: "zou", tone: 3, hz: "走", tip: "to walk" }, { base: "niu", tone: 2, hz: "牛", tip: "cow", audio: "audio/c_niu.mp3" },
      { base: "liu", tone: 4, hz: "六", tip: "six" }, { base: "qiu", tone: 2, hz: "球", tip: "ball" }],
    quiz: { kind: "syl", bases: ["bao", "mao", "hao", "pao", "dao", "gao", "lao", "dou", "tou", "lou", "gou", "kou", "zou", "hou", "niu", "liu", "jiu", "qiu", "xiu", "diu"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "s19", icon: "🌙", zh: "复韵母 ie üe er", en: "Finals ie üe er",
    intro: "i → e makes ie, ü → e makes üe, and er curls your tongue up. After j q x y, üe hides its dots too: xué, yuè.",
    learn: [{ base: "ie", tone: 1, tip: "i slides to e (alone: ye)" }, { base: "üe", tone: 1, tip: "ü slides to e (alone: yue)" }, { base: "er", tone: 2, hz: "儿", tip: "curl your tongue up" }],
    quiz: { kind: "syl", bases: ["ie", "üe", "er"], tones: [1, 2, 3, 4], n: 6 } },
  { id: "s20", icon: "❄️", zh: "拼一拼 ie üe er", en: "Blend: ie üe er",
    intro: "x + uě → xuě 雪, snow! Remember: j q x y + üe is written ue, but still said with round lips.",
    learn: [
      { base: "jie", tone: 3, hz: "姐", tip: "big sister" }, { base: "xie", tone: 3, hz: "写", tip: "to write" },
      { base: "xie", tone: 2, hz: "鞋", tip: "shoe" }, { base: "yue", tone: 4, hz: "月", tip: "moon" },
      { base: "xue", tone: 3, hz: "雪", tip: "snow" }, { base: "er", tone: 3, hz: "耳", tip: "ear" },
      { base: "er", tone: 4, hz: "二", tip: "two" }, { base: "er", tone: 2, hz: "儿", tip: "child" }],
    quiz: { kind: "syl", bases: ["jie", "xie", "qie", "die", "tie", "bie", "nie", "lie", "xue", "jue", "que", "nüe", "lüe", "ye", "yue", "er"], tones: [1, 2, 3, 4], twin: true, n: 8 } },
  { id: "t6", icon: "🍀", zh: "复韵母大复习", en: "Review: ai ei · ao ou · iu ui · ie üe",
    intro: "Same start, different glide! Listen to the end of the sound 👂",
    learn: [],
    quiz: { kind: "syl", bases: ["bai", "bei", "bao", "mai", "mei", "mao", "mou", "lai", "lei", "lao", "lou", "liu", "hai", "hei", "hao", "hou", "hui", "dai", "dao", "dou", "dui", "diu", "gai", "gei", "gao", "gou", "gui", "jie", "jue", "jiu", "xie", "xue", "xiu", "nie", "nüe", "niu", "lie", "lüe"],
      tones: [1, 2, 3, 4], sameTone: true, sameInitial: true, n: 10 } },
  { id: "s21", icon: "👃", zh: "前鼻韵母 an en in un ün", en: "Nose finals an en in un ün",
    intro: "Add an n and the sound ends in your nose 👃: a + n → an. Tongue tip touches behind your top teeth at the end. (Alone, in un ün are written yin, wen, yun.)",
    learn: [{ base: "an", tone: 1, tip: "a, then tongue up: n" }, { base: "en", tone: 1, tip: "e, then n" }, { base: "in", tone: 1, tip: "i, then n (alone: yin)" },
      { base: "un", tone: 1, tip: "u, then n (alone: wen)" }, { base: "ün", tone: 1, tip: "ü, then n (alone: yun)" }],
    quiz: { kind: "syl", bases: ["an", "en", "in", "un", "ün"], tones: [1, 2, 3, 4], n: 6 } },
  { id: "s22", icon: "⛰️", zh: "拼一拼 an en in un ün", en: "Blend: an en in un ün",
    intro: "sh + ān → shān 山, a mountain! After j q x, ün hides its dots again: q + ún → qún 裙.",
    learn: [
      { base: "shan", tone: 1, hz: "山", tip: "mountain" }, { base: "fan", tone: 4, hz: "饭", tip: "rice, meal" },
      { base: "men", tone: 2, hz: "门", tip: "door" }, { base: "hen", tone: 3, hz: "很", tip: "very" },
      { base: "xin", tone: 1, hz: "心", tip: "heart" }, { base: "lin", tone: 2, hz: "林", tip: "woods" },
      { base: "chun", tone: 1, hz: "春", tip: "spring" }, { base: "qun", tone: 2, hz: "裙", tip: "skirt (q + ün)" }],
    quiz: { kind: "syl", bases: ["ban", "pan", "man", "fan", "dan", "tan", "nan", "lan", "gan", "kan", "han", "zhan", "shan", "san", "ben", "pen", "men", "fen", "gen", "hen", "zhen", "chen", "shen", "ren", "bin", "pin", "min", "lin", "jin", "qin", "xin", "dun", "tun", "lun", "gun", "kun", "hun", "chun", "shun", "sun", "jun", "qun", "xun"], tones: [1, 2, 3, 4], twin: true, n: 8 } }
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
  { ch: "火", py: "huǒ", en: "fire", audio: "audio/c_huo.mp3", strokes: 4, set: 3 },
  { ch: "目", py: "mù", en: "eye", audio: "audio/c_mu_eye.mp3", strokes: 5, set: 4 },
  { ch: "耳", py: "ěr", en: "ear", audio: "audio/er3.mp3", strokes: 6, set: 4 },
  { ch: "手", py: "shǒu", en: "hand", audio: "audio/c_shou.mp3", strokes: 4, set: 4 },
  { ch: "足", py: "zú", en: "foot", audio: "audio/c_zu.mp3", strokes: 7, set: 4 },
  { ch: "头", py: "tóu", en: "head", audio: "audio/c_tou.mp3", strokes: 5, set: 4 },
  { ch: "门", py: "mén", en: "door", audio: "audio/c_men.mp3", strokes: 3, set: 4 },
  { ch: "天", py: "tiān", en: "sky, day", audio: "audio/c_tian.mp3", strokes: 4, set: 5 },
  { ch: "田", py: "tián", en: "field", audio: "audio/c_tian_field.mp3", strokes: 5, set: 5 },
  { ch: "王", py: "wáng", en: "king", audio: "audio/c_wang.mp3", strokes: 4, set: 5 },
  { ch: "云", py: "yún", en: "cloud", audio: "audio/c_yun.mp3", strokes: 4, set: 5 },
  { ch: "白", py: "bái", en: "white", audio: "audio/c_bai.mp3", strokes: 5, set: 5 },
  { ch: "不", py: "bù", en: "not, no", audio: "audio/c_bu.mp3", strokes: 4, set: 5 },
  { ch: "子", py: "zǐ", en: "child", audio: "audio/c_zi.mp3", strokes: 3, set: 6 },
  { ch: "女", py: "nǚ", en: "girl, woman", audio: "audio/c_nv.mp3", strokes: 3, set: 6 },
  { ch: "马", py: "mǎ", en: "horse", audio: "audio/c_ma.mp3", strokes: 3, set: 6 },
  { ch: "牛", py: "niú", en: "cow", audio: "audio/c_niu.mp3", strokes: 4, set: 6 },
  { ch: "羊", py: "yáng", en: "sheep", audio: "audio/c_yang.mp3", strokes: 6, set: 6 },
  { ch: "鸟", py: "niǎo", en: "bird", audio: "audio/c_niao.mp3", strokes: 5, set: 6 }
];
// a set opens once 3 characters of the set before it have been traced
const CHAR_SETS = [null, { zh: "第一组", en: "Set 1 · first strokes" }, { zh: "第二组", en: "Set 2 · up, down & more" }, { zh: "第三组", en: "Set 3 · nature" }, { zh: "第四组", en: "Set 4 · my body" }, { zh: "第五组", en: "Set 5 · sky & field" }, { zh: "第六组", en: "Set 6 · people & animals" }];


// badges: finish every lesson of a world, or trace every character of a set (+5⭐ each once; the graduate badge +20⭐)
const BADGES = [
  { id: "w_tones", icon: "🎵", zh: "声调小达人", en: "Tone Star", lessons: ["t1", "t2", "t3"] },
  { id: "w_finals", icon: "🅰️", zh: "单韵母", en: "Simple Finals", lessons: ["f1", "f2"] },
  { id: "w_bpmf", icon: "🫧", zh: "b p m f", en: "First Initials", lessons: ["s1", "s2"] },
  { id: "w_dtnl", icon: "🥁", zh: "d t n l g k h", en: "Drum Sounds", lessons: ["s3", "s4", "s5", "s6", "t4"] },
  { id: "w_zcs", icon: "🐝", zh: "j q x · zh ch sh r · z c s", en: "Buzzy Sounds", lessons: ["s7", "s8", "s9", "s10", "s11", "s12", "t5"] },
  { id: "w_whole", icon: "🌟", zh: "y w · 整体认读", en: "Whole Syllables", lessons: ["s13", "s14"] },
  { id: "w_glide", icon: "🍀", zh: "复韵母", en: "Gliding Finals", lessons: ["s15", "s16", "s17", "s18", "s19", "s20", "t6"] },
  ...[1, 2, 3, 4, 5, 6].map(n => ({ id: "set" + n, icon: "✍️", zh: "写字 第" + "一二三四五六"[n - 1] + "组", en: "Writing Set " + n, set: n })),
  { id: "grad", icon: "👑", zh: "拼音乐园毕业", en: "Pinyin Park Graduate", all: true, stars: 20 }
];

const PRAISE = [["真棒！", "Great job!"], ["太好了！", "Awesome!"], ["你真聪明！", "So clever!"], ["好极了！", "Excellent!"], ["对了！", "That’s right!"]];
const KIND = [["没关系！", "That’s okay!"], ["再听一次！", "Let’s listen again!"], ["加油！", "You can do it!"]];

const SKINS = [
  { id: "classic", zh: "竹子熊猫", en: "Bamboo Panda", img: "img/panda_classic.webp", cost: 0 },
  { id: "festive", zh: "新年熊猫", en: "New Year Panda", img: "img/panda_festive.webp", cost: 20 },
  { id: "space", zh: "太空熊猫", en: "Space Panda", img: "img/panda_space.webp", cost: 40 },
  { id: "brush", zh: "书法熊猫", en: "Brush Panda", img: "img/panda_brush.webp", cost: 80 },
  { id: "lion", zh: "舞狮熊猫", en: "Lion Dance Panda", img: "img/panda_lion.webp", cost: 120 }
];

window.PP = Object.assign(window.PP || {}, { MARKS, mark, audioOf, hasAudio, CHAR_SETS, BADGES, TONES, LESSONS, CHARS, PRAISE, KIND, SKINS });
})();
