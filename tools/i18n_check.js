// Lists every helper-language text the game can show and which ones a language file is missing.
// Usage: node tools/i18n_check.js vi        (exit 1 if anything is missing)   node tools/i18n_check.js vi --keys  (print all keys)
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { localStorage: { getItem: () => null, setItem() {} } }; ctx.window = ctx; vm.createContext(ctx);
for (const f of ["js/data.js", "js/i18n.js", ...fs.readdirSync(path.join(root, "js/i18n")).map(f => "js/i18n/" + f)])
  vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx);
const L = ctx.PP;
const keys = new Set();
const add = k => k && /[A-Za-z]{2}/.test(k) && keys.add(k);
L.LESSONS.forEach(l => { add(l.en); add(l.intro); l.learn.forEach(c => add(c.tip)); });
L.TONES.slice(1).forEach(x => { add(x.en); add(x.hint); });
L.CHARS.forEach(c => add(c.en));
L.CHAR_SETS.slice(1).forEach(s => add(s.en.split(" · ")[1]));
L.BADGES.forEach(b => !b.set && add(b.en));
L.SKINS.forEach(s => add(s.en));
[...L.PRAISE, ...L.KIND].forEach(x => add(x[1]));
["Baby", "Cutie", "Little Learner", "Little Teacher", "Pinyin Champ", "Guest", "Device only", "Connecting…", "Saving…", "Cloud saved", "Offline"].forEach(add);
for (const f of ["js/app.js", "js/cloud.js"]) {
  const src = fs.readFileSync(path.join(root, f), "utf8");
  for (const m of src.matchAll(/\bt\(\s*"((?:[^"\\]|\\.)*)"/g)) add(JSON.parse('"' + m[1] + '"'));
}
keys.delete("Guest");
const code = process.argv[2] || "vi", dict = (L.LANGS[code] || {}).strings || {};
if (process.argv.includes("--keys")) { console.log(JSON.stringify([...keys], null, 1)); process.exit(0); }
const missing = [...keys].filter(k => !dict[k]);
const extra = Object.keys(dict).filter(k => !keys.has(k));
// placeholders must match: {n} in English must also be in the translation
const ph = [...keys].filter(k => dict[k] && (k.match(/\{\w+\}/g) || []).sort().join() !== (dict[k].match(/\{\w+\}/g) || []).sort().join());
console.log(`${code}: ${keys.size} texts, ${missing.length} missing, ${extra.length} unused, ${ph.length} placeholder mismatches`);
missing.forEach(k => console.log("  MISSING " + JSON.stringify(k)));
extra.forEach(k => console.log("  unused  " + JSON.stringify(k)));
ph.forEach(k => console.log("  PLACEHOLDER " + JSON.stringify(k)));
process.exit(missing.length || ph.length ? 1 : 0);
