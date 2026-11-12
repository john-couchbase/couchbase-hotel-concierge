/* One event vocabulary for recorded backend activity and labeled sample events. */
const TraceModel=(()=>{
 function events(run,record){
  if(run.live)return run.traceEvents||[];
  if(!record)return [];
  const meta={example:true,run_id:record.id,trace:{verified:false,status:'Browser-only sample'}};
  const result=[{...meta,type:'request',text:record.request||'Guest request',timestamp:record.events[0]?.time},
   {...meta,...run.selection,type:'selection',timestamp:record.events[0]?.time}];
  for(const e of record.events){if(!['Running','Returned','Failed'].includes(e.state))continue;
   result.push({...meta,type:'tool',name:e.tool,state:e.state,call_id:record.id+'-'+e.tool,timestamp:e.time,arguments:e.arguments||{},output:e.result||{summary:e.output}});
  }
  if(record.status==='Complete')result.push({...meta,type:'answer',text:record.response||record.result,timestamp:record.events.at(-1)?.time});
  return result;
 }
 function resultText(o={}){
  if(o.error)return o.error;
  if(o.tier)return o.tier+' membership';
  if(o.bookings)return o.bookings.length+' saved booking'+(o.bookings.length===1?'':'s');
  if(o.opens!==undefined)return o.name+' is open '+o.opens+':00–'+o.closes+':00';
  if(o.booked===false)return o.reason||'No booking created';
  if(o.booked)return 'Table confirmed for '+o.guests+' at '+o.hour+':00';
  if(o.room)return o.room+(o.extra_charge===0?', no extra charge':'');
  return o.summary||'Result returned to the model';
 }
 function describe(e){
  if(e.type==='request')return {kind:'Guest',title:'Guest request',text:e.text,tone:'guest'};
  if(e.type==='selection')return {kind:'Policy',title:e.policies?.map(p=>p.title).join(' + ')||'Selected instructions',text:e.selection_summary||'Instructions loaded for this request.',tone:'policy'};
  if(e.type==='answer')return {kind:'Reply',title:'Guest response',text:e.text,tone:'reply'};
  return {kind:e.state==='Running'?'Tool call':e.state==='Failed'?'Blocked':'Tool result',title:e.name,text:e.state==='Running'?'Input sent to the application tool':e.state==='Failed'?resultText(e.output):resultText(e.output),tone:e.state==='Running'?'call':e.state==='Failed'?'failed':'result'};
 }
 return {events,describe};
})();
