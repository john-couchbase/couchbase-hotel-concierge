/* Local-only live integration preview; uses the approved chat and activity panels. */
(()=>{
 const badge=document.querySelector('.topbar span')||document.querySelector('header span');
 if(badge)badge.textContent='Live model · Sample hotel';
 document.querySelector('.footer-legal').textContent='Live Couchbase model · Fictional hotel tools';
 document.querySelector('.catalog-open')?.setAttribute('hidden','');
 $('quick-replies').replaceChildren();$('chat-action').replaceChildren();
 $('chat-log').replaceChildren();bubble('Live Couchbase model connected. Ask to find a room, plan dinner, upgrade, or cancel. Hotel data is fictional. Confirmed demo bookings are saved for review.');
 document.querySelector('.demo-settings')?.setAttribute('hidden','');
 document.querySelector('#other-requests')?.setAttribute('hidden','');
 function brief(o){
  if(o.error)return 'Blocked: '+o.error;
  if(o.approval_required)return 'Awaiting your approval · '+brief(o.summary);
  if(o.total!==undefined)return (o.name||'Room')+' · $'+o.total.toFixed(2)+' total · '+o.nights+' nights';
  if(o.rooms)return o.rooms.map(r=>r.name+' · $'+r.nightly+'/night').join(' · ');
  if(o.bookings)return o.bookings.length+' saved booking(s) · '+o.bookings.map(b=>b.reference+(b.cancelled?' cancelled':' active')).join(' · ');
  if(o.reference)return o.reference+(o.cancelled?' · Cancelled':o.room?' · '+o.room:'');
  if(o.tier)return o.tier+' member';
  if(o.nights)return o.start+'–'+o.end+' · '+o.guests+' guests';
  if(o.opens)return o.name+' · '+o.opens+':00–'+o.closes+':00';
  return Object.entries(o).map(([k,v])=>k.replaceAll('_',' ')+': '+v).join(' · ');
 }
 let pending=null,offers=[],lastQuote=null,hasRoom=false;
 let savedState={bookings:[],history:[],storage:'Saved on this Mac',services:{}};
 const savedButton=$('saved-activity');
 function node(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
 function receiptText(b){return b.kind==='room'?`${b.start}–${b.end} · ${b.guests} guests · $${b.total.toFixed(2)} total`:`${b.date} · ${b.hour}:00 · ${b.guests} guests`;}
 function renderSaved(){
  const open=new Set([...$('memory-facts').querySelectorAll('details[open]')].map(d=>d.dataset.id));
  const list=$('memory-facts');list.replaceChildren();$('memory-count').textContent=savedState.bookings.length+' bookings';
  $('view-memory').querySelector('.archive-heading').textContent='Your bookings';$('stay-memory').querySelector('summary span').textContent='Saved receipts';
  $('stay-memory').querySelector('.trace-caption').textContent=savedState.storage+' · Demo records · 24-hour retention';
  if(!savedState.bookings.length)list.append(node('p','Confirmed bookings appear here.','trace-caption'));
  for(const b of [...savedState.bookings].reverse()){
   const card=document.createElement('details');card.className='memory-card';card.dataset.id=b.reference;card.open=open.has(b.reference);
   const summary=document.createElement('summary'),label=document.createElement('span');label.append(node('strong',b.kind==='room'?b.name:'Skyline dinner'),node('small',b.reference));summary.append(label,node('span',b.cancelled?'Cancelled':'Saved','memory-state'));card.append(summary);
   const body=node('div','','memory-content');body.append(node('p',receiptText(b)),node('p',savedState.storage,'trace-caption'));
   if(b.upgrade_used)body.append(node('p','Complimentary upgrade applied.'));
   if(b.checkout_hour)body.append(node('p','Checkout: '+b.checkout_hour+':00'));
   const actions=node('div','','memory-actions');actions.append(actionButton('Ask about this booking',()=>{if(busy)return;selectInspector('now');send('Please review booking '+b.reference+'.');}));
   if(!b.cancelled)actions.append(actionButton('Cancel booking',()=>{if(busy)return;selectInspector('now');send('I want to cancel booking '+b.reference+'.');}));body.append(actions);card.append(body);list.append(card);
  }
  const history=$('history-list');
  const expanded=new Set([...history.querySelectorAll('details[open]')].map(e=>e.dataset.entry));
  history.replaceChildren();$('history-empty').hidden=Boolean(savedState.history.length);
  $('view-history').querySelector('.archive-heading').textContent='Activity history';
  let count=$('view-history').querySelector('.history-total');
  if(!count){count=node('p','','history-total');$('view-history').querySelector('.archive-heading').after(count);}
  count.textContent=savedState.history.length+' recent '+(savedState.history.length===1?'request':'requests');
  const names={validate_stay:'Dates checked',search_rooms:'Rooms found',quote_room:'Room priced',create_reservation:'Room booking',find_reservations:'Bookings reviewed',check_loyalty_tier:'Membership checked',apply_upgrade:'Room upgrade',get_outlet_hours:'Dinner hours checked',book_restaurant:'Dinner reservation',check_departure_schedule:'Checkout availability',update_checkout:'Late checkout',cancel_reservation:'Booking cancellation'};
  for(const [index,h] of [...savedState.history.entries()].reverse()){
   const steps=h.events.filter(e=>e.type==='tool'&&e.state!=='Running'),last=steps.at(-1),blocked=steps.filter(e=>e.state==='Failed').length;
   const awaiting=last?.output?.approval_required;
   const key=h.events.find(e=>e.call_id)?.call_id||index+':'+h.request;
   const card=node('details','','history-card');card.dataset.entry=key;card.open=expanded.has(key);
   const summary=node('summary'),heading=node('span','','history-entry-heading');
   heading.append(node('strong',names[last?.name]||'Guest question'),node('small',(steps.length?steps.length+' '+(steps.length===1?'step':'steps')+' · ':'')+(awaiting?'Awaiting approval':blocked?blocked+' blocked':'Complete')));summary.append(heading);card.append(summary);
   const body=node('div','','history-content');
   const selection=h.events.find(e=>e.type==='selection');
   if(selection){const evidence=node('section','','history-actions');evidence.append(node('h4','Policy & tools','history-section-title'));for(const p of selection.policies)evidence.append(node('p',p.title+' · '+p.version));const used=new Set(steps.map(e=>e.name));evidence.append(node('p',selection.selected_tools.length+' selected · '+used.size+' called'));const unused=selection.selected_tools.filter(n=>!used.has(n));if(unused.length)evidence.append(node('p','Not called: '+unused.map(DemoCatalog.label).join(', '),'trace-caption'));body.append(evidence);}

   const request=node('div','','history-request');request.append(node('h4','Guest request','history-label'),node('p',h.request));body.append(request);
   if(steps.length){const group=node('section','','history-actions');group.append(node('h4','Agent actions','history-section-title'));const list=node('ol','','history-steps');for(const e of steps){
    const row=node('li'),head=node('div','','history-step-heading');
    head.append(node('strong',DemoCatalog.label(e.name)),node('span',e.state==='Failed'?'Blocked':e.output?.approval_required?'Needs approval':'Returned','history-step-status'));
    const o=e.output||{};let detail=brief(o);
    if(o.bookings){const active=o.bookings.filter(b=>!b.cancelled).length;detail=active+' active · '+(o.bookings.length-active)+' cancelled';}
    if(o.rooms)detail=o.rooms.length+' room options found';
    row.append(head,node('p',detail));list.append(row);
   }group.append(list);body.append(group);}else{const answer=h.events.find(e=>e.type==='answer');if(answer){const response=node('section','','history-actions');response.append(node('h4','Agent response','history-section-title'),node('p',answer.text,'history-response'));body.append(response);}}
   body.append(actionButton('Inspect decision trace',()=>{
    if(busy)return;
    const events=h.events,answer=events.find(e=>e.type==='answer');
    const chosen=selection?.selected_tools||[...new Set(steps.map(e=>e.name))];
    const replay={live:true,traceEvents:events,selection,phase:2,intent:'live',prompt:selection?.policies.map(p=>p.title).join(' + ')||'Saved request',policy:selection?.policies.map(p=>p.rule).join(' ')||'',title:'Saved decision',reason:h.request,result:answer?.text||'No response recorded',saved:'Saved activity',tools:chosen.map(name=>{const e=steps.filter(x=>x.name===name).at(-1);return {id:name,name,state:e?.state||'Not called',reason:'Recorded in this request',output:e?.output?brief(e.output):''};})};
    selectInspector('now');guidedRun=replay;StableActivity.render($('decision-route'),replay);const details=document.querySelector('.activity-details-card .sa-review');if(details)details.open=true;
   }));
   card.append(body);history.append(card);
  }
  savedButton.textContent=$('view-now').hidden?'Back to current activity':`Saved activity${savedState.bookings.length?' · '+savedState.bookings.length:''}`;
 }
 savedButton.onclick=()=>{selectInspector($('view-now').hidden?'now':'memory');renderSaved();};
 const responseList=node('section','','recent-responses');responseList.setAttribute('aria-label','Recent agent responses');$('view-now').append(responseList);
 function renderResponses(){
  const expanded=new Set([...responseList.querySelectorAll('details[open]')].map(e=>e.dataset.entry));
  responseList.replaceChildren();
  const current=typeof guidedRun!=='undefined'?guidedRun?.result:null;
  const answers=savedState.history.map((h,index)=>({h,index,answer:h.events.find(e=>e.type==='answer')?.text})).filter(r=>r.answer);
  if(answers.at(-1)?.answer===current)answers.pop();
  const recent=answers.slice(-4).reverse();responseList.hidden=!recent.length;
  if(!recent.length)return;
  responseList.append(node('h3','Recent responses'));
  for(const r of recent){const card=node('details','','response-block');card.dataset.entry=String(r.index);card.open=expanded.has(card.dataset.entry);
   const summary=node('summary',r.h.request);card.append(summary,node('p',r.answer));responseList.append(card);
  }
 }
 function acceptState(data){savedState=data;hasRoom=data.bookings.some(b=>b.kind==='room'&&!b.cancelled);document.querySelector('.footer-legal').textContent='Live Couchbase model · Fictional hotel tools · '+data.storage;renderSaved();renderResponses();}
 async function loadSaved(){try{const r=await fetch('/api/state');if(!r.ok)throw Error();acceptState(await r.json());showChoices();}catch{bubble('Saved bookings could not be loaded. Try refreshing.');}}

 const choices=document.createElement('details');choices.className='other-requests';
 const toggle=document.createElement('summary');toggle.textContent='Other requests';choices.append(toggle);
 const options=document.createElement('div');options.className='suggestions';choices.append(options);$('quick-replies').after(choices);
 function dates(kind){
  if(busy)return;choices.open=false;$('chat-action').replaceChildren();
  const form=document.createElement('form');form.className='stay-form';
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const end=new Date(tomorrow);end.setDate(end.getDate()+2);
  form.innerHTML=kind==='room'?'<div class="stay-fields"><label>Check-in<input name="start" type="date" required></label><label>Check-out<input name="end" type="date" required></label><label>Guests<select name="guests"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label></div>':'<div class="stay-fields"><label>Dinner date<input name="start" type="date" required></label><label>Time<select name="hour"><option value="18">6 pm</option><option value="19">7 pm</option><option value="20" selected>8 pm</option><option value="21">9 pm</option></select></label><label>Guests<select name="guests"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label></div>';
  form.elements.start.value=iso(tomorrow);form.elements.start.min=iso(new Date());if(form.elements.end)form.elements.end.value=iso(end);
  const button=document.createElement('button');button.className='booking-primary';button.textContent=kind==='room'?'Find rooms':'Find a table';form.append(button);
  form.onsubmit=e=>{e.preventDefault();const f=form.elements;if(kind==='room'&&f.end.value<=f.start.value){f.end.setCustomValidity('Choose a checkout after check-in.');f.end.reportValidity();return;}send(kind==='room'?`Find a room for ${f.guests.value} guests from ${f.start.value} to ${f.end.value}.`:`Book dinner for ${f.guests.value} guests on ${f.start.value} at ${f.hour.value}:00.`);};
  if(form.elements.end)form.elements.end.oninput=()=>form.elements.end.setCustomValidity('');
  $('chat-action').append(form);
 }
 function showChoices(){
  $('quick-replies').replaceChildren();options.replaceChildren();choices.hidden=busy;
  if(busy)return;
  options.append(actionButton('Find a room',()=>dates('room')),actionButton('Dinner',()=>dates('dinner')),actionButton('Upgrade',()=>send('Can I upgrade my room?')),actionButton('Late checkout',()=>send('Could I have a late checkout?')),actionButton('Review booking',()=>send('Show my current bookings.')),actionButton('Cancel booking',()=>send('I want to cancel my room booking.')));
  if(pending){$('chat-action').append(actionButton('Confirm demo action',()=>{const id=pending.id;pending=null;send('',id);},true),actionButton('Keep unchanged',()=>send('Do not make that change. Keep everything unchanged.')));return;}
  if(offers.length){for(const room of offers)$('quick-replies').append(actionButton(room.name+' · $'+room.nightly+'/night',()=>send('Please quote the '+room.name+' for the dates and guests I provided.')));offers=[];return;}
  if(lastQuote){const q=lastQuote;$('quick-replies').append(actionButton('Book '+q.name+' · $'+q.total.toFixed(2),()=>send('I would like to book the '+q.name+' at the quoted total.')));lastQuote=null;return;}
  $('quick-replies').append(actionButton(hasRoom?'Plan dinner':'Find a room',()=>dates(hasRoom?'dinner':'room')),actionButton(hasRoom?'Review booking':'Dinner',()=>hasRoom?send('Show my current bookings.'):dates('dinner')));
 }
 showChoices();loadSaved();
 async function send(message,approval){
  if(busy)return;selectInspector('now');pending=null;stateBusy(true);$('quick-replies').replaceChildren();choices.hidden=true;choices.open=false;if(message)bubble(message,'user');$('chat-action').replaceChildren();
  const run={traceEvents:[],live:true,intent:'live',prompt:'live-hotel-preview',policy:'Server-enforced demo policies; real model selects and calls server tools.',phase:0,title:'Reviewing your request',reason:'Couchbase Nova Lite · Live model',tools:[],result:'',saved:'Demo session · Service status appears after response'};
  guidedRun=run;renderResponses();
  const render=()=>{StableActivity.render($('decision-route'),run);document.querySelector('.sa-current-tool').textContent=run.tools.find(t=>t.state==='Running')?.name+'()';if(!run.tools.some(t=>t.state==='Running'))document.querySelector('.sa-current-tool').textContent='Live model · Fictional hotel';document.querySelector('.sa-sdk')?.setAttribute('hidden','');document.querySelector('.sa-stages')?.setAttribute('aria-label','Live decision stages');if(run.phase===0)document.querySelector('.sa-summary p').textContent='Waiting for the live model to choose a check.';$('status').textContent=run.phase===2?'Complete':'Working';};render();
  try{
   const response=await fetch(approval?'/api/confirm':'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(approval?{approval}:{message})});if(!response.ok)throw Error('Request rejected: '+response.status);
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   while(true){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});let i;
    while((i=buffer.indexOf('\n'))>=0){const e=JSON.parse(buffer.slice(0,i));buffer=buffer.slice(i+1);if(['selection','tool','answer'].includes(e.type))run.traceEvents.push(e);
     if(e.type==='selection'){
      run.selection=e;run.prompt=e.policies.map(p=>p.title).join(' + ');run.policy=e.policies.map(p=>p.rule).join(' ');run.title='Policy selected';run.reason=run.prompt;
      run.tools=e.selected_tools.map(name=>({id:name,name,state:'Selected',reason:'Included by the selected policy.',output:''}));render();
     }
     if(e.type==='tool'){
      if(e.state==='Returned'&&e.output){const o=e.output;if(o.bookings)hasRoom=o.bookings.some(b=>b.kind==='room'&&!b.cancelled);if(o.rooms)offers=o.rooms;if(e.name==='quote_room'&&o.total!==undefined)lastQuote=o;if(e.name==='create_reservation'&&o.reference){hasRoom=true;offers=[];lastQuote=null;}if(e.name==='cancel_reservation'&&o.cancelled)hasRoom=false;}

      let t=run.tools.find(t=>t.name===e.name);
      if(!t){t={id:e.call_id,name:e.name,state:e.state,reason:'Selected by the live model for this request.',output:''};run.tools.push(t);}
      t.state=e.state;if(e.state==='Failed')t.reason=e.output?.error||'Server rejected this call';t.output=e.output?brief(e.output):'';run.phase=1;run.title=e.state==='Running'?'Checking '+DemoCatalog.label(e.name):DemoCatalog.label(e.name);run.reason=e.state==='Failed'?'The server rejected this action.':'Actual server tool event';render();
     }
     if(e.type==='state'){acceptState(e);run.saved=e.storage+' · Memory: '+e.services.memory+' · Tracing: '+e.services.tracing;render();}
     if(e.type==='answer'){run.tools.forEach(t=>{if(t.state==='Selected'){t.state='Not called';t.reason='Available for this request; the model did not call it.';}});pending=e.pending;run.phase=2;run.title=pending?'Approval needed':'Response ready';run.result=e.text;run.response=e.text;bubble(e.text);render();}
     if(e.type==='error')throw Error(e.text);
    }
   }
  }catch(e){run.phase=2;run.title='Request stopped';run.result=e.message;bubble(e.message);render();}
  finally{stateBusy(false);showChoices();renderSaved();}
 }
 submit=function(raw){const text=raw.trim();if(text&&!busy){$('chat-input').value='';send(text);}};
 $('restart').onclick=async()=>{if(busy)return;await fetch('/api/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.reload();};
})();
