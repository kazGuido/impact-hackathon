// Scam Coach voice.
//   ScamCoachVoice.speak(text, { voice: "scammer" | "coach", lang: "en" | "zh" | "es" | "ko", onEngine })
//     -> Promise. Resolves with "tts-1", "browser", "stopped" or "none" when the speech ends.
//   ScamCoachVoice.stop()
//
// Plan A: our server makes the voice with tts-1 (POST /api/speak).
// Plan B: if that fails or is slow, the browser's built-in speech is used.
(function () {
  "use strict";

  var SPEAK_URL = "/api/speak";
  var SERVER_TIMEOUT_MS = 8000;
  var hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined";

  // Languages the app can speak: en, zh, es, ko. Anything else is spoken as English.
  var LANG_TAG = { en: "en-US", zh: "zh-CN", es: "es-ES", ko: "ko-KR" };
  var LANG_RE = { en: /^en/i, zh: /^zh/i, es: /^es/i, ko: /^ko/i };

  var runId = 0;        // goes up on every speak() and stop(); old runs see this and quit
  var current = null;   // { id, end } for whatever is playing right now
  var audioEl = null;   // one <audio> element, reused, so iPhone keeps it unlocked
  var silentUrl = null; // tiny silent WAV, used to unlock audioEl during the tap
  var lastUtter = null; // keeps the utterance alive so the browser does not drop its onend

  // A short silent WAV made in code (8 kHz, 0.1 s).
  function getSilentUrl() {
    if (silentUrl) return silentUrl;
    var rate = 8000, n = 800;
    var buf = new ArrayBuffer(44 + n);
    var v = new DataView(buf);
    var s = function (off, str) { for (var i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i)); };
    s(0, "RIFF"); v.setUint32(4, 36 + n, true); s(8, "WAVE");
    s(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
    s(36, "data"); v.setUint32(40, n, true);
    for (var i = 0; i < n; i++) v.setUint8(44 + i, 128);
    silentUrl = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
    return silentUrl;
  }

  function getAudio() {
    if (!audioEl) audioEl = new Audio();
    return audioEl;
  }

  // Must run inside the user's tap. Plays silence once, so later audio is allowed on iPhone.
  function unlockAudio() {
    try {
      var el = getAudio();
      el.src = getSilentUrl();
      var p = el.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* no audio support: the browser voice will be used */ }
  }

  function endCurrent() {
    var c = current;
    current = null;
    if (c) c.end();
  }

  function stop() {
    runId++;
    endCurrent();
    if (audioEl) { try { audioEl.pause(); } catch (e) { /* ignore */ } }
    if (hasSpeech) { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  }

  // Pick a browser voice that matches the language and sounds like the role.
  var MALE_NAMES = /daniel|fred|aaron|alex|david|mark|tom|reed|rocko|eddy|kangkang|rishi|yu-?shu/i;
  var FEMALE_NAMES = /samantha|karen|tessa|moira|victoria|zira|ting-?ting|meijia|sin-?ji|lili|huihui|yaoyao|flo|shelley|sandy|kathy|female/i;
  function browserVoices() {
    return (hasSpeech && window.speechSynthesis.getVoices()) || [];
  }
  // False only when the browser lists voices but none of them speaks this language.
  // (Some browsers list no voices until later, so an empty list still tries to speak.)
  function hasVoiceFor(lang) {
    var all = browserVoices();
    if (!all.length) return true;
    return all.some(function (v) { return LANG_RE[lang].test(v.lang); });
  }
  function pickBrowserVoice(lang, voice) {
    var all = browserVoices();
    var langRe = LANG_RE[lang];
    var list = all.filter(function (v) { return langRe.test(v.lang); });
    if (!list.length) return null;
    var first = function (arr) { return arr.length ? arr[0] : null; };
    if (voice === "scammer") {
      return first(list.filter(function (v) { return MALE_NAMES.test(v.name) && !FEMALE_NAMES.test(v.name); })) ||
        first(list.filter(function (v) { return !FEMALE_NAMES.test(v.name); })) || list[list.length - 1];
    }
    return first(list.filter(function (v) { return FEMALE_NAMES.test(v.name); })) ||
      first(list.filter(function (v) { return !MALE_NAMES.test(v.name); })) || list[0];
  }

  // Browser voice. Resolves when the sentence ends, is stopped, or times out.
  function playBrowser(text, voice, lang, my, onEngine) {
    return new Promise(function (resolve) {
      // No voice for this language: say nothing, so the app shows the text only.
      if (!hasSpeech || !hasVoiceFor(lang)) return resolve("none");
      var settled = false;
      var watchdog = null;
      function settle(result) {
        if (settled) return;
        settled = true;
        clearTimeout(watchdog);
        if (current && current.id === my) current = null;
        resolve(result);
      }
      current = {
        id: my,
        end: function () { try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } settle("stopped"); }
      };
      var u = new SpeechSynthesisUtterance(text);
      lastUtter = u;
      u.lang = LANG_TAG[lang];
      var picked = pickBrowserVoice(lang, voice);
      if (picked) u.voice = picked;
      // Different pitch and speed, so the two roles still sound different with any voice.
      u.pitch = voice === "scammer" ? 0.7 : 1.15;
      u.rate = voice === "scammer" ? 1.05 : 0.9;
      u.onend = function () { settle("browser"); };
      u.onerror = function () { settle("none"); };
      // Some browsers never fire onend. Stop waiting after a generous time for the sentence.
      watchdog = setTimeout(function () { settle("browser"); }, text.length * 120 + 4000);
      onEngine("browser");
      try {
        window.speechSynthesis.speak(u);
      } catch (e) {
        settle("none");
      }
    });
  }

  // Server voice (tts-1). Plays the MP3 and resolves when it ends. Rejects if it cannot play.
  function playServer(blob, my, onEngine) {
    return new Promise(function (resolve, reject) {
      var el = getAudio();
      var url = URL.createObjectURL(blob);
      var settled = false;
      function settle(fn, value) {
        if (settled) return;
        settled = true;
        if (current && current.id === my) current = null;
        el.onended = null;
        el.onerror = null;
        try { el.pause(); } catch (e) { /* ignore */ }
        URL.revokeObjectURL(url);
        fn(value);
      }
      current = { id: my, end: function () { settle(resolve, "stopped"); } };
      el.onended = function () { settle(resolve, "tts-1"); };
      el.onerror = function () { settle(reject, new Error("audio error")); };
      el.src = url;
      var p = el.play();
      if (p && p.catch) p.catch(function (err) { settle(reject, err); });
      onEngine("tts-1");
    });
  }

  // Asks our server for the tts-1 audio. Rejects on any failure, so the caller falls back.
  function fetchServerAudio(text, voice, ctl) {
    return fetch(SPEAK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: text, voice: voice }),
      cache: "no-store",
      signal: ctl ? ctl.signal : undefined,
    }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.blob();
    });
  }

  function speak(text, opts) {
    opts = opts || {};
    var voice = opts.voice === "scammer" ? "scammer" : "coach";
    var lang = LANG_TAG[opts.lang] ? opts.lang : "en";
    var onEngine = typeof opts.onEngine === "function" ? opts.onEngine : function () {};
    var clean = String(text == null ? "" : text).replace(/\s+/g, " ").trim();

    stop();
    var my = runId;
    if (!clean) return Promise.resolve("none");

    unlockAudio();

    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, SERVER_TIMEOUT_MS);

    function fallback() {
      clearTimeout(timer);
      if (my !== runId) return Promise.resolve("stopped");
      return playBrowser(clean, voice, lang, my, onEngine);
    }

    return fetchServerAudio(clean, voice, ctl)
      .then(function (blob) {
        clearTimeout(timer);
        if (my !== runId) return "stopped";
        return playServer(blob, my, onEngine).catch(fallback);
      })
      .catch(fallback);
  }

  window.ScamCoachVoice = { speak: speak, stop: stop };
})();
