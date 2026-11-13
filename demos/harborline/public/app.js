const $=id=>document.getElementById(id);
let pending=null,busy=false,version=0;
let receipts=[],editingId=null;
let roomStage=null,stayDraft=null,selectedRoom=null,reservation=null,diningSlot=null;
const prompts={room:'I’d like to find a room.',upgrade:'Can I upgrade my room?',dining:'Can you help me book dinner?',checkout:'Could I have a late checkout?'};
const labels={room:'Find a room',upgrade:'Room upgrade',dining:'Dinner reservation',checkout:'Late checkout'};
function bubble(text,who='assistant'){
 if(who==='assistant')text=text.replace(/\s*[—–]\s*/g,', ').replace(/\s+-\s+/g,', ').replace(/^\s*-\s+/gm,'').replace(/,\s*,/g,',');
 const li=document.createElement('div');li.className=`chat-bubble ${who}`;
 const label=document.createElement('span');label.className='chat-author';label.textContent=who==='user'?'You':'Concierge';
 const body=document.createElement('p');body.textContent=text;li.append(label,body);
 if(text.length>280){const more=document.createElement('details'),summary=document.createElement('summary'),full=document.createElement('p');summary.textContent='Read full message';full.textContent=text;full.tabIndex=0;more.className='message-more';more.append(summary,full);body.textContent=text.slice(0,220).replace(/\s+\S*$/,'')+'…';li.append(more);}$('chat-log').append(li);$('chat-log').scrollTop=$('chat-log').scrollHeight;
}
function activity(label,text,kind='finding',note=''){
 const li=document.createElement('li');li.className=`message message-${kind}`;
 const title=document.createElement('span');title.className='message-label';title.textContent=label;
 const p=document.createElement('p');p.textContent=text;li.append(title,p);
 if(note){const small=document.createElement('span');small.className='message-note';small.textContent=note;li.append(small)}
 $('decision-messages').append(li);return li;
}
function stateBusy(value){busy=value;$('send').disabled=value;$('chat-input').disabled=value;document.querySelectorAll('[data-intent],.receipt-card,#receipt-actions button,.quick-replies button,#chat-action button,#chat-action input,#chat-action select').forEach(b=>b.disabled=value);}
function clearActivity(){ if($('decision-route'))$('decision-route').hidden=true; $('receipt-actions').replaceChildren();$('tool-trace').hidden=true;$('tool-trace').open=false; $('decision-messages').replaceChildren();$('evidence').hidden=true;$('evidence').open=false; }
function suggest(text){$('quick-replies').replaceChildren();const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>submit(text);$('quick-replies').append(b)}
function classify(text){const t=text.toLowerCase();const hits=[];if(/upgrad/.test(t))hits.push('upgrade');if(/\b(dinner|restaurant|table|dining)\b/.test(t))hits.push('dining');if(/late.*check.?out|check.?out.*late/.test(t))hits.push('checkout');if(!hits.includes('upgrade')&&/find.*room|get.*room|book.*room|room.*book|need.*room|like.*room|reserve.*room|room.*available|room.*availability/.test(t))hits.push('room');return hits.length===1?hits[0]:null;}
function detailsReady(intent,text){const t=text.toLowerCase();if(intent==='room')return /friday/.test(t)&&/monday/.test(t)&&/\b(2|two)\b/.test(t);if(intent==='dining'&&diningSlot&&text===diningSlot.prompt)return true;if(intent==='dining')return /saturday/.test(t)&&/8\s*(pm|p\.m\.)/.test(t)&&/\b(2|two)\b/.test(t);return true;}
function ask(intent){pending=intent;clearActivity();$('status').textContent='Needs details';$('activity-context').textContent=labels[intent];activity('Details needed','Dinner time and party size','request');
 const guests=reservation?.stay.guests||2;const date=reservation?.stay.start||localToday();const day=dateLabel(date);diningSlot={guests,date,day,prompt:`${day} at 8 pm, ${guests} guests`};
 bubble(reservation?`Dinner for ${guests} on your arrival evening? Try the suggested 8 pm slot.`:'Which day, time, and party size? Try the sample reservation below.');suggest(diningSlot.prompt);}

