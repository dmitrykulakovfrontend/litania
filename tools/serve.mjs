/* A static server for testing the app over http, the way GitHub Pages serves it (under /litania/).
   node tools/serve.mjs [port]      prints the address it took; the first free port at or above the one asked for */
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPE = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".png": "image/png",
  ".svg": "image/svg+xml", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json", ".json": "application/json" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!p.startsWith("/litania/")) { res.writeHead(302, { location: "/litania/" }); return res.end(); }
  p = p.slice("/litania".length); if (p.endsWith("/")) p += "index.html";
  const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "content-type": TYPE[path.extname(f)] || "application/octet-stream", "cache-control": "no-cache" });
  fs.createReadStream(f).pipe(res);
});
let port = +(process.argv[2] || 5290);
server.on("error", e => { if (e.code === "EADDRINUSE") server.listen(++port); else throw e; });
server.on("listening", () => console.log(`serving http://localhost:${port}/litania/  pid ${process.pid}`));
server.listen(port);
