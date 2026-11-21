// Merges the files in content/ into public/scams.json and checks them.
// Run by hand:  node scripts/build-content.js
// wrangler runs it for you before "wrangler dev" and "wrangler deploy" (see wrangler.jsonc).
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "content");
const out = path.join(__dirname, "..", "public", "scams.json");
const LANGS = ["en", "zh", "es", "ko"];
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

const meta = read("meta.json");
const signs = read("signs.json");
const files = fs.readdirSync(dir).filter((f) => /^\d\d-.*\.json$/.test(f)).sort();
const scenarios = files.flatMap(read);
const errors = [];
const err = (m) => errors.push(m);

for (const [k, s] of Object.entries(signs))
  for (const f of ["title", "desc", "tip"])
    for (const l of LANGS) if (!s[f] || !s[f][l]) err(`sign ${k}.${f}.${l} is missing`);

const ids = new Set();
for (const s of scenarios) {
  if (ids.has(s.id)) err(`duplicate id ${s.id}`);
  ids.add(s.id);
  const langs = LANGS.filter((l) => s.message && s.message[l]);
  if (!langs.includes("en")) err(`${s.id}: English message is required`);
  if (s.sample_data !== true) err(`${s.id}: sample_data must be true`);
  if (!Array.isArray(s.hints) || s.hints.length !== 2) err(`${s.id}: needs exactly 2 hints`);
  if (s.is_scam && !(s.signs || []).length) err(`${s.id}: a scam needs warning signs`);
  for (const k of s.signs || []) if (!signs[k]) err(`${s.id}: unknown sign ${k}`);
  if (s.friend) {
    // "Help a friend" scenarios also need a question, three choices and a "what to do" text.
    if (!s.choices || ["unsafe", "safe", "unsure"].some((k) => !s.choices.find((c) => c.kind === k)))
      err(`${s.id}: friend scenario needs choices with kinds unsafe, safe and unsure`);
    for (const l of langs) {
      for (const f of ["question", "gist", "dowhat"]) if (!s[f] || !s[f][l]) err(`${s.id}: ${f}.${l} is missing`);
      for (const c of s.choices || []) if (!c.t[l]) err(`${s.id}: choice ${c.kind}.${l} is missing`);
    }
  }
  for (const h of s.hints || []) if (h.sign && !s.signs.includes(h.sign)) err(`${s.id}: hint sign ${h.sign} not in signs`);
  for (const l of langs) {
    if (!s.sender || !s.sender[l]) err(`${s.id}: sender.${l} is missing`);
    if (!s.explanation || !s.explanation[l]) err(`${s.id}: explanation.${l} is missing`);
    if (s.context && !s.context[l]) err(`${s.id}: context.${l} is missing`);
    (s.hints || []).forEach((h, i) => { if (!h[l]) err(`${s.id}: hints[${i}].${l} is missing`); });
    if (s.is_scam) {
      const marks = (s.marks && s.marks[l]) || [];
      if (!marks.length) err(`${s.id}: marks.${l} is empty`);
      for (const m of marks) {
        if (!s.message[l].includes(m.t)) err(`${s.id}: mark "${m.t}" is not in message.${l}`);
        if (!signs[m.s]) err(`${s.id}: mark sign ${m.s} unknown`);
      }
    } else if (!(s.reasons || []).length || s.reasons.some((r) => !r[l])) {
      err(`${s.id}: reasons.${l} is missing`);
    }
  }
}
for (const id of meta.order) if (!ids.has(id)) err(`order lists unknown id ${id}`);
for (const id of ids) if (!meta.order.includes(id)) err(`${id} is not in meta.json "order"`);

if (errors.length) {
  console.error("CONTENT ERRORS:\n - " + errors.join("\n - "));
  process.exit(1);
}
const { order, ...metaRest } = meta;
fs.writeFileSync(out, JSON.stringify({ _meta: metaRest, signs, scenarios, order }, null, 1) + "\n");
const n = (l) => scenarios.filter((s) => s.message[l]).length;
console.log(`content ok: ${scenarios.length} scenarios (en ${n("en")}, zh ${n("zh")}, es ${n("es")}, ko ${n("ko")})`);