function plan(intent){const available=$('availability').value==='yes',tier=$('tier').value,used=$('used').value==='yes'||Boolean(reservation?.upgradeUsed);
 if(intent==='room')return {checks:[['Stay','Friday–Monday · 3 nights'],['Guests','2 adults'],['Room inventory',available?'Harbor King available':'No rooms available',available]],decision:available?'Room found':'No matching room',reason:available?'The sample room fits both guests for all three nights.':'The demo inventory has no room for this stay.',result:available?'Harbor King · Available to review':'No booking made',reply:available?'A Harbor King is available for your sample Friday–Monday stay for two. This is a simulated offer; no room has been booked.':'No room is available for that sample stay. No booking was made.',policy:'Sample stay: Friday–Monday, 2 adults. Return an offer only; booking requires a separate confirmation.'};
 if(intent==='dining'){const n=diningSlot?.guests||2,day=diningSlot?.day||'Saturday';return {checks:[['Restaurant hours',`${day} · Open 5–11 pm`],['Table inventory',available?`8 pm · Table for ${n} available`:`No table for ${n} at 8 pm`,available]],decision:available?'Table available':'Requested time unavailable',reason:available?'Opening hours and party size both fit.':'No table matches the requested time.',result:available?`Skyline Rooftop · ${day}, 8 pm`:'No booking made',reply:available?`Dinner confirmed for ${n} at Skyline Rooftop, ${day} at 8 pm. `:'No table is available at 8 pm in this scenario. Nothing was booked.',policy:'Fictional restaurant: open daily 5–11 pm. Suggested dinner uses the arrival date and party size from your demo room booking, when available.'};}
 if(intent==='checkout')return {checks:[['Reservation',reservation?`Maya Chen · ${dateLabel(reservation.stay.end)}`:'Maya Chen · Sample departure Monday'],['Departure schedule',available?'Room can be held until 2 pm':'Room needed for next arrival',available]],decision:available?'Late checkout approved':'Standard checkout applies',reason:available?'The sample departure schedule allows a later checkout.':'The next arrival needs the room.',result:available?`${reservation?dateLabel(reservation.stay.end):'Monday'} · 2 pm · No extra charge`:`${reservation?dateLabel(reservation.stay.end):'Monday'} · 11 am`,reply:available?`Your demo checkout is ${reservation?dateLabel(reservation.stay.end):'Monday'} at 2 pm, at no extra charge.`:'Late checkout isn’t available in this scenario. Your checkout remains at 11 am.',policy:'Fictional policy: complimentary checkout until 2 pm if the room is not needed for the next arrival. Standard checkout: 11 am.'};
 const eligible=tier!=='Silver',ok=eligible&&!used&&available;const checks=[['Membership',`${tier} · ${eligible?'Eligible':'Not eligible'}`,eligible]];
 if(eligible)checks.push(['Stay allowance',used?'Upgrade already used':'Upgrade not yet used',!used]);if(eligible&&!used)checks.push(['Room inventory',available?'Deluxe Harbor View available':'No upgrade room available',available]);
 return {checks,decision:ok?'Upgrade approved':used?'No second upgrade':'Original room kept',reason:!eligible?'Complimentary upgrades require Gold or Platinum.':used?'Only one complimentary upgrade is allowed per stay.':!available?'No upgrade room is available.':'Membership, allowance, and room availability all meet the policy.',result:ok?'Deluxe Harbor View · No extra charge':'Reservation unchanged',reply:ok?'Upgraded to Deluxe Harbor View at no extra charge.':!eligible?'Your membership doesn’t include a complimentary upgrade. Your original room is kept.':used?'Your complimentary upgrade has already been used this stay. Your reservation is unchanged.':'You’re eligible, but no upgrade room is available. Your original room is kept.',policy:'Gold or Platinum membership; one complimentary upgrade per stay; subject to availability. Maya has a sample Friday–Monday reservation.'};
}
async function wait(ms,id){let elapsed=0;while(elapsed<ms){await new Promise(r=>setTimeout(r,100));if(id!==version)return false;if(!document.hidden)elapsed+=100;}return id===version;}
async function execute(intent){pending=null;const id=++version,data=plan(intent);clearActivity();stateBusy(true);$('activity-context').textContent=labels[intent];$('status').textContent='Checking';
 for(const [label,finding,passed=true] of data.checks){const row=activity(label,'Checking…','active');if(!await wait(850,id))return;row.remove();activity(label,finding,passed?'finding':'blocked',({'Membership':'check_loyalty_tier','Stay allowance':'find_reservations','Room inventory':'find_reservations','Restaurant hours':'get_outlet_hours','Table inventory':'book_restaurant · availability check','Reservation':'find_reservations','Departure schedule':'check_departure_schedule'}[label]||'')+' · Simulated');}
 $('status').textContent='Decision';activity('Decision',data.decision,'decision',data.reason);if(!await wait(650,id))return;activity('Result',data.result,'result');bubble(data.reply);$('evidence-content').textContent=data.policy;$('evidence').hidden=false;$('status').textContent='Complete';renderTools(intent,data);saveReceipt(intent,data.result);stateBusy(false);$('chat-input').focus();}
function localToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function dateLabel(value){return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));}
function followChat(){requestAnimationFrame(()=>{$('chat-log').scrollTop=$('chat-log').scrollHeight;});}
function actionButton(text,fn,primary=false){const b=document.createElement('button');b.type='button';b.className=primary?'booking-primary':'quiet-button';b.textContent=text;b.onclick=fn;return b;}
function showPolicy(text){$('evidence-content').textContent=text;$('evidence').hidden=false;}
function startRoom(){editingId=null;pending=null;roomStage='dates';selectedRoom=null;stayDraft=null;clearActivity();$('quick-replies').replaceChildren();$('activity-context').textContent='Find a room';$('status').textContent='Your stay';activity('Need to know','Dates and number of guests','request');bubble('When are you staying, and how many guests?');dateForm();}
function dateForm(){const root=$('chat-action');root.replaceChildren();const form=document.createElement('form');form.className='stay-form';
 const today=localToday();let end=new Date(today+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+2);
 form.innerHTML='<div class="stay-fields"><label>Check-in<input id="stay-start" type="date" required></label><label>Check-out<input id="stay-end" type="date" required></label><label>Guests<select id="stay-guests"><option value="1">1 guest</option><option value="2" selected>2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select></label></div><p id="stay-error" class="form-error" role="alert"></p><button type="submit" class="booking-primary">Find rooms</button>';
 root.append(form);$('stay-start').min=today;$('stay-end').min=today;$('stay-start').value=stayDraft?.start||today;$('stay-end').value=stayDraft?.end||end.toISOString().slice(0,10);$('stay-guests').value=stayDraft?.guests||2;followChat();
 form.onsubmit=e=>{e.preventDefault();if(busy)return;try{const stay=Booking.stay($('stay-start').value,$('stay-end').value,$('stay-guests').value,localToday());bubble(`${dateLabel(stay.start)}–${dateLabel(stay.end)} · ${stay.guests} guests`,'user');searchRooms(stay);}catch(err){$('stay-error').textContent=err.message;}};
}
async function searchRooms(stay){stayDraft=stay;roomStage='searching';const id=++version,available=$('availability').value==='yes';clearActivity();if(editingId)activity('Memory recalled',`Editing ${editingId} · ${stay.guests} guests retained`,'finding','Confirmed booking stays unchanged until approval.');$('chat-action').replaceChildren();stateBusy(true);$('status').textContent='Checking';$('activity-context').textContent=`${dateLabel(stay.start)}–${dateLabel(stay.end)} · ${stay.nights} nights · ${stay.guests} guests`;
 const options=available?Booking.rooms.filter(r=>r.capacity>=stay.guests):[];
 const run={intent:'room',prompt:'room_search_policy',phase:0,title:'Checking your stay',policy:'Match dates, guest capacity and availability. Show full demo prices before asking for confirmation.',reason:'Find rooms that fit this stay.',result:'',saved:'',tools:[
 {name:'validate_stay',reason:'Check the dates and number of nights.',output:`${dateLabel(stay.start)}–${dateLabel(stay.end)} · ${stay.nights} nights`,state:'Selected'},
 {name:'search_rooms',reason:'Only offer available rooms that fit every guest.',output:`${options.length} matching rooms · ${stay.guests} guests`,state:'Selected'},
 {name:'quote_room',reason:'Include all nights and the 10% demo tax.',output:options.length?options.map(r=>`${r.name}: ${Booking.money(Booking.quote(r,stay.nights).total)}`).join(' · '):'No available rooms to price.',state:'Selected'}]};
 guidedRun=run;showDecisionRoute('room',[]);renderGuidedRun($('decision-route'));
 for(const tool of run.tools){
 if(tool.name==='quote_room'&&!options.length){tool.state='Not called';tool.reason='No available rooms to price.';continue;}
 run.phase=1;run.reason=tool.reason;tool.state='Running';renderGuidedRun($('decision-route'));
 const row=activity(tool.name,'Checking…','active','Simulated room function');if(!await wait(850,id))return;
 row.remove();tool.state='Returned';activity(tool.name,tool.output,'finding','Simulated room function');renderGuidedRun($('decision-route'));
 }
 run.phase=2;run.title=options.length?`${options.length} rooms fit your stay`:'No matching rooms';run.result=options.length?'Choose a room to review the total.':'Nothing booked. Try different dates or availability.';run.saved=editingId?'Your existing booking is unchanged.':'No reservation created yet.';renderGuidedRun($('decision-route'));
 showPolicy('Fictional USD rates: King $189/night, Twin $219/night, Suite $289/night. 10% demo tax; no other fees. Capacity: King 2; Twin/Suite 4. Rates are fixed demo fixtures, not live prices.');
 stateBusy(false);$('status').textContent=options.length?'Choose a room':'No availability';roomStage=options.length?'choice':'dates';
 bubble(options.length?'Choose a room. Totals include 10% tax.':'No rooms are available in this demo scenario. Nothing was booked.');
 if(options.length)renderRooms(options);else dateForm();
}
function renderRooms(options){const root=$('chat-action');root.replaceChildren();const list=document.createElement('div');list.className='room-options';
 for(const room of options){const q=Booking.quote(room,stayDraft.nights),b=document.createElement('button');b.type='button';b.className='room-option';b.innerHTML=`<span><strong>${room.name}</strong><small>${room.detail}</small></span><span class="room-price"><strong>${Booking.money(q.total)}</strong><small>${Booking.money(room.rate)} / night</small></span>`;b.onclick=()=>{if(!busy){bubble(room.name,'user');reviewRoom(room);}};list.append(b);}root.append(list);const note=document.createElement('p');note.className='price-note';note.textContent=`Total for ${stayDraft.nights} nights · USD · Sample prices`;root.append(note);root.append(actionButton('Change dates',()=>{roomStage='dates';dateForm();}));followChat();}
