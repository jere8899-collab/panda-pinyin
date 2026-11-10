// Offline check on the live site: node tools/test/offline.js
const { chromium } = require("playwright-core");
const BASE = process.env.BASE || "https://jere8899-collab.github.io/panda-pinyin/";
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/google/chrome/chrome" });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage();
  await p.goto(BASE); await p.evaluate(() => navigator.serviceWorker.ready);
  await p.evaluate(() => { const s = PP.Store.state; s.profiles = [PP.Store.newProfile("Off")]; s.current = s.profiles[0].id; PP.Store.save(); });
  await p.reload(); await p.waitForSelector(".home"); await p.waitForFunction(() => navigator.serviceWorker.controller);
  const ok1 = await p.evaluate(async () => (await fetch("audio/ma3.mp3")).ok);   // plays once online → cached
  await new Promise(r => setTimeout(r, 1500));
  await ctx.setOffline(true);
  await p.reload(); const home = await p.waitForSelector(".home", { timeout: 10000 }).then(() => true).catch(() => false);
  const au = await p.evaluate(async () => { try { return (await fetch("audio/ma3.mp3")).ok; } catch (e) { return false; } });
  await p.click("#garden"); await p.click(".ch[data-i='0']");
  const stroke = await p.waitForFunction(() => /Your turn: stroke 1/.test(document.querySelector("#tfb").textContent), null, { timeout: 15000 }).then(() => true).catch(() => false);
  console.log(ok1 && home ? "✓ game opens offline" : "✗ game offline", au ? "✓ heard sound plays offline" : "✗ sound offline", stroke ? "✓ tracing works offline" : "✗ tracing offline");
  await b.close(); process.exit(home && au && stroke ? 0 : 1);
})();
