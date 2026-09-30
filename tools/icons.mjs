/* Renders the app icons from the chapter emblem drawn in js/art.js.
   node tools/icons.mjs     writes icons/icon.svg, icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png */
import fs from "node:fs"; import path from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
import { launch } from "./pw.mjs";
const browser = await launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, "index.html")).href + "?demo");
await page.waitForFunction(() => window.VOXART);
const emblem = await page.evaluate(() => VOXART.emblem(512, "ic").replace('class="emblem" ', 'xmlns="http://www.w3.org/2000/svg" '));
fs.mkdirSync(path.join(root, "icons"), { recursive: true });
fs.writeFileSync(path.join(root, "icons", "icon.svg"), emblem.replace(/\s*\n\s*/g, " "));
/* bg: the tile behind the emblem; pad: how much of the tile the emblem fills */
const shots = [["icon-192.png", 192, null, 1], ["icon-512.png", 512, null, 1], ["maskable-512.png", 512, "#0c1838", .66], ["apple-touch-icon.png", 180, "#0c1838", .82]];
for (const [name, size, bg, k] of shots) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg ? `radial-gradient(circle at 50% 40%,#1c3470,${bg} 75%)` : "transparent"}">
    <div style="width:${Math.round(size * k)}px;height:${Math.round(size * k)}px">${emblem.replace(/width="512" height="512"/, 'width="100%" height="100%"')}</div></body></html>`);
  await page.screenshot({ path: path.join(root, "icons", name), omitBackground: !bg });
}
await browser.close();
console.log("icons written");