function reviewRoom(room){selectedRoom=room;roomStage='confirm';const q=Booking.quote(room,stayDraft.nights);$('chat-action').replaceChildren();clearActivity();$('status').textContent='Review';activity('Selected room',room.name);activity('Room cost',`${Booking.money(room.rate)} × ${stayDraft.nights} nights = ${Booking.money(q.subtotal)}`);activity('Demo tax',`${Booking.money(q.tax)} · 10%`);activity('Total',Booking.money(q.total),'result');activity('Decision','Waiting for your confirmation','decision',editingId?'Your saved booking is unchanged until you confirm.':'No reservation has been created.');bubble(`${room.name}, ${dateLabel(stayDraft.start)}–${dateLabel(stayDraft.end)}. Your total is ${Booking.money(q.total)}. Confirm this booking?`);const actions=$('chat-action');actions.className='chat-action';actions.append(actionButton('Confirm demo booking',()=>{bubble('Confirm demo booking','user');confirmRoom();},true),actionButton('Choose another room',()=>{roomStage='choice';renderRooms(Booking.rooms.filter(r=>r.capacity>=stayDraft.guests));}));showPolicy('Price is in USD and includes 10% fictional tax. No payment is collected. Confirmation creates an in-memory demo reservation only.');followChat();}
async function confirmRoom(){if(busy||roomStage!=='confirm')return;const id=++version;stateBusy(true);$('status').textContent='Confirming';
 const bookingRun={intent:'room',prompt:'room_confirmation_policy',phase:1,title:'Confirming your room',policy:'Create or update a demo booking only after guest approval and a final availability check.',reason:'Recheck availability before saving.',result:'',saved:'',tools:[
 {name:'check_room_availability',state:'Running',reason:'Confirm the selected room is still available.',output:''},
 {name:editingId?'update_reservation':'create_reservation',state:'Selected',reason:'Save only after your confirmation and an available room.',output:''}]};
 guidedRun=bookingRun;showDecisionRoute('room',[]);renderGuidedRun($('decision-route'));
 const check=activity('Final availability','Checking…','active');if(!await wait(700,id))return;check.remove();
 if($('availability').value!=='yes'){
 bookingRun.tools[0].state='Returned';bookingRun.tools[0].output='Selected room is unavailable.';bookingRun.tools[1].state='Not called';bookingRun.tools[1].reason='Availability changed; nothing was saved.';bookingRun.phase=2;bookingRun.title='Room no longer available';bookingRun.result='No booking made.';bookingRun.saved=editingId?'Your existing booking is unchanged.':'No reservation saved.';renderGuidedRun($('decision-route'));
 activity('Availability changed','Room no longer available','blocked');bubble('That room is no longer available in the demo inventory. No booking was made.');stateBusy(false);roomStage='dates';$('status').textContent='Not booked';dateForm();return;}
 const code=editingId||'DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase();reservation={code,upgradeUsed:receipts.find(r=>r.id===code)?.room?.upgradeUsed||false,room:selectedRoom,stay:{...stayDraft},quote:Booking.quote(selectedRoom,stayDraft.nights)};roomStage=null;$('chat-action').replaceChildren();clearActivity();
 guidedRun=bookingRun;bookingRun.tools[0].state='Returned';bookingRun.tools[0].output=selectedRoom.name+' · Available';bookingRun.tools[1].state='Returned';bookingRun.tools[1].output=code;bookingRun.phase=2;bookingRun.title=editingId?'Booking updated':'Booking confirmed';bookingRun.result=code+' · '+Booking.money(reservation.quote.total)+' total';bookingRun.saved=`Saved this session: ${selectedRoom.name} · ${dateLabel(stayDraft.start)}–${dateLabel(stayDraft.end)} · ${stayDraft.guests} guests.`;showDecisionRoute('room',[]);renderGuidedRun($('decision-route'));
 activity('Guest approval','Confirmed by you');activity('Availability','Room still available');activity('Decision',editingId?'Update demo reservation':'Create demo reservation','decision','Guest approval and availability are both confirmed.');activity('Confirmation',code,'result',`${selectedRoom.name} · ${Booking.money(reservation.quote.total)} total`);$('status').textContent='Confirmed';bubble(`Demo booking confirmed: ${code}. ${selectedRoom.name}, ${dateLabel(stayDraft.start)}–${dateLabel(stayDraft.end)}. `);bubble('Would you like dinner plans or a later checkout?');stateBusy(false);$('quick-replies').append(actionButton('Plan dinner',()=>submit(prompts.dining)),actionButton('Late checkout',()=>submit(prompts.checkout)));showPolicy('Demo confirmation only. The reservation exists in this browser session and is cleared by New chat or reload. No hotel or payment system was contacted.');renderTools('room');saveReceipt('room',`${selectedRoom.name} · ${Booking.money(reservation.quote.total)}`,code);const saved=receipts.find(r=>r.id===code);if(saved)saved.guidedRun=structuredClone(bookingRun);renderGuidedRun($('decision-route'));}
