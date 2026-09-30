/* sfx.js: every sound in vox, synthesised with Web Audio. No files, so it weighs nothing and works with no signal.
   The palette is the machine's: relay clacks, cogitator chirps, a wax seal's thump, a bell, a choir chord for the big moments.
   Silent while the microphone is open, while the tab is hidden, and when he turns sounds off (one switch per device). */
(function () {
"use strict";
const S = window.VOXSFX = {};
const KEY = "vx-sfx";
let ac = null, out = null, wet = null, noiseBuf = null;

S.on = () => { try { return localStorage.getItem(KEY) !== "0"; } catch (e) { return true; } };
S.set = on => { try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} if (on) S.play("click"); };

function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ac = new AC(); } catch (e) { return null; }
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(ac.destination);
    out = ac.createGain(); out.gain.value = .42; out.connect(comp);
    /* a cathedral: two seconds of decaying noise as the impulse */
    const len = Math.round(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const conv = ac.createConvolver(); conv.buffer = ir; wet = ac.createGain(); wet.gain.value = .32; wet.connect(conv); conv.connect(out);
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate); const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  }
  if (ac.state === "suspended") ac.resume().catch(() => {});
  return ac;
}
/* the first touch anywhere wakes the audio, so the first real sound is on time */
["pointerdown", "keydown"].forEach(ev => addEventListener(ev, function wake() { if (S.on()) ctx(); removeEventListener(ev, wake, true); }, true));

const quiet = () => !S.on() || document.hidden || (window.EC && EC.voice && (EC.voice.st.rec || EC.voice.st.wait));

