/* Local save (always) + hooks for the family cloud save (js/cloud.js).
   Key is pandaPinyin.save.v1 — never touch other apps' keys on this origin (Word Realms shares github.io). */
(function () {
const KEY = "pandaPinyin.save.v1";
const PP = window.PP;
const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const uid = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fresh = () => ({ app: "panda-pinyin", v: 1, profiles: [], current: null, deleted: [] });
const newProfile = name => ({ id: uid(), name, stars: 0, xp: 0, happy: 60, day: null, skin: "classic", owned: ["classic"], lessons: {}, chars: {}, created: Date.now(), updated: Date.now() });

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.app === "panda-pinyin") { s.deleted = s.deleted || []; return s; } } catch (e) {}
  return fresh();
}
let state = load();
const listeners = [];
const S = PP.Store = {
  KEY, today, newProfile,
  get state() { return state; },
  set(s) { state = s; localStorage.setItem(KEY, JSON.stringify(state)); },
  save(fromCloud) { localStorage.setItem(KEY, JSON.stringify(state)); if (!fromCloud) listeners.forEach(f => f()); },
  onSave(f) { listeners.push(f); },
  cur() { return state.profiles.find(p => p.id === state.current) || null; },
  touch(p) { p.updated = Date.now(); S.save(); },
  add(name) { const p = newProfile(name); state.profiles.push(p); state.current = p.id; S.save(); return p; },
  remove(id) { state.profiles = state.profiles.filter(p => p.id !== id); if (!state.deleted.includes(id)) state.deleted.push(id); if (state.current === id) state.current = null; S.save(); },
  // progress score of one child: used to keep the better copy when cloud and device differ
  score: p => (p.xp || 0) * 2 + (p.stars || 0) + Object.values(p.lessons || {}).reduce((a, l) => a + (l.best || 0) * 5, 0) + Object.values(p.chars || {}).reduce((a, c) => a + (c.best || 0) * 5, 0),
  // merge two saves child by child (ids); a child deleted on either side stays deleted
  merge(a, b) {
    const del = Array.from(new Set([...(a.deleted || []), ...(b.deleted || [])]));
    const by = {};
    [...(a.profiles || []), ...(b.profiles || [])].forEach(p => {
      if (del.includes(p.id)) return;
      const o = by[p.id];
      if (!o) by[p.id] = p;
      else { const sp = S.score(p), so = S.score(o); if (sp > so || (sp === so && (p.updated || 0) > (o.updated || 0))) by[p.id] = p; }
    });
    const profiles = Object.values(by).sort((x, y) => (x.created || 0) - (y.created || 0));
    return { app: "panda-pinyin", v: 1, profiles, deleted: del, current: a.current && by[a.current] ? a.current : null };
  }
};
})();