function handleRoomText(text){if(roomStage==='dates'){const dates=text.match(/\d{4}-\d{2}-\d{2}/g),guests=text.match(/\b([1-4])\s*(?:guest|adult|people)/i);if(dates?.length===2&&guests){try{searchRooms(Booking.stay(dates[0],dates[1],guests[1],localToday()));return;}catch(e){bubble(e.message);return;}}bubble('Choose dates and guests below, or type YYYY-MM-DD to YYYY-MM-DD, 2 guests.');dateForm();return;}
 if(roomStage==='choice'){const room=Booking.rooms.find(r=>text.toLowerCase().includes(r.name.toLowerCase()));if(room&&room.capacity>=stayDraft.guests){reviewRoom(room);return;}bubble('Choose one of the available room options below.');return;}
 if(roomStage==='confirm'){if(/^(yes|confirm|confirm demo booking|book it)[.!]?$/i.test(text)){confirmRoom();return;}if(/^(no|cancel)[.!]?$/i.test(text)){roomStage=null;$('chat-action').replaceChildren();clearActivity();activity('Result','No booking made','result');$('status').textContent='Cancelled';bubble('No problem. Nothing was booked.');return;}bubble('Use Confirm demo booking to continue, or type cancel.');}}

function submit(raw){const text=raw.trim();if(!text||busy)return;$('chat-input').value='';$('quick-replies').replaceChildren();bubble(text,'user');const detected=classify(text);
 if(detected==='room'){startRoom();return;}
 if(roomStage&&!detected){handleRoomText(text);return;}
 if(detected){roomStage=null;$('chat-action').replaceChildren();}
 if(detected)editingId=null;
 const intent=detected||pending;
 if(!intent){clearActivity();$('status').textContent='Choose a request';$('activity-context').textContent='Four scripted scenarios';bubble('This demo supports finding a room, upgrades, dinner, and late checkout. Choose one below to try it.');return;}
 if((intent==='room'||intent==='dining')&&!detailsReady(intent,text)){if(pending===intent&&!detected){bubble('This scripted demo uses the sample details below. Other dates and party sizes aren’t supported yet.');suggest(diningSlot?.prompt||'Saturday at 8 pm, 2 guests');return;}ask(intent);return;}
 execute(intent);
}
function restart(){version++;receipts=[];editingId=null;renderReceipts();pending=null;roomStage=null;stayDraft=null;selectedRoom=null;reservation=null;diningSlot=null;$('chat-action').replaceChildren();stateBusy(false);$('chat-input').value='';$('chat-log').replaceChildren();$('quick-replies').replaceChildren();clearActivity();$('status').textContent='Ready';$('activity-context').textContent='Checks appear here as you chat.';bubble('Hi Maya. How can I help with your stay?');}
// A concise, inspectable explanation of the scripted route, not model reasoning.
function renderTools(intent,data){
 const ok=intent==='room'||(intent==='upgrade'?data.decision==='Upgrade approved':intent==='dining'?data.decision==='Table available':data.decision==='Late checkout approved');
 const entries=intent==='room'?[
 ['search_rooms','Used','Dates, capacity and sample rates'],[editingId?'update_reservation':'create_reservation','Used','Guest confirmed the room and total'],['apply_upgrade','Not selected','This request is about room booking']
 ]:intent==='dining'?[
 ['get_outlet_hours','Used','Dinner time falls within opening hours'],['book_restaurant',ok?'Used':'Not called',ok?'Table matches the party size':'No matching table'],['get_menu','Not called','Selected for dining; no menu question asked'],['apply_upgrade','Not selected','Unrelated to dinner']
 ]:intent==='upgrade'?[
 ['check_loyalty_tier','Used','Check complimentary upgrade eligibility'],['find_reservations',data.checks.length>1?'Used':'Not called',data.checks.length>1?'Check the stay allowance and availability':'Membership rule already blocks the upgrade'],['apply_upgrade',ok?'Used':'Not called',data.reason],['book_restaurant','Not selected','Unrelated to a room upgrade']
 ]:[['find_reservations','Used','Read departure date'],['check_departure_schedule','Used','Check the next arrival'],['update_checkout',ok?'Used':'Not called',data.reason],['book_restaurant','Not selected','Unrelated to checkout']];
 const root=$('tool-list');root.replaceChildren();
 const route=document.createElement('p');route.className='trace-route';route.textContent='Prompt · '+({room:'room-booking',dining:'dining-and-spa',upgrade:'loyalty-upgrade',checkout:'late-checkout'}[intent]);root.append(route);
 for(const [name,status,why] of entries){const row=document.createElement('div');row.className='tool-row';const title=document.createElement('code');title.textContent=name;const state=document.createElement('span');state.className=status==='Used'?'tool-used':'tool-skipped';state.textContent=status;const note=document.createElement('p');note.textContent=why;row.append(title,state,note);root.append(row);}
 $('tool-trace').hidden=false;
}
function saveReceipt(intent,summary,code){
 const id=code||editingId||'DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase();
 const receipt={id,intent,title:intent==='room'?'Room booking':labels[intent],summary,activity:$('decision-messages').innerHTML,tools:$('tool-list').innerHTML,policy:$('evidence-content').textContent,context:$('activity-context').textContent,diningSlot:diningSlot?{...diningSlot}:null,room:intent==='room'?structuredClone(reservation):null};
 const index=receipts.findIndex(r=>r.id===id);if(index<0)receipts.push(receipt);else receipts[index]=receipt;
 editingId=null;renderReceipts(id);
}
function renderReceipts(active){
 $('receipts').hidden=!receipts.length;const root=$('receipt-list');root.replaceChildren();
 for(const r of receipts){const button=document.createElement('button');button.className='receipt-card';button.type='button';button.disabled=busy;button.setAttribute('aria-pressed',String(r.id===active));const title=document.createElement('strong');title.textContent=r.title;const summary=document.createElement('span');summary.textContent=r.summary;const ref=document.createElement('small');ref.textContent=r.id;button.append(title,summary,ref);button.onclick=()=>openReceipt(r);root.append(button);}
}
function openReceipt(r){
 if(busy)return;clearActivity();$('decision-messages').innerHTML=r.activity;$('tool-list').innerHTML=r.tools;$('tool-trace').hidden=false;showPolicy(r.policy);$('activity-context').textContent=r.id+' · '+r.title;$('status').textContent='Saved';
 $('receipt-actions').append(actionButton('Edit request',()=>editReceipt(r)));renderReceipts(r.id);
}
function editReceipt(r){
 if(busy)return;pending=null;roomStage=null;$('quick-replies').replaceChildren();$('chat-action').replaceChildren();
 if(r.intent==='room'){startRoom();editingId=r.id;stayDraft={...r.room.stay};dateForm();bubble('Update your dates or room. The saved booking changes only after you confirm.');}
 else {editingId=r.id;if(r.intent==='dining')diningSlot=r.diningSlot;clearActivity();$('activity-context').textContent='Edit '+r.title;$('status').textContent='Review changes';bubble('Adjust Demo conditions below, then recheck this request.');$('chat-action').append(actionButton('Recheck '+r.title,()=>{$('chat-action').replaceChildren();execute(r.intent);},true));}
}
$('chat-form').addEventListener('submit',e=>{e.preventDefault();submit($('chat-input').value)});$('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();submit($('chat-input').value)}});
document.querySelectorAll('[data-intent]').forEach(b=>b.onclick=()=>submit(prompts[b.dataset.intent]));$('restart').onclick=restart;
$('theme').onclick=()=>{const dark=document.body.classList.toggle('dark');$('theme').setAttribute('aria-checked',dark);document.querySelector('.logo').src=`assets/couchbase-logo${dark?'-dark':''}.svg`};restart();

$('tier').addEventListener('change',()=>{$('guest-context').textContent=`Fictional hotel · Maya Chen, ${$('tier').value} member`;});
