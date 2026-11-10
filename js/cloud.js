/* ☁️ Family cloud save (optional). One family account (family name + password, no email) holds all the
   children's profiles. Free Supabase backend: rows live in public.saves with row-level security, so each
   account can only read/write its own row. Panda Pinyin accounts use their own e-mail namespace
   (<name>@family.pandapinyin.app) and their own session key (pp-auth), so they never mix with Word Realms
   accounts on the same github.io origin. The game never waits for the cloud; the device save always works. */
(function () {
const PP = window.PP, S = PP.Store, ui = PP.ui;
const CFG = {
  url: "https://aoqfqopzycowbnjshzvg.supabase.co",
  key: "sb_publishable_uohGzZ5-4NxurifutYE4Xg_8FMVfiVp",   // public by design; RLS protects rows
  lib: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.min.js",
  domain: "family.pandapinyin.app", storageKey: "pp-auth", prefix: "pp:"
};
const META = "pandaPinyin.cloud.v1";
let client = null, libP = null, timer = null, busy = false;
const C = PP.Cloud = { status: "guest", name: null, cfg: CFG };
const meta = () => { try { return JSON.parse(localStorage.getItem(META)) || {}; } catch (e) { return {}; } };
const setMeta = m => localStorage.setItem(META, JSON.stringify(Object.assign(meta(), m)));
const email = n => n.trim().toLowerCase() + "@" + CFG.domain;
const ours = u => !!(u && u.email && u.email.endsWith("@" + CFG.domain));   // hard guard: only ever write Panda Pinyin accounts

C.nameErr = n => { n = String(n || "").trim(); if (n.length < 3) return "Family name needs at least 3 letters."; if (n.length > 20) return "Keep it to 20 letters or fewer."; if (!/^[A-Za-z0-9_]+$/.test(n)) return "Letters, numbers and _ only (no spaces)."; return null; };
C.passErr = p => String(p || "").length < 6 ? "Password needs at least 6 characters." : null;
const friendly = (e, signup) => { const m = String((e && (e.message || e)) || "").toLowerCase(), code = e && e.code;
  if (code === "user_already_exists" || /already (registered|exists)/.test(m)) return "That family name is taken. Try another.";
  if (code === "invalid_credentials" || /invalid login/.test(m)) return "Wrong family name or password.";
  if (/rate limit|too many|429/.test(m)) return "Too many tries. Please wait a minute.";
  if (/fetch|network|load|offline|timeout/.test(m)) return "Can't reach the cloud right now. Progress is still saved on this device.";
  return signup ? "Couldn't create the family account. Please try again." : "Couldn't log in. Please try again."; };

const LABEL = { guest: ["☁️", "Device only"], loading: ["☁️", "Connecting…"], saving: ["⏳", "Saving…"], saved: ["☁️✓", "Cloud saved"], offline: ["📴", "Offline"] };
C.chip = () => `<button class="cloud-chip st-${C.status}" id="cloudChip" aria-label="Family cloud save">${LABEL[C.status][0]}</button>`;
C.bindChip = () => { const b = document.getElementById("cloudChip"); if (b) { b.title = LABEL[C.status][1]; b.onclick = () => PP.Grown.open(); } };
const set = st => { C.status = st; document.querySelectorAll(".cloud-chip").forEach(b => { b.className = "cloud-chip st-" + st; b.textContent = LABEL[st][0]; b.title = LABEL[st][1]; });
  const el = document.getElementById("ccStatus"); if (el) el.textContent = LABEL[st][1]; };

function lib() {
  if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
  return libP || (libP = new Promise((res, rej) => { const s = document.createElement("script"), t = setTimeout(() => rej(new Error("timeout")), 9000);
    s.src = CFG.lib; s.onload = () => { clearTimeout(t); window.supabase ? res(window.supabase) : rej(new Error("load")); }; s.onerror = () => { clearTimeout(t); libP = null; rej(new Error("load")); }; document.head.appendChild(s); }));
}
async function sb() { if (client) return client; const L = await lib();
  client = L.createClient(CFG.url, CFG.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: CFG.storageKey } }); return client; }

async function pull(user) {
  const { data, error } = await client.from("saves").select("data, updated_at").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (data && data.data && data.data.app === "panda-pinyin") {
    const merged = S.merge(S.state, data.data); merged.current = S.state.current && merged.profiles.some(p => p.id === S.state.current) ? S.state.current : null;
    S.set(merged);
  }
  await push(true);
}
async function push(now) {
  const { data: { user } } = await client.auth.getUser();
  if (!ours(user)) { set("guest"); return; }
  set("saving");
  const body = Object.assign({}, S.state); delete body.current;    // which child is playing stays per device
  const { error } = await client.from("saves").upsert({ user_id: user.id, username: CFG.prefix + C.name, data: body, updated_at: new Date().toISOString() });
  if (error) { set(navigator.onLine ? "guest" : "offline"); setMeta({ dirty: true }); throw error; }
  setMeta({ dirty: false, at: Date.now() }); set("saved");
}
const queue = () => { if (!C.name) return; setMeta({ dirty: true }); clearTimeout(timer); timer = setTimeout(() => push().catch(() => set(navigator.onLine ? "guest" : "offline")), 2000); };
S.onSave(queue);
C.saveNow = () => push();

C.boot = async () => {
  const m = meta(); if (!m.name) return;               // never loads the library for device-only families
  C.name = m.name; set("loading");
  try { await sb(); const { data: { session } } = await client.auth.getSession();
    if (!session || !ours(session.user)) { C.name = null; setMeta({ name: null }); return set("guest"); }
    await pull(session.user); PP.App.rerender();
  } catch (e) { set(navigator.onLine ? "guest" : "offline"); }
};
window.addEventListener("online", () => C.name && client && meta().dirty && push().catch(() => {}));
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && C.name && client && meta().dirty) push().catch(() => {}); });

