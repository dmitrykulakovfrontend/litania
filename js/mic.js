/* mic.js: the recording chain, so the teacher's voice (the one he copies) and his own come out clear.
   The browser's own processing is switched off: echo cancelling, noise suppression and auto gain muffle speech
   (Firefox cut everything above ~1.3 kHz and pumped the level into clipping). Instead, all at 48 kHz:
     high-pass 80 Hz (rumble, desk thumps, mains hum)  ->  RNNoise (xiph's neural noise suppressor, full band)
     ->  a soft gate between words (js/gate-worklet.js)  ->  a compressor that lifts quiet speech (its automatic make-up gain)  ->  a limiter against clipping.
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
  const tap = new AnalyserNode(c, { fftSize: 1024 });
  input.connect(hp); hp.connect(nr); nr.connect(gate); gate.connect(comp); comp.connect(lim); lim.connect(tap);
  return { out: lim, tap, close() { try { input.disconnect(); } catch (e) {} [hp, nr, gate, comp, lim, tap].forEach(n => { try { n.disconnect(); } catch (e) {} }); try { nr.destroy(); } catch (e) {} } };
};

/* a live microphone through the chain: {stream, level(), close()} */
M.open = async () => {
  await load();
  if (!ctx || ctx.state === "closed") ctx = new AudioContext({ sampleRate: 48000, latencyHint: "interactive" });
  if (ctx.state === "suspended") await ctx.resume();
  const raw = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: { ideal: 1 } } });
  try {
    const src = ctx.createMediaStreamSource(raw), ch = await M.chain(ctx, src), dest = ctx.createMediaStreamDestination();
    dest.channelCount = 1; ch.out.connect(dest);
    const buf = new Float32Array(ch.tap.fftSize);
    return {
      stream: dest.stream,
      level() { ch.tap.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.min(1, Math.sqrt(s / buf.length) * 4); },
      close() { ch.close(); try { dest.disconnect(); } catch (e) {} raw.getTracks().forEach(t => t.stop()); dest.stream.getTracks().forEach(t => t.stop()); }
    };
  } catch (e) { raw.getTracks().forEach(t => t.stop()); throw e; }
};
/* the teacher can switch the chain off in Settings if a microphone sounds better raw; on by default */
M.enabled = () => { try { return localStorage.getItem("vx-mic-clean") !== "0"; } catch (e) { return true; } };
M.set = on => { try { localStorage.setItem("vx-mic-clean", on ? "1" : "0"); } catch (e) {} };
M.warm = () => { load().catch(() => {}); };
})();
