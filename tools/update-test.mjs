/* A new version must reach the page without anyone clearing caches: publish a change, open the page again,
   and check the new files are in use within 90 s (Firefox: 1 to 3 s, Chrome: up to a minute), in both browsers. Needs tools/serve.mjs running.
   node tools/update-test.mjs http://127.0.0.1:5391/litania/      (it edits js/mic.js for a moment and puts it back) */
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process"; import { fileURLToPath } from "node:url";
import { launch, SILENT } from "./pw.mjs";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), ".."), base = process.argv[2] || "http://127.0.0.1:5391/litania/";
const file = path.join(root, "js", "mic.js"), orig = fs.readFileSync(file, "utf8");
const publish = text => { fs.writeFileSync(file, text); execFileSync(process.execPath, [path.join(root, "tools", "sw.mjs")]); };
let pw; try { pw = await import("playwright"); } catch { pw = await import("file:///C:/nvm4w/nodejs/node_modules/@playwright/mcp/node_modules/playwright/index.mjs"); }
let bad = 0;
try {
  for (const kind of ["chrome", "firefox"]) {
    const b = kind === "chrome" ? await launch() : await pw.firefox.launch({ firefoxUserPrefs: { "media.volume_scale": "0.0" } });
    const ctx = await b.newContext(); await ctx.addInitScript(SILENT);
    const p = await ctx.newPage(), errs = []; p.on("pageerror", e => errs.push(e.message));
    await p.goto(base + "?teacher"); await p.waitForFunction(() => window.EC);
    await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await p.reload(); await p.waitForFunction(() => window.EC && navigator.serviceWorker.controller && window.voxSW);
    const mark = "/* update " + Date.now() + " */";
    publish(orig + mark + "\n");
    /* what a person does: opens the page again. The browser checks sw.js on every navigation; the new worker takes over
       and the page reloads itself onto the new files */
    await p.goto(base + "?teacher");
    const t0 = Date.now(); let fresh = false;
    while (!fresh && Date.now() - t0 < (+process.env.WAIT || 90) * 1000   /* Chrome may hold the update until the worker is idle: 15 to 60 s seen */) {
      await p.waitForTimeout(1000);
      try { fresh = String(await p.evaluate(() => window.EC ? fetch("js/mic.js").then(r => r.text()) : "")).includes(mark); } catch (e) {}
    }
    console.log(`${fresh ? "ok  " : "FAIL"}  ${kind}: new version in use ${fresh}, after ${Math.round((Date.now() - t0) / 1000)} s${errs.length ? "  errors: " + errs.join(" | ") : ""}`);
    if (!fresh) bad++;
    publish(orig);
    await b.close();
  }
} finally { publish(orig); }
console.log(bad ? bad + " failed" : "updates arrive by themselves");
process.exit(bad ? 1 : 0);