C.auth = async (mode, name, pass) => {
  await sb();
  const fn = mode === "signup" ? client.auth.signUp({ email: email(name), password: pass }) : client.auth.signInWithPassword({ email: email(name), password: pass });
  const { data, error } = await fn;
  if (error) throw new Error(friendly(error, mode === "signup"));
  const user = data.user || (data.session && data.session.user);
  if (!data.session) throw new Error("This account needs switching on by the site owner (email confirmation is on).");
  if (!ours(user)) throw new Error("Not a Panda Pinyin account.");
  C.name = name.trim().toLowerCase(); setMeta({ name: C.name });
  await pull(user);
};
C.logout = async (clear) => {
  try { await sb(); await client.auth.signOut(); } catch (e) {}
  C.name = null; setMeta({ name: null, dirty: false }); set("guest");
  if (clear) { localStorage.removeItem(S.KEY); S.set({ app: "panda-pinyin", v: 1, profiles: [], current: null, deleted: [] }); }
};

/* ---------------- 👪 Grown-ups panel (behind a small grown-up check) ---------------- */
PP.Grown = { open() {
  const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 5);
  ui.modal(`<h3>👪 Grown-ups only</h3><p>What is <b>${a} × ${b}</b>?</p>
    <input id="gate" inputmode="numeric" maxlength="3" autocomplete="off"><p class="err" id="gErr"></p>
    <div class="row"><button class="btn ghost" data-x>Cancel</button><button class="btn" id="gOk">OK</button></div>`, (m, close) => {
    const inp = m.querySelector("#gate"); setTimeout(() => inp.focus(), 50);
    m.querySelector("[data-x]").onclick = close;
    const ok = () => { if (+inp.value === a * b) { close(); panel(); } else m.querySelector("#gErr").textContent = "Not quite. Please ask a grown-up 🙂"; };
    m.querySelector("#gOk").onclick = ok; inp.onkeydown = e => e.key === "Enter" && ok();
  });
} };
function panel() {
  const kids = S.state.profiles;
  ui.modal(`<h3>👪 Grown-ups</h3>
    <div class="box"><b>☁️ Family cloud save</b>
      ${C.name ? `<p>Signed in as <b>${ui.esc(C.name)}</b> · <span id="ccStatus">${LABEL[C.status][1]}</span></p>
        <p class="muted">All children’s progress syncs to this family account. Log in with the same family name on another phone or tablet to continue there.</p>
        <div class="row"><button class="btn sm" id="cSave">Save now</button><button class="btn sm ghost" id="cOut">Log out</button></div>
        <button class="link" id="cOutClear">Log out & clear this device (shared computer)</button>`
      : `<p class="muted">Progress is saved on this device. Make a free family account (no email needed) to keep it safe in the cloud and use it on other devices.</p>
        <input id="cName" placeholder="Family name, e.g. ngfamily" autocomplete="username" autocapitalize="off" maxlength="20">
        <input id="cPass" type="password" placeholder="Password (6+ characters)" autocomplete="current-password">
        <p class="err" id="cErr"></p>
        <div class="row"><button class="btn sm" id="cIn">Log in</button><button class="btn sm ghost" id="cUp">Create account</button></div>
        <p class="muted tiny">Write the family name and password down: there is no email, so they can’t be reset.</p>`}
    </div>
    <div class="box"><b>🧒 Players</b>${kids.length ? kids.map(k => `<div class="krow"><span>${ui.esc(k.name)} · ⭐ ${k.stars} · Lv ${PP.App.level(k)}</span><button class="btn sm ghost" data-del="${k.id}">Remove</button></div>`).join("") : `<p class="muted">No players yet.</p>`}</div>
    <p class="muted tiny">Audio: real recordings by Chen Wang and Yue Tan (audio-cmn / Shtooka, CC BY-SA). Stroke order: Hanzi Writer (MIT) + hanzi-writer-data (Arphic PL). <a href="CREDITS.md" target="_blank">Credits</a></p>
    <button class="btn ghost" data-x>Close</button>`, (m, close) => {
    m.querySelector("[data-x]").onclick = close;
    const err = t => m.querySelector("#cErr").textContent = t;
    const go = mode => async () => {
      const n = m.querySelector("#cName").value.trim(), p = m.querySelector("#cPass").value;
      const e = C.nameErr(n) || C.passErr(p); if (e) return err(e);
      err(mode === "signup" ? "Creating…" : "Logging in…");
      try { await C.auth(mode, n, p); close(); PP.App.rerender(); ui.toast("☁️✓ Family cloud save is on!"); } catch (x) { err(x.message); }
    };
    if (m.querySelector("#cIn")) { m.querySelector("#cIn").onclick = go("login"); m.querySelector("#cUp").onclick = go("signup"); }
    if (m.querySelector("#cSave")) {
      m.querySelector("#cSave").onclick = () => C.saveNow().then(() => ui.toast("☁️✓ Saved")).catch(() => ui.toast("Couldn't reach the cloud. Saved on this device."));
      m.querySelector("#cOut").onclick = async () => { await C.logout(false); close(); PP.App.rerender(); };
      m.querySelector("#cOutClear").onclick = async () => { if (!confirm("Log out and remove Panda Pinyin progress from THIS device? (The cloud copy stays.)")) return; await C.logout(true); close(); PP.App.profiles(); };
    }
    m.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { const k = kids.find(x => x.id === b.dataset.del);
      if (!confirm(`Remove ${k.name} and all their progress?`)) return; S.remove(k.id); close(); PP.App.profiles(); });
  });
}
})();
