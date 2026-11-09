/* Local, session-scoped inspection. History never replays an action. */
let decisionHistory=[],historyRun=0,historyQueued=false;
const memoryNotes=new Map();
const viewNames=['now','memory','history'];
function selectInspector(name){
 const saved=name!=='now';$('view-now').hidden=saved;$('view-memory').hidden=!saved;$('view-history').hidden=!saved;
 $('activity-context').hidden=saved;$('status').hidden=saved;
 $('saved-activity').textContent=saved?'Back to current activity':'Saved activity';$('saved-activity').setAttribute('aria-expanded',String(saved));
 if(saved)$('stay-memory').open=true;
}
$('saved-activity').onclick=()=>selectInspector($('view-now').hidden?'now':'memory');
for(const [i,name] of viewNames.entries()){
 const tab=$('tab-'+name);tab.onclick=()=>selectInspector(name);
 tab.onkeydown=e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;if(n!==undefined){e.preventDefault();selectInspector(viewNames[n]);$('tab-'+viewNames[n]).focus();}};
}
refreshMemory=function(){
 const expanded=new Set(Array.from($('memory-facts').querySelectorAll('details[open]')).map(e=>e.dataset.id));
 const list=$('memory-facts');list.replaceChildren();$('memory-count').textContent=`${receipts.length} saved request${receipts.length===1?'':'s'}`;$('memory-tab-count').textContent=receipts.length;
 if(!receipts.length){const p=document.createElement('p');p.textContent='Confirmed requests are saved here. Each card shows its source and what can be edited.';list.append(p);return;}
 for(const r of receipts){
 const card=document.createElement('details');card.className='memory-card';card.dataset.id=r.id;card.open=expanded.has(r.id);const summary=document.createElement('summary');
 const text=document.createElement('span');const title=document.createElement('strong');title.textContent=r.title;const ref=document.createElement('small');ref.textContent=r.id;text.append(title,ref);
 const status=document.createElement('span');status.className='memory-state';status.textContent=r.cancelled?'Cancelled':`Revision ${r.revision||1}`;summary.append(text,status);card.append(summary);
 const content=document.createElement('div');content.className='memory-content';const facts=document.createElement('p');facts.textContent=r.room?`${r.room.room.name} · ${dateLabel(r.room.stay.start)}–${dateLabel(r.room.stay.end)} · ${r.room.stay.guests} guests · ${Booking.money(r.room.quote.total)}`:r.summary;
 const source=document.createElement('p');source.className='trace-caption';source.textContent=`Source: confirmed demo receipt${r.savedAt?' · Updated '+new Date(r.savedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):''}`;
 content.append(facts,source);
 const form=document.createElement('form');const label=document.createElement('label');label.textContent='Your note';const input=document.createElement('textarea');input.rows=2;input.maxLength=240;input.value=memoryNotes.get(r.id)||'';input.placeholder='For example: prefers a quiet room';input.setAttribute('aria-label',`Note for ${r.id}`);label.append(input);const save=actionButton('Save note',()=>{});save.type='submit';const feedback=document.createElement('p');feedback.className='trace-caption';feedback.setAttribute('role','status');form.append(label,save,feedback);
 form.onsubmit=e=>{e.preventDefault();memoryNotes.set(r.id,input.value.trim());feedback.textContent='Note saved for this session. Booking facts unchanged.';recordNote(r,input.value.trim());};content.append(form);
 const actions=document.createElement('div');actions.className='memory-actions';if(!r.cancelled)actions.append(actionButton('Edit booking details',()=>{if(busy)return;selectInspector('now');editReceipt(r);}));actions.append(actionButton('Open receipt',()=>{if(busy)return;selectInspector('now');openReceipt(r);}));content.append(actions);card.append(content);list.append(card);
 }
};
function captureDecision(){
 const decision=$('decision-messages').querySelector('.message-decision p'),result=$('decision-messages').querySelector('.message-result p');
 if(!decision&&!result)return;
 const existing=decisionHistory.find(e=>e.run===historyRun);
 const record={run:historyRun,time:existing?.time||Date.now(),title:decision?.textContent||result.textContent,context:$('activity-context').textContent,status:$('status').textContent,activity:$('decision-messages').innerHTML,route:$('decision-route').hidden?'':$('decision-route').innerHTML,tools:$('tool-trace').hidden?'':$('tool-list').innerHTML};
 if(existing)Object.assign(existing,record);else decisionHistory.push(record);renderHistory();
}
function scheduleCapture(){if(historyQueued)return;historyQueued=true;queueMicrotask(()=>{historyQueued=false;captureDecision();});}
function historyTitle(e){
 const names={'Create demo reservation':'Room booked','Update demo reservation':'Booking updated','Waiting for your confirmation':'Booking ready to confirm','Table available':'Dinner reserved','Memory note updated':'Note saved','Answer from the saved record':'Booking question answered','Cancel the selected request':'Booking cancelled','Ask for your confirmation':'Cancellation awaiting approval','Ask for a booking first':'No booking found','Collect dates, then recheck price and availability':'New dates requested'};
 return names[e.title]||(/^DEMO-/.test(e.title)?'Booking found':e.title);
}
function renderHistory(){
 const expanded=new Set(Array.from($('history-list').querySelectorAll('details[open]')).map(e=>e.dataset.run));
 $('history-count').textContent=decisionHistory.length;$('history-empty').hidden=Boolean(decisionHistory.length);$('history-list').replaceChildren();
 for(const e of [...decisionHistory].reverse()){
 const card=document.createElement('details');card.className='history-card';card.dataset.run=String(e.run);card.open=expanded.has(String(e.run));
 const summary=document.createElement('summary');const title=document.createElement('strong');title.textContent=historyTitle(e);const time=document.createElement('span');time.textContent=new Date(e.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});summary.append(title,time);card.append(summary);
 const body=document.createElement('div');body.className='history-content';const context=document.createElement('p');context.className='trace-caption';context.textContent=e.context;body.append(context);
 if(e.note!==undefined){const p=document.createElement('p');p.textContent=e.note||'Note cleared';body.append(p);}else{
 const original=document.createElement('div');original.innerHTML=e.activity;const result=original.querySelector('.message-result p'),reason=original.querySelector('.message-decision .message-note');
 for(const [label,value] of [['Outcome',result?.textContent],['Why',reason?.textContent]]){if(!value)continue;const p=document.createElement('p');p.className='history-fact';const strong=document.createElement('strong');strong.textContent=label;const text=document.createElement('span');text.textContent=value;p.append(strong,text);body.append(p);}
 if(!result&&!reason){const p=document.createElement('p');p.textContent=e.title;body.append(p);}
 if(e.tools){const tools=document.createElement('details');const summary=document.createElement('summary');summary.textContent='View tools';tools.append(summary);const list=document.createElement('div');list.innerHTML=e.tools;tools.append(list);body.append(tools);}}
 card.append(body);$('history-list').append(card);
 }
}
function recordNote(r,note){decisionHistory.push({run:'note-'+crypto.randomUUID(),time:Date.now(),title:'Memory note updated',context:r.id,note});renderHistory();}
const clearBeforeInspector=clearActivity;
clearActivity=function(){captureDecision();historyRun++;clearBeforeInspector();};
const activityBeforeInspector=activity;
activity=function(...args){const row=activityBeforeInspector(...args);scheduleCapture();return row;};
const saveBeforeInspector=saveReceipt;
saveReceipt=function(...args){saveBeforeInspector(...args);const r=receipts.find(r=>r.id===focusedReceipt);if(r)r.savedAt=Date.now();refreshMemory();scheduleCapture();};
const cancelBeforeInspector=finishCancellation;
finishCancellation=function(){cancelBeforeInspector();const r=receipts.find(r=>r.id===focusedReceipt);if(r)r.savedAt=Date.now();refreshMemory();scheduleCapture();};
const restartBeforeInspector=restart;
restart=function(){decisionHistory=[];historyRun++;memoryNotes.clear();restartBeforeInspector();decisionHistory=[];renderHistory();refreshMemory();selectInspector('now');};$('restart').onclick=restart;
const submitBeforeInspector=submit;
submit=function(text){if(busy)return;selectInspector('now');submitBeforeInspector(text);if(Conversation.route(text)==='memory')selectInspector('memory');scheduleCapture();};
refreshMemory();renderHistory();
const recallBeforeInspector=recall;
recall=function(r,action){recallBeforeInspector(r,action);const note=memoryNotes.get(r.id);if(note)activity('Guest note',note,'finding','Source: your editable memory note; not a confirmed hotel request.');};

// Keep secondary request choices out of the main conversation flow.
document.querySelectorAll("[data-intent]").forEach(button=>button.addEventListener("click",()=>{$("other-requests").open=false;}));
