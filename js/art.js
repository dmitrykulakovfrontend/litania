/* art.js: everything drawn for the vox design. Plain functions that return SVG strings.
   A fan tribute to a grimdark far-future setting: every shape here is drawn from scratch, no official marks. */
(function () {
"use strict";
const f = x => (Math.round(x * 10) / 10).toString();
const A = window.VOXART = {};

/* ---------- a cogwheel outline, even-odd with a hub hole ---------- */
function cog(cx, cy, ro, ri, teeth, hub) {
  const pts = [], step = Math.PI * 2 / teeth, w1 = step * .34, w2 = step * .22;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    [[a - w1, ri], [a - w2, ro], [a + w2, ro], [a + w1, ri]].forEach(([t, r]) => pts.push(f(cx + Math.cos(t) * r) + " " + f(cy + Math.sin(t) * r)));
  }
  let d = "M" + pts.join("L") + "Z";
  if (hub) d += `M${f(cx + hub)} ${f(cy)}A${hub} ${hub} 0 1 0 ${f(cx - hub)} ${f(cy)}A${hub} ${hub} 0 1 0 ${f(cx + hub)} ${f(cy)}Z`;
  return d;
}
A.cog = cog;

/* ---------- the chapter's mark: an inverted omega on a ceramite disc with a gold rim ---------- */
A.omegaPath = (cx, cy, r) => { const p = a => [cx + Math.cos(a * Math.PI / 180) * r, cy + Math.sin(a * Math.PI / 180) * r], s0 = p(218), s1 = p(322);
  return `M${f(s0[0])} ${f(s0[1])}A${r} ${r} 0 1 0 ${f(s1[0])} ${f(s1[1])}`; };
A.emblem = (size = 40, id = "e") => `<svg class="emblem" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">
  <defs><linearGradient id="${id}g" x1="0" y1="2" x2="0" y2="62" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fbe39a"/><stop offset=".5" stop-color="#d4a63a"/><stop offset="1" stop-color="#7a5a1c"/></linearGradient>
  <radialGradient id="${id}b" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#3f63b3"/><stop offset=".6" stop-color="#1c3470"/><stop offset="1" stop-color="#0c1838"/></radialGradient></defs>
  <circle cx="32" cy="32" r="30.5" fill="url(#${id}g)" stroke="#3b2a08" stroke-width="1"/><circle cx="32" cy="32" r="26.5" fill="url(#${id}b)" stroke="#3b2a08" stroke-width="1"/>
  <circle cx="32" cy="32" r="24.3" fill="none" stroke="#f0cf73" stroke-width=".7" opacity=".5"/>
  <path d="${A.omegaPath(32, 30.5, 12.5)}" fill="none" stroke="#2a1d05" stroke-width="8.4" transform="translate(0 .8)" opacity=".55"/>
  <path d="${A.omegaPath(32, 30.5, 12.5)}" fill="none" stroke="url(#${id}g)" stroke-width="6.6"/>
  <path d="M13.5 22.3h9.4M41.1 22.3h9.4" stroke="#2a1d05" stroke-width="6" transform="translate(0 .8)" opacity=".55"/><path d="M13.5 22.3h9.4M41.1 22.3h9.4" stroke="url(#${id}g)" stroke-width="4.4" stroke-linecap="square"/>
  <ellipse cx="25" cy="20" rx="9" ry="4" fill="#fff" opacity=".12" transform="rotate(-25 25 20)"/></svg>`;

/* ---------- the Imperial eagle, two heads, drawn as layered feathers ---------- */
A.aquila = (w = 120, id = "q") => {
  const L = [[21, 26, 9, 5], [25, 30, 6, 17], [29, 34, 8, 29], [33, 38, 13, 40], [37, 42, 22, 50], [41, 45, 33, 57]];
  const wing = L.map(([y1, y2, tx, ty], i) => `<path d="M55.5 ${y1}C44 ${y1 - 2} ${tx + 14} ${ty - 3} ${tx} ${ty}C${tx + 16} ${ty + 5} 45 ${y2 + 1} 55.5 ${y2}Z" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".8" opacity="${1 - i * .04}"/>`).join("");
  return `<svg class="aquila" width="${w}" height="${Math.round(w * .55)}" viewBox="0 0 120 66" aria-hidden="true">
    <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe39a"/><stop offset=".45" stop-color="#d4a63a"/><stop offset="1" stop-color="#6e5018"/></linearGradient></defs>
    <g>${wing}</g><g transform="translate(120 0) scale(-1 1)">${wing}</g>
    <path d="M57 26 49.5 15M63 26l7.5-11" stroke="url(#${id}g)" stroke-width="5.4" stroke-linecap="round"/><path d="M57 26 49.5 15M63 26l7.5-11" stroke="#3b2a08" stroke-width=".7" fill="none" opacity=".6"/>
    <circle cx="48" cy="12.5" r="6.2" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".8"/><circle cx="72" cy="12.5" r="6.2" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".8"/>
    <path d="M42.6 10.4 35 13.6l6.4.6 2.4 2.2Z" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".7"/><path d="M77.4 10.4 85 13.6l-6.4.6-2.4 2.2Z" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".7"/>
    <circle cx="46.2" cy="11.4" r="1.1" fill="#2a1d05"/><circle cx="73.8" cy="11.4" r="1.1" fill="#2a1d05"/>
    <path d="M60 19 67 33 60 53 53 33Z" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".9"/>
    <path d="M60 51 53.5 62.5 60 60.5 66.5 62.5Z" fill="url(#${id}g)" stroke="#3b2a08" stroke-width=".8"/>
    <circle cx="60" cy="33" r="5.4" fill="#1c3470" stroke="#3b2a08" stroke-width=".8"/><path d="${A.omegaPath(60, 32.6, 2.8)}" fill="none" stroke="#f0cf73" stroke-width="1.5"/></svg>`;
};

/* ---------- a purity seal: red wax with parchment tails. seed makes every one a little different ---------- */
A.seal = (seed = "s", size = 44, tails = true) => {
  const r = EC.rng("seal" + seed), pts = [], N = 22;
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, rad = 15 * (1 + (r() - .5) * .16); pts.push([22 + Math.cos(a) * rad, 20 + Math.sin(a) * rad]); }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < N; i++) { const p = pts[(i + 1) % N], q = pts[i], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; d += `Q${f(q[0])} ${f(q[1])} ${f(mx)} ${f(my)}`; }
  const t1 = -8 + r() * 6, t2 = 4 + r() * 8, gid = "w" + String(seed).replace(/\W/g, "");
  const tail = (x, rot, len) => `<g transform="translate(${x} 26) rotate(${f(rot)})"><path d="M-4 0h8l.6 ${len}-4.6-3-4.6 3Z" fill="#dccb9c" stroke="#8c7443" stroke-width=".7"/>
    <path d="M-2.6 6h5.2M-2.6 10h4.2M-2.6 14h5M-2.6 18h3.6" stroke="#5a4526" stroke-width=".7" opacity=".7"/></g>`;
  const h = tails ? 62 : 40;
  return `<svg class="seal" width="${size}" height="${Math.round(size * h / 44)}" viewBox="0 0 44 ${h}" aria-hidden="true">
    <defs><radialGradient id="${gid}" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#e2493c"/><stop offset=".55" stop-color="#a3201a"/><stop offset="1" stop-color="#5e0e0a"/></radialGradient></defs>
    ${tails ? tail(17, t1 + 8, 30 + r() * 8) + tail(27, t2 - 6, 26 + r() * 10) : ""}
    <path d="${d}Z" fill="url(#${gid})" stroke="#4a0906" stroke-width=".8"/>
    <circle cx="22" cy="20" r="9.6" fill="none" stroke="#5e0e0a" stroke-width="1.3" opacity=".8"/><circle cx="22" cy="20" r="9.6" fill="none" stroke="#f07a6a" stroke-width=".5" opacity=".45" transform="translate(-.5 -.6)"/>
    <path d="${A.omegaPath(22, 19.4, 4.6)}" fill="none" stroke="#5e0e0a" stroke-width="2.3" opacity=".9"/><path d="M15.6 16.6h3.4M25 16.6h3.4" stroke="#5e0e0a" stroke-width="1.7" opacity=".9"/>
    <ellipse cx="17.5" cy="14" rx="4.5" ry="2.4" fill="#fff" opacity=".18" transform="rotate(-28 17.5 14)"/></svg>`;
};

