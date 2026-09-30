/* Checks the things only a real http origin can show: the service worker, opening with no signal, the entry redirects.
   Start tools/serve.mjs first, then: node tools/offline-test.mjs http://localhost:5290/litania/ */
import { launch } from "./pw.mjs";
const base = process.argv[2] || "http://localhost:5290/litania/";
const browser = await launch();
let bad = 0; const check = (name, ok, extra) => { console.log((ok ? "ok    " : "FAIL  ") + name + (extra ? "  " + extra : "")); if (!ok) bad++; };
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage(), errs = [];
page.on("pageerror", e => errs.push(e.message)); page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });

await page.goto(base);
check("bare address opens his side", await page.evaluate(() => EC.HIM && document.body.dataset.role === "student"), await page.evaluate(() => location.hash));
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(1500);
const cached = await page.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open(ks[0]); return (await c.keys()).length; });
check("service worker cached the app", cached > 40, cached + " files");

await ctx.setOffline(true);
await page.reload(); await page.waitForTimeout(1200);
check("opens with no signal", await page.evaluate(() => !!document.querySelector(".vx-s .sbar")));
const fonts = await page.evaluate(async () => { await document.fonts.ready; const r = []; for (const f of ["Spectral", "Spectral SC", "IBM Plex Mono"]) { try { r.push((await document.fonts.load(`600 16px "${f}"`, "Жж Aa")).length > 0); } catch (e) { r.push(false); } } return r; });
check("fonts load with no signal", fonts.every(Boolean), fonts.join(","));
const img = await page.evaluate(() => { const i = document.querySelector(".fig img"); return i ? i.complete && i.naturalWidth > 0 : null; });
check("artwork loads with no signal", img !== false, String(img));
await page.evaluate(() => go("cards")); await page.waitForTimeout(400);
check("cards work with no signal", await page.evaluate(() => !!document.querySelector(".vx-cards")));
await ctx.setOffline(false);

await page.goto("about:blank"); await page.goto(base + "#7"); await page.waitForTimeout(600);
check("old short link #7 opens week 7", await page.evaluate(() => EC.HIM && EC.S.week === 6), await page.evaluate(() => location.hash));
await page.goto(base + "?teacher"); await page.waitForTimeout(600);
check("?teacher opens the teacher side", await page.evaluate(() => !EC.HIM && document.body.dataset.role === "teacher"));
const link = await page.evaluate(() => EC.hisLink());
check("his link points at this address", /#him\d+-/.test(link) && link.indexOf(base) === 0, link);
check("no sync promise without a server", await page.evaluate(() => { EC.S.changedAt = Date.now(); return EC.syncState().show === false; }));
check("console clean", !errs.filter(e => !/net::ERR_INTERNET_DISCONNECTED/.test(e)).length, errs.join(" | ").slice(0, 300));
await browser.close();
console.log(bad ? bad + " failed" : "offline checks pass");
process.exit(bad ? 1 : 0);
