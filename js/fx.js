/* fx.js: motion for vox. Cogitator drum counters, the decode of a transmission, gold motes in the air,
   the card flung off the table, the swipe, the ceremony of a new rank, the purge of a fading phrase.
   Everything here stands down under prefers-reduced-motion and stops while the tab is hidden. */
(function () {
"use strict";
const F = window.VOXFX = {};
const calm = matchMedia("(prefers-reduced-motion: reduce)");
F.calm = () => calm.matches;

/* ---------- drum counters: two-half flip digits, settle once from noise, then flip on change ---------- */
function paint(c, ch) { c.dataset.c = ch; c.classList.toggle("sep", !/[0-9]/.test(ch)); c.querySelectorAll("b").forEach(b => { b.textContent = ch; }); }
function cell(ch) {
  const c = document.createElement("span"); c.className = "fl"; c.setAttribute("aria-hidden", "true");
  c.innerHTML = `<i class="u"><b></b></i><i class="l"><b></b></i><i class="fu"><b></b></i><i class="fb"><b></b></i>`; paint(c, ch); return c;
}
/* c._target is always the latest value; a flip in flight chains to it when it lands, so a quick change never leaves a stale half */
function flipTo(c, ch, delay) {
  c._target = ch;
  if (calm.matches || !c.animate || document.hidden) { paint(c, ch); return; }
  if (c._busy) return;
  const fu = c.querySelector(".fu"), fb = c.querySelector(".fb"), u = c.querySelector(".u b"), l = c.querySelector(".l b");
  const run = () => {
    const to = c._target, from = c.dataset.c; if (c._busy || to === from) return;
    c._busy = true; c.classList.toggle("sep", !/[0-9]/.test(to)); u.textContent = to; fu.firstChild.textContent = from; fb.firstChild.textContent = to; c.dataset.c = to; fu.style.display = "block";
    const a = fu.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(-90deg)" }], { duration: 110, easing: "ease-in", fill: "forwards" });
    a.onfinish = () => { fu.style.display = "none"; fb.style.display = "block";
      const b = fb.animate([{ transform: "rotateX(90deg)" }, { transform: "rotateX(0deg)" }], { duration: 120, easing: "cubic-bezier(.3,1.6,.5,1)", fill: "forwards" });
      b.onfinish = () => { l.textContent = to; fb.style.display = "none"; a.cancel(); b.cancel(); c._busy = false; if (c._target !== to) flipTo(c, c._target); }; };
  };
  delay ? setTimeout(run, delay) : run();
}
F.syncFlap = el => {
  const txt = el.dataset.text || "", chars = [...txt];
  if (!el._ready) {
    el._ready = true; el.textContent = "";
    chars.forEach((ch, i) => { const c = cell(ch); el.appendChild(c);
      if (!calm.matches && /\d/.test(ch)) { paint(c, String((i * 7 + 3) % 10)); flipTo(c, ch, 160 + i * 110); } });
    return;
  }
  let cells = el.querySelectorAll(".fl");
  if ([...cells].map(c => c.dataset.c).join("") === txt) return;
  cells.forEach((c, i) => { if (i >= chars.length) c.remove(); });
  cells = el.querySelectorAll(".fl");
  chars.forEach((ch, i) => { if (cells[i]) flipTo(cells[i], ch, i * 40); else el.appendChild(cell(ch)); });
};
F.flap = (id, text, cls, label) => `<span class="flap ${cls || ""}"${id ? ` id="${id}"` : ""} data-static data-text="${EC.esc(text)}" role="img" aria-label="${EC.esc(label || text)}"></span>`;
/* morph updates attributes even on data-static nodes, so data-text always holds the value to show */
F.flaps = root => (root || document).querySelectorAll(".flap").forEach(F.syncFlap);

/* ---------- numbers that count up once, the first time they are drawn ---------- */
F.counts = () => document.querySelectorAll("[data-count]").forEach(el => {
  const to = +el.dataset.count; if (el._n === to) return;
  const from = el._n == null ? 0 : el._n; el._n = to;
  if (calm.matches || !isFinite(to) || document.hidden || from === to) { el.textContent = to + (el.dataset.suf || ""); return; }
  const t0 = performance.now(), d = Math.min(900, 300 + Math.abs(to - from) * 30);
  const step = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e) + (el.dataset.suf || ""); if (k < 1 && el._n === to) requestAnimationFrame(step); };
  requestAnimationFrame(step);
});

