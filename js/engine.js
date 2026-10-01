/* engine.js: everything in the English coach that is not a look.
   Every design loads content.js, then this file, then draws its own screens on top.

   ─── Loading ───────────────────────────────────────────────────────────────────
     <script src="../shared/content.js"></script>
     <script src="../shared/engine.js"></script>
     <script> EC.init({ns:"lego"}); EC.on("change", render); render(); </script>

   ─── Modes, read from the URL ─────────────────────────────────────────────────
     EC.HIM       true on his link: #him, #him5 (week 5), #him5-<mask> (week 5 + the teacher's ticks)
     EC.PREVIEW   ?preview: the sandbox. Its own storage key, never touches the real record
     EC.DEMO      ?demo: a populated fake history on its own key. Use it for screenshots:
                    index.html?demo            teacher, week 5, sessions, report from "his phone"
                    index.html?demo#him5       his phone, cards due, streak, heatmap
     State lives in localStorage "ec2:<ns>:<v1|him|preview>" (demo keys get a "demo-" prefix).
     A design's first run copies week, ticks and history from the old app's record.

   ─── State ───────────────────────────────────────────────────────────────────
     EC.S                     the one state object. Read freely. Write through the functions
                              below, or set EC.S.ui.<anything> for your own view state + EC.save()
     EC.save()                debounced write
     EC.on(evt, fn)           "change" re-render · "tick" runner second (arg: seconds left)
                              "rec" recording second · "finish" session finished ({k,w})
     EC.emit(evt, arg)

   ─── Content ─────────────────────────────────────────────────────────────────
     EC.week(n?)              W[n] (default the current week)
     EC.ph(pid)               {pid:"3-4", w:3, i:4, en, ru}. Phrase ids are "<week>-<index>"
     EC.weekPh(n)             phrases of week n
     EC.unlocked()            phrases of weeks 0..S.week (everything already taught)
     EC.known()               how many phrases are ticked in the bank
     EC.got(pid)              is it ticked
     EC.tick(pid)             teacher only: toggle the bank tick. Never available on his side
     EC.milestone()           a MILESTONES number reached and not yet celebrated, or null
     EC.celebrated(n)         mark it shown

   ─── Cards, Anki-style (his side) ────────────────────────────────────────────
     Each phrase makes two cards: "<pid>:h" hear it, recall the meaning; "<pid>:s" see the
     Russian, say the English aloud. The :s card appears only after its :h card has graduated.
     Scheduler: FSRS-6 (what Anki uses by default), default parameters, 90 % target retention.
     Learning steps 1 and 10 min; after that FSRS picks the day from stability and difficulty.
     EC.srs.newPerDay()       default 5, EC.srs.setNewPerDay(n) · retention() / setRetention(0.8..0.97)
     EC.srs.R(cid)            recall probability right now, 0..1, null if never seen (memory strength)
     EC.srs.counts()          {learn, rev, neu}: what is waiting right now
     EC.srs.next()            {cid, pid, dir:"h"|"s", en, ru, card, isNew} or null when done for today.
                              Sticky: the same card comes back until it is answered, buried or undone
     EC.srs.bury(cid)         «пропустить»: hide this card until tomorrow, schedule untouched
     EC.srs.preview(cid)      {1:{m|d},2:…,3:…,4:…}  what each grade would schedule
     EC.ivl(p,"ru"|"en")      that as text: "1 мин", "10 мин", "3 дн", "2 мес"
     EC.srs.answer(cid, g)    g = 1 Забыл · 2 Трудно · 3 Помню · 4 Легко
     EC.srs.undo()            take back the last answer (true if it did)
     EC.srs.begin() / end()   bracket a sitting; end() logs it as one round for the teacher
     EC.srs.rank(cid)         0 new · 1 learning · 2 <3d · 3 <7d · 4 <21d · 5 mature (≥21d)
     EC.srs.at(cid)           the same object next() returns, for any card id
     EC.srs.mem(pid)          one phrase, both cards folded: {stage 0 unseen · 1 learning · 2 young · 3 mature,
                               R (weaker card's recall now, 0..1, null if unseen), due (ms), ivl (days),
                               lapses, S (stability, days), D (difficulty 1..10), cards (0..2)}
     EC.srs.nextLearnAt()     ms when the next waiting-to-be-repeated card comes back, 0 if none
     EC.srs.moreNew(n)        "study a bit more": raise today's new-card limit by n (default 5)
     EC.srs.aheadList(n)      review ahead: cards not due yet, weakest first, as srs.at objects
     EC.srs.stats()           {total, seen, learning, young, mature, today, newToday,
                               ret (% remembered, 30 days, -1 if none), forecast[14], leeches[pid],
                               perWeek:[{w,total,seen,mature}]}
     EC.streak()              {n, today}: consecutive days with any practice
     EC.heat(n)               last n days, oldest first: [{k,date,rev,ex,rounds,n}]

   ─── Games (his side) ────────────────────────────────────────────────────────
     EC.games.quiz(n)         [{pid,en,ru,opts:[ru…],ans}]: hear it, pick the meaning
     EC.games.buildPool()     pids that work as word puzzles
     EC.games.tiles(pid)      {pid,en,ru,tiles:[{i,t}],answer:[t…]}
     EC.games.check(pid,arr)  arr of tile texts in chosen order → true/false
     EC.games.cram(scope,n)   random round, scope "week"|"all" (the old card drill, no scheduling)
     EC.games.log(kind,n,ok)  record a finished round ("quiz","build","echo","cram")
     EC.miss(pid)             count a failed production for the teacher's "keeps failing" list

   ─── Exercises on the road (his side) ────────────────────────────────────────
     EC.exOn(id) / EC.exDone(id)    marked «Сделал сегодня» / toggle it

   ─── Voice ───────────────────────────────────────────────────────────────────
     EC.voice.has(key) · count("t"|"m") · canSay() · say(text) · play(key) · hear(pid)
     EC.voice.rec(key) · stop() · del(key) · level() 0..1 while recording or playing
     EC.voice.myKey(pid)      "t:<pid>" for the teacher, "m:<pid>" on his side
     EC.voice.pos()           {t, dur} seconds of the clip playing now, or null (karaoke, scrubbers)
     EC.voice.peaks(key, n)   Promise of n real waveform peaks 0..1 for a stored clip, or null
     EC.voice.st              {rec:{k,left,max}|null, wait:key, playing:key, msg}
     EC.voice.sline()         one sentence about voice sending, for the role on screen (Russian for him, English for the teacher)
     EC.voice.sinfo()         {mode, have, total|pending|sent, busy, err:""|net|key|server|nokey, on, hasKey}
     EC.voice.setKey(s)       teacher: the key that lets recordings reach the server (Settings)
     EC.voice.syncNow()       both sides: send or fetch now. It also runs on open, on "online", on becoming visible, every 5 min
     Labels, in the order he needs them: робот (robot, labelled as such, always first and
     plainest) · учитель (the teacher's clip, the voice he copies) · я (his own, 6 s cap, ↺ redo)

   ─── Teacher: sessions ───────────────────────────────────────────────────────
     EC.run                   null or {k, idx, left, ticking, t0}. SESS[k].blocks[idx] is on screen
     EC.runStart(k) · runToggle() · runNext() · runBack() · runStop()
     EC.setWeek(n) · setSess(k) · setName(s) · reset()
     EC.cold()                shuffled unticked phrases for the in-room cold round
     EC.addNote(text) · delNote(i)    session notes, {d,w,k,t}
     EC.setPlan([ms…])        next session times · EC.cadence() {last7, target:3, last}

   ─── Teacher: his side ───────────────────────────────────────────────────────
     EC.hisLink(week)         the link to send him (week + ticks travel in it)
     EC.previewSrc(week)      src for an <iframe> showing his view in the sandbox
     EC.pv.get() · set(o) · clear() · fill(part) · demo()   sandbox controls
     EC.pullRep()             fetch his latest report (read-only, safe)
     EC.report()              everything to draw it: see function for shape
     EC.syncState()           his side: {show, pending, text} for the «отправлено» line
     EC.copy(text)            → Promise

   ─── Small things ────────────────────────────────────────────────────────────
     EC.esc(s)  ALWAYS for interpolated text · EC.fmt(sec) "04:59" · EC.plur(n,["фраза","фразы","фраз"])
     EC.dayStr(date) · EC.whenRu(ms) · EC.whenEn(ms) · EC.shuffle(arr)

   ─── Drawing helpers ─────────────────────────────────────────────────────────
     EC.morph(root, html)     patch root's children to match html. Unlike innerHTML it keeps focus, scroll
                              position, media, and CSS transitions on nodes that did not change. Use it for
                              every render. data-key="x" on list items makes reorders move nodes; data-static
                              on a node (canvas, iframe) leaves its subtree alone once it exists. State the
                              user can change (value, checked, open) must be rendered from state.
     EC.bind(root, acts, ins) one click listener for the whole view. <button data-act="name" data-arg="x">
                              calls acts.name("x", el, event). <input data-in="name"> calls ins.name(value, el, e)
     EC.onKey(fn)             keydown that ignores typing in fields and Ctrl/Cmd/Alt combos
     EC.haptic(ms)            a short buzz where the phone allows it
     EC.rng(seed)             seeded random, () => 0..1, same seed same sequence (covers, constellations, bricks)
     EC.wave(pid, n)          n bars 0..1 shaped like that phrase spoken: a stand-in for a real waveform

   ─── Demo mode ────────────────────────────────────────────────────────────────
     ?demo stores no audio at all: every "учитель" clip and a few "я" clips are virtual, and pressing them makes the
     robot voice read the phrase (a little higher for "я"). Every voice state can be seen and heard without a file.
*/
(function(){
"use strict";
const EC = window.EC = {};

/* ============ config ============ */
/* Where the app lives, and where its small server lives. The server is optional: with EC.API empty the app works
   fully offline, sends nothing, and says so. EC.SYNC = "always" lets a test talk to a stubbed server from any address. */
EC.SITE = "https://dmitrykulakovfrontend.github.io/litania";
EC.API = "https://d5dreb89c09p5akgjh13.764nr5vy.apigw.yandexcloud.net";   // Yandex Cloud: API Gateway litania-api -> function litania-api -> bucket litania-data-c1e7d856
EC.SYNC = true;
const onSite = () => location.href.indexOf(EC.SITE + "/") === 0;
EC.online = () => !!EC.API && (EC.SYNC === "always" || (EC.SYNC && onSite()));

/* ============ modes ============ */
const HREF = location.href;
EC.PREVIEW = /[?&]preview(&|$|#)/.test(HREF);
EC.DEMO = /[?&]demo(&|$|#|=)/.test(HREF);
const HM = /[?#]him(\d+)?(?:-([A-Za-z0-9_-]+))?$/i.exec(HREF);
EC.HIM = !!HM;
EC.LINKWEEK = HM && HM[1] ? Math.max(0, Math.min(+HM[1] - 1, W.length - 1)) : null;
EC.LINKMASK = HM && HM[2] ? HM[2] : null;

/* ============ state ============ */
const DEF = {week:0, sess:"a", done:[], got:[], name:"", log:[], miss:{}, ex:[], sid:"", sentAt:0, changedAt:0,
  rep:null, repAt:0, srs:{}, rev:[], newPer:5, extra:null, bury:{}, ret:0.9, tkey:"", vloc:{}, vup:{}, vdown:{}, sessLog:[], notes:[], plan:[], seen:[], ui:{}};
const clone = o => JSON.parse(JSON.stringify(o));
let KEY = "", PKEY = "", saveT = null;
EC.S = clone(DEF);

function keyFor(kind){ return "ec2:" + EC.NS + ":" + (EC.DEMO ? "demo-" : "") + kind; }
function load(){
  let raw = null;
  try{ raw = localStorage.getItem(KEY); }catch(e){}
  if(raw){ try{ EC.S = Object.assign(clone(DEF), JSON.parse(raw)); return "own"; }catch(e){} }
  EC.S = clone(DEF);
  if(EC.DEMO || EC.PREVIEW) return "fresh";
  /* first run: carry over what the old app knows */
  try{
    const old = JSON.parse(localStorage.getItem(EC.HIM ? "cnulya:him" : "cnulya:v1") || "null");
    if(old) ["week","sess","done","got","name","log","miss","ex","sid","rep","repAt"].forEach(k => { if(old[k] !== undefined) EC.S[k] = old[k]; });
  }catch(e){}
  return "fresh";
}
EC.save = function(){ clearTimeout(saveT); saveT = setTimeout(saveNow, 250); };
function saveNow(){ clearTimeout(saveT); try{ localStorage.setItem(KEY, JSON.stringify(EC.S)); }catch(e){} }
addEventListener("pagehide", saveNow);

/* ============ events ============ */
const L = {};
EC.on = (e, f) => { (L[e] = L[e] || []).push(f); };
EC.emit = (e, a) => { (L[e] || []).forEach(f => { try{ f(a); }catch(x){ console.error(x); } }); };
const changed = () => EC.emit("change");

/* ============ small things ============ */
EC.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
EC.fmt = s => { const n = s < 0; s = Math.abs(s); return (n ? "−" : "") + String(Math.floor(s/60)).padStart(2,"0") + ":" + String(s%60).padStart(2,"0"); };
EC.plur = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a >= 11 && a <= 14 ? f[2] : b === 1 ? f[0] : b >= 2 && b <= 4 ? f[1] : f[2]; };
EC.dayStr = d => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
EC.shuffle = a => { a = a.slice(); for(let i = a.length-1; i > 0; i--){ const j = Math.floor(Math.random()*(i+1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const hm = d => String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
EC.whenRu = t => { const d = new Date(t), now = new Date(), y = new Date(); y.setDate(y.getDate()-1);
  return EC.dayStr(d) === EC.dayStr(now) ? "сегодня в " + hm(d) : EC.dayStr(d) === EC.dayStr(y) ? "вчера в " + hm(d)
    : String(d.getDate()).padStart(2,"0") + "." + String(d.getMonth()+1).padStart(2,"0") + " в " + hm(d); };
EC.whenEn = t => { const d = new Date(t), now = new Date(), y = new Date(); y.setDate(y.getDate()-1);
  return EC.dayStr(d) === EC.dayStr(now) ? "today, " + hm(d) : EC.dayStr(d) === EC.dayStr(y) ? "yesterday, " + hm(d)
    : d.toLocaleDateString("en-GB", {weekday:"short", day:"numeric", month:"short"}) + ", " + hm(d); };
EC.copy = t => new Promise(res => {
  const fb = () => { const a = document.createElement("textarea"); a.value = t; document.body.appendChild(a); a.select();
    try{ document.execCommand("copy"); }catch(e){} a.remove(); res(true); };
  try{ navigator.clipboard.writeText(t).then(() => res(true), fb); }catch(e){ fb(); }
});

/* ============ drawing helpers ============ */
/* morph: make root's children match html, touching only what differs, so focus, scroll, media and
   running CSS transitions survive a re-render. */
const keyOf = n => n.nodeType === 1 ? n.getAttribute("data-key") : null;
function morphKids(from, to){
  const old = Array.from(from.childNodes), kids = Array.from(to.childNodes), byKey = {}, tok = {};
  old.forEach(o => { const k = keyOf(o); if(k != null) byKey[k] = o; });
  let ptr = 0;
  kids.forEach((n, i) => {
    const k = keyOf(n); let m = null;
    if(k != null){ const c = byKey[k]; if(c && c.nodeName === n.nodeName && c._tok !== tok) m = c; }
    else {
      while(ptr < old.length && (old[ptr]._tok === tok || keyOf(old[ptr]) != null)) ptr++;
      if(ptr < old.length && old[ptr].nodeType === n.nodeType && old[ptr].nodeName === n.nodeName) m = old[ptr++];
    }
    const at = from.childNodes[i] || null;
    if(m){ m._tok = tok; morphNode(m, n); if(at !== m) from.insertBefore(m, at); }
    else { n._tok = tok; from.insertBefore(n, at); }
  });
  old.forEach(o => { if(o._tok !== tok && o.parentNode === from) from.removeChild(o); });
}
function morphNode(a, b){
  if(a.nodeType !== 1){ if(a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  Array.from(a.attributes).forEach(t => { if(!b.hasAttribute(t.name)) a.removeAttribute(t.name); });
  Array.from(b.attributes).forEach(t => { if(a.getAttribute(t.name) !== t.value) a.setAttribute(t.name, t.value); });
  const tag = a.nodeName;
  if((tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") && a !== document.activeElement){
    if(tag === "INPUT" && (a.type === "checkbox" || a.type === "radio")) a.checked = b.checked;
    else if(a.value !== b.value) a.value = b.value;
  }
  if(a.hasAttribute("data-static")) return;
  morphKids(a, b);
}
EC.morph = (root, html) => { const t = document.createElement("template"); t.innerHTML = html; morphKids(root, t.content); };
EC.bind = (root, acts, ins) => {
  root.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if(!el || !root.contains(el) || el.disabled) return;
    const f = acts[el.dataset.act]; if(f && f(el.dataset.arg, el, e) !== true) e.preventDefault();
  });
  if(ins) root.addEventListener("input", e => {
    const el = e.target.closest("[data-in]"); if(!el) return;
    const f = ins[el.dataset.in]; if(f) f(el.value, el, e);
  });
};
EC.onKey = fn => document.addEventListener("keydown", e => {
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target, tag = t && t.tagName;
  if(tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
  fn(e);
});
EC.haptic = ms => { try{ if(navigator.vibrate) navigator.vibrate(ms || 12); }catch(e){} };
EC.rng = seed => {
  const str = String(seed); let h = 1779033703 ^ str.length;
  for(let i = 0; i < str.length; i++){ h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
  h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); let a = (h ^ h >>> 16) >>> 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
};
EC.wave = (pid, n = 32) => {
  const p = EC.ph(pid), r = EC.rng("wave" + pid), words = Math.max(1, p ? p.en.trim().split(/s+/).length : 3), out = [];
  for(let i = 0; i < n; i++){ const x = i / n * words, hump = Math.pow(Math.sin((x % 1) * Math.PI), .7);
    out.push(Math.max(.08, Math.min(1, hump * (.55 + r() * .45)))); }
  return out;
};

/* ============ content ============ */
EC.week = n => W[n == null ? EC.S.week : n];
EC.ph = pid => { const [w, i] = String(pid).split("-").map(Number), p = W[w] && W[w].ph[i];
  return p ? {pid: w + "-" + i, w, i, en: p[0], ru: p[1]} : null; };
EC.weekPh = n => W[n].ph.map((p, i) => ({pid: n + "-" + i, w: n, i, en: p[0], ru: p[1]}));
EC.unlocked = () => { const a = []; for(let n = 0; n <= EC.S.week; n++) a.push(...EC.weekPh(n)); return a; };
EC.known = () => EC.S.got.length;
EC.got = pid => EC.S.got.includes(pid);
EC.tick = pid => {
  if(EC.HIM) return false;              // his phone never ticks the bank
  const i = EC.S.got.indexOf(pid);
  if(i < 0) EC.S.got.push(pid); else EC.S.got.splice(i, 1);
  EC.save(); changed(); return i < 0;
};
EC.milestone = () => { const k = EC.known(); const hit = MILESTONES.filter(n => n <= k && !EC.S.seen.includes(n)); return hit.length ? hit[hit.length-1] : null; };
EC.celebrated = n => { MILESTONES.forEach(m => { if(m <= n && !EC.S.seen.includes(m)) EC.S.seen.push(m); }); EC.save(); changed(); };

/* the bank travels to his phone inside the link, one bit per phrase */
function maskOf(got){
  const bits = []; W.forEach((w, n) => w.ph.forEach((_, i) => bits.push(got.includes(n + "-" + i) ? 1 : 0)));
  let bin = ""; for(let i = 0; i < bits.length; i += 8){ let b = 0; for(let j = 0; j < 8; j++) b = (b << 1) | (bits[i+j] || 0); bin += String.fromCharCode(b); }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").replace(/A+$/, "") || "A";   // a trailing A is six zero bits
}
function gotOf(mask){
  try{
    let b64 = mask.replace(/-/g, "+").replace(/_/g, "/"); while(b64.length % 4) b64 += "A";
    const bin = atob(b64), bits = [];
    for(let i = 0; i < bin.length; i++){ const b = bin.charCodeAt(i); for(let j = 7; j >= 0; j--) bits.push((b >> j) & 1); }
    const got = []; let k = 0; W.forEach((w, n) => w.ph.forEach((_, i) => { if(bits[k++]) got.push(n + "-" + i); }));
    return got;
  }catch(e){ return null; }
}

/* ============ cards: FSRS-6, the scheduler Anki itself uses by default since 23.10 ============
   A straight port of open-spaced-repetition/py-fsrs (scheduler.py), default parameters, 90 % target
   retention. Each card carries stability S (days until recall drops to 90 %), difficulty D (1..10)
   and the time of its last review. Learning steps 1 and 10 minutes, relearning 10 minutes.
   One change from py-fsrs, the same one Anki makes: review cards fall due at the start of a study
   day (04:00), and "days since last review" counts study days, not 24-hour blocks. */
const MIN = 6e4, DAY = 864e5, ROLL = 4, AHEAD = 20 * MIN, LEECH = 4;
const P = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796,
           1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
const DECAY = -P[20], FACTOR = Math.pow(0.9, 1 / DECAY) - 1, SMIN = 0.001, MAXIVL = 36500;
const LEARN = [1, 10], RELEARN = [10];
const FUZZ = [[2.5, 7, .15], [7, 20, .1], [20, Infinity, .05]];

function dayStart(t){ const d = new Date(t); if(d.getHours() < ROLL) d.setDate(d.getDate()-1);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), ROLL).getTime(); }
function dayAt(t, n){ const d = new Date(dayStart(t)); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, ROLL).getTime(); }
const dayKey = t => EC.dayStr(new Date(dayStart(t)));
const daysBetween = (a, b) => Math.round((dayStart(b) - dayStart(a)) / DAY);

const clampD = d => Math.min(10, Math.max(1, d)), clampS = s => Math.max(SMIN, s);
const retr = (elapsed, S) => Math.pow(1 + FACTOR * elapsed / S, DECAY);
const initS = g => clampS(P[g - 1]);
const initD = (g, clamp) => { const d = P[4] - Math.exp(P[5] * (g - 1)) + 1; return clamp ? clampD(d) : d; };
const nextD = (D, g) => { const dd = -P[6] * (g - 3), d2 = D + (10 - D) * dd / 9; return clampD(P[7] * initD(4, false) + (1 - P[7]) * d2); };
const shortS = (S, g) => { let inc = Math.exp(P[17] * (g - 3 + P[18])) * Math.pow(S, -P[19]); if(g > 1) inc = Math.max(inc, 1); return clampS(S * inc); };
const recallS = (D, S, R, g) => S * (1 + Math.exp(P[8]) * (11 - D) * Math.pow(S, -P[9]) * (Math.exp((1 - R) * P[10]) - 1) * (g === 2 ? P[15] : 1) * (g === 4 ? P[16] : 1));
const forgetS = (D, S, R) => Math.min(P[11] * Math.pow(D, -P[12]) * (Math.pow(S + 1, P[13]) - 1) * Math.exp((1 - R) * P[14]), S / Math.exp(P[17] * P[18]));
const nextIvl = S => Math.min(MAXIVL, Math.max(1, Math.round(S / FACTOR * (Math.pow(EC.S.ret || 0.9, 1 / DECAY) - 1))));
function fuzzIvl(iv){
  if(iv < 2.5) return iv;
  let delta = 1; FUZZ.forEach(([a, b, f]) => { delta += f * Math.max(Math.min(iv, b) - a, 0); });
  let lo = Math.round(iv - delta), hi = Math.round(iv + delta);
  lo = Math.max(2, lo); hi = Math.min(hi, MAXIVL); lo = Math.min(lo, hi);
  return Math.min(Math.round(Math.random() * (hi - lo + 1) + lo), MAXIVL);
}

/* card: {s 1 learning · 2 review · 3 relearning, step, S, D, due, last, ivl (days, review only), reps, lapses} */
function sched(c0, g, now, fz){
  const c = c0 ? Object.assign({}, c0) : {s: 1, step: 0, S: null, D: null, reps: 0, lapses: 0, ivl: 0};
  const elapsed = c.last ? daysBetween(c.last, now) : null;
  if(c.S == null || c.D == null){ c.S = initS(g); c.D = initD(g, true); }
  else if(elapsed < 1){ c.S = shortS(c.S, g); c.D = nextD(c.D, g); }
  else { const R = retr(elapsed, c.S); c.S = clampS(g === 1 ? forgetS(c.D, c.S, R) : recallS(c.D, c.S, R, g)); c.D = nextD(c.D, g); }
  let mins = null;
  const review = () => { c.s = 2; c.step = 0; c.ivl = nextIvl(c.S); };
  if(c.s === 2){
    if(g === 1){ c.lapses++; c.s = 3; c.step = 0; mins = RELEARN[0]; }
    else review();
  } else {
    const st = c.s === 1 ? LEARN : RELEARN;
    if(c.step >= st.length && g > 1) review();
    else if(g === 1){ c.step = 0; mins = st[0]; }
    else if(g === 2) mins = c.step === 0 && st.length === 1 ? st[0] * 1.5 : c.step === 0 ? (st[0] + st[1]) / 2 : st[c.step];
    else if(g === 3){ if(c.step + 1 === st.length) review(); else { c.step++; mins = st[c.step]; } }
    else review();
  }
  if(c.s === 2){ if(fz) c.ivl = fuzzIvl(c.ivl); c.due = dayAt(now, c.ivl); }
  else { c.ivl = 0; c.due = now + mins * MIN; }
  c.reps++; c.last = now;
  return c;
}

const srs = EC.srs = {};
let UNDO = null, ROUND = null, LASTCID = "";
srs.sched = sched;   // exposed for tests
srs.newPerDay = () => EC.S.newPer || 5;
srs.setNewPerDay = n => { EC.S.newPer = Math.max(1, Math.min(30, n|0)); EC.save(); changed(); };
srs.retention = () => EC.S.ret || 0.9;
srs.setRetention = r => { EC.S.ret = Math.max(0.8, Math.min(0.97, +r || 0.9)); EC.save(); changed(); };
/* how likely he is to recall it right now, 0..1 (FSRS retrievability). null for a card never seen. */
srs.R = cid => { const c = EC.S.srs[cid]; return c && c.S ? retr(Math.max(0, daysBetween(c.last, Date.now())), c.S) : null; };
srs.card = cid => EC.S.srs[cid] || null;
srs.cids = () => { const a = []; EC.unlocked().forEach(p => { a.push(p.pid + ":h", p.pid + ":s"); }); return a; };
const pidOf = cid => cid.split(":")[0];
function eligibleNew(cid, today){
  if(EC.S.srs[cid]) return false;
  if(cid.endsWith(":h")) return true;
  const h = EC.S.srs[pidOf(cid) + ":h"];
  return !!h && h.s === 2 && dayKey(h.last) !== today;     // say it only once hearing it is easy, and not the same day
}
const extraToday = () => EC.S.extra && EC.S.extra.k === dayKey(Date.now()) ? EC.S.extra.n : 0;
srs.moreNew = (n = 5) => { EC.S.extra = {k: dayKey(Date.now()), n: extraToday() + n}; EC.save(); changed(); };
srs.newToday = () => { const t = dayKey(Date.now()); return EC.S.rev.filter(r => r[3] === 0 && dayKey(r[0]) === t).length; };
function queue(now){
  const today = dayKey(now), learn = [], rev = [], neu = [], ahead = [];
  srs.cids().forEach(cid => {
    if(EC.S.bury && EC.S.bury[cid] === today) return;
    const c = EC.S.srs[cid];
    if(!c){ if(eligibleNew(cid, today)) neu.push(cid); return; }
    if(c.s === 1 || c.s === 3){ if(c.due <= now) learn.push(cid); else if(c.due <= now + AHEAD) ahead.push(cid); }
    else if(c.due <= now) rev.push(cid);
  });
  const by = (a, b) => EC.S.srs[a].due - EC.S.srs[b].due;
  learn.sort(by); rev.sort(by); ahead.sort(by);
  const left = Math.max(0, srs.newPerDay() + extraToday() - srs.newToday());
  return {learn, rev, neu: neu.slice(0, left), ahead};
}
srs.counts = () => { const q = queue(Date.now()); return {learn: q.learn.length, rev: q.rev.length, neu: q.neu.length, ahead: q.ahead.length}; };
let CUR = null;
srs.next = () => {
  const now = Date.now(), q = queue(now);
  /* the card on screen stays the card on screen until it is answered, buried or undone,
     even if another one falls due while he is looking at the answer */
  if(CUR && q.learn.concat(q.rev, q.neu, q.ahead).includes(CUR.cid) && ((EC.S.srs[CUR.cid] || {}).last || 0) === CUR.last) return srs.at(CUR.cid);
  const pick = arr => arr.find(c => c !== LASTCID) || arr[0];
  let cid = null;
  if(q.learn.length) cid = pick(q.learn);
  else if(q.rev.length || q.neu.length){
    const doneToday = EC.S.rev.filter(r => dayKey(r[0]) === dayKey(now)).length;
    cid = q.neu.length && (!q.rev.length || doneToday % 4 === 3) ? q.neu[0] : pick(q.rev);
  }
  else if(q.ahead.length) cid = pick(q.ahead);
  CUR = cid ? {cid, last: (EC.S.srs[cid] || {}).last || 0} : null;
  return cid ? srs.at(cid) : null;
};
srs.bury = cid => {
  EC.S.bury = EC.S.bury || {}; const t = dayKey(Date.now());
  Object.keys(EC.S.bury).forEach(k => { if(EC.S.bury[k] !== t) delete EC.S.bury[k]; });
  EC.S.bury[cid] = t; CUR = null; EC.save(); changed();
};
srs.at = cid => { const p = EC.ph(pidOf(cid)); if(!p) return null; const c = EC.S.srs[cid] || null;
  return {cid, pid: p.pid, dir: cid.slice(-1), en: p.en, ru: p.ru, w: p.w, card: c, isNew: !c}; };
srs.preview = cid => {
  const now = Date.now(), c = EC.S.srs[cid] || null, out = {};
  [1,2,3,4].forEach(g => { const n = sched(c, g, now, false);
    out[g] = n.s === 2 ? {d: n.ivl} : {m: Math.max(1, Math.round((n.due - now) / MIN))}; });
  return out;
};
EC.ivl = (p, lang) => {
  const ru = lang !== "en";
  if(p.m != null){ return p.m < 60 ? p.m + (ru ? " мин" : " min") : Math.round(p.m/60) + (ru ? " ч" : " h"); }
  const d = p.d;
  if(d < 30) return d + (ru ? " дн" : d === 1 ? " day" : " days");
  if(d < 365) return Math.round(d/30) + (ru ? " мес" : " mo");
  return (d/365).toFixed(1).replace(/\.0$/, "") + (ru ? " г" : " y");
};
srs.answer = (cid, g) => {
  const now = Date.now(), prev = EC.S.srs[cid] || null;
  const c = sched(prev, g, now, true);
  UNDO = {cid, prev, revLen: EC.S.rev.length, miss: g === 1 && cid.endsWith(":s") ? pidOf(cid) : null};
  EC.S.srs[cid] = c;
  EC.S.rev.push([now, cid, g, prev ? prev.s : 0, c.s === 2 ? c.ivl : 0]);
  if(EC.S.rev.length > 4000) EC.S.rev = EC.S.rev.slice(-4000);
  if(UNDO.miss) EC.S.miss[UNDO.miss] = (EC.S.miss[UNDO.miss] || 0) + 1;
  LASTCID = cid; CUR = null;
  touch(); changed();
  return c;
};
srs.undo = () => {
  if(!UNDO) return false;
  if(UNDO.prev) EC.S.srs[UNDO.cid] = UNDO.prev; else delete EC.S.srs[UNDO.cid];
  EC.S.rev = EC.S.rev.slice(0, UNDO.revLen);
  if(UNDO.miss && EC.S.miss[UNDO.miss]) EC.S.miss[UNDO.miss]--;
  CUR = {cid: UNDO.cid, last: UNDO.prev ? UNDO.prev.last : 0};
  UNDO = null; LASTCID = ""; touch(); changed(); return true;
};
srs.canUndo = () => !!UNDO;
srs.begin = () => { ROUND = EC.S.rev.length; };
srs.end = () => {
  if(ROUND == null) return;
  const a = EC.S.rev.slice(ROUND); ROUND = null; UNDO = null;
  if(a.length) logRound("srs", a.length, a.filter(r => r[2] > 1).length);
};
srs.rank = cid => { const c = EC.S.srs[cid]; if(!c) return 0; if(c.s !== 2) return 1;
  return c.ivl < 3 ? 2 : c.ivl < 7 ? 3 : c.ivl < 21 ? 4 : 5; };
srs.mem = pid => {
  const ids = [pid + ":h", pid + ":s"].filter(id => EC.S.srs[id]), cs = ids.map(id => EC.S.srs[id]);
  if(!cs.length) return {stage: 0, R: null, due: null, ivl: 0, lapses: 0, S: 0, D: 0, cards: 0};
  const rev = cs.filter(c => c.s === 2);
  const stage = rev.length < cs.length ? 1 : cs.length === 2 && rev.every(c => c.ivl >= 21) ? 3 : 2;
  return {stage, R: Math.min(...ids.map(srs.R)), due: Math.min(...cs.map(c => c.due)), ivl: rev.length ? Math.min(...rev.map(c => c.ivl)) : 0,
          lapses: cs.reduce((a, c) => a + c.lapses, 0), S: Math.min(...cs.map(c => c.S || 0)), D: Math.max(...cs.map(c => c.D || 0)), cards: cs.length};
};
srs.nextLearnAt = () => { const now = Date.now(); let t = 0;
  srs.cids().forEach(cid => { const c = EC.S.srs[cid]; if(c && c.s !== 2 && c.due > now && (!t || c.due < t)) t = c.due; });
  return t; };
srs.aheadList = (n = 10) => { const now = Date.now();
  return srs.cids().filter(cid => { const c = EC.S.srs[cid]; return c && c.s === 2 && c.due > now; })
    .sort((a, b) => srs.R(a) - srs.R(b)).slice(0, n).map(srs.at); };
srs.stats = () => {
  const now = Date.now(), today = dayKey(now), cids = srs.cids(), st = {total: cids.length, seen: 0, learning: 0, young: 0, mature: 0};
  cids.forEach(cid => { const c = EC.S.srs[cid]; if(!c) return; st.seen++;
    if(c.s !== 2) st.learning++; else if(c.ivl >= 21) st.mature++; else st.young++; });
  st.today = EC.S.rev.filter(r => dayKey(r[0]) === today).length;
  st.newToday = srs.newToday();
  const since = now - 30 * DAY, rv = EC.S.rev.filter(r => r[0] >= since && r[3] === 2);
  st.ret = rv.length ? Math.round(rv.filter(r => r[2] > 1).length / rv.length * 100) : -1;
  st.forecast = Array.from({length: 14}, () => 0);
  cids.forEach(cid => { const c = EC.S.srs[cid]; if(!c) return;
    const d = c.due <= now ? 0 : Math.round((dayStart(c.due) - dayStart(now)) / DAY);
    if(d < 14) st.forecast[d]++; });
  st.leeches = Object.keys(EC.S.srs).filter(cid => EC.S.srs[cid].lapses >= LEECH).map(pidOf).filter((p, i, a) => a.indexOf(p) === i);
  st.perWeek = [];
  for(let n = 0; n <= EC.S.week; n++){ const row = {w: n, total: 0, seen: 0, mature: 0};
    EC.weekPh(n).forEach(p => [":h", ":s"].forEach(d => { const c = EC.S.srs[p.pid + d]; row.total++;
      if(c){ row.seen++; if(c.s === 2 && c.ivl >= 21) row.mature++; } }));
    st.perWeek.push(row); }
  return st;
};

/* ============ activity: streak and heatmap ============ */
function activity(){
  const by = {};
  const add = (k, f) => { by[k] = by[k] || {rev: 0, ex: 0, rounds: 0}; by[k][f]++; };
  EC.S.rev.forEach(r => add(EC.dayStr(new Date(r[0])), "rev"));
  EC.S.ex.forEach(x => add(x.split("|")[0], "ex"));
  EC.S.log.forEach(x => { if(x.k !== "srs") add(EC.dayStr(new Date(x.d)), "rounds"); });
  return by;
}
EC.heat = n => { const by = activity(), out = [];
  for(let i = n - 1; i >= 0; i--){ const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate() - i);
    const k = EC.dayStr(d), a = by[k] || {rev: 0, ex: 0, rounds: 0};
    out.push({k, date: d, rev: a.rev, ex: a.ex, rounds: a.rounds, n: a.rev + a.ex + a.rounds}); }
  return out; };
EC.streak = () => { const by = activity(), d = new Date(); d.setHours(12,0,0,0);
  const today = !!by[EC.dayStr(d)]; if(!today) d.setDate(d.getDate() - 1);
  let n = 0; while(by[EC.dayStr(d)]){ n++; d.setDate(d.getDate() - 1); }
  return {n, today}; };

/* ============ games ============ */
const games = EC.games = {};
function logRound(k, n, ok){
  EC.S.log.push({d: Date.now(), n, ok, k});
  if(EC.S.log.length > 300) EC.S.log = EC.S.log.slice(-300);
  touch();
}
games.log = (k, n, ok) => { if(n > 0){ logRound(k, n, ok); changed(); } };
EC.miss = pid => { EC.S.miss[pid] = (EC.S.miss[pid] || 0) + 1; touch(); };
games.quiz = (n = 8) => {
  const all = EC.unlocked(), cur = all.filter(p => p.w === EC.S.week);
  const pool = EC.shuffle(cur).concat(EC.shuffle(all.filter(p => p.w !== EC.S.week))).slice(0, n);
  return EC.shuffle(pool).map(p => {
    const others = EC.shuffle(all.filter(o => o.ru !== p.ru)).map(o => o.ru).filter((r, i, a) => a.indexOf(r) === i).slice(0, 3);
    const opts = EC.shuffle([p.ru].concat(others));
    return {pid: p.pid, en: p.en, ru: p.ru, opts, ans: opts.indexOf(p.ru)};
  });
};
const words = en => en.trim().split(/\s+/);
games.buildPool = () => EC.unlocked().filter(p => !/[\/_]/.test(p.en) && words(p.en).length >= 3).map(p => p.pid);
games.tiles = pid => {
  const p = EC.ph(pid), answer = words(p.en);
  let tiles = answer.map((t, i) => ({i, t}));
  for(let k = 0; k < 8; k++){ tiles = EC.shuffle(tiles); if(tiles.map(x => x.t).join(" ") !== p.en) break; }
  return {pid: p.pid, en: p.en, ru: p.ru, tiles, answer};
};
games.check = (pid, arr) => arr.join(" ") === words(EC.ph(pid).en).join(" ");
games.cram = (scope, n = 20) => {
  const from = scope === "week" ? EC.S.week : 0, a = [];
  for(let w = from; w <= EC.S.week; w++) a.push(...EC.weekPh(w));
  return EC.shuffle(a).slice(0, n);
};

/* ============ exercises on the road ============ */
EC.exOn = id => EC.S.ex.includes(EC.dayStr(new Date()) + "|" + id);
EC.exDone = id => {
  const k = EC.dayStr(new Date()) + "|" + id, i = EC.S.ex.indexOf(k);
  if(i < 0) EC.S.ex.push(k); else EC.S.ex.splice(i, 1);
  if(EC.S.ex.length > 500) EC.S.ex = EC.S.ex.slice(-500);
  touch(); changed();
};

/* ============ teacher: the session runner ============ */
EC.run = null;
EC.runStart = k => { EC.S.sess = k; if(EC.run) clearInterval(EC.run.iv);
  EC.run = {k, idx: 0, left: SESS[k].blocks[0].m * 60, ticking: false, iv: null, t0: Date.now()}; EC.save(); changed(); };
function tick(){ const r = EC.run; if(!r) return; r.left--; if(L.tick && L.tick.length) EC.emit("tick", r.left); else changed(); }
EC.runToggle = () => { const r = EC.run; if(!r) return;
  if(r.ticking){ clearInterval(r.iv); r.ticking = false; } else { r.iv = setInterval(tick, 1000); r.ticking = true; } changed(); };
EC.runNext = () => { const r = EC.run; if(!r) return; const b = SESS[r.k].blocks; clearInterval(r.iv);
  if(r.idx >= b.length - 1){ finish(); return; }
  r.idx++; r.left = b[r.idx].m * 60; r.ticking = false; changed(); };
EC.runBack = () => { const r = EC.run; if(!r || !r.idx) return; clearInterval(r.iv);
  r.idx--; r.left = SESS[r.k].blocks[r.idx].m * 60; r.ticking = false; changed(); };
EC.runStop = () => { if(EC.run) clearInterval(EC.run.iv); EC.run = null; changed(); };
function finish(){
  const r = EC.run, k = r.k, w = EC.S.week; clearInterval(r.iv); EC.run = null;
  const id = w + k; if(!EC.S.done.includes(id)) EC.S.done.push(id);
  EC.S.sessLog.push({d: Date.now(), w, k, min: Math.max(1, Math.round((Date.now() - r.t0) / MIN))});
  const order = ["a","b","c"], i = order.indexOf(k);
  if(i < 2) EC.S.sess = order[i+1]; else if(EC.S.week < W.length - 1){ EC.S.week++; EC.S.sess = "a"; }
  EC.save(); EC.emit("finish", {k, w}); changed();
}
EC.setWeek = n => { EC.S.week = Math.max(0, Math.min(n, W.length - 1)); EC.S.sess = "a"; EC.save(); changed(); };
EC.setSess = k => { EC.S.sess = k; EC.save(); changed(); };
EC.setName = s => { EC.S.name = String(s || "").trim().slice(0, 40); EC.save(); changed(); };
EC.reset = () => { if(EC.run) clearInterval(EC.run.iv); EC.run = null; const keep = EC.S.sid; EC.S = clone(DEF); EC.S.sid = keep; saveNow(); changed(); };
EC.cold = () => EC.shuffle(EC.unlocked().filter(p => !EC.got(p.pid)));
EC.addNote = t => { t = String(t || "").trim(); if(!t) return;
  const last = EC.S.sessLog[EC.S.sessLog.length - 1];
  EC.S.notes.push({d: Date.now(), w: EC.S.week, k: last && Date.now() - last.d < 3 * 36e5 ? last.k : EC.S.sess, t: t.slice(0, 2000)});
  if(EC.S.notes.length > 300) EC.S.notes = EC.S.notes.slice(-300);
  EC.save(); changed(); };
EC.delNote = i => { EC.S.notes.splice(i, 1); EC.save(); changed(); };
EC.setPlan = a => { EC.S.plan = (a || []).filter(x => x > Date.now() - 36e5).sort((x, y) => x - y).slice(0, 3); EC.save(); changed(); };
EC.cadence = () => { const since = Date.now() - 7 * DAY, s = EC.S.sessLog;
  return {last7: s.filter(x => x.d >= since).length, target: 3, last: s.length ? s[s.length-1].d : 0}; };

/* ============ his progress: collected offline, sent on its own ============ */
function apiUrl(){ return EC.API + "/progress"; }
function touch(){ EC.S.changedAt = Date.now(); EC.save(); sync(); }
function summary(){
  const st = srs.stats(), c = srs.counts(), days = {};
  EC.heat(30).forEach(d => { if(d.rev) days[d.k] = d.rev; });
  return {total: st.total, seen: st.seen, mature: st.mature, young: st.young, due: c.learn + c.rev,
          streak: EC.streak().n, ret: st.ret, today: st.today, leech: st.leeches.slice(0, 12), days};
}
EC.snapshot = () => ({sid: EC.S.sid, w: EC.S.week + 1, r: EC.S.log, m: EC.S.miss, ex: EC.S.ex, got: EC.S.got.length,
  t: EC.voice.count("t"), me: EC.voice.count("m"), c: summary(), at: Date.now()});
let SYNCING = false;
function sync(){
  if(!EC.online() || !EC.HIM || EC.PREVIEW || EC.DEMO || SYNCING || !EC.S.changedAt || EC.S.sentAt >= EC.S.changedAt) return;
  if(navigator.onLine === false) return;
  const snap = EC.snapshot(); SYNCING = true;
  fetch(apiUrl(), {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify(snap), keepalive: true})
    .then(r => { if(r.ok){ EC.S.sentAt = snap.at; EC.save(); changed(); } return r.ok; })
    .catch(() => false).then(ok => { SYNCING = false; if(ok && EC.S.changedAt > EC.S.sentAt) setTimeout(sync, 800); });
}
EC.sync = sync;
EC.syncState = () => {
  if(!EC.HIM || !EC.S.changedAt || !EC.online() || EC.PREVIEW) return {show: false, pending: false, text: ""};
  const pending = EC.S.changedAt > EC.S.sentAt;
  return {show: true, pending, text: pending
    ? "Ещё не отправлено учителю. Уйдёт само, как только появится интернет. Ничего нажимать не надо."
    : "Учитель видит, что ты сделал. Отправлено " + EC.whenRu(EC.S.sentAt) + "."};
};
let REPLOAD = false;
EC.repLoading = () => REPLOAD;
EC.pullRep = () => {
  if(EC.DEMO){ changed(); return Promise.resolve(EC.S.rep); }
  if(!EC.API){ EC.voice.st.msg = "The progress server is not connected yet. His reports will appear here once it is."; changed(); return Promise.resolve(null); }
  REPLOAD = true; changed();
  return fetch(apiUrl(), {cache: "no-store", headers: {"x-teacher-key": EC.S.tkey || ""}}).then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => { EC.S.rep = d; EC.S.repAt = Date.now(); REPLOAD = false; EC.save(); changed(); return d; })
    .catch(e => { REPLOAD = false; EC.voice.st.msg = e === 401 ? "The server did not accept the teacher key. Check it in Settings." : "Could not reach the progress store. Check the connection and press Refresh again."; changed(); return null; });
};
/* Shape:
   {has, at, daysAgo, week, weekDelta (his week minus yours; + means he is ahead),
    days:[{k,date,ex,rounds,rev,n}] ×14 oldest first, active,
    ex:[{id,name,c}], rounds:{count,total,ok,pct}, voice:{t,me},
    failing:[{pid,en,ru,w,c}] ×10, cards: null | {total,seen,mature,young,due,streak,ret,today,leech:[{pid,en,ru,w}]}} */
EC.report = () => {
  const r = EC.S.rep;
  if(!r) return {has: false};
  const at = r.recv || r.at || 0, daysAgo = Math.floor((Date.now() - at) / DAY);
  const exBy = {}, rdBy = {}, rvBy = (r.c && r.c.days) || {};
  (r.ex || []).forEach(x => { const d = x.split("|")[0]; exBy[d] = (exBy[d] || 0) + 1; });
  (r.r || []).forEach(x => { if(x.k === "srs") return; const d = EC.dayStr(new Date(x.d)); rdBy[d] = (rdBy[d] || 0) + 1; });
  const days = [];
  for(let i = 13; i >= 0; i--){ const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate() - i); const k = EC.dayStr(d);
    const ex = exBy[k] || 0, rounds = rdBy[k] || 0, rev = rvBy[k] || 0; days.push({k, date: d, ex, rounds, rev, n: ex + rounds + rev}); }
  const since = EC.dayStr(new Date(Date.now() - 13 * DAY)), exC = {};
  (r.ex || []).forEach(x => { const [d, id] = x.split("|"); if(d >= since) exC[id] = (exC[id] || 0) + 1; });
  const rounds = (r.r || []).filter(x => EC.dayStr(new Date(x.d)) >= since), tot = rounds.reduce((a, x) => a + x.n, 0), ok = rounds.reduce((a, x) => a + x.ok, 0);
  const m = r.m || {}, failing = Object.keys(m).filter(k => m[k] > 0).sort((a, b) => m[b] - m[a]).slice(0, 10)
    .map(pid => { const p = EC.ph(pid); return p ? Object.assign(p, {c: m[pid]}) : null; }).filter(Boolean);
  const cards = r.c ? Object.assign({}, r.c, {leech: (r.c.leech || []).map(EC.ph).filter(Boolean)}) : null;
  return {has: true, at, daysAgo, week: r.w, weekDelta: r.w - 1 - EC.S.week, days, active: days.filter(d => d.n).length,
    ex: EX.filter(e => exC[e.id]).map(e => ({id: e.id, name: e.n, c: exC[e.id]})),
    rounds: {count: rounds.length, total: tot, ok, pct: tot ? Math.round(ok / tot * 100) : 0},
    voice: {t: r.t || 0, me: r.me || 0}, failing, cards};
};

/* ============ teacher: links and the sandbox ============ */
const FILE = () => location.pathname.split("/").pop() || "index.html";
EC.hisLink = week => {
  const n = (week == null ? EC.S.week : week) + 1, tail = n + "-" + maskOf(EC.S.got);
  return (onSite() ? EC.SITE + "/" : location.href.split(/[?#]/)[0]) + "#him" + tail;
};
EC.previewSrc = week => FILE() + "?preview" + (EC.DEMO ? "&demo" : "") + "#him" + ((week == null ? EC.S.week : week) + 1);
EC.pv = {
  get(){ try{ return JSON.parse(localStorage.getItem(PKEY) || "{}"); }catch(e){ return {}; } },
  set(o){ try{ localStorage.setItem(PKEY, JSON.stringify(Object.assign(clone(DEF), EC.pv.get(), o))); }catch(e){} changed(); },
  clear(){ try{ localStorage.removeItem(PKEY); }catch(e){} changed(); },
  fill(part, week){ const w = week == null ? EC.S.week : week, got = [];
    for(let n = 0; n <= w; n++) W[n].ph.forEach((_, i) => { if(part === 1 || Math.random() < part) got.push(n + "-" + i); });
    EC.pv.set({got, week: w}); },
  demo(week){ const T = clone(DEF); demoHim(T, week == null ? EC.S.week : week); try{ localStorage.setItem(PKEY, JSON.stringify(T)); }catch(e){} changed(); }
};

/* ============ voice ============ */
/* Clips live in IndexedDB "cnulya-voice" ("cnulya-voice-demo2" under ?demo), keys t:<pid> (teacher) and m:<pid> (his). Never in the state JSON.
   The same database the old app uses, so recordings already made carry over. */
const V = EC.voice = {st: {rec: null, wait: "", playing: "", msg: ""}, max: 6};
let VDB = null, CLIP = {}, AU = null, ACX = null, AN = null, BUF = null;
function vdb(){ return new Promise((res, rej) => { if(VDB) return res(VDB);
  const q = indexedDB.open(EC.DEMO ? "cnulya-voice-demo2" : "cnulya-voice", 1);
  q.onupgradeneeded = () => { if(!q.result.objectStoreNames.contains("c")) q.result.createObjectStore("c"); };
  q.onsuccess = () => { VDB = q.result; res(VDB); }; q.onerror = () => rej(q.error); }); }
function put(k, b){ Object.keys(PEAKS).forEach(x => { if(x.indexOf(k + "|") === 0) delete PEAKS[x]; }); return vdb().then(d => new Promise((res, rej) => { const t = d.transaction("c", "readwrite"); t.objectStore("c").put(b, k);
  t.oncomplete = () => { CLIP[k] = 1; res(); }; t.onerror = () => rej(t.error); })); }
function get(k){ return vdb().then(d => new Promise(res => { const r = d.transaction("c").objectStore("c").get(k);
  r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); })); }
V.del = k => vdb().then(d => new Promise(res => { const t = d.transaction("c", "readwrite"); t.objectStore("c").delete(k);
  t.oncomplete = () => { delete CLIP[k]; res(); changed(); }; t.onerror = () => res(); }));
function scan(){ return vdb().then(d => new Promise(res => { const r = d.transaction("c").objectStore("c").getAllKeys();
  r.onsuccess = () => { CLIP = {}; (r.result || []).forEach(k => CLIP[k] = 1); res(); }; r.onerror = () => res(); })).catch(() => {}); }
V.has = k => !!CLIP[k];
V.count = pre => Object.keys(CLIP).filter(k => k.indexOf(pre + ":") === 0).length;
V.myKey = pid => (EC.HIM ? "m:" : "t:") + pid;
V.canSay = () => "speechSynthesis" in window;
function speakAs(text, key, pitch, done){
  const finish = ok => { if(V.st.playing === key){ V.st.playing = ""; changed(); } if(done){ const d = done; done = null; d(ok); } };
  try{
    const u = new SpeechSynthesisUtterance(String(text).replace(/_+/g, " ").replace(/-/g, " "));
    u.lang = "en-GB"; u.rate = .8; u.pitch = pitch || 1;
    const vs = speechSynthesis.getVoices() || [], v = vs.find(x => /^en-GB/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang));
    if(v) u.voice = v;
    u.onstart = () => { V.st.playing = key; changed(); };
    u.onend = u.onerror = () => finish(true);
    speechSynthesis.cancel(); speechSynthesis.speak(u);
    setTimeout(() => finish(true), 2200 + String(text).length * 120);   // a browser with no voice never fires onend
  }catch(e){ finish(false); }
}
V.say = t => speakAs(t, "robot", 1);
if(V.canSay()) try{ speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => {}; }catch(e){}
function meter(){
  if(ACX) return ACX;
  try{ ACX = new (window.AudioContext || window.webkitAudioContext)(); AN = ACX.createAnalyser(); AN.fftSize = 512; BUF = new Float32Array(AN.fftSize); }catch(e){ ACX = null; }
  return ACX;
}
V.level = () => { if(V.st.rec && V.st.rec.lvl) return V.st.rec.lvl();
  if(V.st.playing && (V.st.playing === "robot" || CLIP[V.st.playing] === 2)) return .3 + .4 * Math.abs(Math.sin(performance.now() / 110));
  if(!AN || !(V.st.rec || (V.st.playing && V.st.playing !== "robot"))) return 0;
  AN.getFloatTimeDomainData(BUF); let s = 0; for(let i = 0; i < BUF.length; i++) s += BUF[i] * BUF[i];
  return Math.min(1, Math.sqrt(s / BUF.length) * 4); };
V.play = k => new Promise(done => {
  if(AU){ AU.pause(); AU = null; }
  if(CLIP[k] === 2){ const p = EC.ph(k.slice(2)); if(!p) return done(false); speakAs(p.en, k, k.charAt(0) === "m" ? 1.3 : 1, done); return; }
  get(k).then(b => {
    if(!b){ V.st.msg = EC.HIM ? "Записи пока нет." : "No recording yet."; changed(); return done(false); }
    const url = URL.createObjectURL(b); AU = new Audio(url); V.st.playing = k;
    if(meter()){ try{ ACX.resume(); const src = ACX.createMediaElementSource(AU); src.connect(ACX.destination); src.connect(AN); }catch(e){} }
    /* the analyser only listens. It must never reach the speakers: the microphone feeds it too, and a mic routed to the
       speakers makes the browser echo canceller erase the voice from every recording after the first playback */
    AU.onended = AU.onerror = () => { URL.revokeObjectURL(url); V.st.playing = ""; AU = null; changed(); done(true); };
    AU.play().catch(() => { V.st.playing = ""; changed(); done(false); }); changed();
  });
});
V.pos = () => AU && AU.duration && isFinite(AU.duration) ? {t: AU.currentTime, dur: AU.duration} : null;
/* Real waveform of a stored clip: n peaks 0..1 (Promise, null if there is no clip or the browser cannot decode it) */
const PEAKS = {};
V.peaks = (k, n = 48) => {
  const id = k + "|" + n; if(PEAKS[id]) return Promise.resolve(PEAKS[id]);
  return get(k).then(b => b ? b.arrayBuffer() : null).then(ab => {
    const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if(!ab || !AC) return null;
    return new Promise(res => { try{ new AC(1, 1, 22050).decodeAudioData(ab, buf => {
      const d = buf.getChannelData(0), step = Math.max(1, Math.floor(d.length / n)), out = [];
      for(let i = 0; i < n; i++){ let m = 0; for(let j = i * step; j < Math.min(d.length, (i + 1) * step); j++) m = Math.max(m, Math.abs(d[j])); out.push(m); }
      const mx = Math.max.apply(null, out.concat(.001)); PEAKS[id] = out.map(x => Math.max(.06, x / mx)); res(PEAKS[id]);
    }, () => res(null)); }catch(e){ res(null); } });
  }).catch(() => null);
};
V.hear = pid => { const p = EC.ph(pid); if(!p) return null;
  if(CLIP["t:" + p.pid]){ V.play("t:" + p.pid); return "friend"; }
  if(V.canSay()){ V.say(p.en); return "robot"; }
  return null; };
V.rec = k => {
  if(V.st.rec) return V.stop();
  if(!navigator.mediaDevices || !window.MediaRecorder){ V.st.msg = EC.HIM ? "Этот браузер не умеет записывать звук. Открой страницу в Chrome." : "This browser can't record. Open the page in Chrome."; changed(); return; }
  V.st.wait = k; V.st.msg = ""; changed();
  /* the clean chain (js/mic.js: RNNoise, soft gate, compressor) when it can be built, else the browser's own processing */
  const plain = () => navigator.mediaDevices.getUserMedia({audio: {echoCancellation: false, noiseSuppression: false, autoGainControl: true}}).then(stream => ({stream, level: null, close: () => stream.getTracks().forEach(t => t.stop())}));
  const mic = window.VOXMIC && VOXMIC.enabled() ? VOXMIC.open().catch(e => { if(e && e.name === "NotAllowedError") throw e; return plain(); }) : plain();
  mic.then(m => {
    const stream = m.stream; V.st.wait = "";
    let mr; try{ mr = new MediaRecorder(stream, {audioBitsPerSecond: m.level ? 64000 : 48000}); }catch(e){ mr = new MediaRecorder(stream); }   // speech: 64 kbit/s Opus is clear and a 6 s clip stays under 50 KB
    let src = null;
    if(!m.level && meter()){ try{ ACX.resume(); src = ACX.createMediaStreamSource(stream); src.connect(AN); }catch(e){} }
    const ch = [];
    mr.ondataavailable = e => { if(e.data && e.data.size) ch.push(e.data); };
    mr.onstop = () => { m.close(); if(src) try{ src.disconnect(); }catch(e){}
      if(V.st.rec && V.st.rec.iv) clearInterval(V.st.rec.iv);
      const b = new Blob(ch, {type: (ch[0] && ch[0].type) || "audio/webm"});
      V.st.rec = null; put(k, b).then(() => { if(k.indexOf("m:") === 0) touch(); else { EC.S.vloc[k] = Date.now(); EC.save(); upAll(); } changed(); }); };
    V.st.rec = {k, mr, lvl: m.level, left: V.max, max: V.max, iv: setInterval(() => { if(!V.st.rec) return;
      V.st.rec.left--; if(V.st.rec.left <= 0) V.stop(); else { EC.emit("rec", V.st.rec.left); changed(); } }, 1000)};
    mr.start(); changed();
  }).catch(() => { V.st.wait = ""; V.st.msg = EC.HIM ? "Микрофон не разрешён. Нажми на замок рядом с адресом и включи микрофон." : "Microphone blocked. Allow it in the padlock menu next to the address."; changed(); });
};
V.stop = () => { const r = V.st.rec; if(r && r.mr && r.mr.state !== "inactive") r.mr.stop(); };
/* ---- the teacher's voice travels over the internet by itself ----
   Teacher: every recording is POSTed to /api/voice with the teacher key. Student: on open, on "online", when the page becomes
   visible and every 5 minutes, the list of clips is fetched and anything new is downloaded into IndexedDB, so it plays with no signal.
   Off in the prototypes (EC.SYNC false) and in demo and sandbox. EC.SYNC = "always" lets a test talk to a stubbed server. */
const vsync = {busy: false, err: "", total: 0};
const vapi = () => EC.API + "/voice";
const vOn = () => EC.online() && !EC.PREVIEW && !EC.DEMO && navigator.onLine !== false;
const VT = {webm: "audio/webm", mp4: "audio/mp4", m4a: "audio/mp4", ogg: "audio/ogg", wav: "audio/wav"};
const pend = () => Object.keys(CLIP).filter(k => k.indexOf("t:") === 0 && CLIP[k] === 1 && (EC.S.vloc[k] || 1) > (EC.S.vup[k] || 0));
function upOne(k){
  const at = EC.S.vloc[k] || 1;
  return get(k).then(b => { if(!b) return;
    return fetch(vapi() + "?k=" + encodeURIComponent(k), {method: "POST", headers: {"x-teacher-key": EC.S.tkey, "content-type": (b.type || "audio/webm").split(";")[0]}, body: b})
      .then(r => { if(r.status === 401){ vsync.err = "key"; throw 0; } if(r.status === 503){ vsync.err = "server"; throw 0; } if(!r.ok){ vsync.err = "net"; throw 0; } vsync.err = ""; EC.S.vup[k] = at; EC.save(); }); });
}
function upAll(){
  if(EC.HIM || !vOn() || vsync.busy) return Promise.resolve();
  if(!EC.S.tkey){ vsync.err = "nokey"; changed(); return Promise.resolve(); }
  const todo = pend(); if(!todo.length){ if(vsync.err === "nokey" || vsync.err === "key") vsync.err = ""; return Promise.resolve(); }
  vsync.busy = true; vsync.err = ""; changed();
  return todo.reduce((p, k) => p.then(() => upOne(k)), Promise.resolve()).catch(() => { if(!vsync.err) vsync.err = "net"; }).then(() => { vsync.busy = false; changed(); });
}
function downAll(){
  if(!EC.HIM || !vOn() || vsync.busy) return Promise.resolve();
  vsync.busy = true; changed();
  return fetch(vapi(), {cache: "no-store"}).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
    const clips = d.clips || {}, keys = Object.keys(clips); vsync.total = keys.length; vsync.err = "";
    const need = keys.filter(k => !CLIP[k] || (EC.S.vdown[k] || 0) < clips[k].at);
    return need.reduce((p, k) => p.then(() => fetch(vapi() + "?k=" + encodeURIComponent(k) + "&x=" + clips[k].x, {cache: "no-store"})
      .then(r => r.ok ? r.blob() : Promise.reject()).then(b => put(k, new Blob([b], {type: VT[clips[k].x] || "audio/webm"}))).then(() => { EC.S.vdown[k] = clips[k].at; EC.save(); changed(); }).catch(() => {})), Promise.resolve());
  }).catch(() => { vsync.err = "net"; }).then(() => { vsync.busy = false; changed(); });
}
V.syncNow = () => EC.HIM ? downAll() : upAll();
V.setKey = s => { EC.S.tkey = String(s || "").trim().slice(0, 80); vsync.err = ""; EC.save(); changed(); return upAll(); };
V.sinfo = () => { const t = V.count("t"), on = vOn();
  if(EC.HIM) return {mode: "student", have: t, total: Math.max(t, vsync.total), busy: vsync.busy, err: vsync.err, on};
  const p = pend().length; return {mode: "teacher", have: t, pending: p, sent: t - p, busy: vsync.busy, err: vsync.err, on, hasKey: !!EC.S.tkey}; };
V.sline = () => { const i = V.sinfo();
  if(i.mode === "student"){
    if(!i.on) return i.have ? "Голос учителя на телефоне: " + i.have + " " + EC.plur(i.have, ["фраза", "фразы", "фраз"]) + "." : "Пока фразы читает робот. Голос учителя появится здесь, когда он запишет фразы.";
    if(i.busy) return "Загружаю голос учителя…";
    if(i.err) return "Нет связи. Голос учителя загрузится сам, когда появится интернет.";
    return i.have ? "Голос учителя на телефоне: " + i.have + " " + EC.plur(i.have, ["фраза", "фразы", "фраз"]) + ". Новые приходят сами." : "Учитель ещё не записал фразы. Они придут сами.";
  }
  if(!i.on) return EC.API ? "Recordings are kept on this device. On the live site they reach his phone by themselves." : "Recordings are kept on this device. The voice server is not connected yet, so they do not reach his phone.";
  if(!i.hasKey || i.err === "nokey") return "Enter your teacher key in Settings, then recordings can reach his phone.";
  if(i.err === "key") return "The server did not accept the teacher key. Check it in Settings.";
  if(i.err === "server") return "The server has no teacher key yet. Set TEACHER_KEY on the project.";
  if(i.busy) return "Sending recordings…";
  if(i.err) return "No connection. Recordings wait and go by themselves.";
  return i.pending ? i.pending + " recording" + (i.pending > 1 ? "s" : "") + " waiting. They go by themselves." : "All " + i.have + " recordings are on the server. They reach his phone by themselves.";
};

/* ============ demo clips: none are stored, every one is "virtual" and the robot reads the phrase ============ */
function demoClips(){
  const week = EC.S.week;
  EC.unlocked().forEach((p, idx) => {
    if((EC.HIM || p.w < week || p.i < 6) && !CLIP["t:" + p.pid]) CLIP["t:" + p.pid] = 2;
    if(EC.HIM && idx % 5 === 2 && !CLIP["m:" + p.pid]) CLIP["m:" + p.pid] = 2;
  });
  return Promise.resolve();
}

/* ============ demo history, for screenshots and for the sandbox ============ */
function rnd(a, b){ return a + Math.floor(Math.random() * (b - a + 1)); }
function demoHim(T, week){
  const now = Date.now(); T.week = week; T.sid = "demo";
  const pids = []; for(let n = 0; n <= week; n++) W[n].ph.forEach((_, i) => pids.push(n + "-" + i));
  T.srs = {};
  pids.forEach(pid => { const n = +pid.split("-")[0], age = week - n;
    const mk = (maxIvl, lapses) => { const ivl = Math.max(1, rnd(Math.ceil(maxIvl/3), maxIvl));
      return {s: 2, ivl, S: ivl * (0.8 + Math.random() * .5), D: 3 + lapses * 1.5 + Math.random() * 3, step: 0, reps: 3 + age * 2, lapses,
              due: dayAt(now, rnd(0, Math.min(ivl, 9)) - (Math.random() < .15 ? 1 : 0)), last: now - rnd(1, Math.max(1, ivl)) * DAY}; };
    if(age >= 1) T.srs[pid + ":h"] = mk(Math.min(40, 3 * Math.pow(2, age)), Math.random() < .2 ? 1 : 0);
    else if(Math.random() < .55) T.srs[pid + ":h"] = Math.random() < .5 ? mk(2, 0) : {s: 1, ivl: 0, S: 2.3, D: 5.2, step: 1, reps: 1, lapses: 0, due: now + rnd(-3, 15) * MIN, last: now - 5 * MIN};
    if(age >= 2) T.srs[pid + ":s"] = mk(Math.min(30, 2 * Math.pow(2, age - 1)), Math.random() < .3 ? rnd(1, 2) : 0);
    else if(age === 1 && Math.random() < .6) T.srs[pid + ":s"] = mk(3, Math.random() < .3 ? 1 : 0);
  });
  ["2-4", "2-8", "3-3"].forEach(p => { if(T.srs[p + ":s"]) T.srs[p + ":s"].lapses = rnd(4, 6); });
  T.rev = [];
  const cids = Object.keys(T.srs);
  for(let i = 26; i >= 0; i--){
    if(i > 5 && Math.random() < .22) continue;          // a few missed days, but the last six are a streak
    const n = i === 0 ? rnd(6, 12) : rnd(9, 26), base = dayAt(now, -i) + rnd(4, 14) * 36e5;
    for(let j = 0; j < n; j++){ const t = Math.min(now - (n - j) * 20000, base + j * 40000);
      const g = Math.random(), gr = g < .09 ? 1 : g < .2 ? 2 : g < .88 ? 3 : 4;
      T.rev.push([t, cids[rnd(0, cids.length - 1)], gr, j < 5 && i < 12 && i > 0 ? 0 : 2, gr > 1 ? rnd(1, 20) : 0]); }
  }
  T.ex = []; T.log = [];
  const exIds = EX.filter(e => !e.cards && !e.games).map(e => e.id);
  for(let i = 13; i >= 0; i--){ if(i > 5 && Math.random() < .3) continue;
    const d = new Date(now - i * DAY); EC.shuffle(exIds).slice(0, rnd(1, 3)).forEach(id => T.ex.push(EC.dayStr(d) + "|" + id));
    const n = rnd(10, 22); T.log.push({d: d.getTime(), n, ok: Math.round(n * (.7 + Math.random() * .25)), k: "srs"});
    if(Math.random() < .4){ const q = rnd(6, 8); T.log.push({d: d.getTime() + 36e5, n: q, ok: q - rnd(0, 2), k: Math.random() < .5 ? "quiz" : "build"}); } }
  T.miss = {"2-4": 6, "2-8": 5, "3-3": 4, "2-6": 3, "3-1": 2, "1-9": 1};
  const got = []; pids.forEach(pid => { const n = +pid.split("-")[0];
    if(n < week - 1 ? Math.random() < .88 : n === week - 1 ? Math.random() < .45 : false) got.push(pid); });
  T.got = got; T.changedAt = now - 2 * 36e5; T.sentAt = now - 2 * 36e5;
}
function demoTeacher(T){
  const now = Date.now(), week = 4; T.week = week; T.sess = "b"; T.name = "Dima";
  T.done = []; T.sessLog = [];
  let t = now - (week * 3 + 1) * 2.3 * DAY;
  for(let n = 0; n < week; n++) ["a","b","c"].forEach(k => { T.done.push(n + k); t += 2.3 * DAY; T.sessLog.push({d: t, w: n, k, min: rnd(22, 31)}); });
  T.done.push(week + "a"); T.sessLog.push({d: now - 1.1 * DAY, w: week, k: "a", min: 26});
  const H = clone(DEF); demoHim(H, week); T.got = H.got;
  T.notes = [
    {d: now - 1.1 * DAY, w: week, k: "a", t: "\"I'd like\" came out as \"I like\" every time. Drill it as one word next session."},
    {d: now - 3.4 * DAY, w: 3, k: "c", t: "Talked about his Space Marines for five minutes with \"I have\". Best session yet."},
    {d: now - 8 * DAY, w: 2, k: "c", t: "Still drops \"is\": \"He my brother\". Expected. Keep going back to week 3."}];
  const d1 = new Date(now + DAY); d1.setHours(18, 30, 0, 0); const d2 = new Date(now + 3 * DAY); d2.setHours(18, 30, 0, 0);
  T.plan = [d1.getTime(), d2.getTime()];
  const saved = EC.S; EC.S = H; const snap = EC.snapshot(); EC.S = saved;
  snap.t = 38; snap.me = 11; snap.recv = now - 3 * 36e5; snap.at = snap.recv;
  T.rep = snap; T.repAt = now - 20 * MIN;
}

/* ============ start ============ */
EC.init = o => {
  EC.NS = (o && o.ns) || "x";
  KEY = keyFor(EC.PREVIEW ? "preview" : EC.HIM ? "him" : "v1");
  PKEY = keyFor("preview");
  const how = load();
  if(EC.DEMO && how === "fresh"){ if(EC.HIM) demoHim(EC.S, EC.LINKWEEK == null ? 4 : EC.LINKWEEK); else demoTeacher(EC.S); }
  if(EC.HIM && EC.LINKWEEK != null) EC.S.week = EC.LINKWEEK;
  if(EC.HIM && EC.LINKMASK){ const g = gotOf(EC.LINKMASK); if(g) EC.S.got = g; }
  if(EC.HIM && !EC.PREVIEW && !EC.S.sid) EC.S.sid = Math.random().toString(36).slice(2, 10);
  saveNow();
  scan().then(() => EC.DEMO ? demoClips() : null).then(() => { changed(); sync(); V.syncNow(); });
  addEventListener("online", () => V.syncNow()); setInterval(() => V.syncNow(), 5 * 60 * 1000);
  addEventListener("online", sync);
  setInterval(sync, 3 * 60 * 1000);
  document.addEventListener("visibilitychange", () => { if(document.visibilityState === "visible"){ sync(); V.syncNow(); } });
};
})();