/* ---------- building blocks ---------- */
function env(g, t, a, peak, d, end = .0001) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
function tone(o) {
  const t = ac.currentTime + (o.at || 0), osc = ac.createOscillator(), g = ac.createGain();
  osc.type = o.type || "sine"; osc.frequency.setValueAtTime(o.f, t); if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || o.d));
  if (o.detune) osc.detune.value = o.detune;
  let node = osc;
  if (o.lp) { const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; f.Q.value = o.q || .7; node.connect(f); node = f; }
  if (o.bp) { const f = ac.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = o.bp; f.Q.value = o.q || 4; node.connect(f); node = f; }
  node.connect(g); g.connect(out); if (o.verb) { const s = ac.createGain(); s.gain.value = o.verb; g.connect(s); s.connect(wet); }
  env(g, t, o.a || .004, o.v || .2, o.d);
  osc.start(t); osc.stop(t + (o.a || .004) + o.d + .05);
}
function noise(o) {
  const t = ac.currentTime + (o.at || 0), src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = noiseBuf; src.loop = true; f.type = o.type || "bandpass"; f.frequency.setValueAtTime(o.f, t); if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + o.d); f.Q.value = o.q || 1;
  src.connect(f); f.connect(g); g.connect(out); if (o.verb) { const s = ac.createGain(); s.gain.value = o.verb; g.connect(s); s.connect(wet); }
  env(g, t, o.a || .002, o.v || .2, o.d);
  src.start(t, Math.random() * .5); src.stop(t + (o.a || .002) + o.d + .05);
}
/* a bell: inharmonic partials, long decay */
function bell(f, at = 0, v = .16, d = 2.4) { [[1, 1], [2.01, .55], [2.76, .42], [5.4, .22], [8.93, .1]].forEach(([m, a]) => tone({ f: f * m, at, v: v * a, d: d / Math.sqrt(m), a: .002, verb: .7 })); }
/* a choir: detuned saws through two vowel formants, slow swell. "Ah" */
function choir(notes, at = 0, d = 2.6, v = .05) {
  notes.forEach(n => [-9, 0, 8].forEach(dt => {
    [[720, 6], [1150, 7]].forEach(([bp, q], k) => tone({ f: n, detune: dt, type: "sawtooth", bp, q, a: .45, d, v: v * (k ? .6 : 1), at, verb: 1 }));
    tone({ f: n / 2, detune: dt, type: "sine", a: .5, d, v: v * .5, at, verb: .6 });
  }));
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

/* ---------- the palette ---------- */
const SND = {
  /* a relay closing: every plain button */
  click() { noise({ f: 2600, q: 1.4, d: .03, v: .12 }); tone({ f: 150, f2: 60, d: .05, v: .16 }); },
  /* the tab bar: a lighter, higher double tick */
  tab() { noise({ f: 4200, q: 2, d: .018, v: .09 }); noise({ f: 3000, q: 2, d: .02, v: .07, at: .045 }); },
  /* reveal: the cogitator decodes, a burst of static and five data blips */
  reveal() { noise({ f: 5000, type: "highpass", d: .09, v: .05 }); [0, 1, 2, 3, 4].forEach(i => tone({ type: "square", f: hz([81, 86, 84, 88, 93][i]), at: .02 + i * .038, d: .03, v: .035, lp: 3500 })); },
  /* four grades, from a denial buzz to a bright chime */
  g1() { tone({ type: "sawtooth", f: 196, f2: 98, d: .26, v: .12, lp: 900 }); tone({ type: "square", f: 98, d: .18, v: .05, lp: 500, at: .02 }); },
  g2() { tone({ type: "triangle", f: hz(69), d: .09, v: .12 }); tone({ type: "triangle", f: hz(67), d: .14, v: .1, at: .09 }); },
  g3() { tone({ f: hz(76), d: .25, v: .13, verb: .3 }); tone({ f: hz(83), d: .45, v: .12, at: .08, verb: .4 }); tone({ type: "triangle", f: hz(88), d: .3, v: .03, at: .08 }); },
  g4() { [76, 83, 88, 95].forEach((m, i) => tone({ f: hz(m), d: .5, v: .1, at: i * .06, verb: .5 })); tone({ type: "triangle", f: hz(100), d: .6, v: .03, at: .2, verb: .8 }); },
  /* the purity seal pressed into wax */
  stamp() { tone({ f: 110, f2: 42, d: .22, v: .34 }); noise({ f: 700, type: "lowpass", d: .09, v: .2 }); noise({ f: 1800, q: 3, d: .05, v: .06, at: .05 }); },
  unstamp() { noise({ f: 1400, f2: 3000, q: 2, d: .12, v: .08 }); },
  /* a card that was fading comes back: the taint burns off */
  purge() { noise({ f: 6000, f2: 500, q: .8, d: .55, v: .09, verb: .5 }); tone({ f: 70, f2: 38, d: .4, v: .2, at: .05 }); tone({ f: hz(88), d: .9, v: .05, at: .12, verb: 1 }); },
  /* a game answer */
  right() { SND.g3(); },
  wrong() { tone({ type: "square", f: 140, d: .12, v: .07, lp: 700 }); tone({ type: "square", f: 118, d: .2, v: .07, lp: 700, at: .13 }); },
  tile() { tone({ type: "triangle", f: hz(72 + Math.floor(Math.random() * 6)), d: .07, v: .1 }); noise({ f: 3200, q: 3, d: .015, v: .05 }); },
  /* hydraulics: a sheet or a door */
  hiss() { noise({ f: 900, f2: 5000, type: "bandpass", q: .6, a: .03, d: .28, v: .05 }); },
  /* the bell of the chapel: a new block in the session, time is up */
  bell() { bell(hz(64)); },
  toll() { bell(hz(57), 0, .2, 3.2); bell(hz(57), .9, .15, 3); },
  /* the Emperor protects: done for today */
  glory() { choir([hz(50), hz(57), hz(62), hz(66)], 0, 2.8); bell(hz(74), .15, .1, 3); },
  /* a new rank: choir, rising, then the bell */
  rank() { choir([hz(45), hz(52), hz(57)], 0, 1.4, .045); choir([hz(50), hz(57), hz(62), hz(66)], 1.1, 3, .05); bell(hz(74), 1.1, .14, 3.2); tone({ f: 55, f2: 38, d: 1, v: .25, at: 1.1 }); },
  /* the machine spirit wakes */
  boot() { tone({ type: "sawtooth", f: 55, f2: 440, glide: .7, d: .8, v: .04, lp: 1200 }); tone({ f: 50, d: 1.2, v: .08, a: .3 }); [0, 1, 2].forEach(i => tone({ type: "square", f: hz(84 + i * 5), at: .55 + i * .06, d: .04, v: .03, lp: 3000 })); bell(hz(69), .8, .08, 2.2); },
  /* vox squelch: a transmission arrives (a new report, a copied link) */
  vox() { noise({ f: 1800, q: 1.5, d: .07, v: .1 }); tone({ type: "square", f: hz(91), at: .08, d: .05, v: .03, lp: 3000 }); tone({ type: "square", f: hz(96), at: .14, d: .06, v: .03, lp: 3000 }); }
};
S.play = (name, force) => {
  if ((!force && quiet()) || !SND[name]) return;
  if (!ctx()) return;
  try { SND[name](); } catch (e) {}
};
})();
