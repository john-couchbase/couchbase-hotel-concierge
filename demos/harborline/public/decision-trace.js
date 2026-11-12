/* Observable decisions only. Live evidence and scripted examples remain distinct. */
(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const label=n=>DemoCatalog.label(n);
 const original=StableActivity.render;
 let current=null,view=null;
 function mount(host,run){
  const box=el('section','','dt-inspector');box.setAttribute('aria-label','Decision trace');
  const top=el('div','','dt-heading'),title=el('strong','Behind the decision'),mode=el('span',run.live?'Live events':'Scripted example','dt-mode');top.append(title,mode);
  const tabs=el('div','','dt-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Decision evidence');
  const body=el('div','','dt-body');body.id='decision-evidence';body.setAttribute('role','tabpanel');body.tabIndex=0;
  const follow=el('button','Follow steps','dt-follow');follow.type='button';follow.hidden=true;
  const buttons=['Policy','Tools','Results','Trace'].map((name,i)=>{const b=el('button',name);b.type='button';b.id='dt-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls',body.id);b.onclick=()=>{view.selected=i;view.follow=false;follow.hidden=false;draw(run,true);};b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;buttons[next].click();buttons[next].focus();};tabs.append(b);return b;});
  follow.onclick=()=>{view.follow=true;follow.hidden=true;draw(run,true);};
  top.append(follow);box.append(top,tabs,body);host.append(box);
  view={box,body,buttons,selected:0,follow:true,key:'',run};
 }
 function line(parent,title,value,kind=''){const row=el('section','','dt-evidence '+kind);row.append(el('h4',title),el('p',value));parent.append(row);return row;}
 function code(parent,title,value){const d=el('details','','dt-payload');d.append(el('summary',title),el('pre',typeof value==='string'?value:JSON.stringify(value,null,2)));parent.append(d);return d;}
 function evidence(run){
  if(run.live)return run.traceEvents||[];
  const r=DemoCatalog.list().find(x=>x.id===run.traceId);
  return (r?.events||[]).map((e,i)=>({type:'tool',name:e.tool,state:e.state,call_id:'example-'+e.tool,timestamp:e.time,output:e.output?{summary:e.output}:undefined,example:true}));
 }
 function draw(run,force=false){
  const events=evidence(run),selection=run.selection;
  const active=run.phase===2?2:run.tools.some(t=>t.state==='Running')?1:0;
  if(view.follow)view.selected=active;
  const key=JSON.stringify([view.selected,events,selection,run.result,run.saved,run.phase]);if(!force&&key===view.key)return;view.key=key;
  view.buttons.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===view.selected));b.tabIndex=i===view.selected?0:-1;b.dataset.active=String(i===active);});
  view.body.setAttribute('aria-labelledby',view.buttons[view.selected].id);
  const scroll=view.body.scrollTop,opened=new Set([...view.body.querySelectorAll('details[open]')].map(d=>d.dataset.key));
  const content=el('div');
  if(view.selected===0){
   const policies=selection?.policies||[{title:run.prompt,rule:run.policy,version:run.live?'Not recorded':DemoCatalog.version()}];
   if(run.live&&!selection)line(content,'Matching the request','Waiting for policy selection from the server.');
   else{
    line(content,'Chosen instructions',policies.map(p=>p.title).join(' + '),'dt-policy');
    const candidates=selection?.candidates||[];
    for(const p of policies){const match=candidates.find(c=>c.name===p.name);if(match)line(content,'Policy purpose',match.description);const d=code(content,'Rule and version',{policy:p.title,version:p.version,rule:p.rule});d.dataset.key='policy-'+p.title;}
    line(content,'How it was selected',run.live?'Nova Lite selected the policy from request context. The app loaded its matching version from Agent Catalog.':'This example uses a scripted policy match.');
    if(candidates.length){const d=code(content,'Other available policies',candidates.filter(c=>!c.selected).map(c=>({policy:c.title,purpose:c.description})));d.dataset.key='alternatives';}
    line(content,run.live?'Selection summary':'Why this policy',selection?.selection_summary||(run.live?'No selection explanation was recorded for this request.':run.intent==='upgrade'?'The guest asked for an upgrade, so the example checks membership and this stay’s upgrade allowance.':run.intent==='dining'?'The guest asked for dinner, so the example switches to restaurant hours and reservations.':'This request uses the policy and checks shown above.'));
    if(selection?.selection_summary)content.append(el('p','Model-provided summary. Check it against the recorded policy and results.','dt-mode'));
   }
  }
  if(view.selected===1){
   const selected=selection?.selected_tools||run.tools.map(t=>t.name),calls=events.filter(e=>e.type==='tool'&&e.state==='Running'),used=new Set(events.filter(e=>e.type==='tool'&&['Running','Returned','Failed'].includes(e.state)).map(e=>e.name));
   line(content,'Selected versus called',selected.length+' available to the model, '+used.size+' called','dt-tool');
   for(const name of selected){const matching=events.filter(e=>e.name===name),last=matching.at(-1);const row=line(content,label(name),used.has(name)?last?.state==='Failed'?'Call failed':last?.state==='Running'?'Running now':'Result returned':run.phase===2?'Selected, not called':'Selected, waiting');row.append(el('code',name));if(selection?.tool_purposes?.[name])row.append(el('p',selection.tool_purposes[name]));row.dataset.running=String(last?.state==='Running');
    for(const [i,c] of calls.filter(c=>c.name===name).entries()){const result=matching.find(e=>e.call_id===c.call_id&&['Returned','Failed'].includes(e.state));const d=code(row,'Call '+(i+1)+' details',{call_id:c.call_id,input:c.arguments||'Not recorded in this example',result:result?.output||'Waiting for result'});d.dataset.key=c.call_id;}
   }
   if(selection?.excluded_tools?.length){const d=code(content,'Not sent to the model',selection.excluded_tools);d.dataset.key='excluded';}
  }
  if(view.selected===2){
   line(content,run.result?'Guest outcome':'Waiting for the outcome',run.result||'The result will appear after the checks return.','dt-result');
   const results=events.filter(e=>e.type==='tool'&&['Returned','Failed'].includes(e.state));
   for(const [i,e] of results.entries()){const row=line(content,label(e.name),e.state==='Failed'?'Blocked by the tool':'Returned evidence');const d=code(row,'Inspect result',e.output||{});d.dataset.key='result-'+(e.call_id||i);}
   if(!results.length)line(content,'Supporting checks',run.phase===2?'No tool result was recorded for this response.':'No tools have returned yet.');
   if(results.length)line(content,'What supports the outcome','Compare the returned facts above with the selected policy. These are execution records, not private model thoughts.');
  }
  if(view.selected===3){
   if(!run.live)line(content,'Example trace','These events are stored in this browser only. No Agent Tracer write is made.','dt-trace');
   else{const traced=events.filter(e=>e.trace),saved=traced.filter(e=>e.trace.verified),failed=traced.filter(e=>!e.trace.verified);line(content,'Couchbase Agent Tracer',saved.length+' records verified'+(failed.length?', '+failed.length+' not verified':''),'dt-trace');line(content,'Request ID',events.find(e=>e.run_id)?.run_id||'Waiting for the first traced event');}
   for(const [i,e] of events.entries()){const row=line(content,e.type==='tool'?label(e.name)+' — '+e.state:e.type==='selection'?'Policy selected':e.type==='answer'?'Guest response':e.type,e.example?'Scripted event':e.trace?.verified?'Saved and read back':e.trace?.status||'Not verified');if(e.timestamp)row.append(el('time',new Date(e.timestamp).toLocaleTimeString()));const d=code(row,'Record details',{record_id:e.trace?.record_id||'Not available',run_id:e.run_id,call_id:e.call_id,timestamp:e.timestamp});d.dataset.key='trace-'+i;}
   if(!events.length)line(content,'No events yet','Start a guest request to see its trace.');
  }
  view.body.replaceChildren(content);for(const d of view.body.querySelectorAll('details'))if(opened.has(d.dataset.key))d.open=true;view.body.scrollTop=scroll;
 }
 StableActivity.render=function(root,run){original(root,run);const host=root._stableView?.review?.querySelector('.sa-review-content');if(!host)return;
  if(current!==run||!view||!host.contains(view.box)){current=run;host.classList.add('dt-host');mount(host,run);}
  draw(run);
 };
})();
