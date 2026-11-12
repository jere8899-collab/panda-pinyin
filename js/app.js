(function () {
const PP = window.PP, S = PP.Store, $ = s => document.querySelector(s), t = PP.t;
const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const app = () => $("#app");

/* ---------------- audio: recorded files first, zh-CN speech only if a file can't play ---------------- */
let cur = null;
const Audio1 = PP.Audio = {
  failed: 0,
  play(src, fallbackText) {
    try { if (cur) { cur.pause(); cur.currentTime = 0; } } catch (e) {}
    const a = cur = new Audio(src);
    a.dataset && (a.dataset.src = src);
    const p = a.play();
    return (p && p.catch ? p : Promise.resolve()).catch(err => {
      if (err && err.name === "NotAllowedError") return;   // autoplay blocked: the child taps 🔊
      Audio1.failed++; Audio1.speak(fallbackText);
    });
  },
  speak(text) {
    if (!text || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text); u.lang = "zh-CN"; u.rate = 0.8;
    const v = speechSynthesis.getVoices().find(v => /zh[-_]CN/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
};
const sfx = ok => { try { const c = sfx.c || (sfx.c = new (window.AudioContext || window.webkitAudioContext)()); const o = c.createOscillator(), g = c.createGain();
  o.type = "sine"; const t = c.currentTime; (ok ? [660, 880] : [330, 262]).forEach((f, i) => o.frequency.setValueAtTime(f, t + i * 0.12));
  g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.32); } catch (e) {} };

/* ---------------- panda pet ---------------- */
const level = p => Math.min(10, 1 + Math.floor((p.xp || 0) / 30));
const lvlXp = p => (p.xp || 0) % 30;
const STAGE = ["", ["熊猫宝宝", "Baby"], ["熊猫宝宝", "Baby"], ["小可爱", "Cutie"], ["小可爱", "Cutie"], ["小学生", "Little Learner"], ["小学生", "Little Learner"], ["小老师", "Little Teacher"], ["小老师", "Little Teacher"], ["拼音大王", "Pinyin Champ"], ["拼音大王", "Pinyin Champ"]];
const stage = lv => STAGE[lv][0] + " " + t(STAGE[lv][1]);
const skinOf = p => PP.SKINS.find(s => s.id === p.skin) || PP.SKINS[0];
const sleepy = p => p.day !== S.today() && (p.xp || 0) > 0;     // hasn't played yet today: sleepy, wakes on the first play (never sad or punished)
const pandaImg = (p, cls = "") => `<img class="panda ${cls}" src="${sleepy(p) ? "img/panda_sleepy.webp" : skinOf(p).img}" alt="panda" style="--s:${(0.78 + level(p) * 0.03).toFixed(2)}">`;
const hearts = p => { const n = Math.round((p.happy || 0) / 20); return "❤️".repeat(n) + "🤍".repeat(5 - n); };
function reward(p, stars, xp, happy) {
  const before = level(p);
  p.stars = (p.stars || 0) + stars; p.xp = (p.xp || 0) + xp; p.happy = Math.min(100, (p.happy || 0) + (happy || 0)); p.day = S.today();
  S.touch(p); paintTop();
  return level(p) > before;
}

/* ---------------- badges ---------------- */
const badgeDone = (p, b) => b.all ? PP.LESSONS.every(l => (p.lessons[l.id] || {}).best)
  : b.lessons ? b.lessons.every(id => (p.lessons[id] || {}).best)
  : b.memory ? Object.values(p.chars).filter(c => c.mem).length >= b.memory
  : PP.CHARS.filter(c => c.set === b.set).every(c => p.chars[c.ch] && p.chars[c.ch].best);
// award any badge now earned (also gives older saves the badges they already deserve); returns the new ones
function checkBadges(p) {
  p.badges = p.badges || {};
  const fresh = PP.BADGES.filter(b => !p.badges[b.id] && badgeDone(p, b));
  if (!fresh.length) return [];
  fresh.forEach(b => { p.badges[b.id] = S.today(); p.stars = (p.stars || 0) + (b.stars || 5); });
  S.touch(p); paintTop();
  fresh.forEach((b, i) => setTimeout(() => toast(`${b.icon} ${t("New badge!")} 新徽章：${b.zh} +${b.stars || 5}⭐`, 2200), 600 + i * 2400));
  return fresh;
}
function badgeShelf() {
  const p = S.cur(); checkBadges(p);
  modal(`<h3>🏅 徽章 ${t("Badges")} <small class="muted">${Object.keys(p.badges).length}/${PP.BADGES.length}</small></h3>
    <div class="badges">${PP.BADGES.map(b => { const got = p.badges[b.id];
      const how = b.all ? t("Finish every Pinyin Park lesson") : b.lessons ? t("Finish:") + " " + b.lessons.map(id => PP.LESSONS.find(l => l.id === id).zh).join(" · ") : b.memory ? t("Write {n} characters with 🧠 默写", { n: b.memory }) : t("Trace all of {set}", { set: PP.CHAR_SETS[b.set].zh });
      return `<div class="badge ${got ? "got" : ""}"><span class="b-ic">${got ? b.icon : "🔒"}</span><b>${b.zh}</b><small>${badgeName(b)}</small><small class="how">${got ? "✓ " + got : how}</small></div>`; }).join("")}</div>
    <button class="btn ghost" data-x>${t("Close")}</button>`, (m, close) => { m.querySelector("[data-x]").onclick = close; });
}
const badgeName = b => b.set ? t("Writing Set {n}", { n: b.set }) : t(b.en);
PP.checkBadges = checkBadges;

/* ---------------- top bar ---------------- */
function topBar(back) {
  const p = S.cur();
  return `<header class="top">
    ${back ? `<button class="ic" id="back" aria-label="${t("Back")}">⬅️</button>` : `<button class="who" id="who" aria-label="${t("Switch player")}">👤 <b>${esc(p.name)}</b></button>`}
    <span class="star-pill" id="starPill">⭐ <b>${p.stars || 0}</b></span>
    ${back ? "" : `<button class="ic lang-btn" id="langBtn" aria-label="${t("Language")}">🌐</button>`}
    ${PP.Cloud ? PP.Cloud.chip() : ""}
  </header>`;
}
function paintTop() { const p = S.cur(), el = $("#starPill"); if (p && el) el.innerHTML = `⭐ <b>${p.stars || 0}</b>`; }
function bindTop(onBack) {
  $("#back") && ($("#back").onclick = onBack || home);
  $("#who") && ($("#who").onclick = profiles);
  $("#langBtn") && ($("#langBtn").onclick = () => langPicker(S.cur()));
  PP.Cloud && PP.Cloud.bindChip();
}

/* ---------------- toast / modal ---------------- */
function toast(html, ms = 1600) { const t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; document.body.appendChild(t); setTimeout(() => t.classList.add("out"), ms); setTimeout(() => t.remove(), ms + 400); }
function modal(html, bind) {
  const m = document.createElement("div"); m.className = "modal"; m.innerHTML = `<div class="sheet" role="dialog">${html}</div>`;
  document.body.appendChild(m);
  m.onclick = e => { if (e.target === m) close(); };
  const close = () => m.remove();
  bind && bind(m, close);
  return close;
}
PP.ui = { modal, toast, esc };

/* ---------------- 🌐 language picker (one child, or this device before a child is picked) ---------------- */
function langPicker(p, after) {
  const cur = p ? (p.lang && PP.LANGS[p.lang] ? p.lang : PP.deviceLang()) : PP.deviceLang();
  const langs = Object.values(PP.LANGS).sort((a, b) => (a.order ?? 9) - (b.order ?? 9) || a.name.localeCompare(b.name));
  modal(`<h3>🌐 ${t("Language")} <small class="muted">${t("for help text")}</small></h3>
    <p class="muted">${t("Chinese and pinyin stay the same. This changes the helper language.")}</p>
    <div class="langs">${langs.map(L => `<button class="lang ${L.code === cur ? "on" : ""}" data-l="${L.code}"><span>${L.flag}</span><b>${L.name}</b>${L.code === cur ? "<i>✓</i>" : ""}</button>`).join("")}</div>
    <button class="btn ghost" data-x>${t("Close")}</button>`, (m, close) => {
    m.querySelector("[data-x]").onclick = close;
    m.querySelectorAll(".lang").forEach(b => b.onclick = () => { PP.setLang(b.dataset.l, p); close(); after ? after() : (p ? home() : profiles()); });
  });
}
PP.langPicker = langPicker;

/* ---------------- 1. profile picker ---------------- */
function profiles() {
  const st = S.state; PP.langMode = "device";
  app().innerHTML = `<section class="screen pick">
    <div class="title"><img src="img/panda_classic.webp" alt="" class="logo"><h1>熊猫拼音<small>Panda Pinyin</small></h1></div>
    <h2>谁来玩？ ${t("Who’s playing?")}</h2>
    <div class="kids">
      ${st.profiles.map(p => `<button class="kid" data-id="${p.id}"><span class="kid-img">${pandaImg(p, "sm")}</span><b>${esc(p.name)}</b><span>⭐ ${p.stars || 0} · ${t("Lv")} ${level(p)}</span></button>`).join("")}
      <button class="kid add" id="addKid"><span class="plus">＋</span><b>${t("Add child")}</b><span>添加</span></button>
    </div>
    <button class="link" id="grown">👪 ${t("Grown-ups · family cloud save")}</button>
    <button class="btn ghost sm lang-pick" id="langPick">🌐 ${PP.LANGS[PP.lang()].flag} ${PP.LANGS[PP.lang()].name}</button>
  </section>`;
  app().querySelectorAll(".kid[data-id]").forEach(b => b.onclick = () => { st.current = b.dataset.id; S.save(); PP.langMode = "child"; home(); });
  $("#addKid").onclick = addKid;
  $("#grown").onclick = () => PP.Grown.open();
  $("#langPick").onclick = () => langPicker(null);
}
function addKid() {
  modal(`<h3>${t("New player")} 新朋友</h3>
    <p class="muted">${t("First name or a nickname only, please.")}</p>
    <input id="kidName" maxlength="12" placeholder="${t("e.g. Mei Mei")}" autocomplete="off" enterkeyhint="done">
    <p class="err" id="kidErr"></p>
    <div class="row"><button class="btn ghost" data-x>${t("Cancel")}</button><button class="btn" id="kidOk">${t("Let’s go!")} 出发</button></div>`, (m, close) => {
    const inp = m.querySelector("#kidName"); setTimeout(() => inp.focus(), 50);
    m.querySelector("[data-x]").onclick = close;
    const ok = () => {
      const n = inp.value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
      if (!n) { m.querySelector("#kidErr").textContent = t("Please type a name 😊"); return; }
      if (S.state.profiles.some(p => p.name.toLowerCase() === n.toLowerCase())) { m.querySelector("#kidErr").textContent = t("That name is already here. Try another!"); return; }
      const np = S.add(n); np.lang = PP.deviceLang(); PP.langMode = "child"; S.touch(np); close(); home(); toast(`🐼 你好，${esc(n)}！ ${t("Hello!")}`);
    };
    m.querySelector("#kidOk").onclick = ok; inp.onkeydown = e => e.key === "Enter" && ok();
  });
}

/* ---------------- 2. home: pet + worlds ---------------- */
const unlocked = (p, i) => i === 0 || !!(p.lessons[PP.LESSONS[i - 1].id] || {}).best;
const FEED = 2;
const crowns = n => "⭐".repeat(n) + "☆".repeat(3 - n);
function home() {
  const p = S.cur(); if (!p) return profiles();
  PP.langMode = "child"; checkBadges(p);
  const lv = level(p), nextIdx = PP.LESSONS.findIndex(l => !(p.lessons[l.id] || {}).best);
  app().innerHTML = `${topBar()}<section class="screen home">
    <div class="pet card">
      <button class="pet-tap" id="petTap" aria-label="${t("Cuddle the panda")}">${pandaImg(p)}</button>
      <div class="pet-info">
        <b>${t("Lv")} ${lv} · ${stage(lv)}</b>
        <div class="bar"><i style="width:${lv >= 10 ? 100 : Math.round(lvlXp(p) / 30 * 100)}%"></i></div>
        <div class="hearts" aria-label="${t("happiness")}">${hearts(p)}</div>
        <p class="say">${sleepy(p) ? "Zzz… 我想你了！ " + t("I missed you! Play to wake me up 💤") : (p.happy >= 80 ? "我好开心！ " + t("I’m so happy! 🎉") : "我们一起学拼音吧！ " + t("Let’s learn pinyin!"))}</p>
        <div class="row"><button class="btn sm" id="feed">🎋 ${t("Feed")} (${FEED}⭐)</button><button class="btn sm ghost" id="skins">👕 ${t("Skins")}</button></div>
      </div>
    </div>
    <button class="node shelf" id="shelf"><span class="n-ic">🏅</span><span class="n-tx"><b>徽章 ${t("Badges")}</b><small>${PP.BADGES.filter(b => p.badges[b.id]).map(b => b.icon).join(" ") || t("Finish a world to win your first badge!")}</small></span><span class="n-st">${Object.keys(p.badges).length}/${PP.BADGES.length}</span></button>
    <h2 class="world">🌈 拼音乐园 <small>${t("Pinyin Park")}</small></h2>
    <div class="path">
      ${PP.LESSONS.map((l, i) => { const r = p.lessons[l.id] || {}, open = unlocked(p, i);
        return `<button class="node ${open ? "" : "locked"} ${i === nextIdx ? "next" : ""}" data-i="${i}" ${open ? "" : "aria-disabled=true"}>
          <span class="n-ic">${open ? l.icon : "🔒"}</span><span class="n-tx"><b>${l.zh}</b><small>${t(l.en)}</small></span><span class="n-st">${r.best ? crowns(r.best) : (i === nextIdx ? "▶" : "")}</span></button>`; }).join("")}
    </div>
    <h2 class="world">🌸 写字花园 <small>${t("Writing Garden")}</small></h2>
    <button class="node garden" id="garden"><span class="n-ic">✍️</span><span class="n-tx"><b>笔顺 ${t("Stroke order")}</b><small>${t("Trace {n} characters and words with your finger:", { n: PP.CHARS.length })} 一 二 三 人 大 口 十 山 日 月…</small></span><span class="n-st">${Object.keys(p.chars).length}/${PP.CHARS.length}</span></button>
  </section>`;
  bindTop();
  app().querySelectorAll(".node[data-i]").forEach(b => b.onclick = () => { const i = +b.dataset.i; if (!unlocked(p, i)) return toast("🔒 " + t("Finish the lesson before this one first!")); lesson(PP.LESSONS[i]); });
  $("#garden").onclick = garden;
  $("#shelf").onclick = badgeShelf;
  $("#petTap").onclick = () => { const im = $("#petTap .panda"); im.classList.remove("hop"); void im.offsetWidth; im.classList.add("hop"); toast(pick(["🐼💕 嘻嘻！", "🐼 抱抱！ " + t("Hug!"), "🐼🎋 好好吃！"]), 900); };
  $("#feed").onclick = () => {
    if ((p.stars || 0) < FEED) return toast(t("Earn ⭐ in a lesson first!"));
    if (p.happy >= 100) return toast("🐼 我吃饱了！ " + t("I’m full!"));
    p.stars -= FEED; reward(p, 0, 1, 20); home(); toast("🎋 好好吃！ " + t("Yummy!"));
  };
  $("#skins").onclick = skins;
}
function skins() {
  const p = S.cur();
  modal(`<h3>👕 ${t("Panda skins")} 皮肤</h3><div class="skins">${PP.SKINS.map(s => { const own = p.owned.includes(s.id);
    return `<button class="skin ${p.skin === s.id ? "on" : ""}" data-s="${s.id}"><img src="${s.img}" alt=""><b>${s.zh}</b><small>${t(s.en)}</small><span>${p.skin === s.id ? "✓ " + t("Wearing") : own ? t("Wear") : "⭐ " + s.cost}</span></button>`; }).join("")}</div>
    <button class="btn ghost" data-x>${t("Close")}</button>`, (m, close) => {
    m.querySelector("[data-x]").onclick = close;
    m.querySelectorAll(".skin").forEach(b => b.onclick = () => {
      const s = PP.SKINS.find(x => x.id === b.dataset.s);
      if (!p.owned.includes(s.id)) { if ((p.stars || 0) < s.cost) return toast(t("Need ⭐ {n}. Keep learning!", { n: s.cost }) + " 加油！"); p.stars -= s.cost; p.owned.push(s.id); toast("🎉 " + t("New skin: {name}!", { name: t(s.en) })); }
      p.skin = s.id; S.touch(p); close(); home();
    });
  });
}

/* ---------------- 3. lesson: learn cards, then a quiz ---------------- */
function lesson(L) {
  if (!L.learn.length) return quiz(L);
  const p = S.cur();
  app().innerHTML = `${topBar(true)}<section class="screen learn">
    <h2>${L.icon} ${L.zh} <small>${t(L.en)}</small></h2>
    <p class="intro">${t(L.intro)}</p>
    <div class="cards">${L.learn.map((c, i) => `<button class="lcard" data-i="${i}">
      <span class="py">${PP.mark(c.base, c.tone)}</span>${c.hz ? `<span class="hz">${c.hz}</span>` : ""}<small>${t(c.tip)}</small><span class="spk">🔊</span></button>`).join("")}</div>
    ${L.id === "t1" ? `<div class="tones">${[1, 2, 3, 4].map(t => `<div><b>${PP.TONES[t].shape}</b><span>${PP.TONES[t].zh}</span><small>${PP.t(PP.TONES[t].hint)}</small></div>`).join("")}</div>` : ""}
    <button class="btn big" id="go">我准备好了！ ${t("I’m ready")} ▶</button>
  </section>`;
  bindTop();
  app().querySelectorAll(".lcard").forEach(b => b.onclick = () => { const c = L.learn[+b.dataset.i]; b.classList.add("heard"); Audio1.play(c.audio || PP.audioOf(c.base, c.tone), c.hz || PP.mark(c.base, c.tone)); });
  $("#go").onclick = () => quiz(L);
}

const INITIAL = /^(zh|ch|sh|[bpmfdtnlgkhjqxzcsryw])/;
const finalOf = b => b.replace(INITIAL, ""), initialOf = b => (b.match(INITIAL) || [""])[0];
function makeQs(L) {
  const q = L.quiz, qs = [];
  let last = "";
  for (let k = 0; k < q.n; k++) {
    let base, tone, key, tries = 0;
    do { base = pick(q.bases); tone = q.kind === "tone" ? q.tones[k % q.tones.length] : pick(q.tones); key = base + tone; }
    while ((key === last || !PP.hasAudio(base, tone)) && ++tries < 30);
    last = key;
    if (q.kind === "tone") {
      const tones = base === "ma" && q.tones.includes(5) ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
      qs.push({ kind: "tone", base, tone, opts: tones.map(t => ({ t, label: PP.mark(base, t), sub: PP.TONES[t].shape + " " + PP.TONES[t].zh })), ans: tone });
    } else {
      // options: the answer + 2 other syllables. sameFinal: only the initial differs (dā / tā / nā);
      // twin: sometimes the same sound with another tone, so the tone matters too
      let pool = q.bases.filter(b => b !== base);
      if (q.sameFinal) pool = pool.filter(b => finalOf(b) === finalOf(base));
      if (q.sameInitial) pool = pool.filter(b => initialOf(b) === initialOf(base));
      if (q.confuse && q.confuse[base]) pool = q.confuse[base].slice();   // look-alike sounds (z / zh / j)
      const others = shuffle(pool).slice(0, 2).map(b => [b, q.sameTone ? tone : pick(q.tones)]);
      if (q.twin && Math.random() < 0.5) others[1] = [base, pick(q.tones.filter(t => t !== tone))];
      const seen = new Set([PP.mark(base, tone)]);
      others.forEach(o => { while (seen.has(PP.mark(o[0], o[1]))) o[1] = o[1] % 4 + 1; seen.add(PP.mark(o[0], o[1])); });
      const opts = shuffle([[base, tone], ...others]).map(([b, t]) => ({ b, t, label: PP.mark(b, t) }));
      qs.push({ kind: "syl", base, tone, opts, ans: PP.mark(base, tone) });
    }
  }
  qs.forEach((x, i) => { x.src = PP.audioOf(x.base, x.tone); x.n = i; });
  return shuffle(qs);
}

function quiz(L) {
  const p = S.cur(), qs = makeQs(L), firstRun = !(p.lessons[L.id] || {}).best;
  let i = 0, right = 0, firstTry = true, starsGot = 0;
  const show = () => {
    const q = PP._q = qs[i];   // PP._q: read by the automated test
    firstTry = true;
    app().innerHTML = `${topBar(true)}<section class="screen quiz">
      <div class="prog"><i style="width:${Math.round(i / qs.length * 100)}%"></i></div>
      <p class="ask">${q.kind === "tone" ? `听一听，是第几声？<small>${t("Listen: which tone?")}</small>` : `听一听，选拼音<small>${t("Listen: pick the sound")}</small>`}</p>
      <div class="listen"><button class="play" id="play" aria-label="${t("Play sound")}">🔊</button><button class="slow" id="again">再听 ${t("Again")}</button></div>
      <div class="opts n${q.opts.length}">${q.opts.map((o, k) => `<button class="opt" data-k="${k}"><b${o.label.length > 4 ? ' class="long"' : ""}>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ""}</button>`).join("")}</div>
      <div class="buddy">${pandaImg(p, "xs")}<p id="fb">${i === 0 ? t("Tap 🔊 to listen!") : "&nbsp;"}</p></div>
    </section>`;
    bindTop(home);
    const say = () => { const b = $("#play"); b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); Audio1.play(q.src, PP.mark(q.base, q.tone)); };
    $("#play").onclick = say; $("#again").onclick = say;
    setTimeout(say, 350);
    app().querySelectorAll(".opt").forEach(b => b.onclick = () => {
      const o = q.opts[+b.dataset.k], ok = q.kind === "tone" ? o.t === q.ans : o.label === q.ans;
      if (b.disabled) return;
      if (ok) {
        sfx(true); b.classList.add("good"); app().querySelectorAll(".opt").forEach(x => x.disabled = true);
        if (firstTry) { right++; starsGot++; }
        const [zh, en] = pick(PP.PRAISE);
        $("#fb").innerHTML = `<b>${zh}</b> ${t(en)} ${firstTry && firstRun ? "+1⭐" : ""}`; $(".buddy .panda").classList.add("hop");
        setTimeout(() => { i++; i < qs.length ? show() : done(); }, 1300);
      } else {
        sfx(false); b.classList.add("bad"); b.disabled = true; firstTry = false;
        const [zh, en] = pick(PP.KIND);
        $("#fb").innerHTML = `<b>${zh}</b> ${t(en)}`;
        setTimeout(say, 700);
      }
    });
  };
  const done = () => {
    const n = qs.length, pct = right / n, c = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    const r = p.lessons[L.id] || (p.lessons[L.id] = { best: 0, plays: 0 });
    const firstTime = !r.best, bonus = firstTime ? 5 : (c > r.best ? 2 : 0);
    if (!firstTime) starsGot = Math.ceil(starsGot / 2);     // replays pay half (v8: stars came too easily)
    r.plays++; r.best = Math.max(r.best, c);
    const up = reward(p, starsGot + bonus, right * 2 + 4, 15);
    checkBadges(p);
    const nx = PP.LESSONS[PP.LESSONS.indexOf(L) + 1];
    app().innerHTML = `${topBar(true)}<section class="screen done">
      <div class="confetti">🎉✨⭐✨🎉</div>
      ${pandaImg(p, "hop big")}
      <h2>${c === 3 ? "太棒了！ " + t("Amazing!") : c === 2 ? "真不错！ " + t("Well done!") : "你很努力！ " + t("Great effort!")}</h2>
      <p class="crowns">${crowns(c)}</p>
      <p>${t("{a} / {b} right first time", { a: right, b: n })} · +${starsGot + bonus}⭐ ${bonus ? `<small>(${firstTime ? t("first finish bonus") : t("new best")} +${bonus})</small>` : ""}</p>
      ${up ? `<p class="lvup">🎊 ${t("Your panda grew to Lv {n}!", { n: level(p) })}</p>` : ""}
      <div class="col">
        ${nx ? `<button class="btn big" id="next">下一课 ${t("Next:")} ${nx.zh} ▶</button>` : `<button class="btn big" id="gardenGo">✍️ ${t("Try the Writing Garden")}</button>`}
        <button class="btn ghost" id="again2">🔁 ${t("Play again")}</button>
        <button class="btn ghost" id="homeGo">🏠 ${t("Home")}</button>
      </div></section>`;
    bindTop(home);
    $("#next") && ($("#next").onclick = () => lesson(nx));
    $("#gardenGo") && ($("#gardenGo").onclick = garden);
    $("#again2").onclick = () => quiz(L); $("#homeGo").onclick = home;
  };
  show();
}

/* ---------------- 4. Writing Garden: stroke-order tracing (Hanzi Writer) ---------------- */
const setOpen = (p, n) => n <= 1 || PP.CHARS.filter(c => c.set === n - 1 && p.chars[c.ch]).length >= 3;
function garden() {
  const p = S.cur();
  app().innerHTML = `${topBar(true)}<section class="screen garden-s">
    <h2>🌸 写字花园 <small>${t("Writing Garden")}</small></h2>
    <p class="intro">${t("Watch the strokes, then trace them with your finger.")} 先看，再写！</p>
    ${PP.CHAR_SETS.slice(1).map((st, k) => { const n = k + 1, open = setOpen(p, n);
      if (!open && n > 1 && !setOpen(p, n - 1)) return setOpen(p, n - 2) ? `<p class="muted set-more">🔒 ${PP.CHAR_SETS.length - n > 1 ? t("{n} more sets to discover", { n: PP.CHAR_SETS.length - n }) : t("1 more set to discover")} · 还有${PP.CHAR_SETS.length - n}组</p>` : "";
      const list = PP.CHARS.map((c, i) => [c, i]).filter(([c]) => c.set === n);
      return `<h3 class="set-h">${open ? "" : "🔒 "}${st.zh} <small>${setName(n)}</small></h3>
      ${open ? "" : `<p class="muted set-lock">${t("Trace 3 characters in {set} to open these!", { set: t("Set {n}", { n: n - 1 }) })}</p>`}
      <div class="chars ${open ? "" : "locked"}">${list.map(([c, i]) => { const r = p.chars[c.ch]; return `<button class="ch" data-i="${i}" ${open ? "" : "aria-disabled=true"}><span class="hz ${c.ch.length > 1 ? "word" : ""}">${c.ch}</span><small>${pyShow(c)} · ${t(c.en)}</small><span class="st">${r ? crowns(r.best || 0) : "☆☆☆"}${r && r.mem ? " 🧠" : ""}</span></button>`; }).join("")}</div>`; }).join("")}
  </section>`;
  bindTop();
  app().querySelectorAll(".ch").forEach(b => b.onclick = () => { const c = PP.CHARS[+b.dataset.i]; if (!setOpen(p, c.set)) return toast("🔒 " + t("Trace 3 characters in the set above first!")); trace(+b.dataset.i); });
}
const setName = n => { const th = (PP.CHAR_SETS[n].en.split(" · ")[1] || ""); return t("Set {n}", { n }) + (th ? " · " + t(th) : ""); };
const pyShow = C => C.ch.length > 1 ? C.py.replace(/ /g, "") : C.py;
function trace(idx, memory) {
  const p = S.cur(), C = PP.CHARS[idx], parts = [...C.ch], word = parts.length > 1;
  const r0 = p.chars[C.ch];
  app().innerHTML = `${topBar(true)}<section class="screen trace">
    <div class="ch-head"><span class="hz ${word ? "word" : ""}" id="hzHead">${parts.map((c, k) => `<i data-k="${k}">${c}</i>`).join("")}</span><div><b>${pyShow(C)}</b> <span>${t(C.en)}</span><small>${C.strokes > 1 ? t("{n} strokes", { n: C.strokes }) : t("1 stroke")} · ${C.strokes}画${word ? " · " + t("2 characters") : ""}</small></div><button class="ic" id="say" aria-label="${t("Hear it")}">🔊</button></div>
    <div class="pad-wrap"><svg class="grid" viewBox="0 0 100 100" aria-hidden="true"><rect x="1" y="1" width="98" height="98" rx="4"/><line x1="50" y1="1" x2="50" y2="99"/><line x1="1" y1="50" x2="99" y2="50"/><line x1="1" y1="1" x2="99" y2="99"/><line x1="99" y1="1" x2="1" y2="99"/></svg><div id="pad"></div></div>
    <p class="fb" id="tfb">${memory ? "🧠 默写 " + t("From memory: no outline this time!") : "👀 " + t("Watch first, then trace!")}</p>
    <div class="row"><button class="btn ghost" id="watch">👀 ${t("Watch")} 看</button><button class="btn ${memory ? "ghost" : ""}" id="write">✍️ ${t("Trace")} 写</button><button class="btn ${memory ? "" : "ghost"}" id="mem" ${r0 ? "" : "disabled"} title="${r0 ? "" : t("Trace it once first")}">🧠 默写</button></div>
    <div class="row"><button class="btn ghost sm" id="prev" ${idx ? "" : "disabled"}>⬅ ${idx ? PP.CHARS[idx - 1].ch : ""}</button><button class="btn ghost sm" id="nextc" ${idx < PP.CHARS.length - 1 && setOpen(p, PP.CHARS[idx + 1].set) ? "" : "disabled"}>${idx < PP.CHARS.length - 1 ? PP.CHARS[idx + 1].ch : ""} ➡</button></div>
  </section>`;
  bindTop(garden);
  const size = Math.min(300, window.innerWidth - 64);
  const pad = $("#pad"); pad.parentElement.style.width = pad.parentElement.style.height = size + "px";
  const fb = t => $("#tfb").innerHTML = t;
  let k = 0, w = null, total = 0, run = 0;
  const mark = () => document.querySelectorAll("#hzHead i").forEach(e => e.classList.toggle("now", word && +e.dataset.k === k));
  const make = () => {
    pad.innerHTML = ""; mark();
    w = PP._writer = HanziWriter.create(pad, parts[k], {
      width: size, height: size, padding: 12, showOutline: !memory, showCharacter: false,
      strokeColor: "#3b3b58", outlineColor: "#e6dff0", drawingColor: "#ff6f91", drawingWidth: 26, highlightColor: "#7fd1ae",
      strokeAnimationSpeed: 1, delayBetweenStrokes: 350, showHintAfterMisses: memory ? 3 : 2, highlightOnComplete: true,
      charDataLoader: (ch, onLoad, onErr) => fetch("vendor/hanzi-data/" + ch + ".json").then(r => r.json()).then(onLoad).catch(onErr),
      onLoadCharDataError: () => fb(t("Couldn't load this character. Check the internet and try again."))
    });
  };
  const n = () => PP._strokes = (w && w._character && w._character.strokes.length) || "";
  const finish = () => {
    const c = total <= 1 ? 3 : total <= 3 ? 2 : 1, r = p.chars[C.ch];
    const first = !r, better = r && c > r.best;
    if (memory) {
      const firstMem = !(r && r.mem); p.chars[C.ch] = Object.assign({}, r, { mem: true, plays: (r ? r.plays : 0) + 1 });
      const st = firstMem ? 3 : 0; reward(p, st, 5, 10); checkBadges(p);
      Audio1.play(C.audio, C.ch);
      return fb(`🧠🎉 <b>${pick(PP.PRAISE)[0]}</b> ${t("You wrote {ch} from memory!", { ch: C.ch })}${st ? ` +${st}⭐` : ""}`);
    }
    // stars (v8): first time 5⭐, a new best +2⭐, otherwise one replay a day pays 1⭐ per character (no endless farming)
    const today = S.today(), daily = !first && !better && r.payDay !== today;
    p.chars[C.ch] = Object.assign({}, r, { best: Math.max(c, r ? r.best : 0), plays: (r ? r.plays : 0) + 1, payDay: daily ? today : (r && r.payDay) || null });
    const st = first ? 5 : better ? 2 : daily ? 1 : 0; reward(p, st, 5, 15); checkBadges(p);
    Audio1.play(C.audio, C.ch);
    fb(`🎉 <b>${pick(PP.PRAISE)[0]}</b> ${t("You wrote {ch}!", { ch: C.ch })} ${crowns(c)} ${st ? `+${st}⭐` : `<small>${t("More ⭐ for this one tomorrow")}</small>`}`);
    const m = $("#mem"); if (m) m.disabled = false;
  };
  const startQuiz = () => {
    const my = ++run;
    setTimeout(() => {
      if (my !== run) return;
      fb(`${memory ? "🧠" : "✍️"} ${word ? `${parts[k]} (${k + 1}/2): ` : "该你了！ "}${t("Your turn: stroke 1 of {n}", { n: w._character ? w._character.strokes.length : "…" })}`);
      w.quiz({
        onMistake: s => { total++; sfx(false); fb(s.mistakesOnStroke >= (memory ? 3 : 2) ? "💡 跟着绿色的笔画写 · " + t("Follow the green stroke") : memory ? "🌱 再想想！ " + t("Think of the stroke order and try again") : "🌱 再试试！ " + t("Almost! Try that stroke again")); },
        onCorrectStroke: s => { sfx(true); if (s.strokesRemaining) fb(`👍 好！ ${t("Stroke {a} of {b}", { a: s.strokeNum + 2, b: s.strokeNum + 1 + s.strokesRemaining })}`); },
        onComplete: () => {
          if (k < parts.length - 1) { k++; fb(`👍 ${t("{a} done! Now {b}", { a: parts[k - 1], b: parts[k] })} ➡`); setTimeout(() => { make(); memory ? startQuiz() : w.animateCharacter({ onComplete: () => { w.hideCharacter(); startQuiz(); } }); }, 900); }
          else finish();
        }
      });
    }, 60);
  };
  const restart = () => { run++; k = 0; total = 0; make(); };
  make();
  $("#watch").onclick = () => { fb("👀 看笔顺 · " + t("Watch the order")); restart(); const go = () => w.animateCharacter({ onComplete: () => { if (k < parts.length - 1) { k++; make(); go(); } else { k = 0; make(); fb(t("Now you try! ✍️ Tap Trace")); } } }); go(); };
  $("#write").onclick = () => memory ? trace(idx, false) : (restart(), startQuiz());
  $("#mem").onclick = () => memory ? (restart(), startQuiz()) : trace(idx, true);
  $("#say").onclick = () => Audio1.play(C.audio, C.ch);
  $("#prev").onclick = () => idx && trace(idx - 1);
  $("#nextc").onclick = () => idx < PP.CHARS.length - 1 && setOpen(p, PP.CHARS[idx + 1].set) && trace(idx + 1);
  if (memory) startQuiz();
  else setTimeout(() => { w.animateCharacter({ onComplete: () => { w.hideCharacter(); startQuiz(); } }); }, 400);
}

PP.App = { langPicker, profiles, home, garden, trace, lesson, quiz, level, rerender: () => (S.cur() ? home() : profiles()) };
document.addEventListener("DOMContentLoaded", () => { S.cur() ? home() : profiles(); PP.Cloud && PP.Cloud.boot(); });
})();
