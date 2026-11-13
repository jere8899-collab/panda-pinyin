// Hands-on "play it like a kid" check of the LIVE game.
// Fresh phone context, real key presses, one lesson, one tracing, shop, reload.
// Does not change game code. Does not deploy. Local-only (no family login).
//
//   BASE=https://jere8899-collab.github.io/panda-pinyin/ node tools/test/kid_check.js
const { chromium, webkit } = require("playwright-core");
const path = require("path"), fs = require("fs");

const BASE = process.env.BASE || "https://jere8899-collab.github.io/panda-pinyin/";
const SHOTS = path.join(__dirname, "../../shots/kid_check");
const HANZI = path.join(__dirname, "../../vendor/hanzi-data");
const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const ANDROID_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const PLAYER = "小明"; // nickname only; created after Mia / Tuấn / 小明 all type into the box
fs.mkdirSync(SHOTS, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));
const ONLY = (process.env.ONLY || "").toLowerCase();

async function pageAlive(page) {
  try { return !page.isClosed() && await page.evaluate(() => true); }
  catch (e) { return false; }
}

const AUDIO_HOOK = () => {
  const A = window.Audio;
  window.__played = [];
  window.Audio = function (src) {
    const a = new A(src);
    window.__played.push(src);
    a.play = () => Promise.resolve();
    return a;
  };
};

// Playwright's Linux WebKit renderer crashes on real Audio()/mp3 playback
// (learn-card tap and quiz autoplay). This dummy never touches the media engine,
// so the rest of the UI flow can still be checked. The crash itself is tested
// separately in 4_lesson_hear_card with real Audio.
const AUDIO_HOOK_SAFE = () => {
  window.__played = [];
  class FakeAudio {
    constructor(src) { this.src = src || ""; this.currentTime = 0; window.__played.push(src); }
    play() { return Promise.resolve(); }
    pause() {}
    addEventListener() {}
    removeEventListener() {}
  }
  window.Audio = FakeAudio;
  const FakeCtx = function () {
    this.currentTime = 0; this.destination = {};
    this.createOscillator = () => ({ type: "sine", frequency: { setValueAtTime() {} }, connect() { return this; }, start() {}, stop() {} });
    this.createGain = () => ({ gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } });
  };
  window.AudioContext = window.webkitAudioContext = FakeCtx;
};

function overflowReport() {
  return [...document.querySelectorAll("#app *, .sheet *")].filter(e => {
    if (!e.offsetParent || e.closest(".who, .shelf small, svg, #pad")) return false;
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return r.right > innerWidth + 1 || r.left < -1 ||
      (cs.overflowX !== "visible" ? false : e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && cs.display !== "inline");
  }).map(e => (e.id || e.className || e.tagName) + ":" + e.textContent.trim().slice(0, 40));
}

async function checkOverflow(page, where, rec) {
  const bad = await page.evaluate(overflowReport);
  rec.overflow.push(...bad.map(b => where + " → " + b));
  return bad;
}

async function clearName(page) {
  await page.tap("#kidName");
  const n = await page.evaluate(() => (document.querySelector("#kidName").value || "").length);
  for (let i = 0; i < n + 2; i++) await page.keyboard.press("Backspace");
  const left = await page.inputValue("#kidName");
  if (left) {
    // last-resort UI clear without setting value directly: select-all then delete
    await page.tap("#kidName");
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Meta+A");
    await page.keyboard.press("Backspace");
  }
}

async function typeEnglish(page, text) {
  await page.tap("#kidName");
  await page.keyboard.type(text, { delay: 50 });
}

async function typeVietnamese(page, text) {
  await page.tap("#kidName");
  await page.keyboard.type(text, { delay: 50 });
}

async function typeChineseIME(page, text) {
  await page.tap("#kidName");
  await page.evaluate(() => {
    const i = document.querySelector("#kidName");
    i.dispatchEvent(new CompositionEvent("compositionstart", { data: "" }));
    i.dispatchEvent(new CompositionEvent("compositionupdate", { data: "xiaoming" }));
  });
  await page.keyboard.insertText(text);
  await page.evaluate(t => {
    document.querySelector("#kidName").dispatchEvent(new CompositionEvent("compositionend", { data: t }));
  }, text);
}