/* ---------- the star of Chaos: eight arrows from a ring. The enemy of memory in this app ---------- */
A.chaosStar = (cx, cy, r, col) => {
  let d = "";
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, ax = Math.cos(a), ay = Math.sin(a), x = cx + ax * r, y = cy + ay * r, h = r * .36, px = -ay, py = ax;
    d += `M${f(cx + ax * r * .32)} ${f(cy + ay * r * .32)}L${f(x)} ${f(y)}M${f(x - ax * h + px * h * .62)} ${f(y - ay * h + py * h * .62)}L${f(x)} ${f(y)}L${f(x - ax * h - px * h * .62)} ${f(y - ay * h - py * h * .62)}`;
  }
  return `<g class="cstar"><circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r * .3)}" fill="none" stroke="${col}" stroke-width="${f(r * .15)}"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${f(r * .15)}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
};
A.chaosIcon = () => `<svg class="cicon" viewBox="-12 -12 24 24" aria-hidden="true">${A.chaosStar(0, 0, 10.5, "currentColor")}</svg>`;

/* ---------- a medal for milestones ---------- */
A.medal = (n, size = 88) => `<svg class="medal" width="${size}" height="${Math.round(size * 1.25)}" viewBox="0 0 80 100" aria-hidden="true">
  <path d="M26 0h28l-6 34H32Z" fill="#1c3470"/><path d="M34 0h12l-2 34h-8Z" fill="#d4a63a"/>
  <path d="${cog(40, 64, 30, 26, 18, 0)}" fill="#c9a24d" stroke="#3b2c0e" stroke-width="1.2"/>
  <circle cx="40" cy="64" r="22" fill="#14264f" stroke="#f0cf73" stroke-width="1.4"/>
  <text x="40" y="${String(n).length > 2 ? 71 : 73}" text-anchor="middle" font-family="Spectral SC, serif" font-weight="800" font-size="${String(n).length > 2 ? 21 : 26}" fill="#e6c676">${n}</text></svg>`;

/* ---------- small icons, 24 box, stroke currentColor ---------- */
const S = `fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"`;
A.icon = {
  robot: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${cog(12, 12, 9.5, 7.6, 8, 0)}" ${S}/><circle cx="12" cy="12" r="3" ${S}/></svg>`,
  teacher: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5h3l7 4.5v-14l-7 4.5Z" ${S}/><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a7.5 7.5 0 0 1 0 11" ${S}/></svg>`,
  me: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="4" ${S}/><path d="M4.5 20.5c1.2-4 4-6 7.5-6s6.3 2 7.5 6" ${S}/></svg>`,
  rec: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6.5" fill="currentColor"/></svg>`,
  play: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5Z" fill="currentColor"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6.5" y="6.5" width="11" height="11" rx="1.5" fill="currentColor"/></svg>`,
  redo: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a7 7 0 1 0 2.1-5" ${S}/><path d="M5 4.5V9h4.5" ${S}/></svg>`,
  close: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" ${S}/></svg>`,
  gear: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${cog(12, 12, 9.5, 7.4, 10, 0)}" ${S}/><circle cx="12" cy="12" r="2.6" ${S}/></svg>`,
  back: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" ${S}/></svg>`,
  scroll: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10.5A2.5 2.5 0 0 1 20 6.5V7h-3M7 4a2.5 2.5 0 0 0-2.5 2.5V17A3 3 0 0 0 7.5 20H16a3 3 0 0 0 3-3V7" ${S}/><path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4.5" ${S}/></svg>`,
  slate: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="3" width="15" height="18" rx="2" ${S}/><rect x="7" y="6" width="10" height="8" rx=".8" ${S}/><path d="M9 17.5h6" ${S}/></svg>`,
  die: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" ${S}/><circle cx="8.2" cy="8.2" r="1.35" fill="currentColor"/><circle cx="15.8" cy="15.8" r="1.35" fill="currentColor"/><circle cx="12" cy="12" r="1.35" fill="currentColor"/><circle cx="15.8" cy="8.2" r="1.35" fill="currentColor"/><circle cx="8.2" cy="15.8" r="1.35" fill="currentColor"/></svg>`,
  route: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="18" r="2" ${S}/><path d="M8 18h5a3.5 3.5 0 0 0 0-7h-2a3.5 3.5 0 0 1 0-7h5" ${S}/><path d="M17.5 2.5l2.5 1.5-2.5 1.5" ${S}/></svg>`,
  sealic: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="6" ${S}/><path d="M9.5 14.5 8 21l2.5-1.5L12 21l.2-6M14.5 14.5 16 21l-2.5-1.5" ${S}/></svg>`,
  chart: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3" ${S}/></svg>`,
  lock: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="1.5" ${S}/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" ${S}/></svg>`,
  warn: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 21.5 20h-19Z" ${S}/><path d="M12 10v4.5M12 17.2v.3" ${S}/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" ${S}/></svg>`,
  plus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" ${S}/></svg>`,
  minus: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" ${S}/></svg>`,
  sndon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5h3l6 4.5v-14l-6 4.5Z" ${S}/><path d="M16 9.2a4 4 0 0 1 0 5.6M18.6 6.6a7.6 7.6 0 0 1 0 10.8" ${S}/></svg>`,
  sndoff: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5v5h3l6 4.5v-14l-6 4.5Z" ${S}/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" ${S}/></svg>`,
  shuffle: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3.5c2.5 0 3.8 1.5 5 4.5s2.5 5.5 5 5.5H21M3 17h3.5c1.2 0 2.2-.4 3-1.3M14 7.3c.8-.2 1.6-.3 2.5-.3H21M18 4l3 3-3 3M18 14l3 3-3 3" ${S}/></svg>`
};

