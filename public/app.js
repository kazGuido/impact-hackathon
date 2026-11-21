// Scam Coach: browser app. No framework. One file.
// Progress is saved ONLY in this browser (localStorage). We never save what the user types.
(() => {
  "use strict";

  const STORE = "scamcoach.v1";
  const LANGKEY = "scamcoach.lang";

  // ---------- Text in two languages ----------
  const T = {
    en: {
      appName: "Scam Coach",
      tagline: "Learn to spot scams yourself, by practising.",
      sub: "Short practice messages. You try first. If you are stuck, we give one small hint. Then you learn the warning signs.",
      start: "Start practice",
      family: "For family: progress",
      privacy: "Practice only. All messages are made-up sample data. Nothing you type is saved. Progress stays on this phone.",
      aiNote: "Hints are written by AI, which can make mistakes. If you are ever unsure about a real message: hang up and call your family, or the anti-fraud hotline {hotline}.",
      practiceTitle: "Practice",
      checkTitle: "Check",
      back: "Back",
      strip: "PRACTICE: this is a made-up message",
      checkIntro: "Check: a NEW message. Let's see what you remember.",
      prompt: "Is this message a scam?",
      scam: "Scam",
      real: "Real",
      unsure: "Not sure",
      orType: "Or type a reply, as if you were answering them:",
      placeholder: "Type your reply…",
      send: "Send",
      noPersonal: "Please do not type real names, bank numbers or codes.",
      said: { scam: "I think it is a scam", real: "I think it is real", unsure: "I am not sure" },
      hintLabel: "Coach hint {n} of 2",
      srcAi: "written by AI",
      srcBuiltin: "built-in hint",
      tryAgain: "Try again. Is it a scam?",
      thinking: "Coach is thinking…",
      unsureBox: "Not sure? That is a good reason to slow down. Do not reply and do not tap anything. Hang up and call your family, or the anti-fraud hotline {hotline}.",
      practiceBanner: "This was a practice exercise. No real person sent this message.",
      wasScam: "It was a scam message.",
      wasReal: "It was a real message.",
      r_first: "You got it on your first try. Well done!",
      r_hint: "You found it after a hint. Well done!",
      r_miss: "Let's look at it together. This one is tricky.",
      markedTitle: "The message, with warning signs marked",
      signsTitle: "Warning signs in this message",
      whyRealTitle: "Why this one looks fine",
      realCaution: "Stay careful anyway. If something feels odd, hang up and call your family, or the anti-fraud hotline {hotline}.",
      tipTitle: "Try this at home",
      checkPass: "Check passed: you spotted it on your own.",
      checkFail: "Not yet, and that is okay. Practice makes it easier.",
      nextCheck: "Check: try a new one",
      nextPractice: "Practise another",
      toFamily: "Family panel",
      familyTitle: "Family panel",
      sampleBanner: "SAMPLE DATA: made-up numbers for the demo. Not a real person.",
      empty: "No practice yet. Ask your parent to try a few practice messages, then come back here.",
      sDone: "Exercises done",
      sFirst: "Right on first try",
      sHint: "Needed a hint",
      sCheck: "Checks passed first try",
      timelineTitle: "Every exercise, oldest first",
      legend: "✓ = right on the first try. ? = needed a hint. Square = check with a new message.",
      trendNeed: "Do a few more exercises to see a trend.",
      trendLine: "First-try correct: earlier {a}% → recently {b}%",
      up: "Improving ▲",
      same: "Steady ►",
      down: "Needs more practice ▼",
      weakTitle: "Warning signs that are still weak",
      weakNone: "No weak warning signs yet. Keep practising!",
      missed: "missed first time {m} of {e}",
      tryHome: "Try at home:",
      falseAlarm: "Real messages first called a scam: {n}. Being careful is good. We also practise telling real messages apart, so nobody becomes afraid of everything.",
      demoOn: "Show sample data (demo)",
      demoOff: "Hide sample data",
      reset: "Erase progress on this phone",
      resetAsk: "Erase all practice progress on this phone?",
      evidenceNote: "Results are stored only in this browser. They show practice progress in this app, not a scientific test.",
      loadFail: "Could not load the practice messages. Please reload the page.",
    },
    zh: {
      appName: "防骗教练",
      tagline: "通过练习，自己学会识别骗局。",
      sub: "一条条练习消息。您先试一试，卡住时我们只给一点小提示，然后您就学会了警示信号。",
      start: "开始练习",
      family: "家人看进度",
      privacy: "这只是练习。所有消息都是虚构的示例。您输入的内容不会被保存。进度只留在这部手机上。",
      aiNote: "提示由 AI 写成，可能会出错。遇到真实消息拿不准时：先挂断，打电话给家人，或拨打反诈热线 {hotline}。",
      practiceTitle: "练习",
      checkTitle: "小测验",
      back: "返回",
      strip: "练习：这是一条模拟消息",
      checkIntro: "小测验：一条新消息。看看您还记得什么。",
      prompt: "您觉得这条消息是骗局吗？",
      scam: "骗局",
      real: "真的",
      unsure: "不确定",
      orType: "或者，像回复对方一样打字回复：",
      placeholder: "在这里输入回复…",
      send: "发送",
      noPersonal: "请不要输入真实姓名、银行卡号或验证码。",
      said: { scam: "我觉得是骗局", real: "我觉得是真的", unsure: "我不确定" },
      hintLabel: "教练提示 {n}/2",
      srcAi: "AI 撰写",
      srcBuiltin: "内置提示",
      tryAgain: "再试一次。这是骗局吗？",
      thinking: "教练在想…",
      unsureBox: "不确定？那就先慢下来。不要回复，不要点任何东西。挂断，打电话给家人，或拨打反诈热线 {hotline}。",
      practiceBanner: "这是一次练习。这条消息不是真人发的。",
      wasScam: "这是一条骗局消息。",
      wasReal: "这是一条真消息。",
      r_first: "您第一次就答对了，真棒！",
      r_hint: "看了提示后您找到了，真棒！",
      r_miss: "我们一起来看看。这一条有点难。",
      markedTitle: "标出警示信号的消息",
      signsTitle: "这条消息里的警示信号",
      whyRealTitle: "为什么这条看起来没问题",
      realCaution: "也要保持小心。如果觉得不对劲，先挂断，打电话给家人，或拨打反诈热线 {hotline}。",
      tipTitle: "在家练一练",
      checkPass: "小测验通过：您自己识别出来了。",
      checkFail: "还没有，没关系。多练几次就容易了。",
      nextCheck: "小测验：换一条试试",
      nextPractice: "再练一条",
      toFamily: "家人面板",
      familyTitle: "家人面板",
      sampleBanner: "示例数据：演示用的虚构数字，不是真人。",
      empty: "还没有练习记录。请让长辈做几条练习，然后回到这里查看。",
      sDone: "已做练习",
      sFirst: "第一次就答对",
      sHint: "需要提示",
      sCheck: "小测验一次通过",
      timelineTitle: "每次练习（从早到晚）",
      legend: "✓ = 第一次就答对。? = 需要提示。方块 = 新消息的小测验。",
      trendNeed: "再多做几条练习，就能看到变化。",
      trendLine: "第一次答对率：之前 {a}% → 最近 {b}%",
      up: "在进步 ▲",
      same: "保持稳定 ►",
      down: "需要多练习 ▼",
      weakTitle: "还不太熟的警示信号",
      weakNone: "暂时没有薄弱的警示信号。继续练习！",
      missed: "第一次没认出：{m}/{e} 次",
      tryHome: "在家练习：",
      falseAlarm: "第一次把真消息当成骗局：{n} 次。小心是好事。我们也练习分辨真消息，免得大家什么都害怕。",
      demoOn: "显示示例数据（演示）",
      demoOff: "隐藏示例数据",
      reset: "清除这部手机上的进度",
      resetAsk: "要清除这部手机上的所有练习进度吗？",
      evidenceNote: "结果只保存在这个浏览器里。它显示的是本应用内的练习进度，不是科学测试。",
      loadFail: "无法加载练习消息，请刷新页面。",
    },
  };

  // ---------- State ----------
  let DATA = null;
  let byId = {};
  let lang = "en";
  let view = "home"; // home | play | family
  let demo = false;
  let S = null; // current practice session
  let attempts = [];

  try { lang = localStorage.getItem(LANGKEY) === "zh" ? "zh" : "en"; } catch {}

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const t = (k, v = {}) => {
    let s = T[lang][k] ?? T.en[k] ?? k;
    if (typeof s !== "string") return s;
    v = { hotline: DATA?._meta?.hotline || "96110", ...v };
    return s.replace(/\{(\w+)\}/g, (_, n) => (v[n] ?? ""));
  };

  // ---------- Progress (browser only; never stores typed text) ----------
  function loadAttempts() {
    try {
      const j = JSON.parse(localStorage.getItem(STORE));
      return Array.isArray(j?.attempts) ? j.attempts.filter((a) => byId[a.id]) : [];
    } catch { return []; }
  }
  function saveAttempts() {
    try { localStorage.setItem(STORE, JSON.stringify({ attempts: attempts.slice(-200) })); } catch {}
  }

  // Made-up history for the demo, clearly labelled as sample data in the UI.
  function sampleAttempts() {
    const rows = [
      ["grandson_trouble", 0, 2, "practice", "unsure"],
      ["refund_cs", 0, 1, "check", "real"],
      ["real_family", 1, 0, "practice", "real"],
      ["police_prosecutor", 0, 1, "practice", "unsure"],
      ["package_express", 1, 0, "check", "scam"],
      ["health_seminar", 0, 1, "practice", "real"],
      ["real_clinic", 0, 1, "practice", "scam"],
      ["ai_voice_relative", 0, 2, "check", "real"],
      ["pension_investment", 1, 0, "practice", "scam"],
      ["prize_winning", 1, 0, "check", "scam"],
      ["grandson_trouble", 1, 0, "practice", "scam"],
      ["refund_cs", 1, 0, "check", "scam"],
    ];
    const day = 86400000, start = Date.now() - rows.length * day;
    return rows.map((r, i) => ({ id: r[0], ts: start + i * day, kind: r[3], firstTry: !!r[1], hints: r[2], final: true, fv: r[4] }));
  }

  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

  function computeStats(list) {
    const n = list.length;
    const ok = list.filter((a) => a.firstTry).length;
    const checks = list.filter((a) => a.kind === "check");
    const checksOk = checks.filter((a) => a.firstTry).length;
    let trend = null;
    if (n >= 4) {
      const half = Math.floor(n / 2);
      const early = list.slice(0, half), late = list.slice(half);
      const a = pct(early.filter((x) => x.firstTry).length, early.length);
      const b = pct(late.filter((x) => x.firstTry).length, late.length);
      trend = { a, b, dir: b > a ? "up" : b < a ? "down" : "same" };
    }
    const sign = {};
    for (const a of list) {
      for (const s of byId[a.id].signs) {
        sign[s] = sign[s] || { e: 0, m: 0 };
        sign[s].e++;
        if (!a.firstTry) sign[s].m++;
      }
    }
    const weak = Object.entries(sign)
      .filter(([, v]) => v.m > 0)
      .sort((x, y) => y[1].m / y[1].e - x[1].m / x[1].e || y[1].m - x[1].m)
      .slice(0, 3);
    const falseAlarms = list.filter((a) => !byId[a.id].is_scam && a.fv === "scam").length;
    return { n, ok, hinted: n - ok, checks: checks.length, checksOk, trend, weak, falseAlarms };
  }

  // ---------- Choosing the next message ----------
  const seen = (id) => attempts.filter((a) => a.id === id).length;
  const lastSeen = (id) => Math.max(0, ...attempts.filter((a) => a.id === id).map((a) => a.ts));

  function pickNext(excludeId) {
    const ids = DATA.order.filter((id) => id !== excludeId);
    const unseen = ids.filter((id) => !seen(id));
    return unseen.length ? unseen[0] : ids.sort((a, b) => lastSeen(a) - lastSeen(b))[0];
  }

  // A check is a DIFFERENT message that shares warning signs with the one just learned.
  function pickCheck(cur) {
    const pool = DATA.order.map((id) => byId[id]).filter((s) => s.id !== cur.id && s.is_scam);
    const score = (s) =>
      cur.signs.filter((x) => s.signs.includes(x)).length * 10 + (s.type !== cur.type ? 1 : 0) + (seen(s.id) ? 0 : 5);
    pool.sort((a, b) => score(b) - score(a));
    return (pool[0] || byId[pickNext(cur.id)]).id;
  }

  // ---------- Talking to our own server (never to the AI directly) ----------
  async function post(path, body, ms = 8000) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ms);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
      const j = await res.json();
      return j && j.ok ? j : null;
    } catch {
      return null; // network, timeout or server problem: caller uses built-in hints
    } finally {
      clearTimeout(timer);
    }
  }

  // Very small offline guess, used only if the AI cannot read a typed reply.
  function localGuess(x) {
    const s = x.toLowerCase();
    if (/scam|fake|fraud|police|call|ask|check|\bno\b|not|don'?t|骗|假|不|报警|核实|问|打电话/.test(s)) return "scam";
    if (/\b(ok|okay|yes|sure|thanks?|send|transfer|pay)\b|好|行|谢|转|可以/.test(s)) return "real";
    return "unsure";
  }

  // ---------- Practice flow ----------
  function startSession(id, kind) {
    const sc = byId[id];
    S = { id, kind, sc, hints: 0, attempts: 0, lastVerdict: null, firstVerdict: null, log: [], busy: false, done: false, safety: false };
    if (kind === "check") S.log.push({ k: "checkintro" });
    if (sc.context) S.log.push({ k: "context" });
    S.log.push({ k: "in" });
    view = "play";
    render();
  }

  async function tapVerdict(v) {
    if (!S || S.busy || S.done) return;
    S.busy = true;
    S.log.push({ k: "outv", v });
    render();
    await judge(v, null);
  }

  async function sendText(raw) {
    const text = String(raw || "").trim().slice(0, 200);
    if (!text || !S || S.busy || S.done) return;
    const me = S;
    S.busy = true;
    S.log.push({ k: "out", text });
    render();
    const r = await post("/api/classify", { id: S.id, lang, text });
    if (S !== me) return;
    await judge(r ? r.verdict : localGuess(text), text);
  }

  async function judge(v, text) {
    const me = S;
    S.attempts++;
    S.lastVerdict = v;
    if (S.firstVerdict === null) S.firstVerdict = v;
    const correct = v !== "unsure" && (v === "scam") === S.sc.is_scam;
    if (correct || S.hints >= 2) return reveal();

    if (v === "unsure" && !S.safety) { S.safety = true; S.log.push({ k: "safety" }); }
    render(); // still busy: shows the thinking dots
    const level = S.hints;
    const r = await post("/api/hint", { id: S.id, lang, level, verdict: v, text: text || undefined });
    if (S !== me) return;
    S.hints++;
    S.log.push({
      k: "coach",
      n: S.hints,
      text: r ? r.hint : S.sc.hints[level][lang],
      src: r ? "ai" : "builtin",
    });
    S.busy = false;
    render();
  }

  function reveal() {
    const final = S.lastVerdict !== "unsure" && (S.lastVerdict === "scam") === S.sc.is_scam;
    const firstTry = S.attempts === 1 && final;
    S.done = true; S.busy = false; S.final = final; S.firstTry = firstTry;
    attempts.push({ id: S.id, ts: Date.now(), kind: S.kind, firstTry, hints: S.hints, final, fv: S.firstVerdict });
    saveAttempts();
    render();
  }

  // ---------- Drawing ----------
  function markup(text, marks) {
    const found = (marks || [])
      .map((m) => ({ i: text.indexOf(m.t), m }))
      .filter((x) => x.i >= 0)
      .sort((a, b) => a.i - b.i);
    let out = "", pos = 0;
    for (const { i, m } of found) {
      if (i < pos) continue;
      out += esc(text.slice(pos, i)) + `<mark>${esc(m.t)}<span class="mi">${DATA.signs[m.s].icon}</span></mark>`;
      pos = i + m.t.length;
    }
    return out + esc(text.slice(pos));
  }

  function barHTML() {
    const langBtn = `<button class="lang" data-act="lang" aria-label="Language">${lang === "en" ? "中文" : "English"}</button>`;
    const backBtn = `<button class="back" data-act="home" aria-label="${esc(t("back"))}">‹</button>`;
    if (view === "home") return `<span></span><div class="title">${esc(t("appName"))}</div>${langBtn}`;
    if (view === "family") return `${backBtn}<div class="title">${esc(t("familyTitle"))}</div>${langBtn}`;
    return `${backBtn}<div class="title">${esc(S.kind === "check" ? t("checkTitle") : t("practiceTitle"))}</div><span></span>`;
  }

  function homeHTML() {
    return `<div class="page">
      <div class="hero">
        <div class="logo">🛡️</div>
        <h1>${esc(t("appName"))}</h1>
        <p><b>${esc(t("tagline"))}</b></p>
        <p>${esc(t("sub"))}</p>
      </div>
      <div class="stack">
        <button class="btn" data-act="start">${esc(t("start"))}</button>
        <button class="btn secondary" data-act="family">${esc(t("family"))}</button>
      </div>
      <p class="note">${esc(t("privacy"))}</p>
      <p class="note">${esc(t("aiNote"))}</p>
    </div>`;
  }

  function chatItemHTML(it) {
    const sc = S.sc;
    switch (it.k) {
      case "checkintro": return `<div class="sys check">${esc(t("checkIntro"))}</div>`;
      case "context": return `<div class="sys">${esc(sc.context[lang])}</div>`;
      case "in":
        return `<div class="row"><div class="avatar">👤</div><div class="col">
          <div class="sender">${esc(sc.sender[lang])}</div>
          <div class="bubble">${esc(sc.message[lang])}</div></div></div>`;
      case "outv":
        return `<div class="row out"><div class="avatar">🙂</div><div class="col"><div class="bubble">${esc(t("said")[it.v])}</div></div></div>`;
      case "out":
        return `<div class="row out"><div class="avatar">🙂</div><div class="col"><div class="bubble">${esc(it.text)}</div></div></div>`;
      case "safety":
        return `<div class="safety">☎️ ${esc(t("unsureBox"))}</div>`;
      case "coach":
        return `<div class="row coach"><div class="avatar coach">🧑‍🏫</div><div class="col">
          <div class="sender">${esc(t("hintLabel", { n: it.n }))}</div>
          <div class="bubble">${esc(it.text)}</div>
          <div class="tag">${esc(it.src === "ai" ? t("srcAi") : t("srcBuiltin"))}</div></div></div>`;
      default: return "";
    }
  }

  function revealHTML() {
    const sc = S.sc;
    const resultKey = S.firstTry ? "r_first" : S.final ? "r_hint" : "r_miss";
    let body;
    if (sc.is_scam) {
      body = `<h3>${esc(t("markedTitle"))}</h3>
        <div class="msgbox">${markup(sc.message[lang], sc.marks[lang])}</div>
        <h3>${esc(t("signsTitle"))}</h3>
        <ul class="signs">${sc.signs
          .map((k) => {
            const g = DATA.signs[k];
            return `<li><span class="ic">${g.icon}</span><div><b>${esc(g.title[lang])}</b>${esc(g.desc[lang])}</div></li>`;
          })
          .join("")}</ul>`;
    } else {
      body = `<h3>${esc(t("whyRealTitle"))}</h3>
        <ul class="reasons">${sc.reasons.map((r) => `<li>${esc(r[lang])}</li>`).join("")}</ul>
        <div class="unsure-box">${esc(t("realCaution"))}</div>`;
    }
    const tip = sc.is_scam ? DATA.signs[sc.signs[0]].tip[lang] : "";
    let checkLine = "";
    if (S.kind === "check") checkLine = `<p class="result"><b>${esc(S.firstTry ? t("checkPass") : t("checkFail"))}</b></p>`;
    return `<div class="card" id="reveal">
      <div class="practice-banner"><b>${esc(t("practiceBanner"))}</b></div>
      <div class="answer ${sc.is_scam ? "scam" : "real"}">${esc(sc.is_scam ? t("wasScam") : t("wasReal"))}</div>
      <p class="result">${esc(t(resultKey))}</p>
      ${checkLine}
      ${body}
      <p class="expl">${esc(sc.explanation[lang])}</p>
      ${tip ? `<h3>${esc(t("tipTitle"))}</h3><div class="unsure-box">${esc(tip)}</div>` : ""}
    </div>`;
  }

  function actionsHTML() {
    if (S.done) {
      const primary =
        S.kind === "check"
          ? `<button class="btn blue" data-act="next">${esc(t("nextPractice"))}</button>`
          : `<button class="btn blue" data-act="check">${esc(t("nextCheck"))}</button>`;
      return `<div class="actions">${primary}<button class="btn secondary" data-act="family">${esc(t("toFamily"))}</button></div>`;
    }
    if (S.busy) return `<div class="actions"><p class="prompt">${esc(t("thinking"))}</p></div>`;
    const prompt = S.hints > 0 ? t("tryAgain") : t("prompt");
    return `<div class="actions">
      <p class="prompt">${esc(prompt)}</p>
      <div class="trio">
        <button class="btn scam" data-act="verdict" data-v="scam"><span class="ic">🚫</span>${esc(t("scam"))}</button>
        <button class="btn real" data-act="verdict" data-v="real"><span class="ic">✅</span>${esc(t("real"))}</button>
        <button class="btn unsure" data-act="verdict" data-v="unsure"><span class="ic">🤔</span>${esc(t("unsure"))}</button>
      </div>
      <div class="reply">
        <input id="replybox" type="text" maxlength="200" autocomplete="off" placeholder="${esc(t("placeholder"))}" aria-label="${esc(t("orType"))}">
        <button class="btn blue" data-act="send">${esc(t("send"))}</button>
      </div>
      <p class="hint-small">${esc(t("orType"))} ${esc(t("noPersonal"))}</p>
    </div>`;
  }

  function playHTML() {
    const dots = S.busy && !S.done ? `<div class="row coach"><div class="avatar coach">🧑‍🏫</div><div class="col"><div class="bubble dots"><span>●</span><span>●</span><span>●</span></div></div></div>` : "";
    return `<div class="strip">${esc(t("strip"))}</div>
      <div class="chat" id="chat">${S.log.map(chatItemHTML).join("")}${dots}${S.done ? revealHTML() : ""}</div>
      ${actionsHTML()}`;
  }

  function familyHTML() {
    const list = demo ? sampleAttempts() : attempts;
    const st = computeStats(list);
    let inner = "";
    if (demo) inner += `<div class="sample-flag">${esc(t("sampleBanner"))}</div>`;
    if (!st.n) {
      inner += `<div class="empty">${esc(t("empty"))}</div>`;
    } else {
      inner += `<div class="stat-grid">
        <div class="stat"><div class="n">${st.n}</div><div class="l">${esc(t("sDone"))}</div></div>
        <div class="stat"><div class="n">${pct(st.ok, st.n)}%</div><div class="l">${esc(t("sFirst"))}</div></div>
        <div class="stat"><div class="n">${st.hinted}</div><div class="l">${esc(t("sHint"))}</div></div>
        <div class="stat"><div class="n">${st.checksOk}/${st.checks}</div><div class="l">${esc(t("sCheck"))}</div></div>
      </div>`;
      const dots = list
        .map((a) => `<div class="dot ${a.firstTry ? "ok" : "help"} ${a.kind === "check" ? "check" : ""}" title="${esc(byId[a.id].sender[lang])}">${a.firstTry ? "✓" : "?"}</div>`)
        .join("");
      const tr = st.trend;
      inner += `<div class="card"><h3 style="margin-top:0">${esc(t("timelineTitle"))}</h3>
        <div class="timeline">${dots}</div><p class="legend">${esc(t("legend"))}</p>
        ${tr ? `<p class="trend">${esc(t("trendLine", { a: tr.a, b: tr.b }))}<br>${esc(t(tr.dir))}</p>` : `<p class="legend">${esc(t("trendNeed"))}</p>`}
      </div>`;
      inner += `<div class="card"><h3 style="margin-top:0">${esc(t("weakTitle"))}</h3>${
        st.weak.length
          ? st.weak
              .map(([k, v]) => {
                const g = DATA.signs[k];
                return `<div class="weak"><div class="top"><span>${g.icon} ${esc(g.title[lang])}</span><span>${esc(t("missed", { m: v.m, e: v.e }))}</span></div>
                  <div class="meter"><i style="width:${pct(v.m, v.e)}%"></i></div>
                  <p><b>${esc(t("tryHome"))}</b> ${esc(g.tip[lang])}</p></div>`;
              })
              .join("")
          : `<p class="empty">${esc(t("weakNone"))}</p>`
      }</div>`;
      if (st.falseAlarms) inner += `<div class="card"><p style="margin:0">${esc(t("falseAlarm", { n: st.falseAlarms }))}</p></div>`;
    }
    inner += `<div class="small-btns">
      <button class="btn secondary" data-act="demo">${esc(demo ? t("demoOff") : t("demoOn"))}</button>
      ${attempts.length && !demo ? `<button class="btn secondary" data-act="reset">${esc(t("reset"))}</button>` : ""}
    </div><p class="note">${esc(t("evidenceNote"))}</p>`;
    return `<div class="page">${inner}</div>`;
  }

  function render() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    $("#bar").innerHTML = barHTML();
    const screen = $("#screen");
    screen.innerHTML = view === "home" ? homeHTML() : view === "family" ? familyHTML() : playHTML();
    if (view === "play") {
      const chat = $("#chat");
      const rev = $("#reveal");
      chat.scrollTop = rev ? Math.max(0, rev.offsetTop - 8) : chat.scrollHeight;
    } else {
      const page = $(".page");
      if (page) page.scrollTop = 0;
    }
  }

  // ---------- Clicks and keys ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || !DATA) return;
    const act = el.dataset.act;
    if (act === "lang") {
      lang = lang === "en" ? "zh" : "en";
      try { localStorage.setItem(LANGKEY, lang); } catch {}
      render();
    } else if (act === "home") { view = "home"; S = null; render(); }
    else if (act === "start" || act === "next") startSession(pickNext(S ? S.id : null), "practice");
    else if (act === "check") startSession(pickCheck(S.sc), "check");
    else if (act === "family") { view = "family"; render(); }
    else if (act === "verdict") tapVerdict(el.dataset.v);
    else if (act === "send") sendText($("#replybox")?.value);
    else if (act === "demo") { demo = !demo; render(); }
    else if (act === "reset") {
      if (window.confirm(t("resetAsk"))) { attempts = []; saveAttempts(); render(); }
    }
  });

  document.addEventListener("keydown", (e) => {
    // isComposing: do not send while the Chinese input method is still choosing characters
    if (e.key === "Enter" && !e.isComposing && e.target && e.target.id === "replybox") {
      e.preventDefault();
      sendText(e.target.value);
    }
  });

  // ---------- Start ----------
  fetch("scams.json")
    .then((r) => r.json())
    .then((d) => {
      DATA = d;
      byId = Object.fromEntries(d.scenarios.map((s) => [s.id, s]));
      attempts = loadAttempts();
      render();
    })
    .catch(() => {
      $("#screen").innerHTML = `<div class="page"><p class="empty">${esc(t("loadFail"))}</p></div>`;
    });
})();
