/* 🌐 Helper language (the non-Chinese text). Chinese characters and pinyin never change.
   Each language is ONE file in js/i18n/<code>.js that calls PP.addLang(code, { name, flag }, { "English text": "translation" }).
   Keys are the English text itself, so a missing or empty translation always falls back to English (never blank).
   tools/build_sw.py adds every js/i18n/*.js file to index.html automatically. */
(function () {
const PP = window.PP = window.PP || {};
const DKEY = "pandaPinyin.lang";          // device default (used before a child is picked); each child also keeps p.lang
const LANGS = PP.LANGS = {};
const seen = PP._i18nSeen = new Set();    // every key looked up (the test checks they're all translated)
PP.addLang = (code, meta, strings) => { LANGS[code] = Object.assign({ code, strings: strings || {} }, meta); };
PP.lang = () => {
  const p = PP.langMode !== "device" && PP.Store && PP.Store.cur && PP.Store.cur();   // the picker screen uses the device language
  let l = (p && p.lang) || localStorage.getItem(DKEY) || "en";
  return LANGS[l] ? l : "en";
};
PP.deviceLang = () => LANGS[localStorage.getItem(DKEY)] ? localStorage.getItem(DKEY) : "en";
PP.setLang = (code, p) => {
  if (!LANGS[code]) return;
  localStorage.setItem(DKEY, code);
  if (p) { p.lang = code; PP.Store.touch(p); }
};
PP.t = (en, vars) => {
  seen.add(en);
  const d = (LANGS[PP.lang()] || {}).strings || {};
  let s = d[en];
  if (s == null || s === "") s = en;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] != null ? vars[k] : m);
  return s;
};
PP.missing = code => [...seen].filter(k => /[A-Za-z]{2}/.test(k) && !((LANGS[code] || {}).strings || {})[k]);
})();
