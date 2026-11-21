// Call demo: incoming call -> in call with captions -> decide -> result -> reward.
// Standalone page. No API calls, nothing saved. On Accept it plays the recording
// (audio/call-short.m4a, or audio/call-long.m4a with ?v=long). If the audio does not play,
// the captions run on a timer so the demo still works.
(() => {
  "use strict";

  // Two recordings. Default: short. URL call.html?v=long: long.
  // lines: [seconds from the start of the audio, caption text].
  const VARIANTS = {
    short: {
      src: "audio/call-short.m4a",
      end: 25, // fallback: seconds before "end the call" shows, if no audio plays
      lines: [
        [0.0, "Abuela? It's me, Alex."],
        [2.0, "Sorry, my nose is swollen, I had an accident."],
        [4.5, "I hit another car. I'm at the police station, they took my phone."],
        [9.0, "If I don't pay bail tonight, I stay here until Monday."],
        [12.5, "It's two thousand dollars."],
        [14.3, "A lawyer will call you, he'll tell you how to pay."],
        [17.8, "And please... don't tell Mom and Dad."],
        [20.7, "You're the only one I can call. Te quiero."],
      ],
    },
    long: {
      src: "audio/call-long.m4a",
      end: 46,
      lines: [
        [0.0, "Abuela? Abuela, it's me, Alex."],
        [1.8, "Sorry if I sound weird, I hit my face on the steering wheel, my nose is all swollen."],
        [7.0, "I had an accident. I'm okay, but I hit another car, and the other lady got hurt."],
        [13.5, "I'm at the police station. They took my phone, they let me use this one for one call."],
        [19.8, "Abuela, they're saying if I don't pay bail tonight, I have to stay here until Monday. Ya sé, I'm so scared."],
        [27.0, "It's two thousand dollars. A lawyer is going to call you in a few minutes, he'll tell you how to pay."],
        [33.4, "And please, don't tell Mom and Dad. The lawyer said it's better if nobody knows, or it gets worse for me."],
        [41.0, "Abuela, I'm sorry. You're the only one I can call. Te quiero."],
      ],
    },
  };
  const params = new URLSearchParams(window.location.search);
  const VARIANT = params.get("v") === "long" ? VARIANTS.long : VARIANTS.short;
  const SHOW_CAPTIONS = params.get("captions") !== "off"; // ?captions=off hides the captions card

  const $ = (id) => document.getElementById(id);
  const phone = $("phone");
  let ticker = null;
  let audio = null;
  let audioOn = false;   // true once the browser has started the audio file
  let t0 = 0;
  let lastLine = -1;
  let wrong = false;       // the user chose "Yes, I trust it"
  let showingSigns = false;

  function show(name) {
    document.querySelectorAll(".scr").forEach((s) => { s.hidden = s.dataset.s !== name; });
    phone.dataset.theme = name === "result" || name === "reward" ? "light" : "dark";
    window.scrollTo(0, 0);
  }

  function fmt(sec) {
    const s = Math.floor(sec);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function stopTimers() {
    if (ticker) { clearInterval(ticker); ticker = null; }
    if (audio) { try { audio.pause(); } catch (e) { /* ignore */ } }
  }

  function tick() {
    const elapsed = (performance.now() - t0) / 1000;
    $("timer").textContent = fmt(elapsed);
    const pos = audioOn && audio ? audio.currentTime : elapsed;
    let idx = 0;
    VARIANT.lines.forEach(([start], i) => { if (pos >= start) idx = i; });
    if (idx !== lastLine) {
      lastLine = idx;
      $("cap").textContent = VARIANT.lines[idx][1];
    }
    if ((audioOn && audio && audio.ended) || (!audioOn && elapsed >= VARIANT.end)) {
      $("ready").hidden = false;
    }
  }

  function startCall() {
    stopTimers();
    audio = null;
    audioOn = false;
    lastLine = -1;
    $("cap").textContent = "";
    $("ready").hidden = true;
    $("timer").textContent = "00:00";
    show("call");
    t0 = performance.now();
    // Created and played inside the Accept tap, so Safari allows the sound.
    try {
      const a = new Audio(VARIANT.src);
      audio = a;
      a.addEventListener("ended", () => { if (audio === a) $("ready").hidden = false; });
      const p = a.play();
      if (p && typeof p.then === "function") {
        // Only update the state if this audio is still the current call's audio.
        p.then(() => { if (audio === a) audioOn = true; },
               () => { if (audio === a) { audio = null; audioOn = false; } });
      }
    } catch (e) {
      audio = null;
    }
    ticker = setInterval(tick, 200);
    tick();
  }

  function endCall() {
    stopTimers();
    show("decide");
  }

  function showResult() {
    show("result");
    const v = $("verdict");
    v.textContent = wrong ? "Not quite. This was a scam." : "You spotted it! ✓";
    v.className = "verdict " + (wrong ? "wrong" : "right");
    $("hintbox").hidden = !wrong;
    $("hint-actions").hidden = showingSigns;
    $("full").hidden = wrong && !showingSigns;
  }

  function answer(trust) {
    wrong = trust; // "Yes, I trust it" is the wrong answer
    showingSigns = false;
    showResult();
  }

  function startOver() {
    stopTimers();
    audio = null;
    audioOn = false;
    wrong = false;
    showingSigns = false;
    $("es-text").hidden = true;
    $("btn-es").setAttribute("aria-expanded", "false");
    $("decline-note").hidden = true;
    show("incoming");
  }

  $("btn-accept").addEventListener("click", startCall);
  $("btn-decline").addEventListener("click", () => { $("decline-note").hidden = false; });
  $("btn-end").addEventListener("click", endCall);
  $("btn-trust").addEventListener("click", () => answer(true));
  $("btn-scam").addEventListener("click", () => answer(false));
  $("btn-retry").addEventListener("click", () => { showingSigns = false; show("decide"); });
  $("btn-signs").addEventListener("click", () => { showingSigns = true; showResult(); });
  $("btn-es").addEventListener("click", () => {
    const open = $("es-text").hidden;
    $("es-text").hidden = !open;
    $("btn-es").setAttribute("aria-expanded", String(open));
  });
  $("btn-next").addEventListener("click", () => show("reward"));
  $("btn-again").addEventListener("click", startOver);

  if (!SHOW_CAPTIONS) $("cap-card").hidden = true;
  show("incoming");
})();
