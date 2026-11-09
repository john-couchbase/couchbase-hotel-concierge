/* Observable run map, backed by the demo's existing route and tool records. */
let flowRequest='';
const bubbleBeforeFlow=bubble;
bubble=function(text,who='assistant'){if(who==='user'&&!Conversation.acknowledgement(text)&&!/^confirm demo booking$/i.test(text))flowRequest=text;bubbleBeforeFlow(text,who);};
function flowNode(label,title,detail,kind='normal'){
 const node=document.createElement('details');node.className='flow-node flow-'+kind;
 const summary=document.createElement('summary');const dot=document.createElement('span');dot.className='flow-dot';dot.setAttribute('aria-hidden','true');const copy=document.createElement('span');const small=document.createElement('span');small.className='flow-label';small.textContent=label;const strong=document.createElement('strong');strong.textContent=title;copy.append(small,strong);summary.append(dot,copy);node.append(summary);
 const p=document.createElement('p');p.className='flow-detail';p.textContent=detail;node.append(p);return node;
}
showDecisionRoute=function(route,rows){
 const root=$('decision-route');root.replaceChildren();root.hidden=false;root.dataset.running='false';root.classList.add('run-map');
 const heading=document.createElement('h3');heading.textContent='Tool selection → result';const caption=document.createElement('p');caption.className='trace-caption';caption.textContent='Simulated run · Select a stage to inspect';root.append(heading,caption);
 const overview=document.createElement('p');overview.className='current-tools';const called=rows.filter(r=>r[1]==='Used').map(r=>r[0]);overview.textContent='Tools used: '+(called.join(' → ')||'Awaiting selection');root.append(overview);const path=document.createElement('div');path.className='flow-path';root.append(path);
 const names={room:'Find a room',upgrade:'Upgrade a room',dining:'Book dinner',checkout:'Late checkout','booking-question':'Review a booking','review-booking':'Find a booking','change-reservation':'Change a booking','cancel-reservation':'Cancel a booking'};
 const wording=flowRequest||$('activity-context').textContent;const cues=wording.match(/\b(review|booking|reservation|cancel|change|move|room|dinner|upgrade|checkout|last four|ending in)\b/gi)||[];const ref=Conversation.reference(wording);
 const request=flowNode('Request interpreted',names[route]||route.replaceAll('-',' '),`Guest wording: “${wording}”\n\nRecognized wording: ${[...new Set(cues)].join(', ')||'follow-up to the current request'}.${ref?'\nReference: '+ref.value:''}\n\nThis demo uses explicit wording and conversation-state rules to select this route. It does not analyze model tokens or expose private reasoning.`,'request');path.append(request);
 const context=$('activity-context').textContent;const record=receipts.find(r=>context.includes(r.id));
 const memory=flowNode('Memory & context',record?record.title+' · '+record.id.slice(-4):'Session context',record?`Source: ${record.id}\n${record.summary}\n${record.cancelled?'Cancelled record':'Saved demo receipt'}. Booking facts are checked before any change.`:`${receipts.length} saved request${receipts.length===1?'':'s'} available in this browser session. Availability and policy come from the demo fixtures. A saved record is not assumed to match just because it exists.`,'memory');path.append(memory);
 const branch=document.createElement('div');branch.className='flow-branch';const used=document.createElement('div');used.className='flow-selected';const unused=document.createElement('div');unused.className='flow-unused';
 const toolNames={find_reservations:'Find the booking',search_rooms:'Search rooms',create_reservation:'Create booking',update_reservation:'Update booking',cancel_reservation:'Cancel booking',check_loyalty_tier:'Check membership',apply_upgrade:'Apply upgrade',get_outlet_hours:'Check opening hours',book_restaurant:'Reserve a table',get_menu:'Read the menu',check_departure_schedule:'Check next arrival',update_checkout:'Update checkout',search_memory:'Recall saved context',update_memory:'Update saved context'};
 for(const [tool,status,reason] of rows){const node=flowNode(status==='Used'?'Tool used':status,toolNames[tool]||tool,`${tool}\n\n${reason}\n\n${status==='Used'?'Executed in the local simulation.':status==='Not called'?'Available to this route, but execution was withheld.':'Excluded from this request’s tool selection.'}`,status==='Used'?'tool':'skipped');(status==='Used'?used:unused).append(node);}
 branch.append(used);if(unused.children.length){const alternatives=document.createElement('details');alternatives.className='tool-alternatives';const label=document.createElement('summary');label.textContent=`Other tools (${unused.children.length})`;alternatives.append(label,unused);branch.append(alternatives);}path.append(branch);
 const result=flowNode('Outcome','Reviewing the result','The outcome will reflect the current activity record.','outcome');result.id='flow-outcome';result.setAttribute('aria-live','polite');path.append(result);
 const memoryWrite=flowNode('Record','Session history', 'Decisions are recorded under Saved activity. Confirmed requests become saved receipts; unconfirmed changes do not overwrite booking facts. All data clears on reload or New chat.','record');path.append(memoryWrite);
 updateFlowOutcome();
};
function updateFlowOutcome(){
 const node=$('flow-outcome');if(!node)return;
 const saved=Array.from($('decision-messages').querySelectorAll('.message')).find(row=>row.querySelector('.message-label')?.textContent==='Memory saved');const storage=$('decision-route').querySelector('.flow-record');if(saved&&storage){storage.querySelector('strong').textContent='Receipt saved';storage.querySelector('.flow-detail').textContent=saved.querySelector('p').textContent+'\n\nLocation: this browser session → Saved activity → Saved context. Decision events are retained in What happened. This is local memory, not a Couchbase write; reload or New chat clears it.';}const result=$('decision-messages').querySelector('.message-result p');const decision=$('decision-messages').querySelector('.message-decision p');const reason=$('decision-messages').querySelector('.message-decision .message-note');
 node.querySelector('strong').textContent=result?.textContent||decision?.textContent||$('status').textContent;
 node.querySelector('.flow-detail').textContent=[decision?.textContent,reason?.textContent,result?.textContent].filter(Boolean).join('\n\n')||'No final outcome yet. The current request still needs details or confirmation.';
}
new MutationObserver(updateFlowOutcome).observe($('decision-messages'),{childList:true,subtree:true,characterData:true});
const restartBeforeFlow=restart;restart=function(){flowRequest='';restartBeforeFlow();};$('restart').onclick=restart;
// Reflect the real simulated check lifecycle while it is running.
const activityBeforeFlow=activity;
activity=function(label,text,kind='finding',note=''){
 const row=activityBeforeFlow(label,text,kind,note);
 if(typeof guidedRun!=='undefined'&&guidedRun)return row;
 if(kind==='decision'&&$('decision-route').dataset.running==='true'){const root=$('decision-route'),path=root.querySelector('.flow-path');root.dataset.running='false';root.querySelector('h3').textContent='How this request moves';root.querySelector('.trace-caption').textContent='Simulated run · Select a stage to inspect';path.lastElementChild?.remove();path.lastElementChild?.remove();const result=flowNode('Decision',text,note||'Based on the completed checks.','outcome');result.id='flow-outcome';path.append(result);}
 if(kind==='active'){
  const root=$('decision-route');root.replaceChildren();root.hidden=false;root.dataset.running='true';root.classList.add('run-map');
  const h=document.createElement('h3');h.textContent='Current check: '+label;const caption=document.createElement('p');caption.className='trace-caption';caption.textContent='Simulated run · Current check';const path=document.createElement('div');path.className='flow-path';
  path.append(flowNode('Request',flowRequest||$('activity-context').textContent,'The current guest request and conversation context.','request'));
  const completed=Array.from($('decision-messages').querySelectorAll('.message-finding')).slice(-2);
  for(const item of completed)path.append(flowNode('Checked',item.querySelector('.message-label').textContent,item.querySelector('p').textContent,'memory'));
  path.append(flowNode('In progress',label,'This check is running in the scripted demo. Its result determines whether the next action can proceed.','tool'));
  path.append(flowNode('Next','Review the check result','The decision will be shown when this check finishes.','record'));root.append(h,caption,path);
 }return row;
};