/* ---------- a transmission decodes: letters settle from cogitator noise, left to right ---------- */
const GLY = "▚▞▛▜▙▟░▒#%&@*+=<>/\\ΞΔΣΩ01";
F.decode = (el, ms = 420) => {
  if (!el || calm.matches) return;
  const final = el.textContent, n = final.length, t0 = performance.now();
  el.setAttribute("aria-label", final);
  const step = t => {
    if (!el.isConnected) return;
    const k = Math.min(1, (t - t0) / ms), fixed = Math.floor(k * n * 1.15);
    let s = ""; for (let i = 0; i < n; i++) s += i < fixed || final[i] === " " ? final[i] : GLY[(Math.random() * GLY.length) | 0];
    el.textContent = s; if (k < 1) requestAnimationFrame(step); else { el.textContent = final; el.removeAttribute("aria-label"); }
  };
  requestAnimationFrame(step);
};

/* ---------- a card flung off the table: a clone flies, the real DOM moves on at once ---------- */
F.fling = (el, dir) => {
  if (!el || calm.matches || !el.animate) return;
  const saved = el.style.transform; el.style.transform = "";
  const r = el.getBoundingClientRect(), c = el.cloneNode(true); el.style.transform = saved;
  c.classList.add("flung"); c.removeAttribute("data-key"); c.querySelectorAll("[id]").forEach(x => x.removeAttribute("id"));
  c.style.transform = ""; c.style.transition = "";
  Object.assign(c.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", margin: 0, zIndex: 70, pointerEvents: "none" });
  c.querySelectorAll("canvas").forEach(x => x.remove());
  document.body.appendChild(c);
  const dx = dir === "l" ? -1 : dir === "r" ? 1 : 0, dy = dir === "u" ? -1 : dir === "d" ? 1 : 0;
  const cur = el._drag || { x: 0, rot: 0 };
  c.animate([{ transform: `translate(${cur.x}px,0) rotate(${cur.rot}deg)`, opacity: 1 },
    { transform: `translate(${dx * innerWidth * .9 + cur.x}px,${dy * 260 + (dx ? 40 : 0)}px) rotate(${dx * 18 + cur.rot}deg)`, opacity: 0 }],
    { duration: 380, easing: "cubic-bezier(.4,.1,.8,.4)" }).onfinish = () => c.remove();
};

/* ---------- swipe a revealed card: left Забыл, right Помню ---------- */
F.swipe = (el, o) => {
  if (!el || el._sw) return; el._sw = true;
  let x0 = 0, y0 = 0, id = null, dx = 0, lock = null;
  const set = (x, done) => { const rot = x / 18; el._drag = { x, rot }; el.style.transform = x ? `translateX(${x}px) rotate(${rot}deg)` : ""; el.style.setProperty("--sw", Math.max(-1, Math.min(1, x / o.dist())).toFixed(3)); if (done) el.style.transition = ""; };
  el.addEventListener("pointerdown", e => { if (!o.enabled() || e.button > 0 || e.target.closest("button,a,input")) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; lock = null; el.style.transition = "none"; });
  el.addEventListener("pointermove", e => {
    if (e.pointerId !== id) return; const mx = e.clientX - x0, my = e.clientY - y0;
    if (!lock && Math.hypot(mx, my) > 8) { lock = Math.abs(mx) > Math.abs(my) * 1.2 ? "x" : "y"; if (lock === "x") try { el.setPointerCapture(id); } catch (err) {} }
    if (lock !== "x") return; e.preventDefault(); dx = mx; set(dx);
    const k = Math.abs(dx) / o.dist(); if (k >= 1 && !el._armed) { el._armed = true; o.armed && o.armed(); } else if (k < 1) el._armed = false;
  });
  const end = e => {
    if (e.pointerId !== id) return; id = null;
    const k = dx / o.dist();
    if (lock === "x" && Math.abs(k) >= 1) { o.commit(k < 0 ? "l" : "r"); }
    el.style.transition = "transform .25s cubic-bezier(.2,1.4,.4,1)"; set(0, true); el._drag = null; el._armed = false; lock = null;
  };
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
};

/* ---------- motes: gold dust and embers drifting up through the whole screen ---------- */
let cv = null, g = null, motes = [], raf = 0, last = 0, mood = "gold";
function seed(n) { motes = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), r: .5 + Math.random() * 1.6, v: .004 + Math.random() * .012, w: Math.random() * 6.28, a: .15 + Math.random() * .45 })); }
function frame(t) {
  raf = 0; if (!cv || document.hidden || calm.matches) return;
  if (t - last < 33) { raf = requestAnimationFrame(frame); return; }
  const dt = Math.min(.1, (t - last) / 1000 || .033); last = t;
  const w = cv.width, h = cv.height, dpr = cv._dpr; g.clearRect(0, 0, w, h);
  for (const m of motes) {
    m.y -= m.v * dt * 6; m.w += dt * .8; m.x += Math.sin(m.w) * .0004;
    if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
    const px = m.x * w, py = m.y * h, fl = .6 + .4 * Math.sin(t / 700 + m.w * 3);
    const col = mood === "warp" ? `rgba(200,140,255,${m.a * fl})` : `rgba(255,214,130,${m.a * fl})`;
    g.fillStyle = col; g.shadowColor = col; g.shadowBlur = 6 * dpr;
    g.beginPath(); g.arc(px, py, m.r * dpr, 0, 6.283); g.fill();
  }
  raf = requestAnimationFrame(frame);
}
function size() { if (!cv) return; const dpr = Math.min(1.5, devicePixelRatio || 1); cv._dpr = dpr; cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); }
F.motes = (on, n = 38) => {
  if (!on || calm.matches) { if (cv) { cancelAnimationFrame(raf); raf = 0; cv.remove(); cv = null; } return; }
  if (!cv) { cv = document.createElement("canvas"); cv.className = "motes"; cv.setAttribute("aria-hidden", "true"); document.body.prepend(cv); g = cv.getContext("2d"); size(); seed(n); }
  if (!raf) raf = requestAnimationFrame(frame);
};
F.mood = m => { mood = m; };
addEventListener("resize", size);
document.addEventListener("visibilitychange", () => { if (!document.hidden && cv && !raf) raf = requestAnimationFrame(frame); });