async function answerRight(page) {
  const k = await page.evaluate(() => {
    const q = PP._q, want = q.ans;
    const opts = [...document.querySelectorAll(".opt")];
    const label = o => q.kind === "tone" ? q.opts[+o.dataset.k].t : o.querySelector("b").textContent;
    const b = opts.find(o => label(o) === want);
    return b ? b.getAttribute("data-k") : null;
  });
  if (k == null) throw new Error("could not find the right answer button");
  await page.tap(`.opt[data-k="${k}"]`);
}

async function playLesson(page) {
  let n = 0;
  while (await page.$(".quiz")) {
    await page.waitForFunction(() => window.__played.length && document.querySelector(".opt:not([disabled])"));
    await sleep(400);
    await answerRight(page);
    n++;
    await sleep(1600);
  }
  return n;
}

function mapStroke(box, pt) {
  const size = box.width, pad = 12, scale = (size - 2 * pad) / 1024;
  const [x, y] = pt;
  return [box.x + pad + x * scale, box.y + size - pad - (y + 124) * scale];
}

async function dragStrokesMouse(page, medians, box) {
  for (const med of medians) {
    const pts = med.map(p => mapStroke(box, p));
    await page.mouse.move(...pts[0]);
    await page.mouse.down();
    for (const p of pts.slice(1)) await page.mouse.move(...p, { steps: 4 });
    await page.mouse.up();
    await sleep(450);
  }
}

async function dragStrokesPointer(page, medians) {
  await page.evaluate(async medians => {
    const svg = document.querySelector("#pad svg");
    const box = svg.getBoundingClientRect();
    const size = box.width, pad = 12, scale = (size - 2 * pad) / 1024;
    const P = ([x, y]) => [box.left + pad + x * scale, box.top + size - pad - (y + 124) * scale];
    const fire = (type, x, y, buttons) => {
      svg.dispatchEvent(new PointerEvent(type, {
        bubbles: true, cancelable: true, composed: true,
        clientX: x, clientY: y, pointerId: 1, pointerType: "touch",
        isPrimary: true, buttons, view: window
      }));
    };
    for (const med of medians) {
      const pts = med.map(P);
      fire("pointerdown", pts[0][0], pts[0][1], 1);
      for (const p of pts.slice(1)) fire("pointermove", p[0], p[1], 1);
      const last = pts[pts.length - 1];
      fire("pointerup", last[0], last[1], 0);
      await new Promise(r => setTimeout(r, 450));
    }
  }, medians);
}

async function traceUntilAccepted(page, ch) {
  const data = JSON.parse(fs.readFileSync(path.join(HANZI, ch + ".json")));
  const accepted = async () => {
    const t = (await page.textContent("#tfb")) || "";
    return t.includes("You wrote") || t.includes("你写了") || t.includes("Bạn đã viết") || t.includes("写了");
  };
  const svg = await page.$("#pad svg");
  const box = await svg.boundingBox();
  try {
    await dragStrokesMouse(page, data.medians, box);
    await sleep(600);
    if (await accepted()) return "mouse";
  } catch (e) { /* mouse may be ignored on a touch-only context */ }
  await dragStrokesPointer(page, data.medians);
  await page.waitForFunction(() => {
    const t = (document.querySelector("#tfb") || {}).textContent || "";
    return /You wrote|你写了|Bạn đã viết|写了/.test(t);
  }, null, { timeout: 8000 }).catch(() => {});
  if (await accepted()) return "pointer";
  throw new Error("tracing of " + ch + " was not accepted; feedback: " + (await page.textContent("#tfb")));
}

