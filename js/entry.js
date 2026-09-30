/* entry.js: runs before the engine reads the address.
   The bare address is his: /litania/ opens the student side, /litania/#7 opens it on week 7 (the old short links).
   The teacher adds ?teacher. ?demo, ?preview and any other query are left alone.
   Also registers the service worker, so after one visit the app opens with no signal. */
(function () {
  "use strict";
  var h = location.hash;
  if (!location.search && !/him/i.test(h)) {
    var n = (h.match(/^#(\d+)(-[A-Za-z0-9_-]+)?$/) || []);
    history.replaceState(null, "", location.pathname + "#him" + (n[1] || "") + (n[2] || ""));
  }
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !/[?&](demo|preview)\b/.test(location.search)) {
    addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
