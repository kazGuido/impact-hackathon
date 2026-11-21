(function (global) {
  'use strict';

  const text = (value, lang, fallback = '') => {
    if (value && typeof value === 'object') return value[lang] ?? value.en ?? Object.values(value)[0] ?? fallback;
    return value ?? fallback;
  };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tr = (lang, en, zh, es, ko) => ({en,zh,es,ko}[lang] || en);
  const val = (scenario, key, lang, fallback = '') => text(scenario && scenario[key], lang, fallback);
  const header = (title, step) => `<header class="v2p-head"><span class="v2p-eyes">◎◎</span><span>${esc(title)}</span><span class="v2p-step">${esc(step)}</span></header>`;

  function practice(scenario, lang = 'en', events = [], callbacks = {}) {
    scenario = scenario || {};
    const sender = val(scenario, 'sender', lang, tr(lang,'Unknown sender','未知发件人','Remitente desconocido','알 수 없는 발신자'));
    const message = val(scenario, 'message', lang, tr(lang,'Take a moment to read this message.','请花点时间阅读这条消息。','Tómese un momento para leer este mensaje.','잠시 시간을 내어 이 메시지를 읽어 보세요.'));
    const canHint = callbacks.allowHints && scenario.hints?.length;
    return `<section class="v2p v2p-phone" data-v2p-view="practice">
      <div class="v2p-phone-top"><button type="button" class="v2p-back" data-v2p-action="back" aria-label="Back">‹</button><span class="v2p-camera"></span><span class="v2p-practice-tag">${esc(tr(lang,'Practice','练习','Práctica','연습'))}</span></div>
      <div class="v2p-sender"><span class="v2p-avatar">●</span><strong>${esc(sender)}</strong><small>${esc(val(scenario,'context',lang,''))}</small></div>
      <div class="v2p-chat" aria-label="${esc(tr(lang,'Practice message','练习消息','Mensaje de práctica','연습 메시지'))}"><div class="v2p-time">${esc(tr(lang,'Today · Practice message','今天 · 练习消息','Hoy · Mensaje de práctica','오늘 · 연습 메시지'))}</div>${String(message).split(/\n+/).filter(Boolean).map(part=>`<div class="v2p-bubble">${esc(part)}</div>`).join('')}</div>
      <footer class="v2p-bottom">${canHint?`<button class="v2p-hint" data-v2p-action="hint">${esc(tr(lang,'Need a hint?','需要提示吗？','¿Necesita una pista?','힌트가 필요하신가요?'))}</button>`:''}<p>${esc(tr(lang,'Read it carefully. Take your time.','仔细阅读，慢慢想。','Léalo con atención. Tómese su tiempo.','천천히 주의 깊게 읽어 보세요.'))}</p><button class="v2p-primary" data-v2p-action="decide">${esc(tr(lang,'Is this real? Decide','这是真的吗？做出判断','¿Es real? Decide','진짜일까요? 판단해 보세요'))}</button></footer>
    </section>`;
  }

  async function revealMessages(chat) {
    if (!chat || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bubbles = [...chat.querySelectorAll('.v2p-bubble')];
    if (!bubbles.length) return;
    const indicator = document.createElement('div');
    indicator.className = 'message-typing';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.innerHTML = '<i></i><i></i><i></i>';
    bubbles.forEach(bubble => { bubble.hidden = true; });

    for (const [index, bubble] of bubbles.entries()) {
      bubble.before(indicator);
      await new Promise(resolve => setTimeout(resolve, index === 0 ? 650 : 380));
      if (!chat.isConnected) return;
      indicator.remove();
      bubble.hidden = false;
      bubble.classList.add('message-arrived');
    }
  }

  const sheetHandle = (action, label) => `<button class="sheet-handle" data-v2p-action="${action}" aria-label="${label}"></button>`;
  const face = (trusted) => `<span class="choice-face" aria-hidden="true"><svg viewBox="0 0 40 40"><circle cx="13" cy="16" r="2.7" fill="currentColor"/><circle cx="27" cy="16" r="2.7" fill="currentColor"/><path d="${trusted?'M10 24c6 8 14 8 20 0':'M8 10l9 3m6 0 9-3M11 29c5-7 13-7 18 0'}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span>${trusted?'✓':'×'}</span></span>`;

  function decision(scenario, lang = 'en') {
    const yes = tr(lang,'Yes, I trust it','是，我相信','Sí, confío','네, 믿어요');
    const no = tr(lang,'No, it’s a scam','不，这是骗局','No, es una estafa','아니요, 사기예요');
    return `<dialog class="v2p v2p-decision choice-sheet" data-v2p-view="decision" aria-labelledby="decision-title">
      ${sheetHandle('back','Back to message')}
      <h1 id="decision-title">${esc(tr(lang,'Do you trust this message?','您相信这条消息吗？','¿Confía en este mensaje?','이 메시지를 믿으시나요?'))}</h1>
      <p class="decision-prompt">${esc(tr(lang,'Is the sender who they claim to be?','发送者真的是他们所说的人吗？','¿El remitente es quien dice ser?','보낸 사람이 정말 본인일까요?'))}</p>
      <div class="v2p-choices">
        <button class="v2p-choice trust-choice" data-v2p-answer="real">${face(true)}<span>${esc(yes)}</span></button>
        <button class="v2p-choice scam-choice" data-v2p-answer="scam">${face(false)}<span>${esc(no)}</span></button>
      </div>
      <p class="decision-note"><span aria-hidden="true">◷</span> ${esc(tr(lang,'No timer. Take your time.','没有计时，慢慢来。','No hay cronómetro. Tómese su tiempo.','시간 제한이 없어요. 천천히 생각해 보세요.'))}</p>
    </dialog>`;
  }

  function markedMessage(message, marks) {
    const ranges = marks.map(mark => ({ ...mark, start: message.indexOf(mark.t) }))
      .filter(mark => mark.start >= 0).sort((a,b) => a.start-b.start);
    let cursor = 0;
    let output = '';
    for (const mark of ranges) {
      if (mark.start < cursor) continue;
      output += esc(message.slice(cursor, mark.start)) + '<mark>' + esc(mark.t) + '</mark>';
      cursor = mark.start + mark.t.length;
    }
    return output + esc(message.slice(cursor));
  }

  function report(scenario, lang, answer, signs) {
    const correct = answer === (scenario.is_scam?'scam':'real');
    const verdict = scenario.is_scam?'This was a scam.':'This message was genuine.';
    const reasons = scenario.is_scam
      ? (scenario.signs||[]).slice(0,3).map(id => signs[id]).filter(Boolean).map(sign => ({
          title: text(sign.title,lang), copy: text(sign.desc,lang)
        }))
      : (scenario.reasons||[]).slice(0,3).map(reason => ({ title:'', copy:text(reason,lang) }));
    const safeStep = text(signs[scenario.signs?.[0]]?.tip,lang,'If you are unsure, check through a number or app you already trust.');
    return `<dialog class="v2p v2p-decision report-sheet ${correct?'is-correct':'is-learning'}" data-v2p-view="result" aria-labelledby="report-title">
      ${sheetHandle('continue','Close report and see progress')}
      <div class="report-body">
        <span class="report-mark" aria-hidden="true">${correct?'✓':'!'}</span>
        <h1 id="report-title">${correct?'You spotted it!':'Not quite.'} ${verdict}</h1>
        <p>You chose “${answer==='real'?'Yes, I trust it':'No, it’s a scam'}”.</p>
        <button class="v2p-backlink coach-jump" data-v2p-action="coach">See Coach Mia’s explanation ↓</button>
        <article class="report-message"><strong>${esc(val(scenario,'sender',lang,'Practice message'))}</strong>
          <p>${markedMessage(val(scenario,'message',lang,''),scenario.marks?.[lang]||scenario.marks?.en||[])}</p>
        </article>
        ${reasons.length?`<h2>${scenario.is_scam?(correct?'The signs you caught':'What gave it away'):'Why this message was genuine'}</h2>
        <ol class="report-signs">${reasons.map(reason=>`<li>${reason.title?`<strong>${esc(reason.title)}. </strong>`:''}${esc(reason.copy)}</li>`).join('')}</ol>`:''}
        <p class="report-safety"><strong>What to do next</strong> ${esc(safeStep)}</p>
        <div class="coach-bubble"><strong>Coach Mia</strong><div class="coach-copy" role="status" data-coach-explanation></div></div>
      </div>
      <footer class="report-actions">
        <button class="v2p-primary" data-v2p-action="next">Next situation <span aria-hidden="true">→</span></button>
        <button class="v2p-backlink" data-v2p-action="continue">See my progress</button>
      </footer>
    </dialog>`;
  }

  function result(scenario, lang = 'en', events = [], answer = 'scam', callbacks = {}) {
    // Accept callback object as fourth argument when no answer is supplied.
    if (answer && typeof answer === 'object') { callbacks = answer; answer = 'scam'; }
    const correct = answer === (scenario && scenario.is_scam ? 'scam' : 'real');
    const explanation = val(scenario||{},'explanation',lang,tr(lang,'Pause and verify through a trusted channel before acting.','采取行动前，请通过可信渠道核实。','Haga una pausa y verifique por un canal de confianza antes de actuar.','행동하기 전에 잠시 멈추고 신뢰할 수 있는 경로로 확인하세요.'));
    return `<section class="v2p v2p-result ${correct?'is-correct':'is-learning'}" data-v2p-view="result">${header(tr(lang,'Practice','练习','Práctica','연습'), '')}
      <div class="v2p-result-icon">${correct?'★':'↗'}</div><div class="v2p-kicker">${esc(correct?tr(lang,'A thoughtful choice','慎重的选择','Una decisión cuidadosa','신중한 선택'):tr(lang,'Good practice','练习得很好','Buen aprendizaje','좋은 연습이에요'))}</div>
      <h1>${esc(correct?tr(lang,scenario && scenario.is_scam?'You spotted it! This was a scam.':'You spotted it! This message was genuine.','您仔细看了。','Se tomó el tiempo para observar.','주의 깊게 살펴보셨어요.'):tr(lang,scenario && scenario.is_scam?'Not quite. This was a scam.':'Not quite. This message was genuine.','这条消息值得留意。','Hay algo que aprender aquí.','여기서 배울 점이 있어요.'))}</h1>
      <article class="v2p-explain"><div class="v2p-kicker">${esc(val(scenario||{},'sender',lang,'Practice message'))}</div><p>${esc(val(scenario||{},'message',lang,''))}</p><h2>${esc(tr(lang,'What to notice','值得注意的地方','En qué fijarse','살펴볼 점'))}</h2><p>${esc(explanation)}</p></article>
      <div class="v2p-safety">${esc(tr(lang,'Practice messages are fictional. In real life, verify using a number or app you already trust.','练习消息均为虚构。现实中请使用您已知可信的电话号码或应用核实。','Los mensajes de práctica son ficticios. En la vida real, verifique con un número o una aplicación de confianza.','연습 메시지는 가상입니다. 실제로는 이미 신뢰하는 전화번호나 앱으로 확인하세요.'))}</div>
      <button class="v2p-primary" data-v2p-action="continue">${esc(tr(lang,'See my progress','查看我的进度','Ver mi progreso','내 진행 상황 보기'))} &nbsp; →</button></section>`;
  }

  function progress(scenario, lang = 'en', events = [], callbacks = {}) {
    const list = Array.isArray(events) ? events : [];
    const correct = list.filter(e => e && (e.ok === true || e.first_try === 1)).length;
    const pct = list.length ? Math.round(correct/list.length*100) : 0;
    const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return ['S','M','T','W','T','F','S'][d.getDay()]});
    return `<section class="v2p v2p-progress-screen" data-v2p-view="progress">${header(tr(lang,'My progress','我的进度','Mi progreso','내 진행 상황'), '')}
      <h1>${esc(tr(lang,'Confidence grows each time.','每一次练习都让您更有信心。','La confianza crece con cada práctica.','연습할수록 자신감이 자라요.'))}</h1>
      <article class="v2p-stat"><div class="v2p-kicker">${esc(tr(lang,'PRACTICES COMPLETED','已完成练习','PRÁCTICAS COMPLETADAS','완료한 연습'))}</div><strong>${list.length}</strong><p>${esc(tr(lang,'Every try is progress.','每次尝试都是进步。','Cada intento es un avance.','매번의 시도가 발전이에요.'))}</p></article>
      <article class="v2p-stat"><div class="v2p-kicker">${esc(tr(lang,'CAREFUL FIRST LOOKS','首次判断准确率','ACIERTOS EN EL PRIMER INTENTO','첫 판단 정답률'))}</div><strong>${list.length?pct+'%':'—'}</strong><div class="v2p-progress"><i style="width:${pct}%"></i></div><p>${esc(tr(lang,'Your results stay on this device.','您的结果仅保存在此设备上。','Sus resultados permanecen en este dispositivo.','결과는 이 기기에 저장됩니다.'))}</p></article>
      <article class="v2p-week"><h2>${esc(tr(lang,'Your week','本周','Esta semana','이번 주'))}</h2><div>${days.map((d,i)=>`<span class="${list.some(e=>e.date && new Date(e.date).toDateString()===new Date(Date.now()-(6-i)*86400000).toDateString())?'done':''}">${list.some(e=>e.date && new Date(e.date).toDateString()===new Date(Date.now()-(6-i)*86400000).toDateString())?'✓':d}</span>`).join('')}</div></article>
      <button class="v2p-primary" data-v2p-action="continue">${esc(tr(lang,'Practice again','再练习一次','Practicar de nuevo','다시 연습하기'))} &nbsp; →</button></section>`;
  }

  function mount(target, view, scenario, lang, events, answer, callbacks) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) throw new Error('V2Practice.mount: target element not found');
    const render = api[view];
    if (typeof render !== 'function') throw new Error(`V2Practice.mount: unknown view "${view}"`);
    const cb = (answer && typeof answer === 'object') ? answer : callbacks || {};
    el.innerHTML = render(scenario, lang, events, answer, cb);
    el.onclick = function (event) {
      const button = event.target.closest('[data-v2p-action],[data-v2p-answer]');
      if (!button || !el.contains(button)) return;
      if (button.dataset.v2pAnswer) { if (cb.onAnswer) cb.onAnswer(button.dataset.v2pAnswer); return; }
      const action = button.dataset.v2pAction;
      if (action === 'hint' && cb.onHint) cb.onHint(Number(button.dataset.v2pHint || 0));
      else if (action === 'back' && cb.onBack) cb.onBack();
      else if (action === 'continue' && cb.onContinue) cb.onContinue();
      else if (action === 'decide' && cb.onDecide) cb.onDecide();
    };
    return el;
  }

  const api = { practice, decision, report, result, progress, mount, revealMessages };
  global.V2Practice = api;
})(window);
