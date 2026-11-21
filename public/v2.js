(()=>{'use strict';const app=document.querySelector('#app');let scenarios=[],idx=0,scenario=null,hintCount=0,practiceKind="practice",step=0,lang=localStorage.getItem('lt-lang')||'en',family=JSON.parse(localStorage.getItem('lt-family')||'{"name":"","reminder":"Sunday"}'),events=JSON.parse(localStorage.getItem('lt-events')||'[]');const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const chromeIcons={
  home:'<path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  practice:'<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
  check:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15 15 5 5"/>',
  family:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v2"/>',
  globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  back:'<path d="m15 5-7 7 7 7"/>'
};
function chromeIcon(name){
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${chromeIcons[name]}</svg>`;
}
function frame(content,title=''){
  const withNav=step>=7;
  const onboarding=['SETUP','FAMILY','CONTACTS','REMINDERS'].includes(title)&&step<=3;
  const stage={SETUP:1,FAMILY:2,CONTACTS:3,REMINDERS:4}[title];
  const back={SETUP:'welcome',FAMILY:'setup',CONTACTS:'invite',REMINDERS:family.name?'contacts':'invite'}[title];
  const active=step===8?'family':step===9?'home':'';
  app.classList.toggle('is-welcome',step===0);
  app.classList.toggle('is-practice',step===4||step===5);
  app.classList.toggle('has-nav',withNav);
  const header=step===0||step===4||step===5||title==='READY'?'':`
    <header class="top ${onboarding?'top-onboarding':''}">
      ${onboarding?`<button class="top-back" data-go="${back}">${chromeIcon('back')} Back</button>
        <span class="steps-dots" role="img" aria-label="Setup step ${stage+1} of 5">
          ${Array.from({length:5},(_,i)=>`<i class="${i===stage?'current':i<stage?'past':''}"></i>`).join('')}
        </span>`:`<div class="brand"><b>Look</b> <em>Twice</em></div>`}
      <span class="language-label">${chromeIcon('globe')} ${esc(lang.toUpperCase())}</span>
    </header>`;
  const navigation=withNav?`<nav class="nav" aria-label="Main navigation">
    ${[['home','Home'],['practice','Practice'],['check','Check'],['family','Family']].map(([route,label])=>
      `<button data-go="${route}" ${active===route?'aria-current="page"':''}>${chromeIcon(route)}<span>${label}</span></button>`).join('')}
    </nav>`:'';
  const inPractice=step===4||step===5;
  app.innerHTML=header+(!inPractice?`<div class="screen-content ${title==='HOME'?'home-content':''}">${content}</div>`:content)+navigation;
  app.onclick=click;
  app.onchange=change;
  window.scrollTo(0,0);
}
function btn(t,a,cls=''){return `<button class="btn ${cls}" data-go="${a}">${t}</button>`}function home(){step=9;frame(`<h1>Good morning${family.name?', '+esc(family.name):''}</h1><div class="card streak"><h2><button class="streak-title" data-go="progress" aria-label="See my progress"><span>${events.length} ${events.length===1?'practice':'practices'} completed</span><span aria-hidden="true">›</span></button></h2><div class="week">${Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const done=events.some(e=>e.date&&new Date(e.date).toDateString()===d.toDateString());return `<div><span class="${done?'done':''}">${done?'✓':''}</span>${['S','M','T','W','T','F','S'][d.getDay()]}</div>`}).join('')}</div><p>Busy day? No problem. We’ll keep your progress safe.</p></div><button class="family-callout" data-go="family"><span class="avatar">♡</span><span><b>Practice with family</b><br>Invite someone to cheer you on</span><b>›</b></button><div class="card scam-card"><span class="scam-label">Scam of the week</span><h2>Spot the warning signs</h2><p>Practice with a realistic message and learn what to look for.</p><button class="inline-link" data-go="scamweek">See how it works ›</button></div>${btn('▶ &nbsp; Start today’s 2-minute practice','practice')}`,'HOME')}function scamweek(){step=9;const item=(new URLSearchParams(location.search).has('awareness')&&scenario)||scenarios.find(x=>x.type==='recent')||scenarios[0];if(!item){home();return}scenario=item;const message=item.message?.[lang]||item.message?.en||'';frame(`<div class="row"><b>Scam of the week</b><button class="inline-link" data-go="home">Close ×</button></div><h1>${esc(item.type==='recent'?'A scam to watch for':'A message to look at')}</h1><p>This kind of message can be easy to miss. Here’s an example:</p><div class="message"><b>Example · Practice</b><p>${esc(message)}</p></div><div class="card"><h2>What to notice</h2><p>${esc(item.explanation?.[lang]||item.explanation?.en||'Pause and check using a trusted channel.')}</p></div><div class="notice">Safe step: use a phone number or website you already trust to check.</div>${btn('Practice this situation','currentpractice')}`,'TODAY')}function currentpractice(){if(scenario){practiceKind="practice";hintCount=0;practiceMessage()}else practice()}function welcome(){step=0;frame(`<div class="welcome-screen"><div class="welcome-logo" role="img" aria-label="Look Twice"><div class="welcome-eyes" aria-hidden="true"><span></span><span></span></div><div class="welcome-word"><b>Look</b> <strong>Twice</strong></div></div><h1>Practice spotting scams before they happen</h1><p>Short, friendly practice, with your family by your side.</p><div class="welcome-languages"><h2>Choose your language</h2><div class="options"><button class="option ${lang==='en'?'selected':''}" data-lang="en" aria-pressed="${lang==='en'}">English</button><button class="option ${lang==='zh'?'selected':''}" data-lang="zh" aria-pressed="${lang==='zh'}">中文</button><button class="option ${lang==='es'?'selected':''}" data-lang="es" aria-pressed="${lang==='es'}">Español</button><button class="option ${lang==='ko'?'selected':''}" data-lang="ko" aria-pressed="${lang==='ko'}">한국어</button></div>${btn('Get started','setup')}</div></div>`,'WELCOME')}function setup(){step=1;frame(`<h1>Who is Look Twice for?</h1><p>You can change this later.</p><div class="choice-list"><button class="choice" data-go="invite"><span class="choice-icon">♙</span><span><b>For me</b><br>I want to practice spotting scams.</span><strong>›</strong></button><button class="choice" data-go="invite"><span class="choice-icon blue">♧</span><span><b>For my parent or grandparent</b><br>I’ll set it up and cheer them on.</span><strong>›</strong></button></div><div class="notice setup-note">💡 &nbsp; Family can cheer you on along the way. We’ll show you how to invite them.</div>`,'SETUP')}function invite(){step=2;frame(`<h1>Make practice feel real</h1><div class="practice-preview"><div class="row"><span class="avatar">${esc((family.name||'S')[0].toUpperCase())}</span><b>${esc(family.name||'Sarah')}</b><span class="pill">Practice</span></div><div class="bubble">Hi Mom, it’s ${esc(family.name||'Sarah')}. I lost my phone…</div></div><p>Scammers often pretend to be someone you love. Add a person, and practice messages can use their first name.</p><div class="trust-points"><div>♧ &nbsp; Stays on this phone</div><div>♙ &nbsp; Only their first name is used</div><div>◇ &nbsp; We never contact them or copy their voice</div></div>${btn('Add someone I trust &nbsp; →','contacts')}${btn('Skip for now','reminder','text')}`,'FAMILY')}function contacts(){step=2;frame(`<h1>Your practice family</h1><p>Tell us who they are, so practice sounds right.</p><div class="card"><label for="fname">Their first name</label><input id="fname" autocomplete="given-name" placeholder="e.g. Sarah" value="${esc(family.name)}"><label for="relationship">Relationship</label><input id="relationship" placeholder="e.g. Daughter" value="${esc(family.relationship||'')}"></div><div class="notice">Practice messages are always marked “Practice”. We never contact them.</div>${btn('Continue &nbsp; →','savefamily')}${btn('Skip for now','reminder','text')}`,'CONTACTS')}function ready(){step=3;frame(`<div class="ready-screen"><div class="ready-logo"><div class="welcome-eyes"><span></span><span></span></div><span class="ready-check">✓</span></div><h1>You’re all set</h1><p>Your first practice takes about 2 minutes.</p><div class="card ready-summary"><div>♧ &nbsp; <b>Practice family:</b> ${esc(family.name||'Add later')}</div><div>♧ &nbsp; <b>Reminder:</b> ${esc(family.reminder||'Not set')}</div><div>♡ &nbsp; <b>Cheering you on:</b> ${esc(family.name||'Your family')}</div></div>${btn('Start my first practice &nbsp; →','finishsetup')}</div>`,'READY')}function reminder(){step=3;frame(`<h1>When should Coach Mia remind you?</h1><p>Choose a preferred time. This demo saves your choice on this device; it does not send notifications.</p><div class="choice-list">${[['Morning','around 9:00 AM'],['Afternoon','around 2:00 PM'],['Evening','around 7:00 PM']].map(([x,t])=>`<button class="choice ${family.reminder===x?'selected':''}" data-reminder="${x}"><span class="choice-icon">☼</span><span><b>${x}</b><br>${t}</span><strong>✓</strong></button>`).join('')}</div><div class="card"><h2>Surprise practice drills</h2><p>Now and then, practice helps you prepare for messages and calls. Practice is always marked.</p></div>${btn('Continue &nbsp; →','ready')}`,'REMINDERS')}function practice(){practiceKind="practice";step=4;if(!scenarios.length){home();return}scenario=scenarios[idx++%scenarios.length];hintCount=0;practiceMessage()}
function check(){
  const attempted=new Set(events.map(event=>event.id));
  const next=scenarios.find(item=>!attempted.has(item.id))||scenarios.find(item=>item.id!==scenario?.id);
  if(!next){practice();return}
  practiceKind='check';
  scenario=next;
  hintCount=0;
  practiceMessage();
}
function practiceMessage(){step=4;frame(V2Practice.practice(scenario,lang,events),'PRACTICE')}function decision(){
  step=5;
  const trigger=app.querySelector('[data-v2p-action="decide"]');
  app.insertAdjacentHTML('beforeend',V2Practice.decision(scenario,lang,events,{allowHints:practiceKind!=='check'}));
  const dialog=app.querySelector('dialog');
  dialog.addEventListener('close',()=>{
    dialog.remove();
    if(step!==5)return;
    step=4;
    trigger?.focus();
  });
  dialog.showModal();
}async function showHint(){
  const button=app.querySelector('.v2p-hint');
  const current=scenario;
  const hints=current.hints||[];
  if(!button||button.disabled||!hints.length)return;
  const level=Math.min(hintCount,hints.length-1);
  const hintLang=current.message?.[lang]&&hints[level]?.[lang]?lang:'en';
  let target=app.querySelector('.v2p-hint-output');
  if(!target){
    target=document.createElement('p');
    target.className='notice v2p-hint-output';
    target.setAttribute('role','status');
    button.before(target);
  }
  target.textContent=hints[level]?.[hintLang]||'Pause and think about who sent the message.';
  hintCount=Math.min(hintCount+1,hints.length);
  button.disabled=true;
  const thinking=document.createElement('span');
  thinking.className='coach-thinking';
  thinking.setAttribute('role','status');
  thinking.innerHTML='<span class="coach-thinking-label">Coach Mia is thinking</span><span aria-hidden="true"><i></i><i></i><i></i></span>';
  button.after(thinking);
  try{
    const response=await fetch('/api/hint',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({id:current.id,lang:hintLang,level,verdict:'unsure'})
    });
    const result=await response.json();
    if(result.ok&&target.isConnected)target.textContent=result.hint;
  }catch{
    // The built in hint is already visible.
  }finally{
    thinking.remove();
    button.disabled=hintCount>=hints.length;
  }
}
async function answer(v){const ok=v===(scenario.is_scam?'scam':'real');events.push({id:scenario.id,ok,hints:hintCount,date:new Date().toISOString()});localStorage.setItem('lt-events',JSON.stringify(events));step=6;frame(V2Practice.result(scenario,lang,events,v)+btn('Share this lesson','share','secondary'),'REFLECTION');if(localStorage.getItem('lt-analytics')==='yes')fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:scenario.id,firstTry:ok&&hintCount===0,hints:hintCount,kind:practiceKind,fv:v})}).catch(()=>{})}function progress(){step=7;frame(`${V2Practice.progress(scenario,lang,events)}<div class="card"><label><input type="checkbox" data-consent ${localStorage.getItem('lt-analytics')==='yes'?'checked':''}> Share anonymous practice totals to help improve learning</label></div>${btn('Family circle','family','secondary')}`,'MY PROGRESS')}function familyView(){step=8;const n=events.length;frame(`<div class="eyebrow">Family</div><h1>${n?'Practice completed':'Practice together'}</h1><div class="card"><div class="row"><span class="avatar">${esc((family.name||'F')[0].toUpperCase())}</span><div><h2>${family.name?esc(family.name)+' is in your corner':'Invite a loved one'}</h2><p>${n?`${n} ${n===1?'practice':'practices'} completed`:'A little encouragement goes a long way.'}</p></div></div></div><h2>Cheer them on</h2><div class="cheer-actions"><button data-go="share">♡<br>Heart</button><button data-go="share">◉<br>Message</button><button data-go="contacts">＋<br>Family</button></div><div class="card family-talk"><h2>Talk about it this week</h2><p>Ask: “What would you do if a message asked you to act right away?”</p></div><p class="family-privacy">Your practice stays on this device.</p><div class="card"><h2>Practice reminder</h2><p>${esc(family.reminder||'Not set')}</p>${btn('Change reminder','reminder','text')}</div>${btn('Invite a loved one','share')}</div>`,'FAMILY')}async function share(){const url=new URL(app.dataset.entry||'/v2',location.origin);if(scenario?.id)url.searchParams.set('awareness',scenario.id);const text='I found a short scam awareness lesson. Take a look with me: '+url.href;try{if(navigator.share)await navigator.share({title:'Look Twice',text});else{await navigator.clipboard.writeText(text);alert('Message copied — choose a loved one to send it to.')}}catch{}}async function click(e){const b=e.target.closest('button,[data-v2p-action]');if(!b)return;if(b.dataset.v2pAnswer){answer(b.dataset.v2pAnswer);return}if(b.dataset.v2pAction){const action=b.dataset.v2pAction;if(action==='decide')decision();if(action==='hint')showHint();if(action==='back'){const dialog=app.querySelector('dialog');if(dialog)dialog.close();else home()}if(action==='continue'){if(step===6)progress();else practice()}return}if(b.dataset.lang){lang=b.dataset.lang;localStorage.setItem('lt-lang',lang);app.querySelectorAll('[data-lang]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b))})}if(b.dataset.audience||b.dataset.comfort){b.classList.toggle('selected')}if(b.dataset.reminder){family.reminder=b.dataset.reminder;localStorage.setItem('lt-family',JSON.stringify(family));document.querySelectorAll('[data-reminder]').forEach(x=>x.classList.toggle('selected',x===b))}if(b.dataset.answer){answer(b.dataset.answer);return}if(b.dataset.go==='savefamily'){family.name=document.querySelector('#fname')?.value.trim()||'';family.relationship=document.querySelector('#relationship')?.value.trim()||'';localStorage.setItem('lt-family',JSON.stringify(family));reminder();return}if(b.dataset.go==='share'){share();return}if(b.dataset.go==='finishsetup'){localStorage.setItem('lt-onboarded','yes');practice();return}go(b.dataset.go)}function change(e){if(e.target.matches('[data-consent]')){localStorage.setItem('lt-analytics',e.target.checked?'yes':'no');return}}function go(x){({welcome,setup,invite,contacts,ready,reminder,home,scamweek,currentpractice,practice,check,progress,family:familyView})[x]?.()}async function init(){try{const r=await fetch('/scams.json');const j=await r.json();scenarios=j.scenarios||[];try{const published=await (await fetch('/api/published')).json();const recent=(published.scenarios||[]).map(row=>{const d=row.draft;return {id:'candidate-'+row.id,type:'recent',is_scam:d.is_scam,sender:{en:d.sender},message:{en:d.message},explanation:{en:d.explanation},signs:d.signs,hints:d.hints.map((h,i)=>({en:h,sign:d.signs[i%d.signs.length]})),source_url:row.source_url}});scenarios=[...recent,...scenarios]}catch{}}catch{}const awareness=new URLSearchParams(location.search).get('awareness');const selected=scenarios.find(x=>x.id===awareness);if(selected){scenario=selected;scamweek()}else if(localStorage.getItem('lt-onboarded')==='yes'){home()}else welcome()}init()})();
