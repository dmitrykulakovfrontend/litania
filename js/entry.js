/* entry.js: runs before the engine reads the address.
   The bare address is his: /litania/ opens the student side, /litania/#7 opens it on week 7 (the old short links).
   The teacher adds ?teacher. ?demo, ?preview and any other query are left alone.
   Also registers the service worker, so after one visit the app opens with no signal, and makes a new version
   arrive quickly: it is checked on every return to the tab, and once installed the page reloads itself at a calm moment. */
(function () {
  "use strict";
  var h = location.hash;
  if (!location.search && !/him/i.test(h)) {
    var n = (h.match(/^#(\d+)(-[A-Za-z0-9_-]+)?$/) || []);
    history.replaceState(null, "", location.pathname + "#him" + (n[1] || "") + (n[2] || ""));
  }
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol) || /[?&](demo|preview)\b/.test(location.search)) return;
  var sw = navigator.serviceWorker, hadOne = !!sw.controller, waiting = false;
  /* never in the middle of something: a recording, a running session clock, a card on screen, a game */
  function calm() {
    var E = window.EC, X = window.X;
    if (!E || !X) return true;
    return !(E.voice && (E.voice.st.rec || E.voice.st.wait)) && !(E.run && E.run.ticking) && X.cur !== "cards" && !X.game && !document.querySelector(".ceremony")
      && !(document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement.value);
  }
  function maybeReload() { if (waiting && calm()) location.reload(); }
  sw.addEventListener("controllerchange", function () { if (hadOne) { waiting = true; maybeReload(); } hadOne = true; });
  addEventListener("load", function () {
    sw.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
      window.voxSW = reg;
      /* a check the browser already has in flight swallows a second one, so ask again a little later, and every 10 minutes */
      var check = function () { reg.update().catch(function () {}); };
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") { check(); setTimeout(check, 5000); maybeReload(); } });
      setInterval(function () { if (document.visibilityState === "visible") check(); }, 10 * 60 * 1000);
      addEventListener("click", function () { setTimeout(maybeReload, 400); }, true);
    }).catch(function () {});
  });
})();
