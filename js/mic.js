/* mic.js: the recording chain, so the teacher's voice (the one he copies) and his own come out clear.
   The browser's own processing is switched off: echo cancelling, noise suppression and auto gain muffle speech
   (Firefox cut everything above ~1.3 kHz and pumped the level into clipping). Instead, all at 48 kHz:
     high-pass 80 Hz (rumble, desk thumps, mains hum)  ->  RNNoise (xiph's neural noise suppressor, full band)
     ->  a soft gate between words (js/gate-worklet.js)  ->  a compressor that lifts quiet speech (its automatic make-up gain)  ->  a limiter and a soft clipper against clipping.
   VOXMIC.open() gives a processed MediaStream to record; if any piece is missing the engine falls back to the browser's
   own processing, so recording never breaks. VOXMIC.chain() is the same graph for any context (tools/denoise-lab.html). */
(function () {
"use strict";
const M = window.VOXMIC = {};
const url = p => new URL(p, document.baseURI).href;
let lib = null, wasm = null, loading = null, ctx = null;

function load() {
  if (!loading) loading = (async () => {
    if (!window.AudioWorkletNode || !window.WebAssembly) throw new Error("no worklet");
    lib = await import(url("vendor/noise/index.js"));
    wasm = await lib.loadRnnoise({ url: url("vendor/noise/rnnoise.wasm"), simdUrl: url("vendor/noise/rnnoise_simd.wasm") });
  })();
  loading.catch(() => { loading = null; });
  return loading;
}
const worklets = new WeakMap();
async function prepare(c) {
  await load();
  if (!worklets.has(c)) worklets.set(c, Promise.all([c.audioWorklet.addModule(url("vendor/noise/rnnoise/workletProcessor.js")), c.audioWorklet.addModule(url("js/gate-worklet.js"))]));
  await worklets.get(c);
}

/* input -> ... -> returns {out, tap, close}. out is the last node; connect it where the sound should go */
M.chain = async (c, input) => {
  await prepare(c);
  const hp = new BiquadFilterNode(c, { type: "highpass", frequency: 80, Q: 0.7 });
  const nr = new lib.RnnoiseWorkletNode(c, { maxChannels: 1, wasmBinary: wasm });
  const gate = new AudioWorkletNode(c, "vox-soft-gate", { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [1], processorOptions: { open: -40, close: -48, floor: -30, holdMs: 150 } });
  const comp = new DynamicsCompressorNode(c, { threshold: -36, knee: 10, ratio: 3.5, attack: 0.005, release: 0.25 });
  const lim = new DynamicsCompressorNode(c, { threshold: -3, knee: 0, ratio: 20, attack: 0.001, release: 0.1 });
  /* the compressor limiter is not a brick wall and its make-up gain can overshoot: a soft clipper keeps every sample under full scale */
  const curve = new Float32Array(2049); for (let i = 0; i < 2049; i++) { const x = i / 1024 - 1, m = Math.abs(x); curve[i] = m < 0.8 ? x : Math.sign(x) * (0.8 + 0.19 * Math.tanh((m - 0.8) / 0.19)); }
  const clip = new WaveShaperNode(c, { curve, oversample: "2x" });
  const tap = new AnalyserNode(c, { fftSize: 1024 });
  input.connect(hp); hp.connect(nr); nr.connect(gate); gate.connect(comp); comp.connect(lim); lim.connect(clip); clip.connect(tap);
  return { out: clip, tap, close() { try { input.disconnect(); } catch (e) {} [hp, nr, gate, comp, lim, clip, tap].forEach(n => { try { n.disconnect(); } catch (e) {} }); try { nr.destroy(); } catch (e) {} } };
};

const RAW = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: { ideal: 1 } } };
/* resume() can wait forever where the browser blocks audio, so it gets a deadline */
const start = c => c.state === "running" ? Promise.resolve() : Promise.race([c.resume(), new Promise((_, no) => setTimeout(() => no(Object.assign(new Error("the audio context did not start"), { name: "AudioBlocked" })), 2000))]);
/* 48 kHz is what RNNoise is trained on. A browser that cannot feed a microphone at another rate into it
   (older Firefox: "different sample-rate") gets a context at the device's own rate instead */
