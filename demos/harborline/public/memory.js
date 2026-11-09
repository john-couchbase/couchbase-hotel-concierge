/* Session-only memory and observable tool events. No network requests. */
let focusedReceipt=null,cancelTarget=null,selection=null,lookupConfirmation=null,lookupMiss=null;
const submitOriginal=submit,saveOriginal=saveReceipt,openOriginal=openReceipt,editOriginal=editReceipt,restartOriginal=restart;
function refreshMemory(){
 const list=$('memory-facts');list.replaceChildren();
 const rooms=receipts.filter(r=>r.intent==='room');
 $('memory-count').textContent=rooms.length?`${rooms.length} stay${rooms.length===1?'':'s'} remembered`:'No saved stay yet';
 for(const r of rooms){const row=document.createElement('p');row.textContent=`${r.id} · ${r.cancelled?'Cancelled':r.room.room.name} · ${dateLabel(r.room.stay.start)}–${dateLabel(r.room.stay.end)} · ${r.room.stay.guests} guests`;list.append(row);}
 if(!rooms.length){const p=document.createElement('p');p.textContent='Book a demo room to remember its dates, guests and price.';list.append(p);}
}
function traceRows(route,rows){
 const root=$('tool-list');root.replaceChildren();const p=document.createElement('p');p.className='trace-route';p.textContent='Route · '+route;root.append(p);
 for(const [tool,state,reason] of rows){const row=document.createElement('div');row.className='tool-row';const c=document.createElement('code');c.textContent=tool;const s=document.createElement('span');s.textContent=state;s.className=state==='Used'?'tool-used':'tool-skipped';const note=document.createElement('p');note.textContent=reason;row.append(c,s,note);root.append(row);}$('tool-trace').hidden=false;showDecisionRoute(route,rows);
}
function showDecisionRoute(route,rows){
 const root=$('decision-route');root.replaceChildren();root.hidden=false;
 const title=document.createElement('h3');title.textContent='Decision summary';const caption=document.createElement('p');caption.className='trace-caption';caption.textContent='Simulated · Observable steps';root.append(title,caption);
 const chosen=rows.filter(r=>r[1]==='Used'),held=rows.find(r=>r[1]==='Not called'||r[1]==='Not selected');
 const names={room:'Find a room',upgrade:'Upgrade a room',dining:'Book dinner',checkout:'Late checkout','booking-question':'Review a booking','review-booking':'Find a booking','change-reservation':'Change a booking','cancel-reservation':'Cancel a booking'};
 const steps=[['Request',names[route]||route.replaceAll('-',' ')],['Tool chosen',chosen.filter(r=>r[0]!=='search_memory').map(r=>r[0]).join(' → ')||chosen[0]?.[0]||'Ask for clarification'],['Why this tool',chosen.filter(r=>r[0]!=='search_memory')[0]?.[2]||'More details are needed before taking action']];
 if(held)steps.push(['Not run',`${held[0]} · ${held[2]}`]);
 for(const [label,text] of steps){const row=document.createElement('div');const strong=document.createElement('span');strong.textContent=label;const p=document.createElement('p');p.textContent=text;row.append(strong,p);root.append(row);}
}
function lookupBooking(text){
 lookupMiss=null;cancelTarget=null;selection=null;lookupConfirmation=null;pending=null;roomStage=null;editingId=null;$('chat-action').replaceChildren();
 const ref=Conversation.reference(text),matches=Conversation.candidates(text,receipts);clearActivity();$('status').textContent='Booking lookup';$('activity-context').textContent=ref?`Reference ${ref.value}`:'Review a booking';
 activity('Understood',ref?`Find a booking ${ref.type==='suffix'?'ending in ':''}${ref.value}`:'Review an existing booking','request');
 traceRows('review-booking',[['search_memory','Used','Check saved references in this session'],['find_reservations','Used',ref?'Match the supplied reference exactly':'Find the saved bookings'],['update_reservation','Not selected','Reviewing a booking makes no changes']]);
 if(!matches.length){lookupMiss=ref?.value||'this request';activity('Result','No matching booking','result');$('status').textContent='No match';bubble(ref?`I couldn’t find a saved demo booking ending in ${ref.value}. Please check the reference or choose a saved receipt. I haven’t selected a different booking.`:'There are no saved demo bookings yet. Find a room first.');for(const r of receipts)$('chat-action').append(actionButton(`${r.title} · ${r.id}`,()=>previewLookup(r)));return;}
 if(matches.length===1){previewLookup(matches[0]);return;}
 selection={matches,callback:previewLookup};activity('Decision','Ask which booking you mean','decision',`${matches.length} records match; no booking has been selected.`);bubble('More than one booking matches. Choose the full reference below.');
 for(const r of matches)$('chat-action').append(actionButton(`${r.title} · ${r.id}`,()=>{selection=null;previewLookup(r);}));
}
function previewLookup(r){
 lookupConfirmation=r.id;$('chat-action').replaceChildren();$('status').textContent='Confirm match';
 activity('Match',r.id,'result',r.cancelled?'Cancelled':r.summary);
 bubble(`${r.id} · ${r.summary}${r.room?` · ${dateLabel(r.room.stay.start)}–${dateLabel(r.room.stay.end)}`:''}. Is this the booking you mean?`);
 $('chat-action').append(actionButton('Yes, that’s the one',()=>confirmLookup(),true),actionButton('Different booking',()=>{lookupConfirmation=null;lookupBooking('review my booking');}));followChat();
}
function confirmLookup(){
 const r=receipts.find(r=>r.id===lookupConfirmation);lookupConfirmation=null;if(!r){bubble('Please choose a saved booking first.');return;}
 $('chat-action').replaceChildren();focusedReceipt=r.id;if(r.room&&!r.cancelled)reservation=structuredClone(r.room);answer(r,'summary');$('status').textContent='Booking selected';renderReceipts(r.id);
 if(!r.cancelled){$('quick-replies').replaceChildren();$('quick-replies').append(actionButton('Change dates',()=>submit(`Change ${r.id}`)),actionButton('Cancel booking',()=>submit(`Cancel ${r.id}`)));}
}
function recall(r,action){
 clearActivity();$('activity-context').textContent=`${r.title} · ${r.id}`;$('status').textContent=action;
 activity('Memory recalled',r.cancelled?'This booking was cancelled':r.summary,'finding',`Source: confirmed demo receipt ${r.id}`);
 activity('Tool · find_reservations',r.cancelled?'Cancelled record found':'Current demo record found','finding','Memory supplies context; the booking record determines what can change.');
}
function findTarget(text,callback){
 let matches=Conversation.candidates(text,receipts);
 if(!matches.length){clearActivity();$('status').textContent='No booking';activity('Memory lookup','No matching saved request','finding');activity('Decision','Ask for a booking first','decision','No reservation will be invented.');bubble('I don’t have a matching booking in this demo yet. Shall we find a room?');suggest(prompts.room);return;}
 if(matches.length===1){callback(matches[0]);return;}
 if(focusedReceipt&&matches.some(r=>r.id===focusedReceipt)&&! /room|booking|stay|reservation|dinner|date/i.test(text)){callback(matches.find(r=>r.id===focusedReceipt));return;}
 selection={matches,callback};bubble('Which request do you mean? Choose one below.');$('chat-action').replaceChildren();
 for(const r of matches)$('chat-action').append(actionButton(`${r.title} · ${r.id}`,()=>{selection=null;$('chat-action').replaceChildren();focusedReceipt=r.id;callback(r);}));
}
function cancelPreview(r){
 pending=null;roomStage=null;editingId=null;cancelTarget=null;$('chat-action').replaceChildren();$('quick-replies').replaceChildren();focusedReceipt=r.id;recall(r,'Review cancellation');
 if(r.cancelled){bubble('That request is already cancelled. Nothing else changed.');return;}
 cancelTarget=r.id;activity('Policy','No fee in this fictional demo','finding');activity('Decision','Ask for your confirmation','decision','The reservation is unchanged until you confirm.');
 traceRows('cancel-reservation',[['search_memory','Used','Recall the referenced request'],['find_reservations','Used','Read its current status'],['cancel_reservation','Not called','Waiting for explicit confirmation'],['create_reservation','Not selected','You requested a cancellation']]);
 bubble(`Cancel ${r.title.toLowerCase()} ${r.id}? This demo has no cancellation fee.`);
 $('chat-action').append(actionButton('Confirm cancellation',()=>finishCancellation(),true),actionButton('Keep booking',()=>keepBooking()));followChat();
}
function keepBooking(){cancelTarget=null;selection=null;$('chat-action').replaceChildren();clearActivity();$('status').textContent='Kept';activity('Result','Booking unchanged','result');bubble('Kept your booking. Nothing changed.');}
function finishCancellation(){
 const r=receipts.find(r=>r.id===cancelTarget);if(!r||r.cancelled||busy)return;
 cancelTarget=null;r.cancelled=true;r.summary='Cancelled · No demo charge';r.revision=(r.revision||1)+1;focusedReceipt=r.id;
 if(reservation?.code===r.id)reservation=null;
 $('chat-action').replaceChildren();recall(r,'Cancelled');activity('Tool · cancel_reservation','Demo record marked cancelled','finding');activity('Decision','Cancel the selected request','decision','You explicitly confirmed; other requests are unchanged.');activity('Memory updated','Cancelled status saved for this session','finding');activity('Result',r.id+' · Cancelled','result');
 traceRows('cancel-reservation',[['search_memory','Used','Located your saved request'],['find_reservations','Used','Verified the request was active'],['cancel_reservation','Used','Changed the demo record after approval'],['update_memory','Used','Replaced active status with cancelled'],['create_reservation','Not selected','No replacement booking requested']]);
 showPolicy('Fictional cancellation policy: no fee. Only the selected demo request is cancelled. Other receipts remain unchanged. No hotel or payment service was contacted.');
 r.activity=$('decision-messages').innerHTML;r.tools=$('tool-list').innerHTML;r.policy=$('evidence-content').textContent;renderReceipts(r.id);refreshMemory();bubble(`Cancelled ${r.id}. I’ll remember that status for this session. Other bookings are unchanged.`);suggest(prompts.room);
}
function changeRequest(r,text){
 if(r.cancelled){recall(r,'Cancelled');bubble('That booking is cancelled. Start a new room search to book again.');suggest(prompts.room);return;}
 if(r.intent!=='room'){bubble('For this version, date and room changes are available for room bookings. You can cancel this request or review its receipt.');openReceipt(r);return;}
 focusedReceipt=r.id;editingId=r.id;pending=null;roomStage='dates';selectedRoom=null;stayDraft={...r.room.stay};dateForm();recall(r,'New dates');activity('Decision','Collect dates, then recheck price and availability','decision','Your current booking stays active until you confirm the change.');traceRows('change-reservation',[['search_memory','Used','Recalled saved dates and guest count'],['find_reservations','Used','Read current booking'],['update_reservation','Not called','New details and approval required'],['cancel_reservation','Not selected','Changing is not cancelling']]);
 const dates=Conversation.dates(text,localToday());if(dates){try{const stay=Booking.stay(dates[0],dates[1],r.room.stay.guests,localToday());searchRooms(stay);}catch(e){bubble(e.message);}}else bubble('What are your new check-in and check-out dates? I’ve kept your guest count below.');
}
function answer(r,kind){
 focusedReceipt=r.id;recall(r,'Answer');let reply;
 if(kind==='cancel-policy')reply='This fictional demo has no cancellation fee. I’ll ask you to confirm before cancelling anything.';
 else if(kind==='explain'){const temp=document.createElement('div');temp.innerHTML=r.activity;reply=Array.from(temp.querySelectorAll('.message-decision p,.message-decision .message-note')).map(n=>n.textContent).join(' ')||'The result followed the saved checks and your confirmation.';$('tool-list').innerHTML=r.tools;$('tool-trace').hidden=false;$('tool-trace').open=true;}
 else if(r.cancelled)reply=`${r.id} is cancelled. It is no longer an active booking.`;
 else if(r.intent==='room'){const b=r.room;reply=kind==='price'?`${Booking.money(b.quote.total)} total: ${Booking.money(b.quote.subtotal)} room cost + ${Booking.money(b.quote.tax)} demo tax.`:kind==='reference'?`Your confirmation is ${r.id}.`:kind==='dates'?`${dateLabel(b.stay.start)}–${dateLabel(b.stay.end)}, ${b.stay.nights} nights, ${b.stay.guests} guests.`:`${b.room.name}, ${dateLabel(b.stay.start)}–${dateLabel(b.stay.end)}, ${b.stay.guests} guests. ${Booking.money(b.quote.total)} total. Reference ${r.id}.`;}
 else reply=`${r.title}: ${r.summary}. Reference ${r.id}.`;
 activity('Decision','Answer from the saved record','decision','A question does not authorize a booking change.');activity('Answer',reply,'result');bubble(reply);
 if(kind!=='explain')traceRows('booking-question',[['search_memory','Used','Retrieved the matching receipt'],['find_reservations','Used','Read saved details and current status'],['update_reservation','Not selected','Read-only question'],['cancel_reservation','Not selected','No cancellation approved']]);
}
saveReceipt=function(intent,summary,code){if(intent==='upgrade'&&reservation&&$('decision-messages').textContent.includes('Upgrade approved')){reservation.upgradeUsed=true;const stayReceipt=receipts.find(r=>r.id===reservation.code);if(stayReceipt)stayReceipt.room.upgradeUsed=true;}
 const oldId=code||editingId;const old=receipts.find(r=>r.id===oldId);const revision=(old?.revision||0)+1;saveOriginal(intent,summary,code);const r=receipts.find(r=>r.id===oldId)||receipts[receipts.length-1];r.revision=revision;focusedReceipt=r.id;cancelTarget=null;refreshMemory();activity('Memory saved',`Receipt ${r.id} · Revision ${revision}`,'finding','Available for follow-up questions in this session.');r.activity=$('decision-messages').innerHTML;};
