/* End to end through the real server: the teacher records a phrase, his phone downloads it by itself,
   he answers a card, the teacher's page reads his report. Writes to the real store; delete test data afterwards.
   TEACHER_KEY=... node tools/sync-test.mjs [base]      base defaults to http://localhost:5290/litania/ (tools/serve.mjs) */
import { launch } from "./pw.mjs";
const base = process.argv[2] || "http://localhost:5290/litania/", key = process.env.TEACHER_KEY;
if (!key) { console.log("set TEACHER_KEY"); process.exit(2); }
const local = !/github\.io/.test(base);
const browser = await launch(); let bad = 0;
const check = (name, ok, extra) => { console.log((ok ? "ok    " : "FAIL  ") + name + (extra ? "  " + extra : "")); if (!ok) bad++; };
async function open(tail) {
  const ctx = await browser.newContext({ permissions: ["microphone"] }), page = await ctx.newPage(), errs = [];
  page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
  await page.goto(base + tail); await page.waitForFunction(() => window.EC && window.go);
  if (local) await page.evaluate(() => { EC.SYNC = "always"; });
  return { ctx, page, errs };
}
const until = async (page, fn, ms = 20000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn)) return true; await page.waitForTimeout(400); } return false; };

/* teacher: key, one recording, upload */
const T = await open("?teacher");
await T.page.evaluate(k => { go("settings"); document.getElementById("tkey").value = k; }, key);
await T.page.click('[data-act="setKey"]');
await T.page.evaluate(() => { go("bank"); EC.voice.rec("t:0-0"); }); await T.page.waitForTimeout(1800); await T.page.evaluate(() => EC.voice.stop());
check("teacher recording exists", await until(T.page, () => EC.voice.has("t:0-0")));
await T.page.evaluate(() => EC.voice.syncNow());
check("teacher recording reached the server", await until(T.page, () => EC.voice.sinfo().pending === 0 && !EC.voice.sinfo().err), await T.page.evaluate(() => EC.voice.sline()));

/* his phone: downloads the clip by itself, answers a card, the report goes */
const S = await open("#him1");
await S.page.evaluate(() => EC.voice.syncNow());
check("his phone downloaded the teacher's clip", await until(S.page, () => EC.voice.has("t:0-0")), await S.page.evaluate(() => EC.voice.sline()));
await S.page.evaluate(() => go("cards")); await S.page.keyboard.press("Space"); await S.page.waitForTimeout(300); await S.page.keyboard.press("3");
await S.page.evaluate(() => EC.sync());
check("his report was sent", await until(S.page, () => EC.syncState().show && !EC.syncState().pending), await S.page.evaluate(() => EC.syncState().text));

/* teacher reads it */
await T.page.evaluate(() => { go("his"); return EC.pullRep(); });
check("teacher reads his report", await until(T.page, () => EC.report().has && EC.report().daysAgo === 0), await T.page.evaluate(() => JSON.stringify(EC.report().cards || {}).slice(0, 80)));
check("consoles clean", !T.errs.length && !S.errs.length, T.errs.concat(S.errs).join(" | ").slice(0, 300));
await browser.close();
console.log(bad ? bad + " failed" : "sync works end to end");
process.exit(bad ? 1 : 0);
