// iPhone-size WebKit check of the name box: English key presses, Vietnamese diacritics, Chinese IME commit, profile created + survives reload.
// BASE=https://jere8899-collab.github.io/panda-pinyin/ node tools/test/namebox_webkit.js   (default: live site)
const { webkit } = require("playwright-core");
const BASE = process.env.BASE || "https://jere8899-collab.github.io/panda-pinyin/";
let fails = 0; const ok = (c, m) => { console.log(c ? "  ✓" : "  ✗", m); if (!c) fails++; };
(async () => {
  const b = await webkit.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.goto(BASE + "?cb=" + Date.now()); await p.waitForSelector(".pick");
  console.log("sw version:", await p.evaluate(async () => (await (await fetch("sw.js", {cache:"no-store"})).text()).match(/pp-[0-9a-f]+/)[0]));
  async function make(label, enter, fill) {
    await p.tap("#addKid"); await p.waitForSelector("#kidName"); await p.tap("#kidName");
    await fill(); const v = await p.inputValue("#kidName");
    ok(v === label, `typed "${label}" -> box shows "${v}"`);
    if (label === "Thảo Vy") await p.screenshot({ path: require("path").join(__dirname, "../../shots/26_namebox_webkit.png") });
    if (enter) await p.keyboard.press("Enter"); else await p.tap("#kidOk");
    await p.waitForSelector(".home", { timeout: 5000 }).catch(() => {});
    ok(!!(await p.$(".home")), `profile "${label}" created (home screen open)`);
    const names = await p.evaluate(() => PP.Store.state.profiles.map(x => x.name));
    ok(names.includes(label), `saved profiles: ${JSON.stringify(names)}`);
    await p.reload(); await p.waitForSelector(".home");
    ok(await p.evaluate(l => PP.Store.cur().name === l, label), `"${label}" still the current child after reload`);
    await p.evaluate(() => PP.App.profiles()); await p.waitForSelector(".pick");
    ok(await p.evaluate(l => [...document.querySelectorAll(".kid")].some(k => k.textContent.includes(l)), label), `"${label}" shown on profile picker after reload`);
  }
  // 1. plain English key presses, one key at a time, incl. Shift+capital, Backspace, space
  await make("Mei Mei", true, async () => { for (const k of ["Shift+M","e","i","x","Backspace","Space","Shift+M","e","i"]) await p.keyboard.press(k); });
  // 2. keyboard.type (English iOS keyboard path)
  await make("Tom", false, () => p.keyboard.type("Tom", { delay: 40 }));
  // 3. Vietnamese with diacritics (iOS Vietnamese keyboard commits accented letters)
  await make("Thảo Vy", false, () => p.keyboard.type("Thảo Vy", { delay: 40 }));
  await make("Nguyễn Đức", false, async () => { await p.keyboard.type("Nguyê", { delay: 30 }); await p.keyboard.press("Backspace"); await p.keyboard.insertText("ễ"); await p.keyboard.press("n"); await p.keyboard.type(" Đức"); });
  // 4. Chinese composition: compositionstart/update with pinyin, then commit 美美
  await make("美美", false, async () => {
    await p.evaluate(() => { const i = document.querySelector("#kidName"); i.dispatchEvent(new CompositionEvent("compositionstart", { data: "" })); i.dispatchEvent(new CompositionEvent("compositionupdate", { data: "meimei" })); });
    await p.keyboard.insertText("美美");
    await p.evaluate(() => document.querySelector("#kidName").dispatchEvent(new CompositionEvent("compositionend", { data: "美美" })));
  });
  // control: the pre-fix handler (returns false) must break English typing in this harness, proving the test can catch the bug
  await p.tap("#addKid"); await p.waitForSelector("#kidName");
  await p.evaluate(() => { document.querySelector("#kidName").onkeydown = e => e.key === "Enter" && false; });
  await p.tap("#kidName"); for (const k of ["a","b","c"]) await p.keyboard.press(k);
  ok((await p.inputValue("#kidName")) === "", "control: old buggy handler blocks English keys in this test (so the test is meaningful)");
  ok(errs.length === 0, "no page errors " + errs.join(" | "));
  await b.close(); console.log(fails ? `FAIL ${fails}` : "ALL PASS"); process.exit(fails ? 1 : 0);
})();