async function wire(raw) {
  let lastErr = null;
  for (const rate of [48000, 0]) {
    if (!ctx || ctx.state === "closed" || (rate && ctx.sampleRate !== rate)) { if (ctx && ctx.state !== "closed") ctx.close(); ctx = new AudioContext(rate ? { sampleRate: rate, latencyHint: "interactive" } : { latencyHint: "interactive" }); }
    try { await start(ctx); return { src: ctx.createMediaStreamSource(raw), c: ctx }; }
    catch (e) { lastErr = e; if (e.name === "AudioBlocked") break; ctx.close(); ctx = null; }
  }
  throw lastErr;
}
/* a live microphone through the chain: {stream, level(), close()} */
M.open = async () => {
  if (!ctx || ctx.state === "closed") ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
  const early = ctx.resume().catch(() => {});      // start while the tap that asked for it still counts as a gesture
  try {
    await load(); await early;
    const raw = await navigator.mediaDevices.getUserMedia(RAW);
    try {
      const { src, c } = await wire(raw), ch = await M.chain(c, src), dest = c.createMediaStreamDestination();
      dest.channelCount = 1; ch.out.connect(dest);
      const buf = new Float32Array(ch.tap.fftSize);
      M.lastError = ""; M.rate = c.sampleRate;
      return {
        stream: dest.stream,
        level() { ch.tap.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.min(1, Math.sqrt(s / buf.length) * 4); },
        close() { ch.close(); try { dest.disconnect(); } catch (e) {} raw.getTracks().forEach(t => t.stop()); dest.stream.getTracks().forEach(t => t.stop()); }
      };
    } catch (e) { raw.getTracks().forEach(t => t.stop()); throw e; }
  } catch (e) { if (e.name !== "NotAllowedError") M.lastError = (e.name || "Error") + ": " + (e.message || e); throw e; }
};
M.lastError = "";

/* step by step, for the teacher's "Check microphone": where the chain breaks on this browser and this microphone */
M.diagnose = async () => {
  const r = [], add = (k, v) => r.push([k, v]), db = x => x > 0 ? (20 * Math.log10(x)).toFixed(1) + " dB" : "silence";
  add("browser", (navigator.userAgent.match(/(Firefox|Edg|Chrome|Version)\/[\d.]+/g) || [navigator.userAgent]).join(" "));
  add("worklets, wasm", (!!window.AudioWorkletNode) + ", " + (!!window.WebAssembly));
  let c = null, raw = null;
  try {
    c = new AudioContext({ sampleRate: 48000 }); const early = c.resume().catch(() => {});
    try { await load(); add("noise model", "loaded" + (wasm ? ", " + Math.round(wasm.byteLength / 1024) + " KB" : "")); } catch (e) { add("noise model", "FAILED " + e.name + ": " + e.message); }
    await early; add("audio context", c.sampleRate + " Hz, " + c.state);
    raw = await navigator.mediaDevices.getUserMedia(RAW);
    const t = raw.getAudioTracks()[0], s = t.getSettings();
    add("microphone", t.label || "(no label)"); add("mic settings", JSON.stringify({ sampleRate: s.sampleRate, channelCount: s.channelCount, echoCancellation: s.echoCancellation, noiseSuppression: s.noiseSuppression, autoGainControl: s.autoGainControl }));
    let src;
    try { src = c.createMediaStreamSource(raw); add("mic into 48 kHz", "ok"); }
    catch (e) { add("mic into 48 kHz", "FAILED " + e.name + ": " + e.message); c.close(); c = new AudioContext(); await start(c).catch(() => {}); src = c.createMediaStreamSource(raw); add("mic into " + c.sampleRate + " Hz", "ok"); }
    const pre = new AnalyserNode(c, { fftSize: 2048 }); src.connect(pre);
    let ch = null; try { ch = await M.chain(c, src); add("noise chain", "built"); } catch (e) { add("noise chain", "FAILED " + e.name + ": " + e.message); }
    add("now", "speak for 3 seconds…");
    const a = new Float32Array(pre.fftSize), b = new Float32Array(ch ? ch.tap.fftSize : 1); let pk0 = 0, pk1 = 0;
    for (let i = 0; i < 60; i++) {
      await new Promise(res => setTimeout(res, 50));
      pre.getFloatTimeDomainData(a); for (const x of a) { const v = Math.abs(x); if (v > pk0) pk0 = v; }
      if (ch) { ch.tap.getFloatTimeDomainData(b); for (const x of b) { const v = Math.abs(x); if (v > pk1) pk1 = v; } }
    }
    r.pop(); add("raw mic peak", db(pk0)); if (ch) add("after the chain, peak", db(pk1));
    if (ch) ch.close();
  } catch (e) { add("FAILED", (e.name || "Error") + ": " + (e.message || e)); }
  finally { if (raw) raw.getTracks().forEach(t => t.stop()); if (c && c.state !== "closed") c.close(); }
  add("last recording error", M.lastError || "none");
  add("noise removal", M.enabled() ? "on" : "off");
  return r;
};
/* the teacher can switch the chain off in Settings if a microphone sounds better raw; on by default */
M.enabled = () => { try { return localStorage.getItem("vx-mic-clean") !== "0"; } catch (e) { return true; } };
M.set = on => { try { localStorage.setItem("vx-mic-clean", on ? "1" : "0"); } catch (e) {} };
M.warm = () => { load().catch(() => {}); };
})();
