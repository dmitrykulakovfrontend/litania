/* vox: the English coach as a machine spirit's interface, in the style of a grimdark far-future war setting.
   Iron plates hold the structure, parchment holds the English (the litany he recites), cogitator glass holds the machine's numbers.
   The teacher's tick is a purity seal. Weeks are worlds on a crusade chart. */
(function () {
"use strict";
const E = EC.esc, HIM = EC.HIM, A = window.VOXART, FX = window.VOXFX, SFX = window.VOXSFX, ic = n => `<span class="ic">${A.icon[n]}</span>`;
const calm = matchMedia("(prefers-reduced-motion: reduce)");
const DAYS = ["день", "дня", "дней"], FR = ["фраза", "фразы", "фраз"], CARDS = ["карточка", "карточки", "карточек"];
const HARD = [2, 7];
/* the bank count is his rank in the Chapter. Art: Warhammer 40,000 artwork, backgrounds removed */
const TOTAL = W.reduce((a, w) => a + w.ph.length, 0);
const RANKS = [
  { n: 0, ru: "Неофит", en: "Neophyte", img: null, who: "", line: "Каждый боевой брат начинал с первого слова." },
  { n: 5, ru: "Скаут", en: "Scout", img: "rank-scout", who: "", line: "Первые слова уже с тобой." },
  { n: 10, ru: "Боевой брат", en: "Battle-brother", img: "rank-brother", who: "", line: "Десять фраз без запинки. Ты в строю." },
  { n: 25, ru: "Ветеран", en: "Veteran", img: "rank-veteran", who: "", line: "Двадцать пять литаний. В начале не было ни одной." },
  { n: 50, ru: "Лейтенант", en: "Lieutenant", img: "rank-lieutenant", who: "как Тит", whoEn: "like Titus", line: "Полсотни фраз. За тобой уже можно идти." },
  { n: 75, ru: "Капитан", en: "Captain", img: "rank-captain", who: "как Катон Сикарий", whoEn: "like Cato Sicarius", line: "Семьдесят пять фраз. Рота под твоим началом." },
  { n: 100, ru: "Магистр ордена", en: "Chapter Master", img: "rank-master", who: "как Марней Калгар", whoEn: "like Marneus Calgar", line: "Сто фраз. Орден знает твоё имя." },
  { n: TOTAL, ru: "Примарх", en: "Primarch", img: "rank-primarch", who: "Робаут Жиллиман", whoEn: "Roboute Guilliman", line: "Все фразы курса. Выше только Император." }];
const rankOf = k => RANKS.filter(r => k >= r.n).pop(), nextRank = k => RANKS.find(r => r.n > k) || null;
const art = (id, cls, lazy = true) => `<img class="${cls || ""}" src="img/${id}.webp" alt=""${lazy ? " loading=\"lazy\"" : ""} decoding="async">`;
const figure = (r, cls) => `<figure class="fig ${cls || ""}${r.img ? "" : " none"}">${r.img ? art(r.img, "", false) : A.aquila(120, "qf" + (cls || "x") + r.n)}</figure>`;
const artNote = en => `<p class="muted small">${en ? "Art from the Warhammer 40,000 universe by Games Workshop and its artists, backgrounds removed. A private fan project, not for sale." : "Арт из вселенной Warhammer 40 000, художники Games Workshop. Фон убран. Фан-проект для себя, не для продажи."}</p>`;
function ladder(k, en) {
  const now = rankOf(k);
  return `<div class="ladder" role="list" aria-label="${en ? "Ranks" : "Звания"}">${RANKS.map(r => `<div class="rung${k >= r.n ? " got" : ""}${now === r ? " now" : ""}" role="listitem">${figure(r, "sm")}<b>${en ? r.en : r.ru}</b><small>${r.n ? r.n + " " + (en ? "phrases" : EC.plur(r.n, FR)) : (en ? "the start" : "начало")}</small></div>`).join("")}</div>`;
}
/* the hero at the top of his home: his rank, drawn as the Chapter's hero of that rank */
function heroRank(ms) {
  const k = EC.known(), r = ms ? rankOf(ms) : rankOf(k), nx = nextRank(k), prog = nx ? Math.round((k - rankOf(k).n) / (nx.n - rankOf(k).n) * 100) : 100;
  return `<section class="pl herofig${ms ? " fresh" : ""}" aria-label="Твоё звание">${figure(r, "lg")}<div class="herotx">
    <p class="kick">${ms ? "Новое звание" : "Твоё звание"}</p><b class="eng rname">${r.ru}</b>${r.who ? `<span class="who">${r.who}</span>` : ""}
    <p class="rline">${ms ? `Ты уже умеешь ${ms} ${EC.plur(ms, FR)}. Было ноль.` : E(r.line)}</p>
    ${ms ? `<p class="motto">Император защищает.</p><button class="btn primary" data-act="celebrate" data-arg="${ms}">Принято</button>`
      : `<p class="muted small">Ты умеешь ${k} ${EC.plur(k, ["фразу", "фразы", "фраз"])}.</p>${nx ? `<div class="bar" role="img" aria-label="До звания ${nx.ru}: ещё ${nx.n - k}"><i style="width:${prog}%"></i></div><p class="muted small">До звания «${nx.ru}»: ещё ${nx.n - k}</p>` : ""}`}</div></section>`;
}
function chaosStrip(k) {
  const t = k.rev + k.learn;
  if (!t) return `<div class="purge ok"><span class="pseal">${A.seal("pure", 30, false)}</span><p><b>Все литании чисты.</b> ${EC.srs.stats().seen ? "Хаос отступил." : "Скверне пока нечего подтачивать."}${k.neu ? " Новые фразы ждут в карточках." : ""}</p></div>`;
  return `<button class="purge" data-act="go" data-arg="cards"><span class="ptx"><b>${A.chaosIcon()}Скверна подтачивает ${t} ${EC.plur(t, ["литанию", "литании", "литаний"])}</b><span>Абаддон хочет, чтобы ты их забыл. Повтори, и скверна уйдёт.</span></span><span class="cfig">${art("chaos-abaddon", "", false)}</span></button>`;
}

/* ---------- shared bits ---------- */
function voice(pid) {
  const V = EC.voice, st = V.st, mine = V.myKey(pid), recNow = st.rec && st.rec.k === mine, waiting = st.wait === mine, on = k => st.playing === k && (k !== "robot" || X.np === pid);
  const pct = recNow ? Math.round((1 - st.rec.left / st.rec.max) * 100) : 0, robotOn = on("robot");
  let h = `<div class="vs" data-key="v${pid}">`;
  h += `<button class="vb robot${robotOn ? " on" : ""}" data-act="say" data-arg="${pid}"${V.canSay() ? "" : " disabled"}>${ic("robot")}<b>${HIM ? "робот" : "robot"}</b></button>`;
  if (HIM) h += `<button class="vb teacher${on("t:" + pid) ? " on" : ""}" data-act="play" data-arg="t:${pid}"${V.has("t:" + pid) ? "" : " disabled"}>${ic("teacher")}<b>учитель</b><i>${V.has("t:" + pid) ? (on("t:" + pid) ? "играет" : "слушать") : "ещё нет"}</i></button>`;
  if (waiting) h += `<button class="vb me rec" disabled>${ic("rec")}<b>${HIM ? "жду…" : "wait…"}</b><i>${HIM ? "микрофон" : "microphone"}</i></button>`;
  else if (recNow) h += `<button class="vb me rec" data-act="stop" style="--p:${pct}%">${ic("stop")}<b>${HIM ? "стоп" : "stop"}</b><i>0:0${st.rec.left}</i></button>`;
  else if (V.has(mine)) h += `<button class="vb me${on(mine) ? " on" : ""}" data-act="play" data-arg="${mine}">${ic(HIM ? "me" : "teacher")}<b>${HIM ? "я" : "yours"}</b><i>${on(mine) ? (HIM ? "играет" : "playing") : (HIM ? "слушать" : "listen")}</i></button>`
    + `<button class="vb again" data-act="rec" data-arg="${mine}" aria-label="${HIM ? "Записать заново" : "Record again"}">${ic("redo")}</button>`;
  else h += `<button class="vb me${HIM ? "" : " recme"}" data-act="rec" data-arg="${mine}">${ic(HIM ? "me" : "rec")}<b>${HIM ? "я" : "record"}</b><i>${HIM ? "записать" : "for him"}</i></button>`;
  return h + `</div>`;
}
/* the vox-trace: the real peaks of the teacher's clip when there is one, a stand-in shaped like the phrase otherwise.
   The part already played lights up, driven by --p from the playback loop in after() */
const PK = {}, ASK = {};
function peaks(k, pid, n) {
  const id = k + n; if (PK[id]) return PK[id];
  if (EC.voice.has(k) && !ASK[id]) { ASK[id] = 1; EC.voice.peaks(k, n).then(p => { if (p) { PK[id] = p; clearTimeout(ASK.t); ASK.t = setTimeout(() => X.render(), 60); } }); }
  return EC.wave(pid, n);
}
function trace(pid, who, n = 44) {
  const k = (who === "m" ? "m:" : "t:") + pid, p = peaks(k, pid, n), w = 3, gap = 1.8, H = 30, on = EC.voice.st.playing === k || (who === "t" && EC.voice.st.playing === "robot" && X.np === pid);
  return `<div class="trace ${who}${on ? " on" : ""}" data-trace="${who === "m" ? "m:" + pid : "t:" + pid}" aria-hidden="true"><svg viewBox="0 0 ${f1(n * (w + gap))} ${H}" preserveAspectRatio="none">${p.map((v, i) => { const h = Math.max(2.4, v * H); return `<rect x="${f1(i * (w + gap))}" y="${f1((H - h) / 2)}" width="${w}" height="${f1(h)}" rx="1.2"/>`; }).join("")}</svg><i class="head"></i></div>`;
}
/* the dossier: what the scheduler knows about a phrase, in plain words */
function dossier(pid) {
  const m = EC.srs.mem(pid);
  if (!m.stage) return `<p class="dossier"><span>новая литания</span><span>в памяти ещё нет</span></p>`;
  const dd = m.S == null ? null : m.S < 1 ? "меньше дня" : Math.round(m.S) + " " + EC.plur(Math.round(m.S), DAYS);
  return `<p class="dossier"><span>в памяти <b>${Math.round((m.R || 0) * 100)}%</b></span>${dd ? `<span>держится <b>${dd}</b></span>` : ""}<span>сбоев <b>${m.lapses || 0}</b></span></p>`;
}
const fading = pid => { const m = EC.srs.mem(pid); return m.stage >= 2 && m.R != null && (m.R < .9 || (m.due != null && m.due <= Date.now())); };
const STAGE = ["ещё не начата", "учу", "помню", "крепко"];
function integrity(m) {
  const pct = m.R == null ? 0 : Math.round(m.R * 100), taint = m.stage >= 2 && m.R != null && (m.R < .9 || (m.due != null && m.due <= Date.now()));
  const label = taint ? "тускнеет, скверна подступает" : STAGE[m.stage];
  return `<span class="integ s${m.stage}${taint ? " taint" : ""}" role="img" aria-label="${label}${m.R == null ? "" : ", в памяти " + pct + " процентов"}"><i style="--r:${m.stage ? pct : 0}%"></i><em>${taint ? A.chaosIcon() + "тускнеет" : STAGE[m.stage]}${m.R == null || !m.stage ? "" : " · " + pct + "%"}</em></span>`;
}
function sealTick(pid) {
  const on = EC.got(pid);
  return `<button class="stamp${on ? " on" : ""}" data-act="tick" data-arg="${pid}" aria-pressed="${on}" aria-label="${on ? "Seal placed. Press to remove" : "Place the seal: said with no pause"}">${on ? A.seal(pid, 34, true) : `<span class="socket">${ic("plus")}</span>`}</button>`;
}
function litany(p, o = {}) {
  const got = EC.got(p.pid), m = o.mem ? EC.srs.mem(p.pid) : null;
  return `<div class="lit${got ? " got" : ""}" data-key="l${p.pid}">
    ${o.tick ? sealTick(p.pid) : o.mark ? `<span class="mk" role="img" aria-label="${got ? "Печать учителя: говорю без паузы" : "Печати пока нет"}">${got ? A.seal(p.pid, 30, false) : ""}</span>` : ""}
    <div class="tx"><b class="en">${E(p.en)}</b><span class="ru">${E(p.ru)}</span>${m ? integrity(m) : ""}</div>${voice(p.pid)}</div>`;
}
const pl = (cls, body, label) => `<section class="pl ${cls || ""}"${label ? ` aria-label="${E(label)}"` : ""}>${body}</section>`;
const h2 = t => `<h2 class="eng">${t}</h2>`;
const medal = (n, en) => { const r = rankOf(n);
  return `<section class="pl medalbox" role="status">${figure(r, "md")}<div><p class="kick">${en ? "New rank" : "Новое звание"}</p><b class="eng">${en ? r.en : r.ru}</b>
  <p>${en ? `He can say ${n} things. Show him this number. It was zero.` : `Ты уже умеешь ${n} ${EC.plur(n, FR)}. Было ноль.`}</p><p class="motto">Император защищает.</p>
  <button class="btn primary" data-act="celebrate" data-arg="${n}">${en ? "Noted" : "Принято"}</button></div></section>`; };
const f1 = x => Math.round(x * 10) / 10;
function wrapLines(t, max) { const out = []; let cur = ""; String(t).split(/\s+/).forEach(w => { if ((cur + " " + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }); if (cur) out.push(cur); return out.slice(0, 3); }
function chart(role) {
  const n = EC.S.week, en = role === "en", sel = X.world == null ? n : X.world, ps = EC.weekPh(sel), got = ps.filter(p => EC.got(p.pid)).length;
  const title = en ? W[sel].t : WRU[sel], lines = wrapLines(title, 12), L = lines.length, top = 200 - (L * 27) / 2;
  const center = `<g class="center" aria-hidden="true"><text x="200" y="${f1(top - 16)}" text-anchor="middle" class="c-k">${en ? "WEEK" : "НЕДЕЛЯ"} ${sel + 1}${sel === n ? (en ? " · NOW" : " · СЕЙЧАС") : ""}</text>
    ${lines.map((l, i) => `<text x="200" y="${f1(top + 22 + i * 27)}" text-anchor="middle" class="c-t">${E(l)}</text>`).join("")}
    <text x="200" y="${f1(top + L * 27 + 26)}" text-anchor="middle" class="c-s">${en ? `${got} of ${ps.length} sealed` : `печатей ${got} из ${ps.length}`}</text>${HARD.includes(sel) ? `<text x="200" y="${f1(top + L * 27 + 48)}" text-anchor="middle" class="c-w">${en ? "a hard week" : "трудная неделя"}</text>` : ""}</g>`;
  /* the first time a week is on screen, the warp storm lifts off its world */
  if (EC.S.ui.vxSeen == null || EC.S.ui.vxSeen < n) { X.clearing = n; EC.S.ui.vxSeen = n; EC.save(); }
  return A.chart({ clear: X.clearing, n, sel, act: en ? "tworld" : "world", lang: en ? "en" : "ru", ticks: W.map((_, i) => EC.weekPh(i).filter(p => EC.got(p.pid)).length), totals: W.map(w => w.ph.length),
    label: i => en ? `Week ${i + 1}: ${W[i].t}` : i > n ? `Неделя ${i + 1}, ещё закрыта` : `Неделя ${i + 1}: ${WRU[i]}`, center });
}
function studs(heat) { return `<span class="studs" aria-hidden="true">${heat.map((d, i) => `<i class="${d.n ? "on" : ""}${i === heat.length - 1 ? " today" : ""}" style="--i:${i}"></i>`).join("")}</span>`; }
const syncLine = () => { const y = EC.syncState(); return y.show ? `<p class="voxline ${y.pending ? "wait" : "ok"}"><span class="lampi"></span>${E(y.text)}</p>` : ""; };

/* ---------- shells ---------- */
const TABS = [["home", "scroll"], ["cards", "slate"], ["games", "die"], ["road", "route"], ["bank", "sealic"]];
function studentShell(body) {
  const at = Math.max(0, TABS.findIndex(([id]) => X.cur === id || (id === "home" && X.cur === "stats")));
  return `${X.msg()}<main class="vx-s">${body}</main>${mini()}${X.cur === "cards" ? "" : `<nav class="tabs" aria-label="Разделы" style="--at:${at}"><i class="tabind" aria-hidden="true"></i>${TABS.map(([id, i]) =>
    `<button data-act="go" data-arg="${id}" aria-current="${X.cur === id || (id === "home" && X.cur === "stats")}">${ic(i)}<span>${X.LABEL[id]}</span></button>`).join("")}</nav>`}`;
}
const sndBtn = en => { const on = SFX.on(); return `<button class="sq snd" data-act="snd" aria-pressed="${on}" aria-label="${en ? (on ? "Sounds on. Turn off" : "Sounds off. Turn on") : (on ? "Звуки включены. Выключить" : "Звуки выключены. Включить")}">${ic(on ? "sndon" : "sndoff")}</button>`; };
function teacherShell(body) {
  return `<header class="vx-top"><div class="brand">${A.aquila(58, "qt")}<span class="eng">Литания</span><small>Chapter cogitator</small></div>
    <nav aria-label="Sections">${window.screens.map(id => `<button data-act="go" data-arg="${id}" aria-current="${X.cur === id}">${X.LABEL[id]}</button>`).join("")}</nav>${sndBtn(true)}</header>${X.msg()}<main class="vx-t">${body}</main>`;
}
const topbar = () => `<header class="sbar">${A.aquila(62, "qs")}<span class="eng brand">Литания</span><span class="glass wchip" aria-label="Неделя ${EC.S.week + 1} из ${W.length}"><span class="wlab">Неделя </span>${String(EC.S.week + 1).padStart(2, "0")}/${W.length}</span>${sndBtn(false)}</header>`;

/* ---------- student: home ---------- */
function home() {
  const k = EC.srs.counts(), s = EC.streak(), n = EC.S.week, w = EC.week(), ms = EC.milestone(), left = k.neu + k.rev + k.learn;
  const mins = Math.max(1, Math.round(left * 12 / 60)), ps = EC.weekPh(n), sealed = ps.filter(p => EC.got(p.pid)).length, sel = X.world == null ? n : X.world;
  return `${topbar()}<div class="home-grid">
    <div class="col-a">${heroRank(ms)}
    ${pl("orders", `${h2("Приказ на сегодня")}<div class="glass readout" role="group" aria-label="Что ждёт сегодня"><div><b data-count="${k.neu}">${k.neu}</b><span>новых</span></div><div class="r"><b data-count="${k.learn}">${k.learn}</b><span>заново</span></div><div class="g"><b data-count="${k.rev}">${k.rev}</b><span>повторить</span></div></div>
      ${chaosStrip(k)}<button class="btn primary big shine" data-act="go" data-arg="cards">${left ? `Начать карточки<small>около ${mins} мин</small>` : "Открыть карточки"}</button>
      <div class="pair"><button class="btn" data-act="go" data-arg="games">${ic("die")}Игры на слух</button><button class="btn" data-act="go" data-arg="road">${ic("route")}В дороге</button></div>`)}
    ${pl("weekpl", `<p class="kick">Неделя ${n + 1}${HARD.includes(n) ? ", трудная" : ""}</p><h1 class="eng title">${E(WRU[n])}</h1>
      <div class="parch cando"><b>${E(w.cando[0])}</b><span>${E(w.cando[1])}</span></div>
      <div class="sealrow" role="group" aria-label="Фразы недели. Печати учителя: ${sealed} из ${ps.length}">${ps.map((p, i) => { const got = EC.got(p.pid), m = EC.srs.mem(p.pid), fd = fading(p.pid);
        return `<button class="sr${got ? " on" : ""} m${m.stage}${fd ? " fd" : ""}${X.slot === p.pid ? " sel" : ""}" data-act="slot" data-arg="${p.pid}" aria-pressed="${X.slot === p.pid}" aria-label="${E(p.en)}${got ? ", печать учителя" : ""}${fd ? ", тускнеет" : ""}" style="--i:${i}">${got ? A.seal(p.pid, 30, false) : `<span>${i + 1}</span>`}${fd ? `<em>${A.chaosIcon()}</em>` : ""}</button>`; }).join("")}</div>
      ${X.slot && EC.ph(X.slot) && EC.ph(X.slot).w === n ? (() => { const p = EC.ph(X.slot); return `<div class="parch slotcap" data-key="cap${p.pid}"><b class="en">${E(p.en)}</b><span class="ru">${E(p.ru)}</span>${trace(p.pid, "t", 36)}${voice(p.pid)}${integrity(EC.srs.mem(p.pid))}</div>`; })() : ""}
      <p class="muted small">Нажми на круг, чтобы услышать фразу. Печать ставит учитель, когда фраза выходит без паузы: ${sealed} из ${ps.length}.</p>
      <button class="btn small" data-act="station" data-arg="${n}">Все фразы недели</button>`)}</div>
    <div class="col-b">${pl("chartbox", `${h2("Крестовый поход")}${chart("ru")}<div class="chart-foot">${sel <= n ? `<button class="btn" data-act="station" data-arg="${sel}">Фразы недели ${sel + 1}</button>` : ""}<p class="muted small">Звезда Хаоса: трудные недели, их осаждает враг. Будущие недели скрыты варп-штормом. Зелёная дуга: печати учителя.</p></div>`)}
    <button class="pl streak" data-act="go" data-arg="stats" aria-label="Прогресс. ${s.n} ${EC.plur(s.n, DAYS)} подряд">${FX.flap("", String(s.n).padStart(2, "0"), "sn", String(s.n))}<span class="st">${EC.plur(s.n, DAYS)} подряд<small>Прогресс и прогноз</small></span>${studs(EC.heat(14))}</button>
    ${syncLine()}</div></div>`;
}

/* ---------- student: cards ---------- */
const cur = () => X.ahead && X.ahead.length ? EC.srs.at(X.ahead[0]) : EC.srs.next();
function gradeRow(c) {
  const pv = EC.srs.preview(c.cid);
  /* colour is not the only signal: each plate carries 1 to 4 chevrons, like the marks of service on a sleeve */
  const chev = n => `<svg class="chev" viewBox="0 0 16 ${n * 4.5 + 6}" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<path d="M1.5 ${i * 4.5 + 7} 8 ${i * 4.5 + 1.5} 14.5 ${i * 4.5 + 7}"/>`).join("")}</svg>`;
  return `<div class="grades" role="group" aria-label="Как ты вспомнил?">${[[1, "Забыл", "r"], [2, "Трудно", "a"], [3, "Помню", "g"], [4, "Легко", "w"]].map(([g, t, l]) =>
    `<button class="gb ${l}" data-act="grade" data-arg="${g}"><span class="gtop"><i class="lamp"></i>${chev(g)}</span><b>${t}</b><small><span>через </span>${EC.ivl(pv[g])}</small><kbd>${g}</kbd></button>`).join("")}</div>`;
}
function sheet() {
  if (!X.sheet) return "";
  const r = EC.srs.retention(), npd = EC.srs.newPerDay();
  return `<div class="sheet-wrap" data-act="sheetBg"><div class="sheet pl" role="dialog" aria-modal="true" aria-labelledby="shT">${h2(`<span id="shT">Настройки карточек</span>`)}
    <div class="setrow"><div><b>Новых фраз в день</b><span>Сколько новых карточек приходит каждый день.</span></div>
      <div class="stepper"><button class="btn" data-act="npd" data-arg="-1" aria-label="Меньше">${ic("minus")}</button><output class="glass" aria-live="polite">${npd}</output><button class="btn" data-act="npd" data-arg="1" aria-label="Больше">${ic("plus")}</button></div></div>
    <div class="setrow col"><div><b>Как крепко помнить</b><span>Чем выше, тем чаще карточки возвращаются. 90% подходит почти всем.</span></div>
      <div class="seg" role="radiogroup" aria-label="Как крепко помнить">${[[.85, "реже"], [.9, "обычно"], [.95, "чаще"]].map(([v, t]) => `<button role="radio" aria-checked="${Math.abs(r - v) < .001}" data-act="ret" data-arg="${v}">${Math.round(v * 100)}%<small>${t}</small></button>`).join("")}</div></div>
    <button class="btn primary big" data-act="sheet" id="shDone">Готово</button></div></div>`;
}
function doneState() {
  const st = EC.srs.stats(), more = EC.srs.nextLearnAt(), ahead = EC.srs.aheadList(1).length;
  if (!st.total) return pl("done", `<div class="emb">${A.emblem(72, "ed")}</div>${h2("Карточек пока нет")}<p>Они появятся после первого занятия с учителем.</p><button class="btn" data-act="go" data-arg="home">На главную</button>`);
  const mins = more ? Math.max(1, Math.round((more - Date.now()) / 6e4)) : 0;
  return pl("done glory", `<div class="halo" aria-hidden="true"><i class="rays"></i></div><figure class="fig emp">${art("emperor", "", false)}</figure>${h2("На сегодня всё")}<p class="motto">Скверна изгнана. Мужество и честь.</p>
    <div class="glass readout"><div><b data-count="${st.today}">${st.today}</b><span>ответов сегодня</span></div><div><b data-count="${st.forecast[1]}">${st.forecast[1]}</b><span>ждёт завтра</span></div><div class="g"><b${st.ret < 0 ? "" : ` data-count="${st.ret}" data-suf="%"`}>${st.ret < 0 ? "—" : st.ret + "%"}</b><span>запомнено</span></div></div>
    ${mins ? `<p class="muted">Одна карточка вернётся через ${mins} мин. Можно закрыть и вернуться.</p>` : ""}
    <button class="btn primary big" data-act="moreNew">Ещё 5 новых</button>${ahead ? `<button class="btn" data-act="ahead">Повторить заранее</button>` : ""}<button class="btn ghost" data-act="go" data-arg="home">На главную</button>`);
}
/* today's stack as service studs on a chain, one per answer; a long stack becomes a filled rail. The cog rides the front */
function railOf(done, total) {
  const pct = Math.round(done / total * 100), lab = `Сегодня сделано ${done}, осталось ${total - done}`;
  if (total > 36) return `<div class="rail" role="img" aria-label="${lab}"><i style="width:${pct}%"></i><span class="rcog" style="left:${pct}%">${A.icon.gear}</span></div>`;
  return `<div class="rail studded" role="img" aria-label="${lab}">${Array.from({ length: total }, (_, i) => `<i class="${i < done ? "on" : i === done ? "now" : ""}"></i>`).join("")}</div>`;
}
function cards() {
  const c = cur(), k = EC.srs.counts(), st = EC.srs.stats(), done = st.today, left = k.neu + k.rev + k.learn, total = Math.max(1, done + left);
  const hud = `<header class="hud"><button class="sq" data-act="go" data-arg="home" aria-label="Закрыть карточки">${ic("close")}</button>
    <div class="glass hudr" role="group" aria-label="Что ждёт"><span><b data-count="${k.neu}">${k.neu}</b>новых</span><span class="r"><b data-count="${k.learn}">${k.learn}</b>заново</span><span class="g"><b data-count="${k.rev}">${k.rev}</b>повторить</span></div>
    <button class="sq" data-act="sheet" aria-label="Настройки карточек">${ic("gear")}</button></header>
    ${railOf(done, total)}`;
  if (!c) return `<section class="vx-cards">${hud}${doneState()}</section>${sheet()}`;
  const aheadTag = X.ahead && X.ahead.length ? `<span class="tag">Повтор заранее: ещё ${X.ahead.length}</span>` : "";
  const ph = EC.ph(c.pid), taint = fading(c.pid), wk = ph ? `<span class="wtag">неделя ${ph.w + 1}</span>` : "";
  const tags = `${c.isNew ? `<span class="tag new">новая</span>` : ""}${taint ? `<span class="tag taint">${A.chaosIcon()}скверна</span>` : ""}${aheadTag}`;
  const front = c.dir === "h"
    ? `<div class="glass slate${taint ? " tainted" : ""}"><p class="cap"><span>Входящая передача${tags}</span>${wk}</p><canvas class="scope" data-static aria-hidden="true"></canvas>
       <button class="btn listen" data-act="hearCard">${ic("play")}Послушать ещё раз</button><p class="q">Что это значит?</p></div>`
    : `<div class="glass slate${taint ? " tainted" : ""}"><p class="cap"><span>Приказ${tags}</span>${wk}</p><p class="q ru">${E(c.ru)}</p><p class="sub">Скажи вслух по-английски</p></div>`;
  const back = X.shown ? `<div class="parch scroll"><b class="en">${E(c.en)}</b><span class="ru">${E(c.ru)}</span>${trace(c.pid, "t")}<p class="hint">Буквы не читай. Послушай и повтори вслух.</p>${voice(c.pid)}${dossier(c.pid)}</div>` : "";
  return `<section class="vx-cards">${hud}<div class="card${X.shown ? " shown" : ""}${left > 2 ? " stack2" : left > 1 ? " stack1" : ""}" data-key="${c.cid}"><div class="swipe-l" aria-hidden="true">Забыл</div><div class="swipe-r" aria-hidden="true">Помню</div>${front}${back}</div>
    <div class="acts">${X.shown ? gradeRow(c) + `<p class="swipehint" aria-hidden="true">${ic("back")}Смахни влево: забыл. Вправо: помню.<span class="ic flip">${A.icon.back}</span></p>` : `<button class="btn primary big" data-act="reveal">Показать ответ<small>пробел</small></button>`}
    <div class="foot">${EC.srs.canUndo() ? `<button class="btn ghost" data-act="undo">${ic("redo")}Вернуть</button>` : `<span></span>`}<button class="btn ghost" data-act="bury">Пропустить до завтра</button></div></div></section>${sheet()}`;
}

/* ---------- student: games ---------- */
const ghead = (t, prog) => `<header class="ghead"><button class="sq" data-act="gEnd" aria-label="Выйти из игры">${ic("back")}</button><h1 class="eng">${t}</h1>${prog ? `<span class="glass mini">${prog}</span>` : "<span></span>"}</header>`;
function result(n, ok, again) {
  return pl("done", `${A.medal(ok, 70)}${h2(`${ok} из ${n}`)}<p>${ok === n ? "Всё верно." : "Остальное не ошибка, просто ещё не выучено. Послушай эти фразы ещё раз."}</p>
    <button class="btn primary big" data-act="${again}">Ещё раз</button><button class="btn ghost" data-act="gEnd">Хватит</button>`);
}
function games() {
  const g = X.game;
  if (!g) return `<div class="page"><figure class="banner">${art("banner-games", "", false)}<figcaption><h1 class="eng">Игры на слух</h1><span>Только фразы, которые уже были на занятии. Пять минут, когда на карточки нет сил.</span></figcaption></figure>
    ${[["gQuiz", "Угадай по звуку", "Слушаешь фразу и выбираешь, что она значит.", "teacher"], ["gBuild", "Собери фразу", "Слова перемешаны. Поставь их по порядку.", "die"], ["eStart", "Эхо", "Слушаешь учителя, записываешь себя и сравниваешь.", "me"]].map(([a, t, d, i]) =>
      `<button class="pl gamebtn" data-act="${a}">${ic(i)}<span><b class="eng">${t}</b><span>${d}</span></span></button>`).join("")}</div>`;
  if (g.kind === "quiz") {
    const q = g.q[g.i];
    if (!q) return `<div class="page">${ghead("Угадай по звуку")}${result(g.q.length, g.ok, "gQuiz")}</div>`;
    return `<div class="page">${ghead("Угадай по звуку", `${g.i + 1} / ${g.q.length}`)}<div class="glass slate"><canvas class="scope" data-static aria-hidden="true"></canvas><button class="btn listen" data-act="hear" data-arg="${q.pid}">${ic("play")}Послушать</button></div>
      <p class="q2">Что это значит?</p><div class="opts">${q.opts.map((o, i) => { const st = g.picked == null ? "" : i === q.ans ? " right" : i === g.picked ? " wrong" : " dim";
        return `<button class="opt${st}" data-act="gPick" data-arg="${i}"${g.picked != null ? ' aria-disabled="true"' : ""}><i class="lamp"></i>${E(o)}</button>`; }).join("")}</div>
      ${g.picked != null ? `<div class="parch scroll"><b class="en">${E(q.en)}</b><span class="ru">${E(q.ru)}</span></div><button class="btn primary big" data-act="gNext">Дальше</button>` : ""}</div>`;
  }
  if (g.kind === "build") {
    const t = g.t;
    if (!t) return `<div class="page">${ghead("Собери фразу")}${result(g.n, g.ok, "gBuild")}</div>`;
    const used = g.pick, left = t.tiles.filter(x => !used.includes(x.i));
    return `<div class="page">${ghead("Собери фразу", `${g.i + 1} / ${g.n}`)}<div class="glass slate"><p class="cap">Приказ</p><p class="q ru">${E(t.ru)}</p></div>
      <div class="parch answer" aria-label="Твой ответ">${used.length ? used.map(i => `<button class="tok" data-act="gUn" data-arg="${i}"${g.result ? " disabled" : ""}>${E(t.tiles.find(x => x.i === i).t)}</button>`).join("") : `<span class="ph">Нажимай слова по порядку</span>`}</div>
      ${g.result ? `<p class="verdict ${g.result}"><i class="lamp"></i>${g.result === "ok" ? "Верно." : "Почти. Правильно так:"}</p><div class="parch scroll"><b class="en">${E(t.en)}</b></div><button class="btn primary big" data-act="gNext">Дальше</button>`
        : `<div class="tokens">${left.map(x => `<button class="tok" data-act="gTile" data-arg="${x.i}">${E(x.t)}</button>`).join("")}</div>`}</div>`;
  }
  const e = g, pid = e.list[e.i];
  if (!pid) return `<div class="page">${ghead("Эхо")}${result(e.list.length, e.ok, "eStart")}</div>`;
  const p = EC.ph(pid), mine = "m:" + pid, recNow = EC.voice.st.rec && EC.voice.st.rec.k === mine;
  const step = (n, t, body) => `<li class="step${e.step === n ? " now" : e.step > n ? " done" : ""}"><span class="num eng">${n}</span><div><b>${t}</b>${e.step === n ? body : ""}</div></li>`;
  return `<div class="page">${ghead("Эхо", `${e.i + 1} / ${e.list.length}`)}<div class="parch scroll"><b class="en">${E(p.en)}</b><span class="ru">${E(p.ru)}</span></div>
    <div class="glass slate traces"><p class="cap"><span>Учитель</span></p>${trace(pid, "t")}<p class="cap me"><span>Я</span></p>${EC.voice.has(mine) ? trace(pid, "m") : `<p class="sub">Твоя запись появится здесь</p>`}</div>
    <ol class="steps">${step(1, "Послушай учителя", `<button class="btn primary" data-act="eListen">${ic("play")}Послушать</button>`)}
      ${step(2, "Повтори и запиши себя", recNow ? `<button class="btn rec" data-act="stop">${ic("stop")}Стоп, 0:0${EC.voice.st.rec.left}</button>` : `<button class="btn primary" data-act="eRec">${ic("rec")}Записать, до 6 секунд</button>`)}
      ${step(3, "Сравни", `<div class="pair"><button class="btn" data-act="eCompare">${ic("play")}Учитель, потом я</button></div><p class="muted small">Похоже звучит?</p><div class="pair"><button class="btn primary" data-act="eGrade" data-arg="1">Похоже</button><button class="btn" data-act="eGrade" data-arg="0">Не очень</button></div>`)}</ol></div>`;
}

/* ---------- student: road ---------- */
function road() {
  const w = EC.week(), h = [];
  h.push(`<div class="page"><h1 class="eng pagetitle">${HIM ? "В дороге" : "On the road"}</h1>`);
  if (!HIM) h.push(`<p class="lead">${E(SOLO.forTeacher)}</p>`);
  h.push(`<div class="parch manual">${SOLO.intro.map(t => `<p>${E(t)}</p>`).join("")}</div>${HIM ? syncLine() : ""}`);
  h.push(pl("", `${h2("Фраза этой недели")}<div class="parch cando"><b>${E(w.cando[0])}</b><span>${E(w.cando[1])}</span></div><p class="roadline">${E(ROAD[EC.S.week])}</p>`));
  h.push(pl("", `${h2(HIM ? "Голос учителя" : "Your voice on his phone")}<p>${E(HIM ? SOLO.voiceHim : SOLO.voiceTeacher)}</p><p class="voxline ${EC.voice.sinfo().err ? "wait" : "ok"}"><span class="lampi"></span>${E(EC.voice.sline())}</p>${HIM ? `<p class="muted small">${E(SOLO.voiceRobot)}</p>` : ""}`));
  SOLO.groups.forEach(g => {
    h.push(pl("exgroup", `${h2(E(g))}${EX.filter(e => e.g === g).map(e => {
      const on = HIM && EC.exOn(e.id);
      const btn = e.cards ? `<button class="btn primary" data-act="go" data-arg="cards">Карточки</button>` : e.games ? `<button class="btn primary" data-act="go" data-arg="games">Игры</button>`
        : HIM ? `<button class="done-stamp${on ? " on" : ""}" data-act="ex" data-arg="${e.id}" aria-pressed="${on}">${on ? A.seal(e.id, 26, false) : `<span class="socket">${ic("check")}</span>`}<span>${on ? "Сделано сегодня" : "Сделал сегодня"}</span></button>` : "";
      return `<div class="ex"><div><b>${E(e.n)}</b><span class="meta">${E(e.m)}</span>${e.d.map(t => `<p>${E(t)}</p>`).join("")}${e.road ? `<p class="roadline">${E(ROAD[EC.S.week])}</p>` : ""}</div>${btn}</div>`;
    }).join("")}`));
  });
  h.push(pl("", `${h2("Правила")}<ul class="rules">${SOLO.rules.map(r => `<li><b>${E(r[0])}</b> ${E(r[1])}</li>`).join("")}</ul>`));
  if (HIM) h.push(`<p class="muted small">Здесь неделя ${EC.S.week + 1}. ${E(SOLO.weekLink)}</p>`);
  return h.join("") + `</div>`;
}

/* ---------- student: bank ---------- */
/* one pip per phrase: red wax for a seal, violet when it fades, green remembered, amber learning */
const pips = ps => `<span class="pips" aria-hidden="true">${ps.map(p => { const m = EC.srs.mem(p.pid); return `<i class="${EC.got(p.pid) ? "sealed" : fading(p.pid) ? "fd" : "m" + m.stage}"></i>`; }).join("")}</span>`;
function bank() {
  const k = EC.known(), r = rankOf(k), nx = nextRank(k);
  let h = `<div class="page"><h1 class="eng pagetitle">Что я умею</h1>${pl("tally", `${FX.flap("", String(k), "big", String(k))}<div><b>${EC.plur(k, FR)}</b><p class="muted small">${E(SOLO.bank)}</p>
    <p class="rankline">Звание: <b>${r.ru}</b>${nx ? `. До звания «${nx.ru}» ещё ${nx.n - k}` : ""}</p></div>${ladder(k)}`)}
    ${pl("sealinfo", `<div class="bigseal">${A.seal("info", 76, true)}</div><div>${h2("Печать чистоты")}<p>Такие печати космодесантники носят на доспехах. Здесь её ставит учитель: фраза вышла без паузы, и скверна её не возьмёт.</p></div>`)}`;
  for (let n = EC.S.week; n >= 0; n--) {
    const ps = EC.weekPh(n), c = ps.filter(p => EC.got(p.pid)).length, open = X.open && X.open[n] != null ? X.open[n] : n === EC.S.week;
    h += `<section class="pl world${open ? " open" : ""}" data-key="w${n}"><button class="whead" data-act="bankOpen" data-arg="${n}" aria-expanded="${open}"><span class="wn eng">${n + 1}</span><span class="wt"><b>${E(WRU[n])}</b><span>печатей ${c} из ${ps.length}</span>${pips(ps)}</span>${ic("back")}</button>
      ${open ? `<div class="lits">${ps.map(p => litany(p, { mark: true, mem: true })).join("")}</div>` : ""}</section>`;
  }
  return h + artNote(false) + `</div>`;
}

/* ---------- student: stats ---------- */
function stats() {
  const st = EC.srs.stats(), s = EC.streak(), heat = EC.heat(84), mx = Math.max(1, ...st.forecast), pad = (heat[0].date.getDay() + 6) % 7;
  const split = [["новые", st.total - st.seen, "#2b3f6e"], ["учу", st.learning, "#e5b51c"], ["помню", st.young, "#4f9a5e"], ["крепко", st.mature, "#7ce38e"]];
  const lvl = n => n === 0 ? 0 : n < 6 ? 1 : n < 16 ? 2 : n < 31 ? 3 : 4, day = i => i === 0 ? "сег" : i === 1 ? "зав" : "+" + i;
  return `<div class="page"><header class="ghead"><button class="sq" data-act="go" data-arg="home" aria-label="Назад">${ic("back")}</button><h1 class="eng">Прогресс</h1><span></span></header>
    <div class="glass readout four"><div><b>${s.n}</b><span>${EC.plur(s.n, DAYS)} подряд</span></div><div class="g"><b>${st.ret < 0 ? "—" : st.ret + "%"}</b><span>запомнено за месяц</span></div><div><b>${st.today}</b><span>ответов сегодня</span></div><div class="g"><b>${st.mature}</b><span>выучено крепко</span></div></div>
    ${pl("", `${h2("Колода")}<div class="split" role="img" aria-label="${split.map(x => x[0] + " " + x[1]).join(", ")}">${split.map(x => `<i style="flex:${x[1] || .001};background:${x[2]}"></i>`).join("")}</div><div class="legend">${split.map(x => `<span style="--c:${x[2]}">${x[0]} ${x[1]}</span>`).join("")}</div>`)}
    ${pl("", `${h2("Ближайшие две недели")}<div class="glass bars" role="img" aria-label="Сколько карточек ждёт каждый день: ${st.forecast.join(", ")}">${st.forecast.map((n, i) => `<div><i style="--h:${Math.max(.02, n / mx).toFixed(3)}"></i><span>${[0, 1, 7, 13].includes(i) ? day(i) : "&nbsp;"}</span><b>${n || ""}</b></div>`).join("")}</div>`)}
    ${pl("", `${h2("Двенадцать недель")}<div class="heat" role="img" aria-label="Занятия по дням за 12 недель">${'<i class="pad"></i>'.repeat(pad)}${heat.map(d => `<i class="l${lvl(d.n)}" title="${d.k}: ${d.n}"></i>`).join("")}</div>`)}
    ${pl("", `${h2("По неделям")}${st.perWeek.map(r => `<div class="pw"><span>${r.w + 1}. ${E(WRU[r.w])}</span><div class="bar2"><i style="width:${Math.round(r.seen / r.total * 100)}%"></i><b style="width:${Math.round(r.mature / r.total * 100)}%"></b></div><em>${r.seen}/${r.total}</em></div>`).join("")}`)}
    ${st.leeches.length ? pl("chaosbox", `<div class="chaoshead"><figure class="fig chaosf">${art("chaos-bearer")}</figure><div>${h2(A.chaosIcon() + "Скверна держит эти фразы")}<p class="muted small">Несущие Слово шепчут, чтобы ты их забыл. Послушай эти фразы ещё раз и спроси учителя на занятии.</p></div></div>${st.leeches.map(pid => { const p = EC.ph(pid); return p ? litany(p, {}) : ""; }).join("")}`) : ""}</div>`;
}

/* ---------- teacher: this week ---------- */
function report1(r) {
  if (!r.has) return `<p>No transmission from him yet. His phone reports by itself the first time it has internet after he practises.</p>`;
  const c = r.cards;
  return `<p>&gt; last report ${E(EC.whenEn(r.at))}${r.daysAgo >= 3 ? ` <span class="warnc">(${r.daysAgo} days ago)</span>` : ""}</p><p>&gt; week ${r.week}${r.weekDelta > 0 ? ", ahead of you" : r.weekDelta < 0 ? ", behind you: send the link" : ", same as you"}</p>
    <p>&gt; active ${r.active} of 14 days</p>${c ? `<p>&gt; cards ${c.seen}/${c.total} started, ${c.mature} solid, ${c.due} waiting</p><p>&gt; streak ${c.streak}, remembered ${c.ret < 0 ? "n/a" : c.ret + "%"}</p>` : ""}${r.failing.length ? `<p>&gt; slipping: ${r.failing.slice(0, 3).map(p => E(p.en)).join(" / ")}</p>` : ""}`;
}
function today() {
  const w = EC.week(), S = EC.S, n = S.week, c = EC.cadence(), ms = EC.milestone(), r = EC.report(), ps = EC.weekPh(n), sealed = ps.filter(p => EC.got(p.pid)).length, k = EC.known(), next = MILESTONES.find(m => m > k);
  return `<div class="desk">
    <aside class="dcol dnav">${pl("chartbox", `${h2("Crusade")}${chart("en")}<div class="chart-foot">${X.world != null && X.world !== n ? `<button class="btn primary" data-act="jump" data-arg="${X.world}">Move to week ${X.world + 1}</button><button class="btn ghost" data-act="tworld" data-arg="${n}">Back to week ${n + 1}</button>` : ""}<p class="muted small">Click a world to look at it. The star of Chaos marks the hard weeks, 3 and 8. Future weeks lie in the warp storm. The green arc is how many phrases carry a seal.</p></div>`)}
      ${pl("tally rankt", `${figure(rankOf(k), "sm")}<div><span class="big eng" data-count="${k}">${k}</span><b>phrases he can say</b><p class="muted small">Rank: ${rankOf(k).en}${rankOf(k).whoEn ? ", " + rankOf(k).whoEn : ""}. ${EC.unlocked().length} taught so far</p>${nextRank(k) ? `<div class="bar"><i style="width:${Math.round((k - rankOf(k).n) / (nextRank(k).n - rankOf(k).n) * 100)}%"></i></div><p class="muted small">${nextRank(k).en} at ${nextRank(k).n}</p>` : ""}</div>`)}</aside>
    <div class="dcol main">${pl("hero", `<div class="herobg" aria-hidden="true">${art("banner-guilliman", "", false)}</div><div class="wk"><svg class="wkcog" viewBox="0 0 64 64" aria-hidden="true"><path d="${A.cog(32, 32, 31, 26.8, 16, 0)}" fill="#1c3470" stroke="#d4a63a" stroke-width="1"/><circle cx="32" cy="32" r="22.6" fill="#0c1838" stroke="#d4a63a" stroke-width=".7" opacity=".95"/></svg><span class="eng">${n + 1}</span></div><div class="ht"><p class="kick">Week ${n + 1} of ${W.length}${HARD.includes(n) ? ", a hard week" : ""}</p><h1 class="eng">${E(w.t)}</h1>
        <div class="parch cando"><b>${E(w.cando[0])}</b><span>${E(w.cando[1])}</span></div></div>
      <div class="rites" role="group" aria-label="Session">${["a", "b", "c"].map(k2 => { const d = S.done.includes(n + k2);
        return `<button class="rite${S.sess === k2 ? " on" : ""}${d ? " done" : ""}" data-act="sess" data-arg="${k2}" aria-pressed="${S.sess === k2}"><span class="eng">${k2.toUpperCase()}</span><b>${E(SESS[k2].name)}</b><small>${SESS[k2].blocks.reduce((a, b) => a + b.m, 0)} min${d ? ", done" : ""}</small>${d ? A.seal(n + k2, 22, false) : ""}</button>`; }).join("")}
        <button class="btn primary big" data-act="start">Start session ${S.sess.toUpperCase()}<small>Space in the session starts the clock</small></button></div>
      <p class="muted small">Sessions in the last 7 days: ${c.last7} of ${c.target}.</p>`)}
      ${pl("", `${h2("Why this week")}<p>${E(w.why)}</p><div class="parch note"><b>Russian rule.</b> ${E(RULE_RU)}</div><div class="glass note"><b>Sound this week.</b> ${E(w.sound)}</div>`)}
      ${pl("", `${h2("Litany of the week")}<p class="muted small">${E(TICK_RULE)} ${sealed} of ${ps.length} sealed. Record each phrase in your voice: it reaches his phone by itself.</p>${ps.map(p => litany(p, { tick: true })).join("")}
        <p class="voxline ${EC.voice.sinfo().err ? "wait" : "ok"}"><span class="lampi"></span>${E(EC.voice.sline())}</p>`)}
      ${pl("", `${h2("Between sessions")}${BETWEEN.filter(b => !b.from || n >= b.from).map(b => `<p><b>${E(b.b)}</b> ${E(b.x.replace("{hw}", w.hw))}</p>`).join("")}`)}</div>
    <aside class="dcol log">${ms ? medal(ms, true) : ""}
      <section class="glass voxlog"><h2 class="eng">Vox-log</h2>${report1(r)}<button class="btn small" data-act="go" data-arg="his">His full report</button></section>
      ${pl("", `${h2("Muster")}${S.plan.length ? S.plan.map(t => `<p class="muster">${ic("slate")}${E(EC.whenEn(t))}</p>`).join("") : `<p class="muted">No sessions planned. Plan them at the end of session C.</p>`}`)}
      ${pl("notes", `${h2("Notes")}${S.notes.slice().reverse().map((nt, i) => `<div class="parch scrap"><small>${E(EC.whenEn(nt.d))}, week ${nt.w + 1}</small><p>${E(nt.t)}</p><button class="btn small ghost" data-act="delNote" data-arg="${S.notes.length - 1 - i}" aria-label="Delete note">Delete</button></div>`).join("") || `<p class="muted">No notes yet.</p>`}
        <div class="addnote"><input id="note" type="text" placeholder="What happened in the session" aria-label="Note"><button class="btn" data-act="addNote">Add</button></div>`)}</aside></div>`;
}

/* ---------- teacher: the session ---------- */
function tools(b, w) {
  let h = "";
  if (b.why) h += `<div class="parch note"><b>Why.</b> ${E(w.why)}</div>`;
  if (b.sound) h += `<div class="glass note"><b>Sound.</b> ${E(w.sound)}<br><span class="links">Check a word out loud in front of him: <a href="https://dictionary.cambridge.org/" target="_blank" rel="noopener">Cambridge</a>, <a href="https://forvo.com/languages/en/" target="_blank" rel="noopener">Forvo</a>, <a href="https://youglish.com/" target="_blank" rel="noopener">YouGlish</a></span></div>`;
  if (b.cando) h += `<div class="parch note"><b>Aim for.</b> ${E(w.cando[0])}<br><i>${E(w.cando[1])}</i></div>`;
  if (b.hw) h += `<div class="parch note"><b>Homework.</b> ${E(w.hw)}</div>`;
  if (b.prev && EC.S.week > 0) h += pl("", `${h2("Last week: " + E(W[EC.S.week - 1].t))}${W[EC.S.week - 1].ph.map(p => `<p class="prevl"><b>${E(p[0])}</b> <span>${E(p[1])}</span></p>`).join("")}`);
  if (b.swap) { const sw = SWAP[EC.S.week];
    h += pl("forge", `${h2("Swap the words")}${sw.map((s, i) => `<p class="frame">${E(s.f)}</p><div class="tokens">${s.w.map(x => `<button class="tok" data-act="swap" data-arg="${i}:${E(x)}">${E(x)}</button>`).join("")}<button class="tok alt" data-act="swapRnd" data-arg="${i}" aria-label="Random word">${ic("shuffle")}</button></div>`).join("")}
      <div class="glass big-sentence" aria-live="polite">${X.swapped ? E(X.swapped) : "Pick a word"}</div>${X.swapped ? `<button class="btn" data-act="swapSay">${ic("robot")}Robot says it</button>` : ""}`); }
  if (b.cold) {
    if (!X.coldQ) { X.coldQ = EC.cold().map(p => p.pid); X.coldI = 0; X.coldShown = false; }
    const pid = X.coldQ[X.coldI], p = pid && EC.ph(pid);
    h += pl("cold", `${h2("Cold round")}<p class="muted small">${Math.min(X.coldI + 1, X.coldQ.length)} of ${X.coldQ.length}, only phrases without a seal. You say the Russian, he says the English.</p>${p
      ? `<div class="glass big-sentence ru">${E(p.ru)}</div>${X.coldShown ? `<div class="parch scroll"><b class="en">${E(p.en)}</b></div><div class="pair"><button class="btn primary" data-act="coldOk" data-arg="${p.pid}">No pause: seal it</button><button class="btn" data-act="coldSkip">Pause: skip</button></div>` : `<button class="btn primary" data-act="coldShow">Show the English</button>`}`
      : `<p>Every phrase he knows carries a seal.</p>`}`);
  }
  if (b.plan) h += pl("", `${h2("Muster: next sessions")}${EC.S.plan.length ? EC.S.plan.map(t => `<p class="muster">${ic("slate")}${E(EC.whenEn(t))}</p>`).join("") : `<p class="muted">None planned yet.</p>`}<div class="pair">${[1, 2, 3].map(d => `<button class="btn small" data-act="plan" data-arg="${d}">In ${d} day${d > 1 ? "s" : ""}, 18:30</button>`).join("")}</div>`);
  if (b.ph || b.rec) h += pl("", `${h2(b.rec ? "Record the litany" : "Litany of the week")}${EC.weekPh(EC.S.week).map(p => litany(p, { tick: !!b.ph })).join("")}${b.rec ? `<p class="voxline ${EC.voice.sinfo().err ? "wait" : "ok"}"><span class="lampi"></span>${E(EC.voice.sline())}</p>` : ""}`);
  if (b.tab === "bank") h += tbankBody();
  return h;
}
/* where the session is, 0..100, counting the running block's elapsed time */
function runPos(r) {
  const bs = SESS[r.k].blocks, b = bs[r.idx], tot = bs.reduce((a, x) => a + x.m, 0) * 60, prev = bs.slice(0, r.idx).reduce((a, x) => a + x.m, 0) * 60;
  return ((prev + Math.max(0, Math.min(b.m * 60, b.m * 60 - r.left))) / tot * 100).toFixed(2);
}
function run() {
  const r = EC.run, w = EC.week();
  if (!r && X.done) return `<div class="tpage">${pl("done wide", `<div class="emb">${A.seal("rite", 64, true)}</div>${h2(`Session ${X.done.k.toUpperCase()} complete`)}<p>Week ${X.done.w + 1}. Write down what to remember while it is fresh.</p>
    <div class="addnote"><input id="note" type="text" placeholder="What happened in the session" aria-label="Note"><button class="btn" data-act="addNote">Add note</button></div>
    <p><b>Next:</b> session ${EC.S.sess.toUpperCase()}, ${E(SESS[EC.S.sess].name)}, week ${EC.S.week + 1}.</p><button class="btn primary big" data-act="doneBack">Back to this week</button>`)}</div>`;
  if (!r) return `<div class="tpage">${pl("done wide", `${h2("No session running")}<p class="muted">Pick A, B or C on This week, or start the next one now.</p><button class="btn primary big" data-act="start">Start session ${EC.S.sess.toUpperCase()}</button>`)}</div>`;
  const bs = SESS[r.k].blocks, b = bs[r.idx]; let acc = 0;
  /* the auspex track: blocks sized by their minutes, a brass cursor riding the whole session */
  return `<div class="tpage run"><div class="tl" role="group" aria-label="Session blocks"><ol class="phases">${bs.map((x, i) => { const st = acc; acc += x.m;
      return `<li class="${i < r.idx ? "done" : i === r.idx ? "now" : ""}" style="flex:${x.m}"${i === r.idx ? ' aria-current="step"' : ""}><i class="lamp"></i><b>${E(x.t)}</b><small>T+${String(st).padStart(2, "0")}:00 · ${x.m} min</small></li>`; }).join("")}</ol>
      <i class="playhead" style="left:${runPos(r)}%" aria-hidden="true"></i></div>
    <div class="runcols"><div>${pl("chrono", `<p class="kick">Session ${r.k.toUpperCase()}, ${E(SESS[r.k].name)}. Week ${EC.S.week + 1}, ${E(w.t)}</p>
      <div class="glass clockglass${r.left < 0 ? " over" : ""}${r.ticking ? " live" : ""}">${FX.flap("fclock", EC.fmt(r.left), "clock" + (r.left < 0 ? " over" : ""), "Time left in this block")}<span class="state">${r.ticking ? "running" : "paused"}${r.left < 0 ? ", over time" : ""}</span></div>
      <div class="pair runbtns"><button class="btn${r.ticking ? "" : " primary"}" data-act="toggle">${r.ticking ? "Pause" : "Start timer"}</button><button class="btn${r.ticking ? " primary" : ""}" data-act="next">${r.idx >= bs.length - 1 ? "Finish" : "Next block"}</button>${r.idx ? `<button class="btn ghost" data-act="back">Back</button>` : ""}<button class="btn ghost" data-act="stopRun">Stop</button></div>
      <p class="muted small">Space starts and pauses. Arrow keys move between blocks.</p>`)}
      ${pl("block", `${h2(E(b.t))}<div class="parch blockbody">${b.body}</div>`)}</div><div class="toolcol">${tools(b, w) || pl("", `<p class="muted">Nothing to prepare for this block. Just talk.</p>`)}</div></div></div>`;
}

/* ---------- teacher: the rest ---------- */
function tbankBody() {
  const k = EC.known();
  let h = pl("tally", `<span class="big eng">${k}</span><div><b>phrases he can say</b><p class="muted small">${E(TICK_RULE)}</p></div><div class="filters"><button class="btn small${X.filter === "all" ? " primary" : ""}" data-act="filter" data-arg="all">All</button><button class="btn small${X.filter === "todo" ? " primary" : ""}" data-act="filter" data-arg="todo">Without a seal</button></div>`);
  for (let n = EC.S.week; n >= 0; n--) {
    const ps = EC.weekPh(n), c = ps.filter(p => EC.got(p.pid)).length, list = ps.filter(p => X.filter === "all" || !EC.got(p.pid));
    h += pl("world open", `<div class="whead static"><span class="wn eng">${n + 1}</span><span class="wt"><b>${E(W[n].t)}</b><span>${c} of ${ps.length} sealed</span></span></div><div class="lits">${list.map(p => litany(p, { tick: true })).join("") || `<p class="muted">All sealed.</p>`}</div>`);
  }
  return h + `<p class="voxline ${EC.voice.sinfo().err ? "wait" : "ok"}"><span class="lampi"></span>${E(EC.voice.sline())}</p>`;
}
const tbank = () => `<div class="tpage narrow"><h1 class="eng pagetitle">Phrase bank</h1>${tbankBody()}</div>`;
function watch() {
  const wk = EC.S.week + 1;
  return `<div class="tpage narrow"><h1 class="eng pagetitle">Watching</h1><p class="lead">${E(WATCH.intro)}</p><div class="parch note"><b>${E(WATCH.rule[0])}</b> ${E(WATCH.rule[1])}</div>
    ${pl("", `${h2("How to watch")}${WATCH.how.map(x => `<p><b>${E(x[0])}.</b> ${E(x[1])}</p>`).join("")}`)}
    ${WATCH.groups.map(([from, label]) => { const locked = wk < from;
      return pl(locked ? "locked" : "", `${h2(E(label))}${locked ? `<p class="lockline">${ic("lock")}Opens around week ${from}. Until then it would teach him nothing.</p>` : ""}${VID.filter(v => v.from === from).map(v =>
        `<div class="vid${locked ? " off" : ""}"><b>${v.u && !locked ? `<a href="${E(v.u)}" target="_blank" rel="noopener">${E(v.n)}</a>` : E(v.n)}</b><span class="meta">${E(v.w)}</span><p>${E(v.d)}</p></div>`).join("")}`); }).join("")}
    ${pl("", `${h2("Use his hobbies in the sessions")}${WATCH.hobbies.map(t => `<p>${t}</p>`).join("")}`)}</div>`;
}
function his() {
  const link = EC.hisLink(), r = EC.report();
  const rep = !r.has ? `<p>No transmission yet. His phone sends a report by itself the first time it has internet after he practises. He presses nothing.</p>` : (() => { const c = r.cards;
    return `<p>&gt; last report <b>${E(EC.whenEn(r.at))}</b>${r.daysAgo >= 3 ? ` <span class="warnc">${r.daysAgo} days ago: no practice or no internet. The log keeps everything.</span>` : ""}</p>
      <p>&gt; he is on week ${r.week}${r.weekDelta > 0 ? `, ahead of your week ${EC.S.week + 1}` : r.weekDelta < 0 ? `, behind your week ${EC.S.week + 1}. Send him the link` : ", same as you"}</p>
      ${c ? `<div class="readout four in"><div><b>${c.seen}/${c.total}</b><span>cards started</span></div><div class="g"><b>${c.mature}</b><span>solid</span></div><div><b>${c.due}</b><span>waiting now</span></div><div class="g"><b>${c.ret < 0 ? "n/a" : c.ret + "%"}</b><span>remembered</span></div></div>` : ""}
      <p>&gt; last two weeks: active ${r.active} of 14 days</p><div class="days14">${r.days.map(d => `<i class="${d.n ? "on" : ""}" title="${d.k}: ${d.rev} cards, ${d.ex} exercises, ${d.rounds} rounds">${d.n || "·"}</i>`).join("")}</div>
      <p>&gt; ${r.rounds.count ? `game rounds: ${r.rounds.ok} of ${r.rounds.total} right (${r.rounds.pct}%)` : "no game rounds in two weeks"}</p><p>&gt; your voice on his phone: ${r.voice.t} phrases, he recorded himself on ${r.voice.me}</p>
      ${r.ex.length ? `<p>&gt; exercises: ${r.ex.map(e => `${e.c}× ${E(e.name)}`).join(", ")}</p>` : ""}`; })();
  const fail = r.has && (r.failing.length || (r.cards && r.cards.leech.length)) ? pl("", `${h2("What keeps failing")}${r.failing.map(p => `<div class="failrow"><b class="cnt">${p.c}</b><div><b>${E(p.en)}</b><span>${E(p.ru)}, week ${p.w + 1}</span></div></div>`).join("")}
      ${r.cards && r.cards.leech.length ? `<p class="muted small">Cards that keep slipping: ${r.cards.leech.map(p => E(p.en)).join(", ")}.</p>` : ""}<p class="muted small">Start session B with these and record them again.</p>`) : "";
  return `<div class="tpage"><h1 class="eng pagetitle">His view</h1><div class="hiscols"><div class="phonecol"><div class="phone"><iframe title="His view" src="${E(EC.previewSrc())}" data-static></iframe></div><p class="muted small">His page as it reaches his phone, on its own storage. Nothing you tap here touches his record.</p></div>
    <div>${pl("", `${h2("His link")}<p class="muted small">The week and your seals travel inside the link, because his phone keeps its own copy.</p><div class="glass code">${E(link)}</div>
      <div class="pair"><button class="btn primary" data-act="copyLink">Copy this week's link</button><a class="btn" href="${E(EC.previewSrc())}" target="_blank" rel="noopener">Open full screen</a></div>`)}
      ${pl("", `${h2("Sandbox")}<p class="muted small">Pretend he has learned:</p><div class="pair"><button class="btn small" data-act="pvFill" data-arg="0">Nothing</button><button class="btn small" data-act="pvFill" data-arg="0.5">About half</button><button class="btn small" data-act="pvFill" data-arg="1">All of it</button><button class="btn small" data-act="pvDemo">Demo history</button><button class="btn small ghost" data-act="pvClear">Wipe</button></div>`)}
      <section class="glass voxlog"><div class="lh"><h2 class="eng">Vox-log: his progress</h2><button class="btn small" data-act="pull">${EC.repLoading() ? "Receiving…" : "Refresh"}</button></div>${rep}</section>${fail}</div></div></div>`;
}
function weeks() {
  return `<div class="tpage narrow"><h1 class="eng pagetitle">All twelve weeks</h1><p class="lead">Three short sessions a week, about twenty-five minutes each. Short and often beats long and weekly at this level.</p>
    ${W.map((w, i) => { const d = ["a", "b", "c"].filter(k => EC.S.done.includes(i + k)).length, cur = EC.S.week === i, open = X.open && X.open["w" + i];
      return `<section class="pl world${cur ? " now" : ""}${open ? " open" : ""}" data-key="wk${i}"><button class="whead" data-act="openWeek" data-arg="w${i}" aria-expanded="${!!open}"><span class="wn eng">${i + 1}</span><span class="wt"><b>${E(w.t)}</b><span>${d === 3 ? "done" : d ? d + " of 3 sessions" : cur ? "now" : ""}${HARD.includes(i) ? ", a hard week" : ""}</span></span>${ic("back")}</button>
        ${open ? `<div class="wbody"><div class="parch cando"><b>${E(w.cando[0])}</b><span>${E(w.cando[1])}</span></div><p>${E(w.why)}</p><p class="muted">${E(w.sound)}</p>${cur ? "" : `<button class="btn" data-act="jump" data-arg="${i}">Move to this week</button>`}</div>` : ""}</section>`; }).join("")}</div>`;
}
function guide() {
  return `<div class="tpage narrow"><h1 class="eng pagetitle">Guide</h1>${GUIDE.map(sec => `<section class="parch page-leaf">${`<h2 class="eng">${E(sec.h)}</h2>`}${sec.b.map(b =>
    b.t === "rows" || b.t === "points" ? b.x.map(r => `<p><b>${E(r[0])}</b> ${E(r[1])}</p>`).join("")
    : b.t === "links" ? b.x.map(l => `<p><a href="${E(l.u)}" target="_blank" rel="noopener"><b>${E(l.n)}</b></a> ${E(l.d)}</p>`).join("")
    : b.t === "note" || b.t === "ru" ? `<div class="aside${b.t === "ru" ? " ru" : ""}">${b.x}</div>` : `<p>${b.x}</p>`).join("")}</section>`).join("")}</div>`;
}
/* which microphone records, on this device. Names appear once the browser has been allowed to use the microphone */
function micPicker() {
  if (!window.VOXMIC) return "";
  if (X.mics == null && !X.micsLoading) { X.micsLoading = true; VOXMIC.list().then(l => { X.mics = l; X.micsLoading = false; X.render(); }).catch(() => { X.mics = []; X.micsLoading = false; }); }
  const cur = VOXMIC.device(), list = X.mics || [], named = list.some(m => m.label);
  return `<label class="micpick"><b>Microphone</b><select id="micsel" aria-label="Microphone"><option value=""${cur ? "" : " selected"}>System default</option>${list.map((m, i) => `<option value="${E(m.deviceId)}"${m.deviceId === cur ? " selected" : ""}>${E(m.label || "Microphone " + (i + 1))}${VOXMIC.callMode(m.label) ? " (call mode, phone quality)" : ""}</option>`).join("")}</select></label>
    ${named ? "" : `<p class="muted small">Names show up after the browser is allowed to use the microphone: press Check microphone once.</p>`}`;
}
function settings() {
  const S = EC.S;
  return `<div class="tpage narrow"><h1 class="eng pagetitle">Settings</h1>
    ${pl("", `${h2("His name")}<div class="addnote"><input id="name" type="text" value="${E(S.name)}" placeholder="e.g. Dima" aria-label="His name"><button class="btn" data-act="setName">Save</button></div>`)}
    ${pl("", `${h2("Voice sending")}<p class="muted small">Your recordings reach his phone by themselves. The teacher key lets this device send them. Whoever set up the site has it.</p><div class="addnote"><input id="tkey" class="secret" type="text" autocomplete="off" spellcheck="false" value="${E(S.tkey)}" placeholder="Teacher key" aria-label="Teacher key"><button class="btn" data-act="setKey">Save</button></div><p class="voxline ${EC.voice.sinfo().err ? "wait" : "ok"}"><span class="lampi"></span>${E(EC.voice.sline())}</p>`)}
    ${pl("", `${h2("Recording")}<p class="muted small">Noise removal cleans every recording on this device: hum below 80 Hz, background noise (RNNoise), quiet pauses between words, an even level. The browser's own processing stays off because it muffles speech. Turn it off only if your voice sounds better raw.</p><div class="seg two" role="radiogroup" aria-label="Noise removal">${[[1, "On"], [0, "Off"]].map(([v, t]) => `<button role="radio" aria-checked="${(window.VOXMIC ? VOXMIC.enabled() : true) === !!v}" data-act="micClean" data-arg="${v}">${t}</button>`).join("")}</div>
      ${micPicker()}
      <p class="muted small">If a recording sounds wrong in one browser, check the microphone there and send a screenshot of the result.</p><button class="btn" data-act="micCheck"${X.micBusy ? " disabled" : ""}>${X.micBusy ? "Checking: speak for 3 seconds…" : "Check microphone"}</button>${X.micDiag ? `<div class="glass code diag" aria-live="polite">${X.micDiag.map(([k, v]) => `<p><b>${E(k)}</b> ${E(v)}</p>`).join("")}</div>` : ""}`)}
    ${pl("", `${h2("Milestones")}<div class="medals">${MILESTONES.map(m => `<span class="${S.seen.includes(m) ? "got" : ""}">${A.medal(m, 44)}</span>`).join("")}</div>`)}
    ${pl("", `${h2("His link and the sandbox")}<p>His link carries the week and your seals. The sandbox on His view runs on a separate storage key, so practising in it never overwrites his real report.</p>`)}
    ${pl("", `${h2("Art")}${artNote(true)}`)}
    <p><button class="btn ghost" data-act="reset">Reset everything on this device</button></p></div>`;
}

/* ---------- boot: one orchestrated moment, once per browser session ---------- */
(function boot() {
  let seen = false; try { seen = sessionStorage.getItem("vx-boot") === "1"; sessionStorage.setItem("vx-boot", "1"); } catch (e) {}
  if (seen || calm.matches || window.frameElement || navigator.webdriver) return;
  const o = document.createElement("div"); o.className = "boot"; o.setAttribute("aria-hidden", "true");
  o.innerHTML = `<img class="boot-bg" src="img/boot-emperor.webp" alt=""><div class="boot-in">${A.aquila(200, "qb")}<p>${HIM ? "Дух машины пробуждается" : "Machine spirit awakening"}</p><p class="l2">${HIM ? "Литании загружены: " : "Litanies loaded: "}<b data-n="${EC.unlocked().length}">0</b></p><i class="boot-bar"></i><p class="l2">${HIM ? "Император защищает" : "The Emperor protects"}</p></div>`;
  document.body.appendChild(o); SFX.play("boot");
  const nb = o.querySelector("[data-n]"), N = +nb.dataset.n, t0 = performance.now(); (function up(t) { const k = Math.min(1, (t - t0) / 700); nb.textContent = Math.round(N * k); if (k < 1) requestAnimationFrame(up); })(t0);
  setTimeout(() => o.classList.add("out"), 1050); setTimeout(() => o.remove(), 1550);
  o.addEventListener("click", () => o.remove());
})();

/* ---------- echo game ---------- */
function playSeq(keys) {
  return keys.reduce((p, k) => p.then(() => new Promise(res => {
    if (EC.voice.has(k)) EC.voice.play(k).then(() => setTimeout(res, 250));
    else if (k.indexOf("t:") === 0) { X.np = k.slice(2); EC.voice.say(EC.ph(k.slice(2)).en); setTimeout(res, 1800); }
    else res();
  })), Promise.resolve());
}

/* ---------- a tap on a tab or a link goes through a view transition and a relay tick.
   window.go itself stays synchronous, so code and keys that call it see the new screen at once ---------- */
function goTap(id) { if (id === X.cur) return window.go(id); SFX.play("tab"); FX.swap(() => window.go(id)); }
/* ---------- one loop while a voice plays or records: the trace's playhead, the mini player, the glow of the button ---------- */
function pump() {
  const st = EC.voice.st;
  if (st.playing !== X.pk) { X.pk = st.playing; X.pt0 = performance.now(); }
  if (!(st.playing || st.rec)) { document.body.style.removeProperty("--lvl"); return; }
  if (X.praf) return;
  const loop = () => {
    X.praf = 0; const st = EC.voice.st; if (!(st.playing || st.rec)) { pump(); return; }
    document.body.style.setProperty("--lvl", EC.voice.level().toFixed(3));
    const k = st.playing === "robot" ? "t:" + X.np : st.playing, pos = EC.voice.pos();
    let p = null;
    if (pos) p = pos.t / pos.dur;
    else if (k) { const ph = EC.ph(k.slice(2)); p = (performance.now() - X.pt0) / 1000 / (.8 + (ph ? ph.en.length : 20) * .07); }
    if (p != null) { p = Math.min(1, p).toFixed(3);
      document.querySelectorAll(".trace").forEach(t => { if (t.dataset.trace === k) t.style.setProperty("--p", p); });
      const mb = document.querySelector(".miniplayer"); if (mb) mb.style.setProperty("--p", p); }
    if (!document.hidden && !FX.calm()) X.praf = requestAnimationFrame(loop);
  };
  X.praf = requestAnimationFrame(loop);
}
/* the vox channel: whatever is playing, shown above the tab bar on every screen but the cards */
function mini() {
  const k = EC.voice.st.playing; if (!k || X.cur === "cards") return "";
  const pid = k === "robot" ? X.np : k.slice(2), p = pid && EC.ph(pid); if (!p) return "";
  const who = k === "robot" ? "робот" : k.charAt(0) === "t" ? "учитель" : "я";
  return `<div class="miniplayer ${k === "robot" ? "robot" : k.charAt(0)}" role="status" aria-live="polite"><span class="mlamp"></span><div class="mtx"><small>Вокс-канал · ${who}</small><b>${E(p.en)}</b><span>${E(p.ru)}</span></div>${trace(pid, k.charAt(0) === "m" ? "m" : "t", 28)}<i class="mbar"></i></div>`;
}
/* ---------- a new rank: a sealed order arrives, he breaks the seal, the choir sings ---------- */
function ceremony(ms) {
  const r = rankOf(ms);
  FX.ceremony(`<div class="cer-sealed"><p class="kick">Приказ из ордена</p><button class="cer-seal" data-open aria-label="Вскрыть печать">${A.seal("cer" + ms, 120, true)}</button><p class="muted">Нажми на печать, чтобы вскрыть приказ.</p></div>
    <div class="cer-open">${r.img ? `<figure class="fig cer-fig">${art(r.img, "", false)}</figure>` : `<div class="cer-fig none">${A.aquila(220, "qc")}</div>`}
    <p class="kick">Новое звание</p><h1 class="eng">${r.ru}</h1>${r.who ? `<p class="who">${r.who}</p>` : ""}
    <p class="cer-line">Ты уже умеешь <b>${ms}</b> ${EC.plur(ms, FR)}. Было ноль.</p><p class="motto">Император защищает.</p><button class="btn primary big" data-close>Принято</button></div>`,
    () => { SFX.play("rank"); EC.haptic([20, 60, 20, 60, 40]); }).then(() => { SFX.play("stamp"); EC.celebrated(ms); });
}
window.voxCeremony = ceremony;
/* ---------- sounds for everything that has no sound of its own ---------- */
const OWN = ["go", "grade", "reveal", "tick", "ex", "gPick", "gTile", "gUn", "gNext", "undo", "bury", "sheet", "sheetBg", "rec", "stop", "play", "say", "hear", "hearCard", "eListen", "eRec", "eCompare", "eGrade", "snd", "slot", "celebrate", "coldOk", "world", "tworld"];
document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-act]"); if (b && !b.disabled && !OWN.includes(b.dataset.act)) SFX.play("click"); }, true);
/* ---------- the session clock: a drum counter, a bell when a block's time runs out ---------- */
EC.on("tick", left => {
  const el = document.getElementById("fclock"); if (el) { el.dataset.text = EC.fmt(left); FX.syncFlap(el); el.classList.toggle("over", left < 0); const cg = el.closest(".clockglass"); if (cg) cg.classList.toggle("over", left < 0); }
  const r = EC.run; if (r) { const b = SESS[r.k].blocks[r.idx], bar = document.querySelector(".tl .playhead"); if (bar) bar.style.left = runPos(r) + "%"; if (b && left === 0) SFX.play("toll"); }
});
EC.on("finish", () => setTimeout(() => SFX.play("toll"), 50));

window.DESIGN = {
  ns: "vox",
  views: { home, cards, games, road, bank: HIM ? bank : tbank, stats, today, run, watch, his, weeks, guide, settings },
  shell: body => HIM ? studentShell(body) : teacherShell(body),
  after() {
    document.body.dataset.screen = X.cur; document.body.classList.toggle("sheet-open", !!X.sheet);
    document.querySelectorAll("canvas.scope").forEach(A.scope); A.scopeTick();
    if (X.cur === "cards" && X.ahead && X.ahead.length) { const c = cur(); if (c && c.cid !== X.aheadPlayed) { X.aheadPlayed = c.cid; X.shown = false; if (c.dir === "h") EC.voice.hear(c.pid); } }
    if (X.echo && X.echo.recStarted && !EC.voice.st.rec && !EC.voice.st.wait) { X.echo.recStarted = false; if (EC.voice.has("m:" + X.echo.list[X.echo.i])) { X.echo.step = 3; X.render(); } }
    if (X.sheet && !X.sheetFocused) { X.sheetFocused = true; const b = document.getElementById("shDone"); if (b) b.focus(); }
    if (X.stampPid) { const s = document.querySelector(`.stamp.on[data-arg="${X.stampPid}"],.done-stamp.on[data-arg="${X.stampPid}"]`); if (s) { s.classList.add("hit"); setTimeout(() => s.classList.remove("hit"), 420);
      const r = s.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + 22, { cls: "wax", n: 10, r: 30 }); } X.stampPid = null; }
    FX.flaps(); FX.counts(); pump(); FX.motes(true, HIM ? 34 : 16);
    const ms = document.getElementById("micsel");
    if (ms && !ms._bound) { ms._bound = true; ms.addEventListener("change", () => { VOXMIC.setDevice(ms.value); X.micDiag = null; SFX.play("click"); X.render(); }); }
    if (X.cur === "cards") {
      const card = document.querySelector(".vx-cards .card");
      if (card) FX.swipe(card, { enabled: () => X.shown, dist: () => Math.min(130, innerWidth * .28), armed: () => EC.haptic(6), commit: d => window.DESIGN.acts.grade(d === "l" ? 1 : 3) });
      if (X.justShown) { X.justShown = false; FX.decode(document.querySelector(".vx-cards .scroll .en")); }
      if (X.purged) { X.purged = false; const r = (card || document.querySelector(".hud")).getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + Math.min(r.height / 2, 150), { cls: "warp", n: 26, r: 120, label: A.chaosIcon() + "Скверна изгнана" }); setTimeout(() => SFX.play("purge"), 150); }
      if (X.graded && document.querySelector(".done.glory")) { X.graded = false; setTimeout(() => SFX.play("glory"), 250);
        const f = document.querySelector(".done.glory .fig"); if (f) { const r = f.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + r.height / 2, { cls: "gold", n: 30, r: 160 }); } }
    }
    if (EC.run) { if (X.lastIdx != null && X.lastIdx !== EC.run.idx) SFX.play("bell"); X.lastIdx = EC.run.idx; } else X.lastIdx = null;
    if (HIM && X.cur === "home" && !navigator.webdriver) { const ms = EC.milestone(); if (ms && X.cer !== ms) { X.cer = ms; ceremony(ms); } }
  },
  acts: {
    go: goTap,
    say: pid => { X.np = pid; EC.voice.say(EC.ph(pid).en); },
    play: k => { X.np = k.slice(2); EC.voice.play(k); },
    hear: pid => { X.np = pid; EC.voice.hear(pid); },
    tick: pid => { if (EC.tick(pid)) { X.stampPid = pid; SFX.play("stamp"); EC.haptic(18); } else SFX.play("unstamp"); },
    coldOk: pid => { if (!EC.got(pid)) { EC.tick(pid); SFX.play("stamp"); } X.coldI++; X.coldShown = false; X.render(); },
    ex: id => { const was = EC.exOn(id); EC.exDone(id); if (!was) { X.stampPid = id; SFX.play("stamp"); EC.haptic(18); } else SFX.play("unstamp"); },
    micCheck: () => { if (!window.VOXMIC || X.micBusy) return; X.micBusy = true; X.micDiag = null; X.render();
      VOXMIC.diagnose().then(r => { X.micDiag = r; X.mics = null; }).catch(e => { X.micDiag = [["FAILED", String(e)]]; }).then(() => { X.micBusy = false; X.render(); }); },
    micClean: v => { if (window.VOXMIC) VOXMIC.set(!!+v); X.render(); },
    snd: () => { SFX.set(!SFX.on()); X.render(); },
    slot: pid => { X.slot = X.slot === pid ? null : pid; if (X.slot) { X.np = pid; EC.voice.hear(pid); } else SFX.play("tab"); X.render(); },
    world: i => { SFX.play("tab"); X.world = +i; X.slot = null; X.render(); },
    tworld: i => { SFX.play("tab"); X.world = +i === EC.S.week ? null : +i; X.render(); },
    gPick: i => { const g = X.game, q = g.q[g.i]; if (g.picked != null) return; g.picked = +i;
      if (+i === q.ans) { g.ok++; SFX.play("right"); EC.haptic(12); } else { EC.miss(q.pid); SFX.play("wrong"); EC.haptic([26, 50, 26]); } X.render(); },
    gTile: i => { const g = X.game, t = g.t; if (g.result) return; g.pick.push(+i); SFX.play("tile");
      if (g.pick.length === t.tiles.length) { const ok = EC.games.check(t.pid, g.pick.map(j => t.tiles.find(x => x.i === j).t)); g.result = ok ? "ok" : "bad";
        if (ok) { g.ok++; setTimeout(() => SFX.play("right"), 90); } else { EC.miss(t.pid); setTimeout(() => SFX.play("wrong"), 90); } }
      X.render(); },
    gUn: i => { SFX.play("tile"); X.game.pick = X.game.pick.filter(j => j !== +i); X.render(); },
    gNext: () => { const g = X.game; g.picked = null; g.result = null; g.pick = []; g.i++; let fin = false;
      if (g.kind === "quiz") { if (g.i >= g.q.length) { EC.games.log("quiz", g.q.length, g.ok); fin = true; } }
      else { g.t = g.pool[g.i] ? EC.games.tiles(g.pool[g.i]) : null; if (!g.t) { EC.games.log("build", g.n, g.ok); fin = true; } }
      if (fin) { const n = g.kind === "quiz" ? g.q.length : g.n; SFX.play(g.ok === n ? "glory" : "bell"); } else SFX.play("click");
      X.render(); },
    jump: i => { X.world = null; EC.setWeek(+i); window.go("today"); },
    station: i => { X.open = X.open || {}; X.open[i] = true; window.go("bank"); },
    bankOpen: n => { X.open = X.open || {}; const c = X.open[n] != null ? X.open[n] : +n === EC.S.week; X.open[n] = !c; X.render(); },
    openWeek: k => { X.open = X.open || {}; X.open[k] = !X.open[k]; X.render(); },
    sheet: () => { SFX.play("hiss"); X.sheet = !X.sheet; X.sheetFocused = false; X.render(); },
    sheetBg: (a, el, e) => { if (e.target === el) { X.sheet = false; X.render(); } return true; },
    ret: v => EC.srs.setRetention(+v),
    ahead: () => { X.ahead = EC.srs.aheadList(10).map(c => c.cid); X.aheadPlayed = ""; X.shown = false; X.render(); },
    reveal: () => { if (X.shown || !cur()) return; X.shown = true; X.justShown = true; SFX.play("reveal"); EC.haptic(8); X.render(); },
    grade: g => { const c = cur(); if (!c || !X.shown) return;
      g = +g; FX.fling(document.querySelector(".vx-cards .card"), { 1: "l", 2: "d", 3: "r", 4: "u" }[g]); SFX.play("g" + g); EC.haptic(g === 1 ? [26, 50, 26] : 14);
      if (g >= 3 && fading(c.pid)) X.purged = true;
      X.shown = false; X.graded = true; if (X.ahead && X.ahead.length) { X.aheadLast = X.ahead.shift(); } else X.aheadLast = null; EC.srs.answer(c.cid, g); },
    undo: () => { X.shown = false; SFX.play("hiss"); if (EC.srs.undo() && X.aheadLast) { X.ahead = X.ahead || []; X.ahead.unshift(X.aheadLast); X.aheadLast = null; X.aheadPlayed = ""; } },
    bury: () => { const c = cur(); if (!c) return; FX.fling(document.querySelector(".vx-cards .card"), "d"); X.shown = false; if (X.ahead && X.ahead.length) { X.ahead.shift(); X.render(); } else EC.srs.bury(c.cid); },
    hearCard: () => { const c = cur(); if (c) EC.voice.hear(c.pid); },
    eStart: () => { const all = EC.unlocked(), wk = all.filter(p => p.w === EC.S.week), rest = all.filter(p => p.w !== EC.S.week);
      X.game = X.echo = { kind: "echo", list: EC.shuffle(wk).concat(EC.shuffle(rest)).slice(0, 5).map(p => p.pid), i: 0, step: 1, ok: 0 }; X.render(); },
    eListen: () => { const e = X.echo, pid = e.list[e.i]; playSeq(["t:" + pid]).then(() => { if (e.step === 1) { e.step = 2; X.render(); } }); },
    eRec: () => { const e = X.echo; e.recStarted = true; EC.voice.rec("m:" + e.list[e.i]); },
    eCompare: () => { const pid = X.echo.list[X.echo.i]; playSeq(["t:" + pid, "m:" + pid]); },
    eGrade: ok => { const e = X.echo; if (+ok) e.ok++; e.i++; e.step = 1; SFX.play(+ok ? "g3" : "click");
      if (e.i >= e.list.length) { EC.games.log("echo", e.list.length, e.ok); setTimeout(() => SFX.play(e.ok === e.list.length ? "glory" : "bell"), 300); } X.render(); },
    gEnd: () => { X.game = null; X.echo = null; X.render(); }
  },
  keys(e) {
    if (X.sheet && e.key === "Escape") { X.sheet = false; X.render(); return true; }
    const w = e.target && e.target.closest && e.target.closest(".world[data-act]");
    if (w && (e.key === "Enter" || e.code === "Space")) { e.preventDefault(); window.DESIGN.acts[w.dataset.act](w.dataset.arg); return true; }
    if (HIM && X.cur === "cards" && !X.sheet) {
      const a = window.DESIGN.acts;
      if (e.code === "Space" || e.key === "Enter") { if (e.target && e.target.closest && e.target.closest("button,a,input,[role=button]")) return true; e.preventDefault(); if (!X.shown && cur()) a.reveal(); return true; }
      if (["1", "2", "3", "4"].includes(e.key)) { if (X.shown) a.grade(e.key); return true; }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { if (X.shown) a.grade(e.key === "ArrowLeft" ? 1 : 3); return true; }
      if (e.key === "u") { a.undo(); return true; }
    }
  }
};
})();
