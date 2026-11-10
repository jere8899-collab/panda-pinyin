(function () {
const PP = window.PP, S = PP.Store, $ = s => document.querySelector(s);
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
const STAGE = ["", "熊猫宝宝 Baby", "熊猫宝宝 Baby", "小可爱 Cutie", "小可爱 Cutie", "小学生 Little Learner", "小学生 Little Learner", "小老师 Little Teacher", "小老师 Little Teacher", "拼音大王 Pinyin Champ", "拼音大王 Pinyin Champ"];
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

/* ---------------- top bar ---------------- */
function topBar(back) {
  const p = S.cur();
  return `<header class="top">
    ${back ? `<button class="ic" id="back" aria-label="Back">⬅️</button>` : `<button class="who" id="who" aria-label="Switch player">👤 <b>${esc(p.name)}</b></button>`}
    <span class="star-pill" id="starPill">⭐ <b>${p.stars || 0}</b></span>
    ${PP.Cloud ? PP.Cloud.chip() : ""}
  </header>`;
}
function paintTop() { const p = S.cur(), el = $("#starPill"); if (p && el) el.innerHTML = `⭐ <b>${p.stars || 0}</b>`; }
function bindTop(onBack) {
  $("#back") && ($("#back").onclick = onBack || home);
  $("#who") && ($("#who").onclick = profiles);
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

/* ---------------- 1. profile picker ---------------- */
function profiles() {
  const st = S.state;
  app().innerHTML = `<section class="screen pick">
    <div class="title"><img src="img/panda_classic.webp" alt="" class="logo"><h1>熊猫拼音<small>Panda Pinyin</small></h1></div>
    <h2>谁来玩？ Who’s playing?</h2>
    <div class="kids">
      ${st.profiles.map(p => `<button class="kid" data-id="${p.id}"><span class="kid-img">${pandaImg(p, "sm")}</span><b>${esc(p.name)}</b><span>⭐ ${p.stars || 0} · Lv ${level(p)}</span></button>`).join("")}
      <button class="kid add" id="addKid"><span class="plus">＋</span><b>Add child</b><span>添加</span></button>
    </div>
    <button class="link" id="grown">👪 Grown-ups · family cloud save</button>
  </section>`;
  app().querySelectorAll(".kid[data-id]").forEach(b => b.onclick = () => { st.current = b.dataset.id; S.save(); home(); });
  $("#addKid").onclick = addKid;
  $("#grown").onclick = () => PP.Grown.open();
}
function addKid() {
  modal(`<h3>New player 新朋友</h3>
    <p class="muted">First name or a nickname only, please.</p>
    <input id="kidName" maxlength="12" placeholder="e.g. Mei Mei" autocomplete="off" enterkeyhint="done">
    <p class="err" id="kidErr"></p>
    <div class="row"><button class="btn ghost" data-x>Cancel</button><button class="btn" id="kidOk">Let’s go! 出发</button></div>`, (m, close) => {
    const inp = m.querySelector("#kidName"); setTimeout(() => inp.focus(), 50);
    m.querySelector("[data-x]").onclick = close;
    const ok = () => {
      const n = inp.value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
      if (!n) { m.querySelector("#kidErr").textContent = "Please type a name 😊"; return; }
      if (S.state.profiles.some(p => p.name.toLowerCase() === n.toLowerCase())) { m.querySelector("#kidErr").textContent = "That name is already here. Try another!"; return; }
      S.add(n); close(); home(); toast(`🐼 你好，${esc(n)}！ Hello!`);
    };
    m.querySelector("#kidOk").onclick = ok; inp.onkeydown = e => e.key === "Enter" && ok();
  });
}

/* ---------------- 2. home: pet + worlds ---------------- */
const unlocked = (p, i) => i === 0 || !!(p.lessons[PP.LESSONS[i - 1].id] || {}).best;
const crowns = n => "⭐".repeat(n) + "☆".repeat(3 - n);
function home() {
  const p = S.cur(); if (!p) return profiles();
  const lv = level(p), nextIdx = PP.LESSONS.findIndex(l => !(p.lessons[l.id] || {}).best);
  app().innerHTML = `${topBar()}<section class="screen home">
    <div class="pet card">
      <button class="pet-tap" id="petTap" aria-label="Cuddle the panda">${pandaImg(p)}</button>
      <div class="pet-info">
        <b>Lv ${lv} · ${STAGE[lv]}</b>
        <div class="bar"><i style="width:${lv >= 10 ? 100 : Math.round(lvlXp(p) / 30 * 100)}%"></i></div>
        <div class="hearts" aria-label="happiness">${hearts(p)}</div>
        <p class="say">${sleepy(p) ? "Zzz… 我想你了！ I missed you! Play to wake me up 💤" : (p.happy >= 80 ? "我好开心！ I’m so happy! 🎉" : "我们一起学拼音吧！ Let’s learn pinyin!")}</p>
        <div class="row"><button class="btn sm" id="feed">🎋 Feed (2⭐)</button><button class="btn sm ghost" id="skins">👕 Skins</button></div>
      </div>
    </div>
    <h2 class="world">🌈 拼音乐园 <small>Pinyin Park</small></h2>
    <div class="path">
      ${PP.LESSONS.map((l, i) => { const r = p.lessons[l.id] || {}, open = unlocked(p, i);
        return `<button class="node ${open ? "" : "locked"} ${i === nextIdx ? "next" : ""}" data-i="${i}" ${open ? "" : "aria-disabled=true"}>
          <span class="n-ic">${open ? l.icon : "🔒"}</span><span class="n-tx"><b>${l.zh}</b><small>${l.en}</small></span><span class="n-st">${r.best ? crowns(r.best) : (i === nextIdx ? "▶" : "")}</span></button>`; }).join("")}
    </div>
    <h2 class="world">🌸 写字花园 <small>Writing Garden</small></h2>
    <button class="node garden" id="garden"><span class="n-ic">✍️</span><span class="n-tx"><b>笔顺 Stroke order</b><small>Trace 一 二 三 人 大 口 with your finger</small></span><span class="n-st">${Object.keys(p.chars).length}/${PP.CHARS.length}</span></button>
  </section>`;
  bindTop();
  app().querySelectorAll(".node[data-i]").forEach(b => b.onclick = () => { const i = +b.dataset.i; if (!unlocked(p, i)) return toast("🔒 Finish the lesson before this one first!"); lesson(PP.LESSONS[i]); });
  $("#garden").onclick = garden;
  $("#petTap").onclick = () => { const im = $("#petTap .panda"); im.classList.remove("hop"); void im.offsetWidth; im.classList.add("hop"); toast(pick(["🐼💕 嘻嘻！", "🐼 抱抱！ Hug!", "🐼🎋 好好吃！"]), 900); };
  $("#feed").onclick = () => {
    if ((p.stars || 0) < 2) return toast("Earn ⭐ in a lesson first!");
    if (p.happy >= 100) return toast("🐼 我吃饱了！ I’m full!");
    p.stars -= 2; reward(p, 0, 1, 20); home(); toast("🎋 好好吃！ Yummy!");
  };
  $("#skins").onclick = skins;
}
function skins() {
  const p = S.cur();
  modal(`<h3>👕 Panda skins 皮肤</h3><div class="skins">${PP.SKINS.map(s => { const own = p.owned.includes(s.id);
    return `<button class="skin ${p.skin === s.id ? "on" : ""}" data-s="${s.id}"><img src="${s.img}" alt=""><b>${s.zh}</b><small>${s.en}</small><span>${p.skin === s.id ? "✓ Wearing" : own ? "Wear" : "⭐ " + s.cost}</span></button>`; }).join("")}</div>
    <button class="btn ghost" data-x>Close</button>`, (m, close) => {
    m.querySelector("[data-x]").onclick = close;
    m.querySelectorAll(".skin").forEach(b => b.onclick = () => {
      const s = PP.SKINS.find(x => x.id === b.dataset.s);
      if (!p.owned.includes(s.id)) { if ((p.stars || 0) < s.cost) return toast(`Need ⭐ ${s.cost}. Keep learning! 加油！`); p.stars -= s.cost; p.owned.push(s.id); toast(`🎉 New skin: ${s.en}!`); }
      p.skin = s.id; S.touch(p); close(); home();
    });
  });
}

/* ---------------- 3. lesson: learn cards, then a quiz ---------------- */
function lesson(L) {
  if (!L.learn.length) return quiz(L);
  const p = S.cur();
  app().innerHTML = `${topBar(true)}<section class="screen learn">
    <h2>${L.icon} ${L.zh} <small>${L.en}</small></h2>
    <p class="intro">${L.intro}</p>
    <div class="cards">${L.learn.map((c, i) => `<button class="lcard" data-i="${i}">
      <span class="py">${PP.mark(c.base, c.tone)}</span>${c.hz ? `<span class="hz">${c.hz}</span>` : ""}<small>${c.tip}</small><span class="spk">🔊</span></button>`).join("")}</div>
    ${L.id === "t1" ? `<div class="tones">${[1, 2, 3, 4].map(t => `<div><b>${PP.TONES[t].shape}</b><span>${PP.TONES[t].zh}</span><small>${PP.TONES[t].hint}</small></div>`).join("")}</div>` : ""}
    <button class="btn big" id="go">我准备好了！ I’m ready ▶</button>
  </section>`;
  bindTop();
  app().querySelectorAll(".lcard").forEach(b => b.onclick = () => { const c = L.learn[+b.dataset.i]; b.classList.add("heard"); Audio1.play(PP.audioOf(c.base, c.tone), c.hz || PP.mark(c.base, c.tone)); });
  $("#go").onclick = () => quiz(L);
}

function makeQs(L) {
  const q = L.quiz, qs = [];
  let last = "";
  for (let k = 0; k < q.n; k++) {
    let base, tone, key, tries = 0;
    do { base = pick(q.bases); tone = q.kind === "tone" ? q.tones[k % q.tones.length] : pick(q.tones); key = base + tone; } while (key === last && ++tries < 10);
    last = key;
    if (q.kind === "tone") {
      const tones = base === "ma" && q.tones.includes(5) ? [1, 2, 3, 4, 5] : [1, 2, 3, 4];
      qs.push({ kind: "tone", base, tone, opts: tones.map(t => ({ t, label: PP.mark(base, t), sub: PP.TONES[t].shape + " " + PP.TONES[t].zh })), ans: tone });
    } else {
      // options: the answer + 2 other syllables (different sound; in the blend lesson sometimes the same sound with another tone)
      const others = shuffle(q.bases.filter(b => b !== base)).slice(0, 2).map(b => [b, q.sameTone ? tone : pick(q.tones)]);
      if (L.id === "s2" && Math.random() < 0.5) others[1] = [base, pick(q.tones.filter(t => t !== tone))];
      const opts = shuffle([[base, tone], ...others]).map(([b, t]) => ({ b, t, label: PP.mark(b, t) }));
      qs.push({ kind: "syl", base, tone, opts, ans: PP.mark(base, tone) });
    }
  }
  qs.forEach((x, i) => { x.src = PP.audioOf(x.base, x.tone); x.n = i; });
  return shuffle(qs);
}

function quiz(L) {
  const p = S.cur(), qs = makeQs(L);
  let i = 0, right = 0, firstTry = true, starsGot = 0;
  const show = () => {
    const q = qs[i];
    firstTry = true;
    app().innerHTML = `${topBar(true)}<section class="screen quiz">
      <div class="prog"><i style="width:${Math.round(i / qs.length * 100)}%"></i></div>
      <p class="ask">${q.kind === "tone" ? "听一听，是第几声？<small>Listen: which tone?</small>" : "听一听，选拼音<small>Listen: pick the sound</small>"}</p>
      <div class="listen"><button class="play" id="play" aria-label="Play sound">🔊</button><button class="slow" id="again">再听 Again</button></div>
      <div class="opts n${q.opts.length}">${q.opts.map((o, k) => `<button class="opt" data-k="${k}"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ""}</button>`).join("")}</div>
      <div class="buddy">${pandaImg(p, "xs")}<p id="fb">${i === 0 ? "Tap 🔊 to listen!" : "&nbsp;"}</p></div>
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
        $("#fb").innerHTML = `<b>${zh}</b> ${en} ${firstTry ? "+1⭐" : ""}`; $(".buddy .panda").classList.add("hop");
        setTimeout(() => { i++; i < qs.length ? show() : done(); }, 1300);
      } else {
        sfx(false); b.classList.add("bad"); b.disabled = true; firstTry = false;
        const [zh, en] = pick(PP.KIND);
        $("#fb").innerHTML = `<b>${zh}</b> ${en}`;
        setTimeout(say, 700);
      }
    });
  };
  const done = () => {
    const n = qs.length, pct = right / n, c = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    const r = p.lessons[L.id] || (p.lessons[L.id] = { best: 0, plays: 0 });
    const firstTime = !r.best, bonus = firstTime ? 5 : (c > r.best ? 2 : 0);
    r.plays++; r.best = Math.max(r.best, c);
    const up = reward(p, starsGot + bonus, right * 2 + 4, 15);
    const nx = PP.LESSONS[PP.LESSONS.indexOf(L) + 1];
    app().innerHTML = `${topBar(true)}<section class="screen done">
      <div class="confetti">🎉✨⭐✨🎉</div>
      ${pandaImg(p, "hop big")}
      <h2>${c === 3 ? "太棒了！ Amazing!" : c === 2 ? "真不错！ Well done!" : "你很努力！ Great effort!"}</h2>
      <p class="crowns">${crowns(c)}</p>
      <p>${right} / ${n} right first time · +${starsGot + bonus}⭐ ${bonus ? `<small>(${firstTime ? "first finish bonus" : "new best"} +${bonus})</small>` : ""}</p>
      ${up ? `<p class="lvup">🎊 Your panda grew to Lv ${level(p)}!</p>` : ""}
      <div class="col">
        ${nx ? `<button class="btn big" id="next">下一课 Next: ${nx.zh} ▶</button>` : `<button class="btn big" id="gardenGo">✍️ Try the Writing Garden</button>`}
        <button class="btn ghost" id="again2">🔁 Play again</button>
        <button class="btn ghost" id="homeGo">🏠 Home</button>
      </div></section>`;
    bindTop(home);
    $("#next") && ($("#next").onclick = () => lesson(nx));
    $("#gardenGo") && ($("#gardenGo").onclick = garden);
    $("#again2").onclick = () => quiz(L); $("#homeGo").onclick = home;
  };
  show();
}

/* ---------------- 4. Writing Garden: stroke-order tracing (Hanzi Writer) ---------------- */
function garden() {
  const p = S.cur();
  app().innerHTML = `${topBar(true)}<section class="screen garden-s">
    <h2>🌸 写字花园 <small>Writing Garden</small></h2>
    <p class="intro">Watch the strokes, then trace them with your finger. 先看，再写！</p>
    <div class="chars">${PP.CHARS.map((c, i) => { const r = p.chars[c.ch]; return `<button class="ch" data-i="${i}"><span class="hz">${c.ch}</span><small>${c.py} · ${c.en}</small><span class="st">${r ? crowns(r.best) : "☆☆☆"}</span></button>`; }).join("")}</div>
  </section>`;
  bindTop();
  app().querySelectorAll(".ch").forEach(b => b.onclick = () => trace(+b.dataset.i));
}
function trace(idx) {
  const p = S.cur(), C = PP.CHARS[idx];
  app().innerHTML = `${topBar(true)}<section class="screen trace">
    <div class="ch-head"><span class="hz">${C.ch}</span><div><b>${C.py}</b> <span>${C.en}</span><small>${C.strokes} stroke${C.strokes > 1 ? "s" : ""} · ${C.strokes}画</small></div><button class="ic" id="say" aria-label="Hear it">🔊</button></div>
    <div class="pad-wrap"><svg class="grid" viewBox="0 0 100 100" aria-hidden="true"><rect x="1" y="1" width="98" height="98" rx="4"/><line x1="50" y1="1" x2="50" y2="99"/><line x1="1" y1="50" x2="99" y2="50"/><line x1="1" y1="1" x2="99" y2="99"/><line x1="99" y1="1" x2="1" y2="99"/></svg><div id="pad"></div></div>
    <p class="fb" id="tfb">👀 Watch first, then trace!</p>
    <div class="row"><button class="btn ghost" id="watch">👀 Watch 看</button><button class="btn" id="write">✍️ Trace 写</button></div>
    <div class="row"><button class="btn ghost sm" id="prev" ${idx ? "" : "disabled"}>⬅ ${idx ? PP.CHARS[idx - 1].ch : ""}</button><button class="btn ghost sm" id="nextc" ${idx < PP.CHARS.length - 1 ? "" : "disabled"}>${idx < PP.CHARS.length - 1 ? PP.CHARS[idx + 1].ch : ""} ➡</button></div>
  </section>`;
  bindTop(garden);
  const size = Math.min(300, window.innerWidth - 64);
  const pad = $("#pad"); pad.parentElement.style.width = pad.parentElement.style.height = size + "px";
  const w = HanziWriter.create(pad, C.ch, {
    width: size, height: size, padding: 12, showOutline: true, showCharacter: false,
    strokeColor: "#3b3b58", outlineColor: "#e6dff0", drawingColor: "#ff6f91", drawingWidth: 26, highlightColor: "#7fd1ae",
    strokeAnimationSpeed: 1, delayBetweenStrokes: 350, showHintAfterMisses: 2, highlightOnComplete: true,
    charDataLoader: (ch, onLoad, onErr) => fetch("vendor/hanzi-data/" + ch + ".json").then(r => r.json()).then(onLoad).catch(onErr),
    onLoadCharDataError: () => { $("#tfb").textContent = "Couldn't load this character. Check the internet and try again."; }
  });
  PP._writer = w;
  const fb = t => $("#tfb").innerHTML = t;
  const startQuiz = () => {
    let miss = 0;
    fb(`✍️ 该你了！ Your turn: stroke 1 of ${C.strokes}`);
    w.quiz({
      onMistake: s => { miss++; sfx(false); fb(s.mistakesOnStroke >= 2 ? "💡 跟着绿色的笔画写 · Follow the green stroke" : "🌱 再试试！ Almost! Try that stroke again"); },
      onCorrectStroke: s => { sfx(true); if (s.strokesRemaining) fb(`👍 好！ Stroke ${s.strokeNum + 2} of ${C.strokes}`); },
      onComplete: s => {
        const c = s.totalMistakes <= 1 ? 3 : s.totalMistakes <= 3 ? 2 : 1, r = p.chars[C.ch];
        const first = !r, better = r && c > r.best;
        p.chars[C.ch] = { best: Math.max(c, r ? r.best : 0), plays: (r ? r.plays : 0) + 1 };
        const st = 3 + (first ? 3 : better ? 1 : 0); reward(p, st, 5, 15);
        Audio1.play(C.audio, C.ch);
        fb(`🎉 <b>${pick(PP.PRAISE)[0]}</b> You wrote ${C.ch}! ${crowns(c)} +${st}⭐`);
      }
    });
  };
  $("#watch").onclick = () => { fb("👀 看笔顺 · Watch the order"); w.cancelQuiz && w.cancelQuiz(); w.showCharacter && w.hideCharacter(); w.animateCharacter({ onComplete: () => fb("Now you try! ✍️ Tap Trace") }); };
  $("#write").onclick = () => { w.cancelQuiz && w.cancelQuiz(); w.hideCharacter(); startQuiz(); };
  $("#say").onclick = () => Audio1.play(C.audio, C.ch);
  $("#prev").onclick = () => idx && trace(idx - 1);
  $("#nextc").onclick = () => idx < PP.CHARS.length - 1 && trace(idx + 1);
  setTimeout(() => { w.animateCharacter({ onComplete: () => { w.hideCharacter(); startQuiz(); } }); }, 400);
}

PP.App = { profiles, home, garden, trace, lesson, quiz, level, rerender: () => (S.cur() ? home() : profiles()) };
document.addEventListener("DOMContentLoaded", () => { S.cur() ? home() : profiles(); PP.Cloud && PP.Cloud.boot(); });
})();
