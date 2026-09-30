/* Finds Playwright wherever it is installed on this machine. */
let mod;
try { mod = await import("playwright"); }
catch { mod = await import("file:///C:/nvm4w/nodejs/node_modules/@playwright/mcp/node_modules/playwright/index.mjs"); }
export const chromium = mod.chromium;
/* Tests must be silent. --mute-audio covers Web Audio and <audio>, but on Windows speechSynthesis goes straight to the
   system voice and ignores it, so every page gets a quiet stand-in that still fires onstart and onend like the real one. */
export const SILENT = () => {
  const fake = { speaking: false, pending: false, paused: false, onvoiceschanged: null, getVoices: () => [], cancel() {}, pause() {}, resume() {},
    speak(u) { setTimeout(() => { u.onstart && u.onstart(); setTimeout(() => { u.onend && u.onend(); }, 400 + String(u.text || "").length * 40); }, 20); },
    addEventListener() {}, removeEventListener() {} };
  try { Object.defineProperty(window, "speechSynthesis", { value: fake, configurable: true }); } catch (e) {}
};
/* System Chrome, muted, with a fake microphone so recording buttons can be exercised headless. */
export const launch = async () => {
  const b = await chromium.launch({ channel: "chrome",
    args: ["--mute-audio", "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
  const nc = b.newContext.bind(b);
  b.newContext = async o => { const c = await nc(o); await c.addInitScript(SILENT); return c; };
  b.newPage = async o => (await b.newContext(o)).newPage();
  return b;
};
