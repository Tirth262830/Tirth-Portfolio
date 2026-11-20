// Run: node tests/ask.test.mjs
// Checks that the "Ask Tirth" assistant picks the right fact for real questions,
// answers every suggestion chip, and refuses questions the site can't answer.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const ctx = { window: {}, globalThis: {} };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ["assets/data.js", "assets/ask.js"]) vm.runInContext(readFileSync(new URL(`../${f}`, import.meta.url), "utf8"), ctx);
const S = ctx.window.SITE;
const engine = ctx.window.AskEngine.create(S.facts, { unknown: S.unknown });

// the chips shown in the panel must all be answered
const chips = readFileSync(new URL("../assets/v2.js", import.meta.url), "utf8").match(/const SUGGEST = \[(.*?)\]/)[1]
  .match(/"([^"]+)"/g).map((s) => s.slice(1, -1));

const cases = [
  // suggestion chips
  ["What does he do now?", "now"],
  ["Best AI project?", "webmcp"],
  ["What's his stack?", "skills"],
  ["Education?", "edu"],
  ["How do I contact him?", "contact"],
  // current work
  ["What is he working on currently?", "now"],
  ["where does he work", "now"],
  ["what's his current job", "now"],
  ["What is Keel?", "now"],
  ["what does tirth do at evently", "now"],
  ["current role?", "now"],
  // other jobs
  ["Tell me about the Ion Exchange internship", "ion"],
  ["did he work as a data analyst", "ion"],
  ["What did he do at YO4GIS?", "yo4gis"],
  ["web developer internship", "yo4gis"],
  ["How much experience does he have?", "exp"],
  ["work history", "exp"],
  // projects
  ["What projects has he built?", "projects"],
  ["show me his projects", "projects"],
  ["What is WebMcp.AI?", "webmcp"],
  ["tell me about the openai challenge", "webmcp"],
  ["what is he most proud of", "webmcp"],
  ["Has he used YOLO?", "ppe"],
  ["any computer vision work?", "ppe"],
  ["helmet detection", "ppe"],
  ["forest fire project", "forest"],
  ["Has he built a machine learning model?", "forest"],
  ["Ghar.com", "ghar"],
  ["airbnb clone", "ghar"],
  ["expense tracker", "expense"],
  ["Power BI dashboard", "powerbi"],
  // skills
  ["What languages does he know?", "skills"],
  ["what technologies does he use", "skills"],
  ["Does he know Python?", "python"],
  ["Is he good with React?", "web"],
  ["frontend or backend?", "web"],
  ["Does he do AI?", "ai"],
  ["experience with LLMs?", "ai"],
  ["agentic workflows", "ai"],
  // education, certs
  ["Where did he study?", "edu"],
  ["What's his CGPA?", "edu"],
  ["which college", "edu"],
  ["Any certifications?", "certs"],
  ["Deloitte simulation", "certs"],
  // contact, location, resume, misc
  ["What's his email?", "contact"],
  ["I want to hire him", "contact"],
  ["Where is he based?", "where"],
  ["Where is he from?", "where"],
  ["Can I see his resume?", "resume"],
  ["download cv", "resume"],
  ["Who is Tirth?", "who"],
  ["tell me about yourself", "who"],
  ["how was this website built", "site"],
  // phrasings first tried after tuning (kept so they stay fixed)
  ["what company does he work for", "now"],
  ["is he employed right now", "now"],
  ["any internships?", "exp"],
  ["his coolest project", "webmcp"],
  ["is he a fresher", "exp"],
  ["does he know typescript", "web"],
  ["when did he graduate", "edu"],
  ["how can i get in touch", "contact"],
  ["which city is he in", "where"],
  ["object detection experience", "ppe"],
  ["has he deployed anything on aws", "forest"],
  ["what's ion exchange", "ion"],
  // things the site does not know: must refuse, not guess
  ["What is his salary expectation?", null],
  ["Is he married?", null],
  ["What's the weather in Paris?", null],
  ["Write me a poem", null],
  ["what is his age", null],
  ["does he know rust", null],
  ["is he open to relocation", null],
  ["What's his phone number?", "contact"],
];

let fail = 0;
for (const [q, want] of cases) {
  const r = engine.answer(q);
  const got = r.kind === "fact" ? r.id : null;
  if (got !== want) {
    fail++;
    const top = engine.rank(q).slice(0, 3).map((x) => `${x.f.id}:${x.s.toFixed(2)}`).join(" ");
    console.log(`FAIL  "${q}"  want=${want} got=${got}  tokens=[${engine.tokens(q)}]  top=${top}`);
  }
}
for (const c of chips) {
  if (engine.answer(c).kind !== "fact") { fail++; console.log(`FAIL  chip "${c}" is not answered`); }
}
for (const g of ["hi", "Hello!", "thanks"]) {
  if (!["greeting", "thanks"].includes(engine.answer(g).kind)) { fail++; console.log(`FAIL  "${g}" not treated as small talk`); }
}
console.log(`\n${cases.length + chips.length + 3 - fail}/${cases.length + chips.length + 3} passed`);
process.exit(fail ? 1 : 0);
