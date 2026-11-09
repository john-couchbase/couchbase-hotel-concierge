/* Upgrade → remembered allowance → dining, using the existing panels and receipts. */
let guidedRun=null;
const clearBeforeGuided=clearActivity;
clearActivity=function(){guidedRun=null;$('decision-route').classList.remove('stable-activity');clearBeforeGuided();};
const executeBeforeGuided=execute;
execute=async function(intent){
 if(!['upgrade','dining','checkout'].includes(intent))return executeBeforeGuided(intent);
 pending=null;const id=++version,data=plan(intent);
 if(intent==='upgrade'&&data.decision!=='Upgrade approved'&&($('used').value==='yes'||reservation?.upgradeUsed))data.decision='No second upgrade';
 const fixture=GuidedScenario.create(intent,{tier:$('tier').value,used:$('used').value==='yes'||!!reservation?.upgradeUsed,available:$('availability').value==='yes',ref:reservation?.code||'',day:diningSlot?.day||'Saturday',guests:diningSlot?.guests||2,departure:reservation?dateLabel(reservation.stay.end):'Monday'});
 clearActivity();stateBusy(true);$('activity-context').textContent=labels[intent];$('status').textContent='Selecting policy';
 const run={...fixture,intent,phase:0,title:'Using the '+(intent==='upgrade'?'upgrade':intent==='checkout'?'checkout':'dining')+' policy',reason:fixture.context,tools:fixture.tools.map(t=>({...t,state:'Selected'})),result:'',saved:''};guidedRun=run;
 showDecisionRoute(intent,run.tools.map(t=>[t.name,'Selected',t.reason]));
 activity('Policy selected',fixture.policy,'finding',fixture.prompt+' · Simulated catalog');
 if(!await wait(1000,id))return;
 for(const tool of run.tools){
  if(!tool.call){tool.state='Not called';continue;}
  run.phase=1;tool.state='Running';run.title='Checking '+tool.name.replaceAll('_',' ');run.reason=tool.reason;$('status').textContent='Checking';
  const row=activity(tool.name,'Checking…','active',tool.reason);renderGuidedRun($('decision-route'));
  if(!await wait(1100,id))return;
  row.remove();tool.state='Returned';activity(tool.name,tool.output,'finding','Simulated tool result');renderGuidedRun($('decision-route'));
  if(!await wait(400,id))return;
 }
 run.phase=2;run.title=data.decision;run.reason=data.reason;$('status').textContent='Decision';activity('Decision',data.decision,'decision',data.reason);
 if(!await wait(700,id))return;
 run.response=data.reply;run.result=data.result;activity('Result',data.result,'result');bubble(data.reply);
 showPolicy(fixture.policy);renderTools(intent,data);
 // Authoritative tool statuses come from executed fixture events, including unsuccessful calls.
 traceRows(intent,run.tools.map(t=>[t.name,t.state==='Returned'?'Used':'Not called',t.state==='Returned'?t.output:t.reason]));
 if(intent==='upgrade'&&data.decision==='Upgrade approved'&&reservation){
  reservation.room={...reservation.room,name:'Deluxe Harbor View'};
  const stay=receipts.find(r=>r.id===reservation.code);if(stay){stay.room.room={...reservation.room};stay.summary=`Deluxe Harbor View · ${Booking.money(reservation.quote.total)} · complimentary upgrade`;stay.revision=(stay.revision||1)+1;stay.savedAt=new Date().toISOString();}
 }
 saveReceipt(intent,data.result);
 run.saved=intent==='upgrade'?(data.decision==='Upgrade approved'?'Saved to this stay: complimentary upgrade used.':'Saved allowance retained; booking unchanged.'):intent==='checkout'?'Checkout result saved for this session.':'Dinner result saved for this session.';
 const receipt=receipts.find(r=>r.id===focusedReceipt);if(receipt)receipt.guidedRun=structuredClone(run);
 $('status').textContent='Complete';stateBusy(false);renderGuidedRun($('decision-route'));$('chat-input').focus();
 if(intent==='upgrade'){
  if(data.decision==='Upgrade approved')$('quick-replies').append(actionButton('Try another upgrade',()=>submit('Can I upgrade my room again?')));
  $('quick-replies').append(actionButton('Plan dinner',()=>submit(prompts.dining)));
 }
};
function renderGuidedRun(root){if(guidedRun)StableActivity.render(root,guidedRun);}
const openBeforeGuided=openReceipt;
openReceipt=function(r){openBeforeGuided(r);if(r.guidedRun){guidedRun=structuredClone(r.guidedRun);const rows=guidedRun.tools.map(t=>[t.name,t.state==='Returned'?'Used':'Not called',t.state==='Returned'?t.output:t.reason]);showDecisionRoute(r.intent,rows);}};
function startUpgradeExample(){
 if(busy)return;
 if(!reservation){
  const start=localToday(),end=new Date(start+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+2);
  const stay=Booking.stay(start,end.toISOString().slice(0,10),2,start),room=Booking.rooms[0];
  reservation={code:'DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase(),stay,room:{...room},quote:Booking.quote(room,stay.nights),upgradeUsed:false};
  $('tier').value='Gold';$('used').value='no';$('availability').value='yes';$('guest-context').textContent='Fictional hotel · Maya Chen, Gold member';
  clearActivity();activity('Sample stay',`${room.name} · ${dateLabel(start)}–${dateLabel(stay.end)} · 2 guests`,'finding');showPolicy('Fictional stay loaded for this walkthrough. No live booking or payment.');
  saveReceipt('room',`${room.name} · ${Booking.money(reservation.quote.total)}`,reservation.code);
  bubble(`Sample stay loaded: ${room.name}, ${dateLabel(start)}–${dateLabel(stay.end)}, 2 guests. I’ll use this fictional booking for the upgrade example.`);
 }
 submit(prompts.upgrade);
}
function offerUpgradeExample(){if(!receipts.length)$('quick-replies').append(actionButton('Try upgrade example',startUpgradeExample));}
const restartBeforeGuided=restart;restart=function(){restartBeforeGuided();offerUpgradeExample();};$('restart').onclick=restart;
offerUpgradeExample();

// Keep the room evidence beside the selected offer until the guest confirms.
const reviewRoomBeforeGuided=reviewRoom;
reviewRoom=function(room){
 const previous=guidedRun?.intent==='room'?structuredClone(guidedRun):null;
 reviewRoomBeforeGuided(room);
 if(previous){
  guidedRun=previous;guidedRun.phase=2;guidedRun.title=room.name;
  guidedRun.result=Booking.money(Booking.quote(room,stayDraft.nights).total)+' total · Awaiting your confirmation';
  guidedRun.saved=editingId?'Your existing booking is unchanged.':'No reservation created yet.';
  showDecisionRoute('room',[]);renderGuidedRun($('decision-route'));
 }
};

// Cancellation keeps its existing approval gate and records only actions performed.
const cancelPreviewBeforeGuided=cancelPreview;
cancelPreview=function(r){
 cancelPreviewBeforeGuided(r);
 const run={intent:'cancel',prompt:'cancel-reservation',policy:'Cancel only the selected active request after explicit approval. No demo fee.',phase:1,title:r.cancelled?'Already cancelled':'Confirm cancellation',reason:'Your booking stays unchanged until you confirm.',result:'',saved:'',tools:[
  {name:'search_memory',state:'Returned',reason:'Locate the selected saved request.',output:r.id},
  {name:'find_reservations',state:'Returned',reason:'Verify its current status.',output:r.cancelled?'Already cancelled':'Active booking'},
  {name:'cancel_reservation',state:'Selected',reason:'Explicit approval is required.',output:'Demo booking cancelled'},
  {name:'update_memory',state:'Selected',reason:'Save the resulting cancellation status.',output:'Cancelled status saved for this session'}
 ]};
 if(r.cancelled){run.phase=2;run.result='Already cancelled · Nothing changed';for(const t of run.tools.slice(2)){t.state='Not called';t.reason='This request was already cancelled.';}}
 guidedRun=run;renderGuidedRun($('decision-route'));
};
const keepBookingBeforeGuided=keepBooking;
keepBooking=function(){
 const run=guidedRun?.intent==='cancel'?guidedRun:null;
 keepBookingBeforeGuided();
 if(!run)return;
 for(const t of run.tools.slice(2)){t.state='Not called';t.reason='You chose to keep the booking.';}
 run.phase=2;run.title='Booking kept';run.result='Booking unchanged';run.saved='Existing booking retained.';
 guidedRun=run;renderGuidedRun($('decision-route'));
};
const finishCancellationBeforeGuided=finishCancellation;
finishCancellation=function(){
 const r=receipts.find(r=>r.id===cancelTarget),run=guidedRun?.intent==='cancel'?guidedRun:null;
 if(!r||r.cancelled||busy)return;
 finishCancellationBeforeGuided();
 if(!run)return;
 for(const t of run.tools.slice(2))t.state='Returned';
 run.phase=2;run.title='Booking cancelled';run.result=r.id+' · Cancelled';run.saved='Cancelled status saved for this session.';
 guidedRun=run;renderGuidedRun($('decision-route'));r.guidedRun=structuredClone(run);
};
