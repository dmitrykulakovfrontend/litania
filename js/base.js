/* base.js: the wiring shared by the six prototypes.
   A design sets window.DESIGN before this file loads:
     { ns, views:{id:()=>html}, shell(body)->html, after(), acts:{name:(arg,el,e)=>..}, voiceRow(pid)->html, keys(e)->bool }
   Any screen a design does not define falls back to the plain view below, themed through plain.css variables.
   Shared state and helpers sit on window.X: X.cur X.shown X.game X.filter, X.voice X.phrase X.grades X.memMeter X.plain. */
"use strict";
(function () {
const D = window.DESIGN || {}, HIM = EC.HIM, E = EC.esc, plur = EC.plur;
EC.init({ ns: D.ns || "proto" });
const app = document.getElementById("app");
document.body.dataset.role = HIM ? "student" : "teacher";
const SCREENS = HIM ? ["home", "cards", "games", "road", "bank", "stats"]
                    : ["today", "run", "bank", "watch", "road", "his", "weeks", "guide", "settings"];
window.screens = SCREENS;
const FR = ["фраза", "фразы", "фраз"], CARDS = ["карточка", "карточки", "карточек"];
const LABEL = HIM ? { home: "Сегодня", cards: "Карточки", games: "Игры", road: "В дороге", bank: "Я умею", stats: "Прогресс" }
  : { today: "This week", run: "Session", bank: "Phrase bank", watch: "Watching", road: "On the road", his: "His view", weeks: "All 12", guide: "Guide", settings: "Settings" };
const STAGE = ["новая", "учу", "помню", "крепко"];
const X = window.X = { HIM, E, app, LABEL, STAGE, FR, plur,
  cur: SCREENS.includes(EC.S.ui.screen) ? EC.S.ui.screen : SCREENS[0],
  shown: false, sitting: false, lastCid: "", game: null, swapped: "", filter: "all", sel: null, done: null, coldQ: null, coldI: 0, coldShown: false };

window.go = id => {
  if (!SCREENS.includes(id)) return;
  if (X.cur === "cards" && id !== "cards" && X.sitting) { EC.srs.end(); X.sitting = false; }
  if (id === "cards" && !X.sitting && HIM) { EC.srs.begin(); X.sitting = true; X.shown = false; }
  X.cur = id; EC.S.ui.screen = id; EC.save(); render(); scrollTo(0, 0);
};
X.go = window.go;

/* ---------- shared pieces ---------- */
const msg = () => EC.voice.st.msg ? `<div class="toast" role="status"><span>${E(EC.voice.st.msg)}</span><button class="btn small" data-act="clearMsg">ok</button></div>` : "";
const nav = () => `<nav class="nav" aria-label="${HIM ? "Разделы" : "Sections"}">${SCREENS.map(id =>
  `<button data-act="go" data-arg="${id}" aria-current="${X.cur === id}">${LABEL[id]}</button>`).join("")}</nav>`;
X.msg = msg; X.nav = nav;

function voice(pid) {
  if (D.voiceRow) return D.voiceRow(pid);
  const V = EC.voice, st = V.st, mine = V.myKey(pid), recNow = st.rec && st.rec.k === mine, playing = k => st.playing === k;
  const pct = recNow ? Math.round((1 - st.rec.left / st.rec.max) * 100) : 0;
  let h = `<div class="voice" data-key="v${pid}">`;
  h += `<button class="vb robot${playing("robot") ? " playing" : ""}" data-act="say" data-arg="${pid}"${V.canSay() ? "" : " disabled"}><b>робот</b></button>`;
  if (HIM) h += `<button class="vb friend${playing("t:" + pid) ? " playing" : ""}" data-act="play" data-arg="t:${pid}"${V.has("t:" + pid) ? "" : " disabled"}><b>учитель</b><i>${V.has("t:" + pid) ? (playing("t:" + pid) ? "играет" : "слушать") : "пока нет"}</i></button>`;
  if (st.wait === mine) h += `<button class="vb rec" disabled><b>жду…</b><i>микрофон</i></button>`;
  else if (recNow) h += `<button class="vb rec" style="--p:${pct}%" data-act="stop"><b>стоп</b><i>0:0${st.rec.left}</i></button>`;
  else if (V.has(mine)) h += `<button class="vb mine${playing(mine) ? " playing" : ""}" data-act="play" data-arg="${mine}"><b>${HIM ? "я" : "ваш голос"}</b><i>${playing(mine) ? "играет" : "слушать"}</i></button>`
    + `<button class="vb again" data-act="rec" data-arg="${mine}" aria-label="${HIM ? "записать заново" : "record again"}">↺</button>`;
  else h += `<button class="vb mine" data-act="rec" data-arg="${mine}"><b>${HIM ? "я" : "записать"}</b><i>${HIM ? "записать" : "для него"}</i></button>`;
  return h + `</div>`;
}
function memMeter(m) {
  const pct = m.R == null ? 0 : Math.round(m.R * 100);
  return `<span class="mem" data-stage="${m.stage}" style="--r:${pct}%" role="img" aria-label="${STAGE[m.stage]}${m.R == null ? "" : ", вспомнишь с вероятностью " + pct + " процентов"}"><i></i><em>${STAGE[m.stage]}</em></span>`;
}
function phrase(p, o = {}) {
  const got = EC.got(p.pid), m = o.mem ? EC.srs.mem(p.pid) : null;
  return `<div class="phrase${got ? " got" : ""}" data-key="${p.pid}">
    ${o.tick ? `<button class="tick${got ? " on" : ""}" data-act="tick" data-arg="${p.pid}" aria-pressed="${got}" aria-label="Said with no pause"></button>`
      : o.mark ? `<span class="mark${got ? " on" : ""}" role="img" aria-label="${got ? "Учитель отметил: говорю без паузы" : "Пока без отметки"}"></span>` : ""}
    <div class="txt"><b class="en">${E(p.en)}</b><span class="ru">${E(p.ru)}</span></div>
    ${m ? memMeter(m) : ""}${voice(p.pid)}</div>`;
}
function grades(c) {
  const pv = EC.srs.preview(c.cid);
  return `<div class="grades">${[["Забыл", 1], ["Трудно", 2], ["Помню", 3], ["Легко", 4]].map(([t, g]) =>
    `<button class="grade g${g}" data-act="grade" data-arg="${g}"><b>${t}</b><small>${EC.ivl(pv[g])}</small><kbd>${g}</kbd></button>`).join("")}</div>`;
}
const milestoneBox = n => `<div class="milestone"><b>${HIM ? `Ты уже умеешь ${n} ${plur(n, FR)}. Было ноль.` : `He can say ${n} things.`}</b>
  <button class="btn" data-act="celebrate" data-arg="${n}">${HIM ? "Спасибо" : "Noted"}</button></div>`;
const dots = heat => `<span class="dots" role="img" aria-label="Последние ${heat.length} дней">${heat.map(d => `<i class="${d.n ? "on" : ""}" title="${d.k}"></i>`).join("")}</span>`;
Object.assign(X, { voice, phrase, grades, memMeter, milestoneBox, dots });

function weekPhrases(n, o) { return EC.weekPh(n).map(p => phrase(p, o)).join(""); }
function block(b) { return b && b.t === "rows" ? b.x.map(r => `<p><b>${E(r[0])}</b> ${E(r[1])}</p>`).join("") : ""; }
X.weekPhrases = weekPhrases;

/* ---------- plain views ---------- */
const PLAIN = X.plain = {};

PLAIN.home = () => {
  const k = EC.srs.counts(), s = EC.streak(), w = EC.week(), y = EC.syncState(), ms = EC.milestone(), left = k.neu + k.rev + k.learn;
  return `<section class="screen home"><h1>Неделя ${EC.S.week + 1}</h1>
    <p class="cando"><b>${E(w.cando[0])}</b><br><span class="muted">${E(w.cando[1])}</span></p>${ms ? milestoneBox(ms) : ""}
    <div class="nums"><div><b>${k.neu}</b><span>новых</span></div><div><b>${k.rev}</b><span>повторить</span></div><div><b>${k.learn}</b><span>заново</span></div></div>
    <div class="streak"><b>${s.n}</b><span>${plur(s.n, ["день", "дня", "дней"])} подряд</span>${dots(EC.heat(14))}</div>
    <p class="row wrap"><button class="btn primary" data-act="go" data-arg="cards">${left ? "Начать карточки" : "Карточки"}</button>
      <button class="btn ghost" data-act="go" data-arg="stats">Прогресс</button></p>
    ${y.show ? `<p class="sync ${y.pending ? "pending" : "sent"}">${E(y.text)}</p>` : ""}</section>`;
};

function doneBlock() {
  const st = EC.srs.stats(), more = EC.srs.nextLearnAt(), first = st.seen === 0, tm = st.forecast[1];
  return `<div class="cardbox"><h2>${first ? "Пока нечего повторять" : "На сегодня всё"}</h2>
    <p>${first ? "Карточки появятся, когда будут фразы с занятия." : `Сегодня ответов: ${st.today}. Завтра: ${tm} ${plur(tm, CARDS)}.`}</p>
    ${more ? `<p class="muted">Одна ещё вернётся через ${Math.max(1, Math.round((more - Date.now()) / 6e4))} мин.</p>` : ""}
    <div class="row wrap"><button class="btn primary" data-act="moreNew">Ещё 5 новых</button><button class="btn ghost" data-act="go" data-arg="stats">Прогресс</button></div>
    <div class="row small muted">Новых в день: <b>${EC.srs.newPerDay()}</b>
      <button class="btn small" data-act="npd" data-arg="-1" aria-label="меньше">−</button><button class="btn small" data-act="npd" data-arg="1" aria-label="больше">+</button></div></div>`;
}
X.doneBlock = doneBlock;
PLAIN.cards = () => {
  const c = EC.srs.next(), k = EC.srs.counts();
  const top = `<div class="counts"><span class="n new">${k.neu}<small>новых</small></span><span class="n lrn">${k.learn}<small>заново</small></span><span class="n rev">${k.rev}<small>повторить</small></span></div>`;
  if (!c) return `<section class="screen cards">${top}${doneBlock()}</section>`;
  const front = c.dir === "h" ? `<button class="btn" data-act="hearCard">Послушать ещё раз</button><p class="tag">Что это значит?</p>`
    : `<div class="q">${E(c.ru)}</div><p class="tag">Скажи вслух по-английски</p>`;
  const back = `<div class="a">${E(c.en)}</div><div>${E(c.ru)}</div><p class="tag">Буквы не читай. Послушай и повтори вслух.</p>${voice(c.pid)}`;
  return `<section class="screen cards">${top}<div class="cardbox" data-key="${c.cid}">${c.isNew ? `<span class="tag">новая</span>` : ""}${front}${X.shown ? back : ""}</div>
    ${X.shown ? grades(c) : `<p style="margin-top:16px"><button class="btn primary" data-act="reveal" style="width:100%">Показать</button></p>`}
    <div class="row wrap">${EC.srs.canUndo() ? `<button class="btn ghost small" data-act="undo">Вернуть</button>` : ""}<button class="btn ghost small" data-act="bury">Пропустить до завтра</button></div></section>`;
};

PLAIN.games = () => {
  const g = X.game;
  if (!g) return `<section class="screen games"><h1>Игры</h1><p class="muted">Только фразы, которые уже были на занятии.</p>
    <button class="choice" data-act="gQuiz"><b>Угадай по звуку</b><br><span class="muted">Слушаешь фразу, выбираешь, что она значит</span></button>
    <button class="choice" data-act="gBuild"><b>Собери фразу</b><br><span class="muted">Слова перемешаны, поставь их по порядку</span></button></section>`;
  if (g.kind === "quiz") {
    const q = g.q[g.i];
    if (!q) return `<section class="screen games"><h1>${g.ok} из ${g.q.length}</h1><p class="muted">Остальное не ошибка, просто ещё не выучено.</p><button class="btn primary" data-act="gQuiz">Ещё раз</button> <button class="btn ghost" data-act="gEnd">Хватит</button></section>`;
    return `<section class="screen games"><p class="muted">${g.i + 1} из ${g.q.length}</p><button class="btn primary" data-act="hear" data-arg="${q.pid}" style="width:100%;min-height:72px;font-size:20px">Послушать</button>
      <p class="muted" style="margin-top:14px">Что это значит?</p>${q.opts.map((o, i) => `<button class="choice${g.picked != null ? (i === q.ans ? " right" : i === g.picked ? " wrong" : "") : ""}" data-act="gPick" data-arg="${i}">${E(o)}</button>`).join("")}
      ${g.picked != null ? `<p><b>${E(q.en)}</b></p><button class="btn primary" data-act="gNext">Дальше</button>` : ""}</section>`;
  }
  const t = g.t;
  if (!t) return `<section class="screen games"><h1>${g.ok} из ${g.n}</h1><button class="btn primary" data-act="gBuild">Ещё раз</button> <button class="btn ghost" data-act="gEnd">Хватит</button></section>`;
  const used = g.pick, left = t.tiles.filter(x => !used.includes(x.i));
  return `<section class="screen games"><p class="muted">${g.i + 1} из ${g.n}</p><h2 style="margin-top:0">${E(t.ru)}</h2>
    <div class="tiles-row" aria-label="Твой ответ">${used.map(i => `<button class="word" data-act="gUn" data-arg="${i}"${g.result ? " disabled" : ""}>${E(t.tiles.find(x => x.i === i).t)}</button>`).join("")}</div>
    ${g.result ? `<p><b>${g.result === "ok" ? "Верно" : "Почти. Правильно так:"}</b> ${E(t.en)}</p><button class="btn primary" data-act="gNext">Дальше</button>`
      : `<div class="tiles-row">${left.map(x => `<button class="word" data-act="gTile" data-arg="${x.i}">${E(x.t)}</button>`).join("")}</div>`}</section>`;
};

PLAIN.road = () => {
  const w = EC.week(), h = [];
  h.push(`<section class="screen road"><h1>${HIM ? "В дороге" : "On the road"}</h1>`);
  if (!HIM) h.push(`<p class="muted">${E(SOLO.forTeacher)}</p>`);
  h.push(`<div class="panel">${SOLO.intro.map(t => `<p>${E(t)}</p>`).join("")}</div>`);
  const y = EC.syncState(); if (y.show) h.push(`<p class="sync ${y.pending ? "pending" : "sent"}">${E(y.text)}</p>`);
  h.push(`<h2>Фраза этой недели</h2><p class="cando"><b>${E(w.cando[0])}</b><br><span class="muted">${E(w.cando[1])}</span></p><p>${E(ROAD[EC.S.week])}</p>`);
  h.push(`<h2>Голос</h2><div class="panel">`);
  if (HIM) h.push(`<p>${E(SOLO.voiceHim)}</p><p class="sync ${EC.voice.sinfo().err ? "pending" : "sent"}">${E(EC.voice.sline())}</p><p class="muted small">${E(SOLO.voiceRobot)}</p>`);
  else h.push(`<p>${E(SOLO.voiceTeacher)}</p><p class="sync ${EC.voice.sinfo().err ? "pending" : "sent"}">${E(EC.voice.sline())}</p>`);
  h.push(`</div>`);
  SOLO.groups.forEach(g => {
    h.push(`<h2>${E(g)}</h2><div class="panel">`);
    EX.filter(e => e.g === g).forEach(e => {
      h.push(`<div class="phrase"><div class="txt"><b>${E(e.n)}</b><span class="muted small">${E(e.m)}</span>${e.d.map(t => `<span style="margin-top:6px">${E(t)}</span>`).join("")}${e.road ? `<span style="margin-top:6px;color:var(--accent)">${E(ROAD[EC.S.week])}</span>` : ""}</div>
        ${e.cards ? `<button class="btn primary" data-act="go" data-arg="cards">Карточки</button>` : e.games ? `<button class="btn primary" data-act="go" data-arg="games">Игры</button>`
          : HIM ? `<button class="btn${EC.exOn(e.id) ? " primary" : ""}" data-act="ex" data-arg="${e.id}" aria-pressed="${EC.exOn(e.id)}">${EC.exOn(e.id) ? "Сделано сегодня" : "Сделал сегодня"}</button>` : ""}</div>`);
    });
    h.push(`</div>`);
  });
  if (HIM) h.push(`<p class="muted small">Здесь неделя ${EC.S.week + 1}. ${E(SOLO.weekLink)}</p>`);
  h.push(`<h2>Правила</h2><div class="note ru">${SOLO.rules.map(r => `<p><b>${E(r[0])}</b> ${E(r[1])}</p>`).join("")}</div></section>`);
  return h.join("");
};

function bankStudent() {
  const k = EC.known(), next = MILESTONES.find(m => m > k);
  let h = `<section class="screen bank"><h1>Что я умею</h1><div class="panel"><div class="tile" style="background:none;padding:0"><b style="font-size:40px">${k} ${plur(k, FR)}</b></div>
    <p class="muted small" style="margin:6px 0 0">${E(SOLO.bank)}</p>${next ? `<div class="progress" style="--p:${Math.round(k / next * 100)}%"><i></i></div><p class="muted small" style="margin:0">До ${next}: ещё ${next - k}</p>` : ""}</div>`;
  for (let n = 0; n <= EC.S.week; n++) {
    const c = EC.weekPh(n).filter(p => EC.got(p.pid)).length;
    h += `<h2>${n + 1}. ${E(WRU[n])} <span class="muted small">${c} из ${W[n].ph.length}</span></h2>${weekPhrases(n, { mark: true, mem: true })}`;
  }
  return h + `</section>`;
}
function bankTeacher() {
  const k = EC.known(), total = EC.unlocked().length, next = MILESTONES.find(m => m > k);
  let h = `<section class="screen bank"><h1>Phrase bank</h1><div class="panel"><b style="font-size:32px">He can say ${k}</b> <span class="muted">of ${total} taught so far</span>
    ${next ? `<div class="progress" style="--p:${Math.round(k / next * 100)}%"><i></i></div><p class="muted small" style="margin:0">Next milestone ${next}. Tick a phrase only when it comes out with no pause.</p>` : ""}</div>
    <div class="row wrap"><button class="btn small${X.filter === "all" ? " primary" : ""}" data-act="filter" data-arg="all">All</button><button class="btn small${X.filter === "todo" ? " primary" : ""}" data-act="filter" data-arg="todo">Not yet ticked</button>
    <span class="grow"></span><span class="muted small">${E(EC.voice.sline())}</span></div>`;
  for (let n = 0; n <= EC.S.week; n++) {
    const ps = EC.weekPh(n), c = ps.filter(p => EC.got(p.pid)).length, list = ps.filter(p => X.filter === "all" || !EC.got(p.pid));
    h += `<h2>${n + 1}. ${E(W[n].t)} <span class="muted small">${c} of ${ps.length}</span></h2>${list.map(p => phrase(p, { tick: true })).join("") || `<p class="muted">All ticked.</p>`}`;
  }
  return h + `</section>`;
}
X.bankTeacher = bankTeacher; X.bankStudent = bankStudent;
PLAIN.bank = () => HIM ? bankStudent() : bankTeacher();

PLAIN.stats = () => {
  const st = EC.srs.stats(), s = EC.streak(), heat = EC.heat(84), mx = Math.max(1, ...st.forecast);
  const pad = (heat[0].date.getDay() + 6) % 7;
  const split = [["новые", st.total - st.seen, "var(--panel2)"], ["учу", st.learning, "var(--warn)"], ["знаю", st.young, "color-mix(in srgb,var(--good) 55%,var(--panel2))"], ["крепко", st.mature, "var(--good)"]];
  const lvl = n => n === 0 ? 0 : n < 6 ? 1 : n < 16 ? 2 : n < 31 ? 3 : 4;
  const day = i => i === 0 ? "сег" : i === 1 ? "зав" : "+" + i;
  return `<section class="screen stats"><h1>Прогресс</h1>
    <div class="tiles"><div class="tile"><b>${s.n}</b><span>${plur(s.n, ["день", "дня", "дней"])} подряд</span></div><div class="tile"><b>${st.ret < 0 ? "—" : st.ret + "%"}</b><span>запомнено за месяц</span></div>
      <div class="tile"><b>${st.today}</b><span>ответов сегодня</span></div><div class="tile"><b>${st.mature}</b><span>выучено крепко</span></div></div>
    <h2>Что в колоде</h2><div class="split" role="img" aria-label="Колода по стадиям">${split.map(x => `<i style="flex:${x[1] || 0.001};background:${x[2]}"></i>`).join("")}</div>
    <div class="legend">${split.map(x => `<span style="--c:${x[2]}">${x[0]} ${x[1]}</span>`).join("")}</div>
    <h2>Ближайшие две недели</h2><div class="bars" role="img" aria-label="Сколько карточек ждёт каждый день">${st.forecast.map(n => `<i style="height:${Math.max(2, Math.round(n / mx * 100))}%" title="${n}"></i>`).join("")}</div>
    <div class="barlabels">${st.forecast.map((_, i) => `<span>${day(i)}</span>`).join("")}</div>
    <h2>Двенадцать недель</h2><div class="heatgrid" role="img" aria-label="Занятия по дням">${"<i></i>".repeat(pad).replace(/<i><\/i>/g, '<i style="visibility:hidden"></i>')}${heat.map(d => `<i style="--l:${lvl(d.n)}" title="${d.k}: ${d.n}"></i>`).join("")}</div>
    <h2>По неделям</h2>${st.perWeek.map(r => `<div class="wk"><div class="row"><b class="grow">${r.w + 1}. ${E(WRU[r.w])}</b><span class="muted small">${r.seen} из ${r.total}, крепко ${r.mature}</span></div>
      <div class="twobar"><i style="--a:${Math.round(r.seen / r.total * 100)}%"></i><b style="--b:${Math.round(r.mature / r.total * 100)}%"></b></div></div>`).join("")}
    ${st.leeches.length ? `<h2>Эти фразы ускользают</h2>${st.leeches.map(pid => { const p = EC.ph(pid); return p ? phrase(p, {}) : ""; }).join("")}` : ""}</section>`;
};

/* ---------- teacher ---------- */
PLAIN.today = () => {
  const w = EC.week(), S = EC.S, c = EC.cadence(), ms = EC.milestone(), r = EC.report();
  return `<section class="screen today"><p class="muted" style="margin:16px 0 0">Week ${S.week + 1} of ${W.length}</p><h1>${E(w.t)}</h1>
    <p class="cando"><b>${E(w.cando[0])}</b><br><span class="muted">${E(w.cando[1])}</span></p>${ms ? milestoneBox(ms) : ""}
    <div class="sessions" role="group" aria-label="Session">${["a", "b", "c"].map(k => `<button class="sess${S.sess === k ? " on" : ""}${S.done.includes(S.week + k) ? " done" : ""}" data-act="sess" data-arg="${k}" aria-pressed="${S.sess === k}"><b>${k.toUpperCase()} ${E(SESS[k].name)}</b><small>${SESS[k].blocks.reduce((a, b) => a + b.m, 0)} min</small></button>`).join("")}
      <button class="btn primary" data-act="start" style="align-self:stretch">Start session ${S.sess.toUpperCase()}</button></div>
    <p class="muted small">Sessions in the last 7 days: ${c.last7} of ${c.target}. ${r.has ? `Last report from him ${E(EC.whenEn(r.at))}.` : "No report from him yet."}</p>
    <h2>Why this week</h2><p>${E(w.why)}</p><div class="note ru"><b>Russian rule.</b> ${E(RULE_RU)}</div><div class="note"><b>Sound this week.</b> ${E(w.sound)}</div>
    <h2>This week's phrases</h2><p class="muted small">${E(TICK_RULE)}</p>${weekPhrases(S.week, { tick: true })}
    <h2>Between sessions</h2><div class="panel">${BETWEEN.filter(b => !b.from || S.week >= b.from).map(b => `<p><b>${E(b.b)}</b> ${E(b.x.replace("{hw}", w.hw))}</p>`).join("")}</div>
    <h2>Next sessions</h2><p>${S.plan.length ? S.plan.map(t => E(EC.whenEn(t))).join(", ") : "None planned."}</p>
    <h2>Notes</h2>${S.notes.slice().reverse().map((n, i) => `<p><span class="muted small">${E(EC.whenEn(n.d))}, week ${n.w + 1}</span><br>${E(n.t)} <button class="btn small ghost" data-act="delNote" data-arg="${S.notes.length - 1 - i}" aria-label="Delete note">Delete</button></p>`).join("") || `<p class="muted">No notes yet.</p>`}
    <div class="row wrap"><input id="note" class="grow" placeholder="What happened in the session" aria-label="Note"><button class="btn" data-act="addNote">Add note</button></div></section>`;
};

function runBlockExtras(b, w) {
  let h = "";
  if (b.why) h += `<div class="note ru"><b>Why.</b> ${E(w.why)}</div>`;
  if (b.sound) h += `<div class="note"><b>Sound.</b> ${E(w.sound)}<br><span class="muted small">Check a word out loud in front of him: <a href="https://dictionary.cambridge.org/" target="_blank" rel="noopener">Cambridge</a>, <a href="https://forvo.com/languages/en/" target="_blank" rel="noopener">Forvo</a>, <a href="https://youglish.com/" target="_blank" rel="noopener">YouGlish</a></span></div>`;
  if (b.cando) h += `<div class="note"><b>Aim for.</b> ${E(w.cando[0])}<br><span class="muted">${E(w.cando[1])}</span></div>`;
  if (b.hw) h += `<div class="note"><b>Homework.</b> ${E(w.hw)}</div>`;
  if (b.prev && EC.S.week > 0) h += `<div class="panel"><b>Last week: ${E(W[EC.S.week - 1].t)}</b>${W[EC.S.week - 1].ph.map(p => `<div class="small">${E(p[0])} <span class="muted">${E(p[1])}</span></div>`).join("")}</div>`;
  if (b.swap) { const sw = SWAP[EC.S.week]; h += `<div class="panel"><b>Swap the words</b>${sw.map((s, i) => `<p style="margin:10px 0 4px">${E(s.f)}</p><div class="row wrap">${s.w.map(x => `<button class="btn small" data-act="swap" data-arg="${i}:${E(x)}">${E(x)}</button>`).join("")}<button class="btn small ghost" data-act="swapRnd" data-arg="${i}">Random</button></div>`).join("")}
    ${X.swapped ? `<div class="swapbig">${E(X.swapped)}</div><button class="btn small" data-act="swapSay">Say it (robot)</button>` : ""}</div>`; }
  if (b.cold) {
    if (!X.coldQ) { X.coldQ = EC.cold().map(p => p.pid); X.coldI = 0; X.coldShown = false; }
    const pid = X.coldQ[X.coldI], p = pid && EC.ph(pid);
    h += `<div class="panel"><b>Cold round</b> <span class="muted small">${Math.min(X.coldI + 1, X.coldQ.length)} of ${X.coldQ.length}, unticked phrases only</span>${p
      ? `<div class="swapbig">${E(p.ru)}</div>${X.coldShown ? `<p><b>${E(p.en)}</b></p><div class="row wrap"><button class="btn primary" data-act="coldOk" data-arg="${p.pid}">No pause: tick</button><button class="btn" data-act="coldSkip">Pause: skip</button></div>` : `<button class="btn" data-act="coldShow">Show English</button>`}`
      : `<p>Everything he knows is ticked.</p>`}</div>`;
  }
  if (b.plan) h += `<div class="panel"><b>Next sessions</b><p>${EC.S.plan.length ? EC.S.plan.map(t => E(EC.whenEn(t))).join(", ") : "None planned yet."}</p><div class="row wrap">${[1, 2, 3].map(n => `<button class="btn small" data-act="plan" data-arg="${n}">In ${n} day${n > 1 ? "s" : ""}, 18:30</button>`).join("")}</div></div>`;
  if (b.ph || b.rec) h += `<div class="panel"><b>${b.rec ? "Record them in your voice" : "This week's phrases"}</b>${weekPhrases(EC.S.week, { tick: !!b.ph })}${b.rec ? `<p class="muted small" style="margin:12px 0 0">${E(EC.voice.sline())}</p>` : ""}</div>`;
  if (b.tab === "bank") h += bankTeacher();
  return h;
}
X.runBlockExtras = runBlockExtras;
PLAIN.run = () => {
  const r = EC.run, w = EC.week();
  if (!r && X.done) return `<section class="screen run"><h1>Session ${X.done.k.toUpperCase()} done</h1><p>Week ${X.done.w + 1}. Write down what to remember while it is fresh.</p>
    <div class="row wrap"><input id="note" class="grow" placeholder="What happened in the session" aria-label="Note"><button class="btn" data-act="addNote">Add note</button></div>
    <p style="margin-top:16px"><b>Next:</b> ${E(SESS[EC.S.sess].name)}, week ${EC.S.week + 1}.</p><button class="btn primary" data-act="doneBack">Back to this week</button></section>`;
  if (!r) return `<section class="screen run"><h1>No session running</h1><p class="muted">Pick A, B or C on This week, or start the next one.</p><button class="btn primary" data-act="start">Start session ${EC.S.sess.toUpperCase()}</button></section>`;
  const bs = SESS[r.k].blocks, b = bs[r.idx];
  return `<section class="screen run"><div class="steps">${bs.map((_, i) => `<i class="${i < r.idx ? "done" : i === r.idx ? "now" : ""}"></i>`).join("")}</div>
    <p class="muted small">Session ${r.k.toUpperCase()} ${E(SESS[r.k].name)}, week ${EC.S.week + 1}, block ${r.idx + 1} of ${bs.length}</p>
    <div id="clock" class="clock${r.left < 0 ? " over" : ""}">${EC.fmt(r.left)}</div>
    <h2 style="margin-top:.6em">${E(b.t)} <span class="muted small">${b.m} min</span></h2><div class="blockbody">${b.body}</div>
    <div class="row wrap" style="margin:12px 0"><button class="btn" data-act="toggle">${r.ticking ? "Pause" : "Start timer"}</button><button class="btn primary" data-act="next">${r.idx >= bs.length - 1 ? "Finish" : "Next block"}</button>
      ${r.idx ? `<button class="btn ghost" data-act="back">Back</button>` : ""}<button class="btn ghost" data-act="stopRun">Stop</button></div>${runBlockExtras(b, w)}</section>`;
};

PLAIN.watch = () => {
  const wk = EC.S.week + 1;
  return `<section class="screen watch"><h1>Watching</h1><p>${E(WATCH.intro)}</p><div class="note"><b>${E(WATCH.rule[0])}</b> ${E(WATCH.rule[1])}</div>
    <h2>How to watch</h2>${WATCH.how.map(x => `<p><b>${E(x[0])}.</b> ${E(x[1])}</p>`).join("")}
    ${WATCH.groups.map(([from, label]) => `<h2>${E(label)}${wk < from ? ` <span class="muted small">not yet</span>` : ""}</h2><div class="panel">${VID.filter(v => v.from === from).map(v =>
      `<div class="vid${wk < from ? " locked" : ""}"><b>${v.u ? `<a href="${E(v.u)}" target="_blank" rel="noopener">${E(v.n)}</a>` : E(v.n)}</b> <span class="muted small">${E(v.w)}</span><br><span class="small">${E(v.d)}</span></div>`).join("")}</div>`).join("")}
    <h2>Use his hobbies in the sessions</h2>${WATCH.hobbies.map(t => `<p>${t}</p>`).join("")}</section>`;
};

function reportBlock(r) {
  if (!r.has) return `<div class="panel"><h2 style="margin-top:0">His progress</h2><p>Nothing from him yet. His phone sends a report on its own the first time it has internet after he practises. He presses nothing.</p>
    <button class="btn" data-act="pull">${EC.repLoading() ? "Loading…" : "Refresh"}</button></div>`;
  const c = r.cards;
  return `<div class="panel"><div class="row wrap"><h2 style="margin:0" class="grow">His progress</h2><button class="btn small" data-act="pull">${EC.repLoading() ? "Loading…" : "Refresh"}</button></div>
    <p style="margin-top:8px">Last report <b>${E(EC.whenEn(r.at))}</b>${r.daysAgo >= 3 ? ` <span style="color:var(--bad)">${r.daysAgo} days ago</span>` : ""}. He is on week ${r.week}${r.weekDelta > 0 ? `, ahead of your week ${EC.S.week + 1}` : r.weekDelta < 0 ? `, behind your week ${EC.S.week + 1}. Send him the link` : ", same as you"}.</p>
    ${r.daysAgo >= 3 ? `<p class="muted small">No report for ${r.daysAgo} days means no practice or no internet. The log keeps everything.</p>` : ""}</div>
    ${c ? `<div class="tiles"><div class="tile"><b>${c.seen} / ${c.total}</b><span>cards started</span></div><div class="tile"><b>${c.mature}</b><span>solid</span></div><div class="tile"><b>${c.due}</b><span>waiting now</span></div><div class="tile"><b>${c.streak}</b><span>day streak</span></div><div class="tile"><b>${c.ret < 0 ? "n/a" : c.ret + "%"}</b><span>remembered, 30 days</span></div></div>` : ""}
    <h2 style="font-size:18px">Last two weeks <span class="muted small">${r.active} of 14 days</span></h2>
    <div class="heat14">${r.days.map(d => `<div class="${d.n ? "on" : ""}" title="${d.k}: ${d.rev} cards, ${d.ex} exercises, ${d.rounds} rounds">${d.n || "·"}</div>`).join("")}</div>
    <div class="panel" style="margin-top:14px"><p class="small" style="margin:0 0 6px">${r.rounds.count ? `Rounds: <b>${r.rounds.ok} of ${r.rounds.total}</b> said straight away (${r.rounds.pct}%).` : "No rounds in the last two weeks."}
      Voice: your voice on his phone ${r.voice.t} phrases, he recorded himself on ${r.voice.me}.${!r.voice.t ? " His phone has not received your recordings yet." : ""}</p>
      ${r.ex.map(e => `<div class="small">${e.c}× ${E(e.name)}</div>`).join("")}</div>
    ${c && c.leech.length ? `<h2 style="font-size:18px">Cards that keep slipping</h2>${c.leech.map(p => `<div class="phrase"><div class="txt"><b class="en">${E(p.en)}</b><span class="ru">${E(p.ru)} · week ${p.w + 1}</span></div></div>`).join("")}` : ""}
    ${r.failing.length ? `<h2 style="font-size:18px">What keeps failing</h2>${r.failing.map(p => `<div class="phrase"><b style="color:var(--bad);min-width:2ch">${p.c}</b><div class="txt"><b class="en">${E(p.en)}</b><span class="ru">${E(p.ru)} · week ${p.w + 1}</span></div></div>`).join("")}<p class="muted small">The number is how many times he could not produce it. Start session B with these and record them again.</p>` : ""}`;
}
X.reportBlock = reportBlock;
PLAIN.his = () => {
  const link = EC.hisLink(), r = EC.report(), w = EC.S.week;
  return `<section class="screen his"><h1>His view</h1><div class="cols"><div><div class="phone-frame"><iframe title="His view" src="${E(EC.previewSrc())}" data-static></iframe></div>
    <p class="muted small" style="margin-top:8px">His page exactly as it reaches his phone, on its own storage. Nothing you tap here touches his record.</p></div>
    <div><div class="panel"><h3>His link</h3><p class="small muted">The week and your ticks travel inside the link, because his phone keeps its own copy.</p><pre class="code">${E(link)}</pre>
      <div class="row wrap"><button class="btn primary" data-act="copyLink">Copy this week's link</button><a class="btn ghost" href="${E(EC.previewSrc())}" target="_blank" rel="noopener">Open full screen</a></div></div>
    <div class="panel"><h3>Sandbox</h3><div class="row wrap"><button class="btn small" data-act="pvFill" data-arg="0">Nothing learned</button><button class="btn small" data-act="pvFill" data-arg="0.5">About half</button><button class="btn small" data-act="pvFill" data-arg="1">All of it</button><button class="btn small" data-act="pvDemo">Demo history</button><button class="btn small ghost" data-act="pvClear">Wipe</button></div></div>
    ${reportBlock(r)}</div></div></section>`;
};

PLAIN.weeks = () => `<section class="screen weeks"><h1>All 12</h1><p class="muted">Three short sessions a week, about twenty-five minutes each. Short and often beats long and weekly at this level.</p>
  ${W.map((w, i) => { const done = ["a", "b", "c"].filter(k => EC.S.done.includes(i + k)).length, cur = EC.S.week === i, open = X.open && X.open[i];
    return `<div class="wk${cur ? " cur" : ""}" data-key="w${i}"><div class="row"><button class="btn ghost grow" style="justify-content:flex-start;text-align:left" data-act="openWeek" data-arg="${i}" aria-expanded="${!!open}"><b>${i + 1}. ${E(w.t)}</b></button>
      <span class="muted small">${done === 3 ? "done" : done ? done + "/3" : cur ? "now" : ""}</span>${cur ? "" : `<button class="btn small" data-act="jump" data-arg="${i}">Jump to this week</button>`}</div>
      ${open ? `<div style="padding:8px 0 0 4px"><p><b>${E(w.cando[0])}</b><br><span class="muted">${E(w.cando[1])}</span></p><p>${E(w.why)}</p><p class="muted">${E(w.sound)}</p></div>` : ""}</div>`; }).join("")}</section>`;

PLAIN.guide = () => `<section class="screen guide"><h1>Guide</h1>${GUIDE.map(sec => `<h2>${E(sec.h)}</h2>${sec.b.map(b =>
  b.t === "rows" || b.t === "points" ? b.x.map(r => `<p><b>${E(r[0])}</b> ${E(r[1])}</p>`).join("")
  : b.t === "links" ? `<div class="panel">${b.x.map(l => `<p><a href="${E(l.u)}" target="_blank" rel="noopener"><b>${E(l.n)}</b></a> ${E(l.d)}</p>`).join("")}</div>`
  : b.t === "note" || b.t === "ru" ? `<div class="note${b.t === "ru" ? " ru" : ""}">${b.x}</div>` : `<p>${b.x}</p>`).join("")}`).join("")}</section>`;

PLAIN.settings = () => {
  const S = EC.S;
  return `<section class="screen settings"><h1>Settings</h1><div class="panel"><h3>His name</h3><div class="row wrap"><input id="name" value="${E(S.name)}" placeholder="e.g. Dima" aria-label="His name"><button class="btn" data-act="setName">Save</button></div></div>
    <div class="panel"><h3>Cards</h3><p class="muted small">New cards a day on this device. His own phone keeps its own number.</p><div class="row">${EC.srs.newPerDay()}
      <button class="btn small" data-act="npd" data-arg="-1" aria-label="fewer">−</button><button class="btn small" data-act="npd" data-arg="1" aria-label="more">+</button></div></div>
    <div class="panel"><h3>Milestones</h3><p>${MILESTONES.map(m => `<span style="margin-right:12px">${S.seen.includes(m) ? "✓" : "○"} ${m}</span>`).join("")}</p></div>
    <div class="panel"><h3>Voice sending</h3><p class="small muted">Your recordings reach his phone by themselves. The teacher key lets this device send them. Whoever set up the site has it.</p><div class="row wrap"><input id="tkey" class="secret" type="text" autocomplete="off" spellcheck="false" value="${E(S.tkey)}" placeholder="Teacher key" aria-label="Teacher key"><button class="btn" data-act="setKey">Save</button></div><p class="sync ${EC.voice.sinfo().err ? "pending" : "sent"}" style="margin-top:10px">${E(EC.voice.sline())}</p></div>
    <div class="panel"><h3>His link and the sandbox</h3><p class="small">His link carries the week and your ticks. The sandbox on His view runs on a separate storage key, so practising in it never overwrites his real report.</p></div>
    <p><button class="btn ghost" data-act="reset">Reset everything</button></p></section>`;
};

/* ---------- render ---------- */
const VIEWS = Object.assign({}, PLAIN, D.views || {});
function render() {
  const v = VIEWS[X.cur] || VIEWS[SCREENS[0]];
  const body = v();
  EC.morph(app, D.shell ? D.shell(body) : `${nav()}<main class="plain-main">${msg()}${body}</main>`);
  if (HIM && X.cur === "cards") autoplay();
  if (D.after) D.after();
}
X.render = render;
function autoplay() {
  const c = EC.srs.next(), id = c ? c.cid : "";
  if (id !== X.lastCid) { X.lastCid = id; X.shown = false; if (c && c.dir === "h") EC.voice.hear(c.pid); }
}

EC.on("change", render);
EC.on("tick", left => { const el = document.getElementById("clock"); if (el) { el.textContent = EC.fmt(left); el.classList.toggle("over", left < 0); } });
EC.on("finish", d => { X.done = d; X.coldQ = null; X.swapped = ""; window.go("run"); });

/* ---------- actions ---------- */
const reset = () => { X.coldQ = null; X.coldI = 0; X.coldShown = false; X.swapped = ""; };
const acts = {
  go: id => window.go(id), clearMsg: () => { EC.voice.st.msg = ""; render(); },
  say: pid => EC.voice.say(EC.ph(pid).en), hear: pid => EC.voice.hear(pid), play: k => EC.voice.play(k), rec: k => EC.voice.rec(k), stop: () => EC.voice.stop(),
  tick: pid => EC.tick(pid), celebrate: n => EC.celebrated(+n), filter: f => { X.filter = f; render(); },
  sess: k => EC.setSess(k), start: () => { X.done = null; reset(); EC.runStart(EC.S.sess); window.go("run"); },
  toggle: () => EC.runToggle(), next: () => { reset(); EC.runNext(); }, back: () => { reset(); EC.runBack(); },
  stopRun: () => { reset(); EC.runStop(); window.go("today"); }, doneBack: () => { X.done = null; window.go("today"); },
  swap: a => { const i = a.indexOf(":"); X.swapped = SWAP[EC.S.week][+a.slice(0, i)].f.replace("___", a.slice(i + 1)); render(); },
  swapRnd: a => { const f = SWAP[EC.S.week][+a], x = f.w[Math.floor(Math.random() * f.w.length)]; X.swapped = f.f.replace("___", x); render(); },
  swapSay: () => { if (X.swapped) EC.voice.say(X.swapped); },
  coldShow: () => { X.coldShown = true; render(); }, coldSkip: () => { X.coldI++; X.coldShown = false; render(); },
  coldOk: pid => { EC.tick(pid); X.coldI++; X.coldShown = false; },
  plan: n => { const d = new Date(Date.now() + n * 864e5); d.setHours(18, 30, 0, 0); EC.setPlan(EC.S.plan.concat([d.getTime()])); },
  addNote: () => { const el = document.getElementById("note"); if (el && el.value.trim()) { EC.addNote(el.value); el.value = ""; } }, delNote: i => EC.delNote(+i),
  jump: i => { EC.setWeek(+i); window.go("today"); }, openWeek: i => { X.open = X.open || {}; X.open[i] = !X.open[i]; render(); },
  reveal: () => { X.shown = true; render(); },
  grade: g => { const c = EC.srs.next(); if (c && X.shown) { X.shown = false; EC.haptic(); EC.srs.answer(c.cid, +g); } },
  undo: () => { X.shown = false; EC.srs.undo(); }, bury: () => { const c = EC.srs.next(); if (c) { X.shown = false; EC.srs.bury(c.cid); } },
  moreNew: () => EC.srs.moreNew(5), hearCard: () => { const c = EC.srs.next(); if (c) EC.voice.hear(c.pid); },
  ex: id => EC.exDone(id), setKey: () => EC.voice.setKey((document.getElementById("tkey") || {}).value),
  copyLink: () => EC.copy(EC.hisLink()).then(() => { EC.voice.st.msg = "Copied. Send him that line in the chat."; render(); }),
  pvFill: p => EC.pv.fill(+p), pvClear: () => EC.pv.clear(), pvDemo: () => EC.pv.demo(), pull: () => EC.pullRep(),
  setName: () => EC.setName(document.getElementById("name").value), npd: d => EC.srs.setNewPerDay(EC.srs.newPerDay() + +d),
  reset: () => { if (confirm("Clear all progress?")) EC.reset(); },
  gQuiz: () => { X.game = { kind: "quiz", q: EC.games.quiz(6), i: 0, ok: 0, picked: null }; render(); },
  gPick: i => { const g = X.game, q = g.q[g.i]; if (g.picked != null) return; g.picked = +i; if (+i === q.ans) g.ok++; else EC.miss(q.pid); render(); },
  gNext: () => { const g = X.game; g.picked = null; g.result = null; g.pick = []; g.i++;
    if (g.kind === "quiz") { if (g.i >= g.q.length) EC.games.log("quiz", g.q.length, g.ok); }
    else { g.t = g.pool[g.i] ? EC.games.tiles(g.pool[g.i]) : null; if (!g.t) EC.games.log("build", g.n, g.ok); }
    render(); },
  gBuild: () => { const pool = EC.shuffle(EC.games.buildPool()).slice(0, 5); X.game = { kind: "build", pool, i: 0, ok: 0, n: pool.length, pick: [], t: EC.games.tiles(pool[0]), result: null }; render(); },
  gTile: i => { const g = X.game, t = g.t; g.pick.push(+i);
    if (g.pick.length === t.tiles.length) { const ok = EC.games.check(t.pid, g.pick.map(j => t.tiles.find(x => x.i === j).t)); g.result = ok ? "ok" : "bad"; if (ok) g.ok++; else EC.miss(t.pid); }
    render(); },
  gUn: i => { X.game.pick = X.game.pick.filter(j => j !== +i); render(); }, gEnd: () => { X.game = null; render(); }
};
Object.assign(acts, D.acts || {});
EC.bind(app, acts);

EC.onKey(e => {
  if (D.keys && D.keys(e) === true) return;
  if (HIM && X.cur === "cards") {
    if (e.code === "Space" || e.key === "Enter") { e.preventDefault(); if (!X.shown && EC.srs.next()) { X.shown = true; render(); } }
    else if (["1", "2", "3", "4"].includes(e.key) && X.shown) { const c = EC.srs.next(); if (c) { X.shown = false; EC.srs.answer(c.cid, +e.key); } }
    else if (e.key === "u") { X.shown = false; EC.srs.undo(); }
  }
  if (!HIM && X.cur === "run" && EC.run) {
    if (e.code === "Space") { e.preventDefault(); EC.runToggle(); }
    else if (e.key === "ArrowRight") { reset(); EC.runNext(); } else if (e.key === "ArrowLeft") { reset(); EC.runBack(); }
  }
});

if (HIM && X.cur === "cards") { EC.srs.begin(); X.sitting = true; }
render();
})();