async function runBrowser(kind) {
  const rec = {
    browser: kind,
    steps: {},
    errors: [],
    consoleErrors: [],
    failedNet: [],
    brokenImages: [],
    overflow: [],
    shots: [],
    notes: [],
    starsBefore: null,
    starsAfterLesson: null,
    starsAfterTrace: null,
    starsAfterReload: null
  };
  const mark = (step, pass, detail) => {
    rec.steps[step] = { pass, detail: detail || "" };
    console.log(`  ${pass ? "✓" : "✗"} [${kind}] ${step}${detail ? " — " + detail : ""}`);
  };
  const shotOn = async (pg, recRef, name) => {
    const file = path.join(SHOTS, `${kind}_${name}.png`);
    await pg.screenshot({ path: file, fullPage: false });
    recRef.shots.push(file);
    return file;
  };
  const shot = async (page, name) => shotOn(page, rec, name);

  let browser;
  try {
    if (kind === "chromium") {
      browser = await chromium.launch({
        executablePath: "/opt/google/chrome/chrome",
        args: ["--autoplay-policy=no-user-gesture-required"]
      });
    } else {
      browser = await webkit.launch();
    }

    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      userAgent: kind === "webkit" ? IPHONE_UA : ANDROID_UA
    });
    const page = await ctx.newPage();
    page.on("pageerror", e => rec.errors.push(e.message));
    page.on("console", m => { if (m.type() === "error") rec.consoleErrors.push(m.text()); });
    page.on("response", r => { if (r.status() >= 400) rec.failedNet.push(r.status() + " " + r.url()); });
    page.on("crash", () => { rec.notes.push("PAGE CRASHED"); console.log("  ! [" + kind + "] page crashed"); });
    await page.addInitScript(kind === "webkit" ? AUDIO_HOOK_SAFE : AUDIO_HOOK);
    if (kind === "webkit") {
      await page.route("**/*.{mp3,wav,ogg,m4a}", r => r.abort());
      rec.notes.push("WebKit main flow uses a dummy Audio + aborted mp3 routes because real playback crashes this renderer");
    }

    // Step 1: fresh empty context, no leftover storage / SW
    await page.goto(BASE + "?cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForSelector(".pick, .home", { timeout: 20000 });
    const storage = await page.evaluate(() => ({
      ls: Object.keys(localStorage).filter(k => /panda|pp-/i.test(k)),
      profiles: (window.PP && PP.Store && PP.Store.state && PP.Store.state.profiles) ? PP.Store.state.profiles.length : -1
    }));
    const onPick = !!(await page.$(".pick"));
    const fresh = onPick && storage.ls.length === 0 && (storage.profiles === 0 || storage.profiles === -1);
    mark("1_fresh_context", fresh,
      `url loaded, picker=${onPick}, local panda keys=${JSON.stringify(storage.ls)}, profiles=${storage.profiles}`);
    if (!onPick && storage.profiles > 0) {
      mark("2_start_new_game", false, "fresh context was not empty; did not start a brand-new game");
    } else {
      mark("2_start_new_game", onPick, "profile picker is showing (no existing child)");
    }
    await shot(page, "01_picker");
    await checkOverflow(page, "picker", rec);

    // Step 3: open add-player and type Mia, Tuấn, 小明 with real key presses
    await page.tap("#addKid");
    await page.waitForSelector("#kidName", { timeout: 8000 });
    await page.tap("#kidName");

    await typeEnglish(page, "Mia");
    const mia = await page.inputValue("#kidName");
    await shot(page, "02_name_Mia");
    mark("3_name_Mia", mia === "Mia", `box shows "${mia}"`);
    await clearName(page);
    const cleared1 = await page.inputValue("#kidName");
    if (cleared1) rec.notes.push(`after clearing Mia, box still has "${cleared1}"`);

    await typeVietnamese(page, "Tuấn");
    const tuan = await page.inputValue("#kidName");
    await shot(page, "03_name_Tuan");
    mark("3_name_Tuan", tuan === "Tuấn", `box shows "${tuan}"`);
    await clearName(page);

    await typeChineseIME(page, "小明");
    const xm = await page.inputValue("#kidName");
    await shot(page, "04_name_Xiaoming");
    mark("3_name_Xiaoming", xm === "小明", `box shows "${xm}"`);

    const canContinue = !!(await page.$("#kidOk")) && xm === "小明";
    await page.tap("#kidOk");
    await page.waitForSelector(".home", { timeout: 8000 }).catch(() => {});
    const onHome = !!(await page.$(".home"));
    if (onHome) {
      await page.waitForSelector(".node[data-i='0'], .pet, #garden", { timeout: 8000 }).catch(() => {});
      await sleep(1200);
    }
    const homeName = onHome ? await page.textContent(".who") : "";
    const homeVisible = onHome ? await page.evaluate(() => {
      const n = document.querySelector(".node[data-i='0']");
      const pet = document.querySelector(".pet, .panda");
      const r = n && n.getBoundingClientRect();
      return { hasNode: !!n, nodeH: r ? Math.round(r.height) : 0, hasPet: !!pet, bodyText: (document.querySelector(".home")||{}).innerText?.slice(0, 120) };
    }) : null;
    rec.notes.push("home after create: " + JSON.stringify(homeVisible));
    mark("3_create_player", onHome && (homeName || "").includes(PLAYER),
      canContinue
        ? `created "${PLAYER}", home who="${(homeName || "").trim()}", painted=${!!(homeVisible && homeVisible.hasNode && homeVisible.nodeH > 0)}`
        : `OK not usable or name mismatch before submit (box="${xm}")`);
    await shot(page, "05_home_new");
    await checkOverflow(page, "home (new player)", rec);

    if (!onHome) {
      mark("4_lesson", false, "blocked: player was not created");
      mark("4_tracing", false, "blocked: player was not created");
      mark("5_stars_and_shop", false, "blocked: player was not created");
      mark("6_reload_persist", false, "blocked: player was not created");
    } else {
      rec.starsBefore = await page.evaluate(() => PP.Store.cur().stars);

      // Step 4a: one full lesson (lesson 1, tones) through the UI
      try {
        await page.tap(".node[data-i='0']");
        await page.waitForSelector(".learn, .quiz", { timeout: 8000 });
        await sleep(400);
        await page.waitForFunction(() => {
          const e = document.querySelector(".lcard, #go, .quiz");
          return e && e.getBoundingClientRect().height > 20;
        }, null, { timeout: 8000 }).catch(() => {});
        await sleep(400);
        await shot(page, "06_lesson_learn");
        // Tapping a learn card to hear it crashes Playwright's Linux WebKit renderer
        // (reproduced with and without the Audio test hook, and with a plain DOM click).
        // Chromium is fine. The main lesson path therefore starts the quiz with #go
        // only; a disposable-context hear-card check is recorded separately for WebKit.
        if (await page.$(".lcard")) {
          await page.tap(".lcard[data-i='0']").catch(() => {});
          await sleep(300);
        }
        rec.notes.push("about to start quiz (#go)");
        if (await page.$("#go")) await page.tap("#go");
        await page.waitForSelector(".quiz", { timeout: 8000 });
        rec.notes.push("quiz visible");
        await sleep(800);
        if (!(await pageAlive(page))) throw new Error("page crashed after opening the quiz");
        await shot(page, "07_lesson_quiz");
        const n = await playLesson(page);
        await page.waitForSelector(".done", { timeout: 8000 });
        rec.starsAfterLesson = await page.evaluate(() => PP.Store.cur().stars);
        const gained = rec.starsAfterLesson - rec.starsBefore;
        mark("4_lesson", n >= 6 && gained > 0 && !!(await page.$(".done")),
          `${n} questions, stars ${rec.starsBefore} → ${rec.starsAfterLesson} (+${gained})`);
        await shot(page, "08_lesson_done");
        await checkOverflow(page, "lesson done", rec);
        if (await page.$("#homeGo")) await page.tap("#homeGo");
        await page.waitForSelector(".home", { timeout: 8000 });
      } catch (e) {
        mark("4_lesson", false, String(e && e.message || e));
        if (await pageAlive(page)) {
          if (await page.$("#homeGo").catch(() => null)) await page.tap("#homeGo").catch(() => {});
          if (await page.$("#back").catch(() => null)) await page.tap("#back").catch(() => {});
          await page.waitForSelector(".home", { timeout: 5000 }).catch(() => {});
        } else {
          rec.notes.push("page dead after lesson; later steps on this context are blocked");
        }
      }

      // Step 4b: one Writing Garden tracing with drag gestures
      if (!(await pageAlive(page))) {
        mark("4_tracing", false, "blocked: page crashed");
        mark("5_stars_and_shop", false, "blocked: page crashed");
        mark("6_reload_persist", false, "blocked: page crashed");
      } else try {
        await page.waitForSelector(".home, #garden", { timeout: 8000 });
        await page.tap("#garden");
        await page.waitForSelector(".garden-s", { timeout: 8000 });
        await shot(page, "09_garden");
        await page.tap(".ch[data-i='0']");
        await page.waitForSelector("#pad svg", { timeout: 20000 });
        await page.waitForFunction(() => /Your turn|Đến lượt|轮到|stroke 1/.test((document.querySelector("#tfb") || {}).textContent || ""), null, { timeout: 20000 });
        const how = await traceUntilAccepted(page, "一");
        rec.starsAfterTrace = await page.evaluate(() => PP.Store.cur().stars);
        const fb = (await page.textContent("#tfb")) || "";
        const traced = /You wrote|你写了|Bạn đã viết|写了/.test(fb);
        mark("4_tracing", traced, `一 accepted via ${how}; feedback="${fb.trim().slice(0, 60)}"; stars now ${rec.starsAfterTrace}`);
        await shot(page, "10_traced");
        await checkOverflow(page, "trace accepted", rec);
        if (await page.$("#back")) await page.tap("#back");
        await page.waitForSelector(".garden-s, .home", { timeout: 8000 }).catch(() => {});
        if (await page.$("#back")) await page.tap("#back").catch(() => {});
        await page.waitForSelector(".home", { timeout: 8000 }).catch(() => {});
      } catch (e) {
        mark("4_tracing", false, String(e && e.message || e));
        if (await page.$("#back")) await page.tap("#back").catch(() => {});
        if (await page.$("#back")) await page.tap("#back").catch(() => {});
        await page.waitForSelector(".home", { timeout: 5000 }).catch(() => {});
      }

      // Step 5: confirm stars added, open shop/skins
      if (!(await pageAlive(page))) {
        if (!rec.steps["5_stars_and_shop"]) mark("5_stars_and_shop", false, "blocked: page crashed");
        if (!rec.steps["6_reload_persist"]) mark("6_reload_persist", false, "blocked: page crashed");
      } else try {
        await page.waitForSelector(".home", { timeout: 8000 });
        const starsNow = await page.evaluate(() => PP.Store.cur().stars);
        const pill = (await page.textContent("#starPill")) || "";
        const starsUp = starsNow > (rec.starsBefore || 0) && pill.includes(String(starsNow));
        await page.tap("#skins");
        await page.waitForSelector(".skins", { timeout: 8000 });
        await sleep(500);
        const skinCount = await page.$$eval(".skin", els => els.length);
        mark("5_stars_and_shop", starsUp && skinCount > 0,
          `stars ${rec.starsBefore} → ${starsNow} (pill="${pill.trim()}"), ${skinCount} skins shown`);
        await shot(page, "11_skins");
        await checkOverflow(page, "skins shop", rec);
        if (await page.$(".sheet [data-x]")) await page.tap(".sheet [data-x]").catch(() => {});
        else if (await page.$("#back")) await page.tap("#back").catch(() => {});
        await page.waitForSelector(".home", { timeout: 8000 }).catch(() => {});
      } catch (e) {
        mark("5_stars_and_shop", false, String(e && e.message || e));
      }

      // Step 6: reload, player + progress still there
      try {
        const before = await page.evaluate(() => {
          const p = PP.Store.cur();
          return { name: p.name, stars: p.stars, lessons: Object.keys(p.lessons || {}).length, chars: Object.keys(p.chars || {}).length };
        });
        await page.reload({ waitUntil: "domcontentloaded" });
        await page.waitForSelector(".home, .pick", { timeout: 20000 });
        const afterHome = !!(await page.$(".home"));
        const after = afterHome ? await page.evaluate(() => {
          const p = PP.Store.cur();
          return { name: p.name, stars: p.stars, lessons: Object.keys(p.lessons || {}).length, chars: Object.keys(p.chars || {}).length, who: document.querySelector(".who") && document.querySelector(".who").textContent };
        }) : null;
        rec.starsAfterReload = after && after.stars;
        const ok = afterHome && after && after.name === PLAYER && after.stars === before.stars &&
          after.lessons === before.lessons && after.chars === before.chars;
        mark("6_reload_persist", ok,
          after ? `name=${after.name} stars=${after.stars} lessons=${after.lessons} chars=${after.chars} (before ${JSON.stringify(before)})`
                : "home did not appear after reload");
        await shot(page, "12_after_reload");
        await checkOverflow(page, "home after reload", rec);
      } catch (e) {
        mark("6_reload_persist", false, String(e && e.message || e));
      }
    }

    // Step 7: console / network / overflow (collected throughout)
    rec.brokenImages = await page.evaluate(() => [...document.querySelectorAll("img")].filter(i => i.offsetParent && (!i.complete || i.naturalWidth === 0)).map(i => i.src || i.getAttribute("src") || "(no src)")).catch(() => []);
    const netFail = rec.failedNet.filter(u => !/favicon/.test(u));
    const allErr = rec.errors.concat(rec.consoleErrors);
    mark("7_console_errors", allErr.length === 0, allErr.length ? allErr.slice(0, 6).join(" | ") : "none");
    mark("7_failed_network", netFail.length === 0 && rec.brokenImages.length === 0,
      (netFail.length || rec.brokenImages.length)
        ? `http: ${netFail.slice(0, 5).join(" | ")} images: ${rec.brokenImages.slice(0, 5).join(" | ")}`
        : "none");
    mark("7_overflow", rec.overflow.length === 0, rec.overflow.length ? rec.overflow.slice(0, 6).join(" | ") : "none");
    mark("7_screenshots", rec.shots.length > 0, rec.shots.length + " saved under shots/kid_check/");

    await ctx.close();

    // Extra WebKit check: does tapping a learn card to hear it crash the renderer?
    if (kind === "webkit") {
      const b2 = browser;
      const ctx2 = await b2.newContext({
        viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
        isMobile: true, hasTouch: true, userAgent: IPHONE_UA
      });
      const p2 = await ctx2.newPage();
      let crashed = false;
      p2.on("crash", () => { crashed = true; });
      try {
        await p2.addInitScript(AUDIO_HOOK);
        await p2.goto(BASE + "?cb=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 30000 });
        await p2.waitForSelector(".pick");
        await p2.tap("#addKid"); await p2.waitForSelector("#kidName"); await p2.tap("#kidName");
        await p2.keyboard.type("Mia", { delay: 40 }); await p2.tap("#kidOk");
        await p2.waitForSelector(".home");
        await p2.waitForSelector(".node[data-i='0']");
        await p2.tap(".node[data-i='0']");
        await p2.waitForSelector(".lcard, #go");
        await shotOn(p2, rec, "13_before_hear_card");
        await p2.tap(".lcard[data-i='0']");
        await sleep(1500);
        if (!crashed) await p2.evaluate(() => true);
        mark("4_lesson_hear_card", !crashed && await pageAlive(p2), crashed ? "Playwright WebKit renderer crashed after tapping a learn card to hear it (also crashes with no Audio hook and with a DOM click; Chromium does not)" : "tapping a learn card did not crash");
        if (!crashed) await shotOn(p2, rec, "13_after_hear_card");
      } catch (e) {
        mark("4_lesson_hear_card", false, "tapping a learn card crashed Playwright WebKit: " + String(e && e.message || e).split("\n")[0]);
      }
      await ctx2.close().catch(() => {});
    }
  } catch (e) {
    rec.notes.push("run aborted: " + (e && e.stack || e));
    console.log(`  ✗ [${kind}] aborted — ${e && e.message || e}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
  return rec;
}

(async () => {
  console.log("LIVE kid check:", BASE);
  const results = [];
  const kinds = ["chromium", "webkit"].filter(k => !ONLY || ONLY === k);
  for (const kind of kinds) {
    console.log("\n== " + kind + " ==");
    results.push(await runBrowser(kind));
  }
  const report = {
    when: new Date().toISOString(),
    base: BASE,
    results
  };
  const out = path.join(SHOTS, "results.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  let fails = 0;
  console.log("\n======== SUMMARY ========");
  for (const rec of results) {
    console.log("\n" + rec.browser + ":");
    for (const [k, v] of Object.entries(rec.steps)) {
      if (!v.pass) fails++;
      console.log(`  ${v.pass ? "PASS" : "FAIL"}  ${k}${v.detail ? "  —  " + v.detail : ""}`);
    }
    if (rec.notes.length) rec.notes.forEach(n => console.log("  note: " + n));
    rec.shots.forEach(s => console.log("  shot: " + s));
  }
  console.log("\nreport:", out);
  console.log(fails ? `FAIL ${fails} step(s)` : "ALL STEPS PASS");
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
