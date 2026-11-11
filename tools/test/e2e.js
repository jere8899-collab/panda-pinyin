// End-to-end phone test: node tools/test/e2e.js  (BASE=https://... to test the live site; CLOUD=1 for a live cloud round trip)
const { chromium } = require("playwright-core");
const path = require("path"), fs = require("fs");
const BASE = process.env.BASE || "http://localhost:8765/";
const SHOTS = path.join(__dirname, "../../shots");
fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) { passes++; console.log("  ✓", m); } else { fails++; console.log("  ✗", m); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const HOOK = () => {   // remember which file the game asks to play
  const A = window.Audio; window.__played = [];
  window.Audio = function (src) { const a = new A(src); window.__played.push(src); a.play = () => Promise.resolve(); return a; };
};
async function answer(page, right) {
  return page.evaluate(right => {
    const q = PP._q, want = q.ans, opts = [...document.querySelectorAll(".opt")];
    const label = o => q.kind === "tone" ? q.opts[+o.dataset.k].t : o.querySelector("b").textContent;
    const b = right ? opts.find(o => label(o) === want) : opts.find(o => label(o) !== want && !o.disabled);
    opts.forEach(o => { const r = o.getBoundingClientRect(), t = o.querySelector("b"); if (r.right > innerWidth + 1 || r.left < -1 || t.scrollWidth > o.clientWidth + 1) (window.__overflow = window.__overflow || []).push(t.textContent + "@" + innerWidth); });
    if (window.__played.slice(-1)[0] !== q.src) throw new Error("played " + window.__played.slice(-1)[0] + " but question is " + q.src);
    b.click(); return want;
  }, right);
}
async function playLesson(page, wrongOnFirst) {
  let n = 0;
  while (await page.$(".quiz")) {
    await page.waitForFunction(() => window.__played.length && document.querySelector(".opt:not([disabled])"));
    await sleep(380);
    if (wrongOnFirst && n === 0) { await answer(page, false); await sleep(200); ok(/没关系|再听|加油/.test(await page.textContent("#fb")), "gentle feedback on a wrong answer"); await sleep(800); }
    await answer(page, true); n++;
    await sleep(1500);
  }
  return n;
}
async function traceChar(page, ch, wrongFirst) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../../vendor/hanzi-data/" + ch + ".json")));
  const box = await (await page.$("#pad svg")).boundingBox();
  const size = box.width, pad = 12, scale = (size - 2 * pad) / 1024;
  const P = ([x, y]) => [box.x + pad + x * scale, box.y + size - pad - (y + 124) * scale];
  if (wrongFirst) { // draw stroke 1 backwards / in the wrong place
    const m = data.medians[data.medians.length - 1].slice().reverse().map(P);
    await page.mouse.move(...m[0]); await page.mouse.down(); for (const p of m) await page.mouse.move(...p, { steps: 3 }); await page.mouse.up(); await sleep(500);
  }
  for (const med of data.medians) {
    const pts = med.map(P);
    await page.mouse.move(...pts[0]); await page.mouse.down();
    for (const p of pts.slice(1)) await page.mouse.move(...p, { steps: 4 });
    await page.mouse.up(); await sleep(450);
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/google/chrome/chrome", args: ["--autoplay-policy=no-user-gesture-required"] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false, isMobile: false });
  const page = await ctx.newPage();
  const errors = [], bad = [];
  page.on("pageerror", e => errors.push(e.message)); page.on("console", m => m.type() === "error" && errors.push(m.text()));
  page.on("response", r => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });
  await page.addInitScript(HOOK);
  await page.goto(BASE); await page.waitForSelector(".pick");
  await page.evaluate(() => { Object.keys(localStorage).filter(k => k.startsWith("pandaPinyin")).forEach(k => localStorage.removeItem(k)); });
  await page.reload(); await page.waitForSelector(".pick");
  console.log("Profiles");
  await page.click("#addKid"); await page.click("#kidOk"); ok(/type a name/.test(await page.textContent("#kidErr")), "empty name is refused");
  await page.fill("#kidName", "Mei Mei"); await page.click("#kidOk"); await page.waitForSelector(".home");
  ok((await page.textContent(".who")).includes("Mei Mei"), "new child Mei Mei on home");
  await page.click(".who"); await page.click("#addKid"); await page.fill("#kidName", "Xiao Long"); await page.click("#kidOk"); await page.waitForSelector(".home");
  await page.click(".who"); ok((await page.$$(".kid[data-id]")).length === 2, "two profiles in the picker");
  await sleep(500); await page.screenshot({ path: SHOTS + "/01_profiles.png" });
  await page.click(".kid[data-id] >> text=Mei Mei"); await page.waitForSelector(".home");
  ok(await page.$eval(".node[data-i='1']", e => e.classList.contains("locked")), "lesson 2 locked at first");

  console.log("Audio files");
  const files = await page.evaluate(() => { const s = new Set(); PP.LESSONS.forEach(L => { L.learn.forEach(c => s.add(c.audio || PP.audioOf(c.base, c.tone))); L.quiz.bases.forEach(b => L.quiz.tones.forEach(t => { if (t < 5 || b === "ma") s.add(PP.audioOf(b, t)); })); }); PP.CHARS.forEach(c => s.add(c.audio)); return [...s]; });
  const res = await page.evaluate(async files => Promise.all(files.map(f => fetch(f).then(async r => [f, r.status, (await r.arrayBuffer()).byteLength]))), files);
  ok(res.every(([, s, n]) => s === 200 && n > 3000), `all ${files.length} audio files load (200, >3 KB)`);
  const dec = await page.evaluate(async f => { const c = new AudioContext(); let n = 0; for (const x of f) { try { const b = await c.decodeAudioData(await (await fetch(x)).arrayBuffer()); if (b.duration > 0.3) n++; } catch (e) {} } return n; }, files);
  ok(dec === files.length, `all ${files.length} audio files decode as sound (${dec})`);

  console.log("Lesson 1 (tones)");
  await page.click(".node[data-i='0']"); await page.waitForSelector(".learn");
  await page.click(".lcard[data-i='2']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/a3.mp3", "tap ǎ card plays a3.mp3");
  await page.screenshot({ path: SHOTS + "/tmp_learn.png" });
  await page.click("#go"); await page.waitForSelector(".quiz"); await sleep(900);
  await page.screenshot({ path: SHOTS + "/02_tone_quiz.png" });
  const n1 = await playLesson(page, true);
  ok(n1 === 6, "6 questions answered"); await page.waitForSelector(".done");
  const stars1 = await page.evaluate(() => PP.Store.cur().stars);
  ok(stars1 === 10, `stars after lesson 1 = 5 first-try + 5 bonus (got ${stars1})`);
  await page.screenshot({ path: SHOTS + "/tmp_done.png" });
  console.log("Lessons 2-7");
  for (let i = 1; i < 33; i++) { await page.click("#next"); await page.waitForSelector(".learn, .quiz");
    if (i === 28) { await sleep(700); await page.click(".lcard[data-i='2']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/yin1.mp3", "in card plays yin1.mp3 (in said alone = yin)"); await page.screenshot({ path: SHOTS + "/14_nasal_learn.png" }); }
    if (i === 30) { await sleep(700); await page.click(".lcard[data-i='2']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/ying1.mp3", "ing card plays ying1.mp3 (ing said alone = ying)"); await page.screenshot({ path: SHOTS + "/15_back_nasal_learn.png" }); }
    if (i === 31) { await sleep(700); await page.click(".lcard[data-i='6']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/long2.mp3", "龙 lóng card plays long2.mp3"); await page.screenshot({ path: SHOTS + "/16_back_nasal_blend.png" }); }
    if (i === 29) { await sleep(700); await page.click(".lcard[data-i='7']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/qun2.mp3", "裙 qún card plays qun2.mp3"); }
    if (i === 20) { await sleep(700); await page.screenshot({ path: SHOTS + "/13_whole_syllables.png" }); }
    if (i === 24) { await sleep(700); await page.click(".lcard[data-i='5']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/c_niu.mp3", "牛 card plays its own word recording"); }
    if (i === 12) { await sleep(700); await page.screenshot({ path: SHOTS + "/09_jqx_learn.png" }); ok((await page.textContent(".intro")).includes("jü"), "ü-dots rule explained"); }
    if (i === 8) { await sleep(700); await page.screenshot({ path: SHOTS + "/06_blend_learn.png" }); await page.click(".lcard[data-i='3']"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/lv4.mp3", "绿 lǜ card plays lv4.mp3"); }
    if (await page.$("#go")) await page.click("#go"); await page.waitForSelector(".quiz");
    if (i === 4) { await sleep(500); await page.screenshot({ path: SHOTS + "/tmp_syl.png" }); }
    if (i === 32) { await sleep(900); await page.screenshot({ path: SHOTS + "/17_n_ng_review.png" }); const q = await page.evaluate(() => PP._q); ok(!!q && q.opts.length === 3, "n / ng review shows 3 choices"); }
    if (i === 18) { await sleep(900); await page.screenshot({ path: SHOTS + "/10_review_quiz.png" }); }
    if (i === 7) { await sleep(900); await page.screenshot({ path: SHOTS + "/05_dtnl_quiz.png" }); }
    const n = await playLesson(page); ok(n >= 6, `lesson ${i + 1} done (${n} qs)`); await page.waitForSelector(".done"); }
  const ovf = await page.evaluate(() => window.__overflow || []); ok(ovf.length === 0, "every answer button fits on screen " + ovf.slice(0, 5).join(","));
  const usedBad = await page.evaluate(() => __played.filter(f => /audio\/(la4|qi4|se4|shu4|zhe4|lve2|miu4|niu2|nve4|tie2|xue2|pin2|ren4|shan2|zhen2|leng2|rong2)\.mp3/.test(f)));
  ok(usedBad.length === 0, "no unchecked recording played as a question " + usedBad.join(","));
  await page.click("#homeGo"); await page.waitForSelector(".home");
  ok((await page.$$(".node.locked")).length === 0, "all lessons unlocked after playing through");
  await sleep(800); await page.screenshot({ path: SHOTS + "/04_home.png" });
  const bm = await page.evaluate(() => PP.Store.cur().badges);
  ok(["w_tones", "w_finals", "w_bpmf", "w_dtnl", "w_zcs", "w_whole", "w_glide", "w_nasal", "grad"].every(k => bm[k]), "all 8 world badges + graduate after every lesson");
  await page.click("#shelf"); await page.waitForSelector(".badges"); await sleep(500);
  ok((await page.$$(".badge.got")).length === 9, "badge shelf shows 9 earned"); await page.screenshot({ path: SHOTS + "/12_badges.png" });
  await page.click(".sheet [data-x]");

  console.log("Pet + skins");
  const p0 = await page.evaluate(() => PP.Store.cur());
  await page.click("#feed"); await sleep(200);
  const p1 = await page.evaluate(() => PP.Store.cur());
  ok(p1.stars === p0.stars - 2 || p0.happy >= 100, "feeding costs 2⭐");
  await page.click("#skins"); await page.click(".skin[data-s='festive']"); await sleep(300);
  const p2 = await page.evaluate(() => PP.Store.cur());
  ok(p2.skin === "festive" && p2.owned.includes("festive"), "bought + wearing festive skin");
  ok((await page.getAttribute(".pet .panda", "src")).includes("festive"), "home panda shows festive skin");

  console.log("Writing Garden");
  await page.click("#garden"); await page.waitForSelector(".garden-s");
  ok((await page.$$(".chars.locked")).length === 5, "sets 2-6 locked at first");
  await page.click(".ch[data-i='6']", { force: true }); await sleep(300); ok(!!(await page.$(".garden-s")) && (await page.$$eval(".toast", ts => ts.some(t => /Trace 3/.test(t.textContent)))), "locked 十 doesn't open, kind toast instead");
  for (const [i, ch] of [[0, "一"], [5, "口"], [4, "大"]]) {
    if (i) { await page.click("#back"); await page.waitForSelector(".garden-s"); }
    await page.click(`.ch[data-i='${i}']`); await page.waitForSelector("#pad svg");
    await page.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 15000 });
    await traceChar(page, ch, ch === "口");
    if (ch === "口") ok(true, "wrong stroke tried first on 口");
    await page.waitForFunction(() => /You wrote/.test(document.querySelector("#tfb").textContent), null, { timeout: 8000 }).catch(() => {});
    ok(/You wrote/.test(await page.textContent("#tfb")), `traced ${ch} to the end`);
    if (ch === "大") await page.screenshot({ path: SHOTS + "/03_tracing.png" });
  }
  await page.click("#back"); await page.waitForSelector(".garden-s");
  ok((await page.$$(".chars.locked")).length === 4, "set 2 opens after 3 traced characters");
  await page.click(".ch[data-i='6']"); await page.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 15000 });
  ok((await page.textContent(".ch-head")).includes("shí") && (await page.textContent(".ch-head")).includes("ten"), "十 shows shí · ten");
  await page.click("#say"); ok((await page.evaluate(() => __played.slice(-1)[0])) === "audio/c_shi.mp3", "十 plays c_shi.mp3");
  await traceChar(page, "十"); await page.waitForFunction(() => /You wrote/.test(document.querySelector("#tfb").textContent), null, { timeout: 8000 }).catch(() => {});
  ok(/You wrote/.test(await page.textContent("#tfb")), "traced 十 to the end"); await page.screenshot({ path: SHOTS + "/07_trace_shi.png" });
  await page.click("#back"); await page.waitForSelector(".garden-s"); await sleep(500); await page.screenshot({ path: SHOTS + "/08_garden_sets.png", fullPage: true });
  const chars = await page.evaluate(() => PP.Store.cur().chars);
  ok(Object.keys(chars).length === 4, "4 characters saved"); ok(chars["一"].best === 3, "一 got 3 stars");
  // a deliberate mistake shows gentle feedback
  await page.click(".ch[data-i='3']"); await page.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 15000 });
  const box = await (await page.$("#pad svg")).boundingBox();
  await page.mouse.move(box.x + 30, box.y + box.height - 30); await page.mouse.down(); await page.mouse.move(box.x + box.width - 30, box.y + 40, { steps: 8 }); await page.mouse.up(); await sleep(400);
  ok(/再试试|Follow/.test(await page.textContent("#tfb")), "wrong stroke on 人 → gentle 'try again'");

  console.log("Switching + reload");
  const mei = await page.evaluate(() => PP.Store.cur());
  await page.click("#back"); await page.click("#back"); await page.waitForSelector(".home"); await page.click(".who");
  await page.click(".kid[data-id] >> text=Xiao Long"); await page.waitForSelector(".home");
  ok((await page.textContent("#starPill")).includes("0"), "Xiao Long has his own 0⭐");
  ok((await page.$$(".node.locked")).length === 32, "Xiao Long's lessons are still locked");
  await page.reload(); await page.waitForSelector(".home");
  ok((await page.textContent(".who")).includes("Xiao Long"), "after reload the same child is playing");
  await page.click(".who"); await page.click(".kid[data-id] >> text=Mei Mei"); await page.waitForSelector(".home");
  const after = await page.evaluate(() => PP.Store.cur());
  ok(after.stars === mei.stars && after.xp === mei.xp && Object.keys(after.lessons).length === 33, `Mei Mei's progress survived reload (⭐${after.stars}, xp ${after.xp})`);

  console.log("Grown-ups gate");
  await page.click("#cloudChip"); await page.waitForSelector("#gate");
  const q = await page.textContent(".sheet p b"); const [a, b] = q.split("×").map(Number);
  await page.fill("#gate", "1"); await page.click("#gOk"); ok(/Not quite/.test(await page.textContent("#gErr")), "wrong gate answer refused");
  await page.fill("#gate", String(a * b)); await page.click("#gOk"); await page.waitForSelector("#cName");
  ok(true, "grown-ups panel opens"); await sleep(600); await page.screenshot({ path: SHOTS + "/tmp_grown.png" });

  if (process.env.CLOUD) {
    console.log("Live cloud round trip");
    const fam = "pptest_" + Date.now().toString(36);
    await page.fill("#cName", fam); await page.fill("#cPass", "pandapass1"); await page.click("#cUp");
    await page.waitForFunction(() => PP.Cloud.status === "saved", null, { timeout: 20000 }).catch(() => {});
    ok(await page.evaluate(() => PP.Cloud.status === "saved"), "family account created and saved to cloud");
    ok(await page.evaluate(() => !!localStorage.getItem("pp-auth")), "session kept under its own pp-auth key");
    const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } }); const p2 = await ctx2.newPage(); await p2.addInitScript(HOOK);
    await p2.goto(BASE); await p2.waitForSelector(".pick"); ok((await p2.$$(".kid[data-id]")).length === 0, "fresh device starts empty");
    await p2.click("#grown"); const q2 = await p2.textContent(".sheet p b"); const [c, d] = q2.split("×").map(Number); await p2.fill("#gate", String(c * d)); await p2.click("#gOk");
    await p2.fill("#cName", fam); await p2.fill("#cPass", "pandapass1"); await p2.click("#cIn");
    await p2.waitForSelector(".kid[data-id]", { timeout: 20000 }).catch(() => {});
    ok((await p2.$$(".kid[data-id]")).length === 2, "second device gets both children from the cloud");
    await p2.click(".kid[data-id] >> text=Mei Mei"); await p2.waitForSelector(".home");
    ok(await p2.evaluate(s => PP.Store.cur().stars === s, after.stars), "Mei Mei's stars match on device 2");
    // device 2 plays, device 1 reloads and sees it
    await p2.evaluate(() => { const p = PP.Store.cur(); p.stars += 7; p.xp += 1; PP.Store.touch(p); });
    await p2.waitForFunction(() => PP.Cloud.status === "saving", null, { timeout: 8000 }).catch(() => {});
    await p2.waitForFunction(() => PP.Cloud.status === "saved", null, { timeout: 15000 }).catch(() => {}); await sleep(500);
    ok(await p2.evaluate(() => PP.Cloud.status === "saved"), "device 2 pushed its change");
    await page.reload(); await page.waitForFunction(() => PP.Cloud.status === "saved", null, { timeout: 20000 }).catch(() => {}); await sleep(500);
    const meiNow = await page.evaluate(() => PP.Store.state.profiles.find(p => p.name === "Mei Mei"));
    console.log("    device1 status", await page.evaluate(() => PP.Cloud.status), "stars", meiNow.stars, "expected", after.stars + 7);
    ok(meiNow.stars === after.stars + 7, "device 1 picks up device 2's new stars after reload");
    await ctx2.close();
  }
  ok(errors.length === 0, "no console errors " + errors.slice(0, 3).join(" | "));
  ok(bad.filter(u => !/favicon/.test(u)).length === 0, "no failed requests " + bad.slice(0, 3).join(" | "));

  console.log("Old v1 save still works");
  const mig = await browser.newContext({ viewport: { width: 390, height: 844 } }); const mp = await mig.newPage(); await mp.addInitScript(HOOK);
  const V1 = { app: "panda-pinyin", v: 1, deleted: [], current: "pold1", profiles: [{ id: "pold1", name: "Old Kid", stars: 33, xp: 70, happy: 80, day: "2026-11-09", skin: "space", owned: ["classic", "space"],
    lessons: { t1: { best: 3, plays: 2 }, t2: { best: 2, plays: 1 }, f1: { best: 3, plays: 1 }, f2: { best: 3, plays: 1 }, s1: { best: 1, plays: 1 }, s2: { best: 2, plays: 1 }, t3: { best: 3, plays: 1 } },
    chars: { "一": { best: 3, plays: 1 }, "人": { best: 2, plays: 1 } }, created: 1, updated: 2 }] };
  await mp.goto(BASE); await mp.evaluate(v => { localStorage.setItem("pandaPinyin.save.v1", JSON.stringify(v)); localStorage.removeItem("pandaPinyin.cloud.v1"); }, V1); await mp.reload(); await mp.waitForSelector(".home");
  ok((await mp.textContent("#starPill")).includes("48"), "old kid keeps 33⭐ + 3 badges they already earned (+15⭐) = 48");
  ok(await mp.evaluate(() => Object.keys(PP.Store.cur().badges).sort().join() === "w_bpmf,w_finals,w_tones"), "old kid gets Tone, Finals, b p m f badges");
  ok((await mp.$$(".node[data-i]")).length === 33 && (await mp.$$(".node.locked")).length === 25, "33 lessons shown; old kid's 7 done + d t n l open, 25 locked");
  ok(await mp.$eval(".node[data-i='7']", e => e.classList.contains("next")), "next lesson for old kid is 声母 d t n l");
  ok((await mp.getAttribute(".pet .panda", "src")).includes("sleepy") || (await mp.getAttribute(".pet .panda", "src")).includes("space"), "old kid's panda/skin shown");
  await mp.click("#garden"); ok((await mp.$$(".chars.locked")).length === 5, "old kid with 2 traced: sets 2-6 still locked");
  ok((await mp.textContent(".garden-s")).includes("⭐⭐⭐"), "old kid's 一 crowns still shown");
  await mp.click("#back"); await mp.click("#skins"); ok((await mp.textContent(".skins")).includes("Brush Panda") && (await mp.textContent(".skins")).includes("Lion Dance Panda"), "Brush + Lion Dance skins in the shop");
  ok(await mp.evaluate(() => PP.Store.cur().owned.join() === "classic,space"), "owned skins unchanged");
  console.log("Sets 4-5");
  await mp.evaluate(() => { const p = PP.Store.cur(); ["二", "三", "十", "土", "上", "中", "日", "月"].forEach(c => p.chars[c] = { best: 2, plays: 1 }); PP.Store.touch(p); });
  await mp.reload(); await mp.waitForSelector(".home"); await mp.click("#garden"); await mp.waitForSelector(".garden-s");
  ok((await mp.$$(".chars.locked")).length === 2, "sets 2-4 open after 3 traced in each set before, sets 5-6 locked");
  for (const [i, ch] of [[18, "目"], [21, "足"]]) {
    if (i !== 18) { await mp.click("#back"); await mp.waitForSelector(".garden-s"); }
    await mp.click(`.ch[data-i='${i}']`); await mp.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 20000 });
    await traceChar(mp, ch); await mp.waitForFunction(() => /You wrote/.test(document.querySelector("#tfb").textContent), null, { timeout: 8000 }).catch(() => {});
    ok(/You wrote/.test(await mp.textContent("#tfb")), `traced ${ch} (${ch === "目" ? 5 : 7} strokes)`);
    await mp.click("#say"); ok(/c_(mu_eye|zu)\.mp3/.test(await mp.evaluate(() => __played.slice(-1)[0])), `${ch} plays its recording`);
  }
  await mp.screenshot({ path: SHOTS + "/11_trace_foot.png" });
  console.log("Set 6");
  await mp.evaluate(() => { const p = PP.Store.cur(); ["手", "天", "田", "王"].forEach(c => p.chars[c] = { best: 2, plays: 1 }); PP.Store.touch(p); });
  await mp.click("#back"); await mp.click("#back"); await mp.waitForSelector(".home"); await mp.click("#garden"); await mp.waitForSelector(".garden-s");
  ok((await mp.$$(".chars.locked")).length === 0, "set 6 opens after 3 of set 5");
  await mp.click(".ch[data-i='34']"); await mp.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 20000 });
  ok((await mp.textContent(".ch-head")).includes("yáng"), "羊 shows yáng");
  await traceChar(mp, "羊"); await mp.waitForFunction(() => /You wrote/.test(document.querySelector("#tfb").textContent), null, { timeout: 8000 }).catch(() => {});
  ok(/You wrote/.test(await mp.textContent("#tfb")), "traced 羊 (6 strokes)");
  await mp.click("#say"); ok((await mp.evaluate(() => __played.slice(-1)[0])) === "audio/c_yang.mp3", "羊 plays c_yang.mp3");
  // a whole set traced gives its badge
  const s1 = await mp.evaluate(() => { const p = PP.Store.cur(), b = p.stars; ["一", "二", "三", "人", "大"].forEach(c => p.chars[c] = p.chars[c] || { best: 1, plays: 1 }); PP.Store.touch(p); return b; });
  await mp.click(".ch[data-i='5']", { force: true }).catch(() => {}); await mp.click("#back"); await mp.waitForSelector(".garden-s");
  await mp.click(".ch[data-i='5']"); await mp.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 20000 });
  await traceChar(mp, "口"); await mp.waitForFunction(() => /You wrote/.test(document.querySelector("#tfb").textContent), null, { timeout: 8000 }).catch(() => {});
  const bp = await mp.evaluate(() => PP.Store.cur());
  ok(!!bp.badges.set1, "tracing all of Set 1 gives the Writing Set 1 badge");
  await sleep(800); ok(await mp.$$eval(".toast", ts => ts.some(t => /New badge/.test(t.textContent))), "badge toast shows");
  const bOnce = await mp.evaluate(() => { const p = PP.Store.cur(), st = p.stars; PP.checkBadges(p); PP.checkBadges(p); return PP.Store.cur().stars === st; });
  ok(bOnce, "a badge pays only once");
  await mig.close();

  console.log("Small phone 320×640");
  const small = await browser.newContext({ viewport: { width: 320, height: 640 } }); const sp = await small.newPage(); await sp.addInitScript(HOOK);
  await sp.goto(BASE); await sp.evaluate(() => { const s = PP.Store.state; s.profiles.push(PP.Store.newProfile("Ana")); s.current = s.profiles[0].id; PP.Store.save(); }); await sp.reload(); await sp.waitForSelector(".home");
  for (const [sel, nm] of [[".node[data-i='0']", "learn"], ["#go", "quiz"]]) { await sp.click(sel); await sleep(500); }
  const over = await sp.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  ok(!over, "no sideways scroll at 320 px"); await sp.screenshot({ path: SHOTS + "/tmp_320_quiz.png" });
  const small_t = await sp.evaluate(() => [...document.querySelectorAll("button")].filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44)).map(b => b.className || b.id));
  ok(small_t.length === 0, "all visible buttons ≥ 44 px tall " + small_t.join(","));
  await small.close();
  console.log(`\n${passes} passed, ${fails} failed`);
  await browser.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
