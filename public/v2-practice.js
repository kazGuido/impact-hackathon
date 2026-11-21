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
    return `<section class="v2p v2p-phone" data-v2p-view="practice">
      <div class="v2p-phone-top"><button type="button" class="v2p-back" data-v2p-action="back" aria-label="Back">‹</button><span class="v2p-camera"></span><span class="v2p-practice-tag">${esc(tr(lang,'Practice','练习','Práctica','연습'))}</span></div>
      <div class="v2p-sender"><span class="v2p-avatar">●</span><strong>${esc(sender)}</strong><small>${esc(val(scenario,'context',lang,''))}</small></div>
      <div class="v2p-chat" aria-label="${esc(tr(lang,'Practice message','练习消息','Mensaje de práctica','연습 메시지'))}"><div class="v2p-time">${esc(tr(lang,'Today · Practice message','今天 · 练习消息','Hoy · Mensaje de práctica','오늘 · 연습 메시지'))}</div>${String(message).split(/\n+/).filter(Boolean).map(part=>`<div class="v2p-bubble">${esc(part)}</div>`).join('')}</div>
      <footer class="v2p-bottom"><p>${esc(tr(lang,'Read it carefully. Take your time.','仔细阅读，慢慢想。','Léalo con atención. Tómese su tiempo.','천천히 주의 깊게 읽어 보세요.'))}</p><button class="v2p-primary" data-v2p-action="decide">${esc(tr(lang,'Is this real? Decide','这是真的吗？做出判断','¿Es real? Decide','진짜일까요? 판단해 보세요'))}</button></footer>
    </section>`;
  }

  function decision(scenario, lang = 'en', events = [], callbacks = {}) {
    const hints = callbacks.allowHints !== false && Array.isArray(scenario?.hints) ? scenario.hints : [];
    const choices = [
      ['scam',tr(lang,'No, it’s a scam','感觉可疑','Parece sospechoso','수상해 보여요')],
      ['real',tr(lang,'Yes, I trust it','看起来可信','Parece legítimo','진짜 같아요')],
      ['unsure',tr(lang,'I’m not sure yet','我还不确定','Aún no estoy seguro','아직 잘 모르겠어요')]
    ];
    return `<dialog class="v2p v2p-decision" data-v2p-view="decision" aria-labelledby="decision-title">
      <h1 id="decision-title">${esc(tr(lang,'Do you trust this message?','您相信这条消息吗？','¿Confía en este mensaje?','이 메시지를 믿으시나요?'))}</h1>
      <div class="v2p-choices">${choices.map(([key,label])=>`<button class="v2p-choice" data-v2p-answer="${key}">${esc(label)}<span>›</span></button>`).join('')}</div>
      ${hints.length?`<button class="v2p-hint" data-v2p-action="hint" data-v2p-hint="0">💡 &nbsp;${esc(tr(lang,'Need a hint?','需要提示吗？','¿Necesita una pista?','힌트가 필요하신가요?'))}</button>`:''}
      <p class="decision-note">${esc(tr(lang,'No timer. Take your time.','没有计时，慢慢来。','No hay cronómetro. Tómese su tiempo.','시간 제한이 없어요. 천천히 생각해 보세요.'))}</p>
      <button class="v2p-backlink" data-v2p-action="back">${esc(tr(lang,'Back to message','返回消息','Volver al mensaje','메시지로 돌아가기'))}</button></dialog>`;
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

  const api = { practice, decision, result, progress, mount };
  global.V2Practice = api;
})(window);
