/* A soft gate for the recording chain, after RNNoise and before the compressor: between words the residual noise
   is turned down, so the compressor's make-up gain does not lift it back. It never cuts to silence (floor) and
   moves smoothly (5 ms open, 120 ms close, 150 ms hold), so word tails are not chopped. Levels in dBFS. */
class VoxSoftGate extends AudioWorkletProcessor {
  constructor(o) {
    super();
    const p = (o && o.processorOptions) || {}, db = x => Math.pow(10, x / 20);
    this.open = db(p.open == null ? -50 : p.open); this.close = db(p.close == null ? -58 : p.close); this.floor = db(p.floor == null ? -30 : p.floor);
    this.att = 1 - Math.exp(-1 / (sampleRate * 0.005)); this.rel = 1 - Math.exp(-1 / (sampleRate * 0.12));
    this.envUp = 1 - Math.exp(-1 / (sampleRate * 0.002)); this.envDown = 1 - Math.exp(-1 / (sampleRate * 0.04));
    this.holdN = Math.round(sampleRate * (p.holdMs == null ? 150 : p.holdMs) / 1000);
    this.env = 0; this.g = this.floor; this.hold = 0; this.on = false;
  }
  process(inputs, outputs) {
    const x = inputs[0] && inputs[0][0], out = outputs[0];
    if (!x) return true;
    const y = out[0];
    for (let n = 0; n < x.length; n++) {
      const a = Math.abs(x[n]);
      this.env += (a > this.env ? this.envUp : this.envDown) * (a - this.env);
      if (this.env > this.open) { this.on = true; this.hold = this.holdN; }
      else if (this.env < this.close) { if (this.hold > 0) this.hold--; else this.on = false; }
      const t = this.on ? 1 : this.floor;
      this.g += (t > this.g ? this.att : this.rel) * (t - this.g);
      y[n] = x[n] * this.g;
    }
    for (let c = 1; c < out.length; c++) out[c].set(y);
    return true;
  }
}
registerProcessor("vox-soft-gate", VoxSoftGate);