openReceipt=function(r){if(busy)return;lookupMiss=null;lookupConfirmation=null;cancelTarget=null;selection=null;roomStage=null;editingId=null;pending=null;$('chat-action').replaceChildren();$('quick-replies').replaceChildren();focusedReceipt=r.id;if(r.intent==='room'&&!r.cancelled)reservation=structuredClone(r.room);openOriginal(r);if(r.cancelled){$('receipt-actions').replaceChildren();$('status').textContent='Cancelled';}else $('receipt-actions').append(actionButton('Cancel request',()=>cancelPreview(r)));};
editReceipt=function(r){cancelTarget=null;selection=null;focusedReceipt=r.id;if(r.cancelled){bubble('This request is cancelled. Create a new booking instead.');return;}editOriginal(r);};
restart=function(){lookupMiss=null;lookupConfirmation=null;cancelTarget=null;selection=null;focusedReceipt=null;restartOriginal();refreshMemory();};$('restart').onclick=restart;
submit=function(raw){
 const text=raw.trim();if(!text||busy)return;
 const ack=Conversation.acknowledgement(text);
 if(lookupConfirmation&&ack){$('chat-input').value='';bubble(text,'user');if(ack==='yes')confirmLookup();else{lookupConfirmation=null;lookupBooking('review my booking');}return;}
 if(selection&&ack){$('chat-input').value='';bubble(text,'user');bubble('Please choose a full reference below so I use the right booking.');return;}
 if(ack&&lookupMiss){$('chat-input').value='';bubble(text,'user');bubble(`There isn’t a matching booking for ${lookupMiss} yet. Please provide the full reference or select a saved receipt.`);return;}
 if(!ack)lookupMiss=null;
 if(ack&&!cancelTarget&&roomStage!=='confirm'){$('chat-input').value='';bubble(text,'user');bubble('What would you like to do next: review a booking, change dates, or cancel?');return;}

 if(roomStage&&/^(cancel|never mind|nevermind|stop)[.!]?$/i.test(text)){roomStage=null;editingId=null;$('chat-action').replaceChildren();$('chat-input').value='';bubble(text,'user');bubble('Stopped the draft. Your saved bookings are unchanged.');return;}
 const route=Conversation.route(text),datePair=roomStage==='dates'?Conversation.dates(text,localToday()):null;
 if(datePair){$('chat-input').value='';bubble(text,'user');try{searchRooms(Booking.stay(datePair[0],datePair[1],Number(text.match(/\b([1-4])\s*(?:guests?|adults?|people)/i)?.[1]||stayDraft?.guests||2),localToday()));}catch(e){bubble(e.message);}return;}
 if(cancelTarget&&/^(yes|confirm|confirm cancellation|cancel it)[.!]?$/i.test(text)){$('chat-input').value='';bubble(text,'user');finishCancellation();return;}
 if(cancelTarget&&/^(no|never mind|nevermind|stop)[.!]?$/i.test(text)){$('chat-input').value='';bubble(text,'user');keepBooking();return;}
 if(selection){const r=selection.matches.find(r=>text.toUpperCase().includes(r.id));if(r){const cb=selection.callback;selection=null;$('chat-action').replaceChildren();bubble(text,'user');$('chat-input').value='';cb(r);return;}}
 if(!route){lookupConfirmation=null;if(['upgrade','checkout'].includes(classify(text))&&!reservation){$('chat-input').value='';bubble(text,'user');bubble('I need an active room booking for that. Find a room first, or open an existing room receipt.');suggest(prompts.room);return;}if(cancelTarget){cancelTarget=null;$('chat-action').replaceChildren();}submitOriginal(text);return;}
 $('chat-input').value='';bubble(text,'user');$('quick-replies').replaceChildren();
 if(route==='lookup'){lookupBooking(text);return;}
 lookupConfirmation=null;
 if(route==='greeting'){bubble('Hi Maya. Find a room, change a booking, or ask me about your stay.');return;}
 if(route==='keep'){keepBooking();return;}
 if(route==='memory'){refreshMemory();$('stay-memory').open=true;bubble(receipts.length?'I remember the demo receipts shown under Your stay, including changes and cancellations. This memory resets with New chat or reload.':'No confirmed stay is saved yet. Find a room to start.');return;}
 if(route==='change'||route==='cancel'){cancelTarget=null;selection=null;pending=null;roomStage=null;$('chat-action').replaceChildren();findTarget(text,r=>route==='change'?changeRequest(r,text):cancelPreview(r));return;}
 findTarget(text,r=>answer(r,route));
};
refreshMemory();
// Keep the newest reply in view when a demo window is resized.
window.addEventListener('resize',followChat);
// Existing room/dining/upgrade runs use the same visible decision summary.
const renderToolsOriginal=renderTools;
renderTools=function(intent,data){renderToolsOriginal(intent,data);const rows=Array.from($('tool-list').querySelectorAll('.tool-row')).map(row=>[row.querySelector('code').textContent,row.querySelector('span').textContent,row.querySelector('p').textContent]);showDecisionRoute(intent,rows);};