/* ---------- a corner bracket for frames, as a css url ---------- */
const enc = s => "url(\"data:image/svg+xml," + encodeURIComponent(s) + "\")";
const corner = rot => enc(`<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'><g transform='rotate(${rot} 11 11)'><path d='M1.5 20.5V7L7 1.5h13.5' fill='none' stroke='#d4a63a' stroke-width='1.6'/><path d='M4.5 20.5V8.2L8.2 4.5h12.3' fill='none' stroke='#d4a63a' stroke-width='.7' opacity='.55'/><circle cx='7.4' cy='7.4' r='1.6' fill='#d4a63a'/></g></svg>`);
/* a rough edge for parchment, stretched to any box */
function rough(seed) {
  const r = EC.rng("rough" + seed), top = [], right = [], bot = [], left = [];
  for (let i = 0; i <= 40; i++) top.push([i * 2.5, .6 + r() * 1.4]);
  for (let i = 0; i <= 40; i++) right.push([98.8 - r() * 1.2, i * 2.5]);
  for (let i = 40; i >= 0; i--) bot.push([i * 2.5, 98.6 - r() * 1.8]);
  for (let i = 40; i >= 0; i--) left.push([.6 + r() * 1.2, i * 2.5]);
  const d = "M" + top.concat(right, bot, left).map(p => f(p[0]) + " " + f(p[1])).join("L") + "Z";
  return enc(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${d}' fill='#000'/></svg>`);
}
const fibre = enc(`<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .1  0 0 0 .55 0'/></filter><rect width='180' height='180' filter='url(#n)'/></svg>`);
const grain = enc(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0'/></filter><rect width='220' height='220' filter='url(#n)'/></svg>`);
const brushed = enc(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='40'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.004 .9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0'/></filter><rect width='300' height='40' filter='url(#n)'/></svg>`);
const static_ = enc(`<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><filter id='n'><feTurbulence type='turbulence' baseFrequency='1.4' numOctaves='1' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .9  0 0 0 0 .55  0 0 0 .35 0'/></filter><rect width='90' height='90' filter='url(#n)'/></svg>`);
const root = document.documentElement.style;
root.setProperty("--c-tl", corner(0)); root.setProperty("--c-tr", corner(90)); root.setProperty("--c-br", corner(180)); root.setProperty("--c-bl", corner(270));
root.setProperty("--rough", rough("a")); root.setProperty("--rough2", rough("b")); root.setProperty("--fibre", fibre); root.setProperty("--grain", grain);
root.setProperty("--brushed", brushed); root.setProperty("--static", static_);

/* ---------- the crusade chart: twelve worlds on a ring ---------- */
/* o = {sel, n (current week), act, lang:"ru"|"en", ticks:[got count per week], totals:[phrases per week], label(i)} */
A.chart = o => {
  const C = 200, R = 148, n = o.n, pos = i => { const a = -Math.PI / 2 + i / 12 * Math.PI * 2; return [C + Math.cos(a) * R, C + Math.sin(a) * R]; };
  let g = "";
  // bezel with degree ticks
  g += `<circle cx="${C}" cy="${C}" r="192" fill="url(#chg)" stroke="#6f5520" stroke-width="1.5"/><circle cx="${C}" cy="${C}" r="184" fill="none" stroke="#c9a24d" stroke-width=".8" opacity=".6"/>`;
  for (let d = 0; d < 360; d += 6) { const a = d * Math.PI / 180, l = d % 30 === 0 ? 11 : 5, r1 = 184, r2 = r1 - l;
    g += `<line x1="${f(C + Math.cos(a) * r1)}" y1="${f(C + Math.sin(a) * r1)}" x2="${f(C + Math.cos(a) * r2)}" y2="${f(C + Math.sin(a) * r2)}" stroke="#c9a24d" stroke-width="${d % 30 === 0 ? 1.6 : .8}" opacity="${d % 30 === 0 ? .9 : .5}"/>`; }
  g += `<circle cx="${C}" cy="${C}" r="118" fill="none" stroke="#c9a24d" stroke-width=".6" opacity=".25" stroke-dasharray="2 6"/><circle cx="${C}" cy="${C}" r="84" fill="none" stroke="#c9a24d" stroke-width=".6" opacity=".2"/>`;
  // route: done arc, then the unknown
  const arc = (a0, a1) => { const p0 = pos(a0), p1 = pos(a1), large = (a1 - a0) / 12 > .5 ? 1 : 0; return `M${f(p0[0])} ${f(p0[1])}A${R} ${R} 0 ${large} 1 ${f(p1[0])} ${f(p1[1])}`; };
  if (n < 11) g += `<path d="${arc(n, 11)}" fill="none" stroke="#4a5f8f" stroke-width="2" stroke-dasharray="3 7"/>`;
  if (n > 0) g += `<path d="${arc(0, n)}" fill="none" stroke="#c9a24d" stroke-width="3.4" stroke-linecap="round"/>`;
  // worlds
  for (let i = 0; i < 12; i++) {
    const [x, y] = pos(i), past = i < n, cur = i === n, fut = i > n, hard = i === 2 || i === 7, sel = o.sel === i;
    const tot = o.totals[i] || 10, got = o.ticks[i] || 0, rr = cur ? 21 : past ? 16 : 11;
    const clickable = !fut || o.lang === "en";
    const lab = o.label(i);
    let w = `<g class="world${cur ? " cur" : past ? " past" : " fut"}${sel ? " sel" : ""}" style="--i:${i}" transform="translate(${f(x)} ${f(y)})"${clickable ? ` data-act="${o.act}" data-arg="${i}" tabindex="0" role="button" aria-label="${EC.esc(lab)}"` : ` aria-hidden="true"`}>`;
    w += `<circle r="30" fill="transparent"/>`;
    if (hard) w += `<circle r="${rr + 8}" fill="none" stroke="#b86cff" stroke-width="1.5" stroke-dasharray="3 3" opacity="${fut ? .7 : .95}"/><g transform="translate(${f(rr * .74 + 9)} ${f(-rr * .74 - 9)})"><circle r="8.5" fill="#1a0b2c" stroke="#b86cff" stroke-width="1"/>${A.chaosStar(0, 0, 6.6, "#d9a2ff")}</g>`;
    if (fut) w += `<circle r="${rr}" fill="url(#chst)" stroke="#6c3fa6" stroke-width="1.2"/>`;
    else w += `<circle r="${rr}" fill="url(#${cur ? "chc" : "chp"})" stroke="#2a1f0c" stroke-width="1.2"/><path d="M${-rr * .2} ${-rr}A${rr} ${rr} 0 0 1 ${-rr * .2} ${rr}A${rr * 1.15} ${rr} 0 0 0 ${-rr * .2} ${-rr}Z" fill="#000" opacity=".28" transform="rotate(-35)"/>`;
    if (!fut && tot) { const c = 2 * Math.PI * (rr + 4); w += `<circle r="${rr + 4}" fill="none" stroke="#0c1633" stroke-width="2.4"/><circle r="${rr + 4}" fill="none" stroke="#7ce38e" stroke-width="2.4" stroke-dasharray="${f(c * got / tot)} ${f(c)}" transform="rotate(-90)" opacity=".95"/>`; }
    if (cur) w += `<g class="reticle"><circle r="${rr + 12}" fill="none" stroke="#e6c676" stroke-width="1.2" stroke-dasharray="6 5"/><path d="M0 ${-rr - 18}v8M0 ${rr + 10}v8M${-rr - 18} 0h8M${rr + 10} 0h8" stroke="#e6c676" stroke-width="1.6"/></g>`;
    if (sel && !cur) w += `<circle r="${rr + 9}" fill="none" stroke="#e6c676" stroke-width="1.6"/>`;
    w += `<text y="${fut ? 4 : 5}" text-anchor="middle" font-family="Spectral SC, serif" font-weight="800" font-size="${cur ? 17 : fut ? 11 : 14}" fill="${fut ? "#c9a8f0" : "#1b150b"}">${i + 1}</text>${o.clear === i ? `<g class="storm" aria-hidden="true"><circle r="${rr + 1}" fill="url(#chst)" stroke="#6c3fa6" stroke-width="1.2"/></g><circle class="flash" r="${rr + 6}" fill="none" stroke="#fff2c4" stroke-width="3"/>` : ""}</g>`;
    g += w;
  }
  const defs = `<defs><radialGradient id="chg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#132552"/><stop offset=".78" stop-color="#0a1330"/><stop offset="1" stop-color="#1b1a2a"/></radialGradient>
    <radialGradient id="chp" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f3dea0"/><stop offset=".55" stop-color="#c9a24d"/><stop offset="1" stop-color="#6f5520"/></radialGradient>
    <radialGradient id="chc" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#e6c676"/><stop offset="1" stop-color="#8a6a26"/></radialGradient>
    <pattern id="chst" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#170b29"/><rect x="1" y="1" width="1" height="1" fill="#8e4fd6"/><rect x="4" y="3" width="1" height="1" fill="#5b2d91"/><rect x="2" y="4" width="1" height="1" fill="#c38bff" opacity=".6"/></pattern></defs>`;
  return `<svg class="chart" viewBox="0 0 400 400" role="group" aria-label="${o.lang === "en" ? "Twelve weeks" : "Двенадцать недель"}">${defs}${g}${o.center || ""}</svg>`;
};

/* ---------- oscilloscope: one canvas, drawn only while something plays ---------- */
const scopes = []; let raf = 0;
A.scope = (el) => { if (!el || el._scope) return; el._scope = true; scopes.push(el); A.scopeTick(); };
function drawScope(cv, t, lvl) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
  if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  g.strokeStyle = "rgba(124,227,142,.12)"; g.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = "#7ce38e"; g.lineWidth = 2; g.shadowColor = "rgba(124,227,142,.8)"; g.shadowBlur = 8; g.beginPath();
  const a = h * .42 * Math.max(.04, lvl);
  for (let x = 0; x <= w; x += 2) { const u = x / w, env = Math.sin(u * Math.PI);
    const y = h / 2 + env * a * (Math.sin(u * 38 + t * 9) * .6 + Math.sin(u * 91 - t * 13) * .3 + Math.sin(u * 7 + t * 3) * .25);
    x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.shadowBlur = 0;
}
const calm = matchMedia("(prefers-reduced-motion: reduce)");
A.scopeTick = () => {
  cancelAnimationFrame(raf);
  for (let i = scopes.length - 1; i >= 0; i--) if (!document.body.contains(scopes[i])) scopes.splice(i, 1);
  const busy = !!(EC.voice.st.playing || EC.voice.st.rec);
  scopes.forEach(cv => drawScope(cv, performance.now() / 1000, busy ? (calm.matches ? .5 : EC.voice.level()) : 0));
  if (busy && scopes.length && !document.hidden && !calm.matches) raf = requestAnimationFrame(A.scopeTick);
};
document.addEventListener("visibilitychange", A.scopeTick);
})();