/* ---------- burst: sparks from a point, for a purge or a seal ---------- */
F.burst = (x, y, o = {}) => {
  if (calm.matches) return;
  const n = o.n || 18, box = document.createElement("div"); box.className = "burst" + (o.cls ? " " + o.cls : ""); box.setAttribute("aria-hidden", "true");
  box.style.left = x + "px"; box.style.top = y + "px";
  for (let i = 0; i < n; i++) { const s = document.createElement("i"), a = Math.random() * 6.283, d = 40 + Math.random() * (o.r || 90);
    s.style.setProperty("--x", (Math.cos(a) * d).toFixed(1) + "px"); s.style.setProperty("--y", (Math.sin(a) * d - 20).toFixed(1) + "px"); s.style.animationDelay = (Math.random() * 80) + "ms"; box.appendChild(s); }
  if (o.label) { const b = document.createElement("b"); b.innerHTML = o.label; box.appendChild(b); }
  document.body.appendChild(box); setTimeout(() => box.remove(), o.label ? 1500 : 1100);
};

/* ---------- screen change: the View Transitions API where the browser has it ---------- */
F.swap = fn => { if (calm.matches || !document.startViewTransition || document.hidden) { fn(); return; } try { const t = document.startViewTransition(fn), no = () => {}; t.ready.catch(no); t.finished.catch(no); t.updateCallbackDone.catch(no); } catch (e) { fn(); } };

/* ---------- an overlay for the big moments: a new rank, the week's world cleared ---------- */
/* html may hold a [data-open] button: the overlay starts sealed, and opening it calls onOpen (a user gesture, so sound may play) */
F.ceremony = (html, onOpen) => new Promise(done => {
  const o = document.createElement("div"); o.className = "ceremony"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Новое звание");
  o.innerHTML = `<div class="rays" aria-hidden="true"></div><div class="cer-in">${html}</div>`;
  document.body.appendChild(o); document.body.classList.add("cer-lock");
  const opener = o.querySelector("[data-open]"), btn = o.querySelector("[data-close]");
  if (!opener) o.classList.add("opened");
  const focus = () => { const t = o.classList.contains("opened") ? btn : opener; if (t) t.focus(); };
  setTimeout(focus, 60);
  const open = () => { if (o.classList.contains("opened")) return; o.classList.add("opened"); if (onOpen) onOpen(); setTimeout(focus, calm.matches ? 0 : 700); };
  const close = () => { o.classList.add("out"); document.body.classList.remove("cer-lock"); setTimeout(() => o.remove(), calm.matches ? 0 : 420); document.removeEventListener("keydown", key, true); done(); };
  const key = e => { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "Enter" || e.code === "Space") { e.preventDefault(); e.stopPropagation(); o.classList.contains("opened") ? close() : open(); } else if (e.key === "Tab") { e.preventDefault(); focus(); } };
  document.addEventListener("keydown", key, true);
  o.addEventListener("click", e => { if (e.target.closest("[data-close]")) close(); else if (e.target.closest("[data-open]")) open(); });
});
})();
