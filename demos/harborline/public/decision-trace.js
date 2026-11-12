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
  body.addEventListener('wheel',()=>{view.follow=false;follow.hidden=false;},{passive:true});body.addEventListener('touchstart',()=>{view.follow=false;follow.hidden=false;},{passive:true});
  body.addEventListener('click',e=>{if(e.target.closest('summary')){view.follow=false;follow.hidden=false;}});
  follow.onclick=()=>{view.follow=true;follow.hidden=true;draw(run,true);};
  top.append(follow);box.append(top,tabs,body);host.append(box);
  view={box,body,buttons,selected:0,follow:true,key:'',run};
 }
 function line(parent,title,value,kind=''){const row=el('section','','dt-evidence '+kind);row.append(el('h4',title),el('p',value));parent.append(row);return row;}
 function code(parent,title,value){const d=el('details','','dt-payload');d.append(el('summary',title),el('pre',typeof value==='string'?value:JSON.stringify(value,null,2)));parent.append(d);return d;}
 function evidence(run){return TraceModel.events(run,run.live?null:DemoCatalog.list().find(x=>x.id===run.traceId));}
 function draw(run,force=false){
  const events=evidence(run),selection=run.selection;
  const active=run.phase===2?2:run.tools.some(t=>t.state==='Running')?1:0;
  if(view.follow)view.selected=3;
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
   const summary=el('div','','dt-session-head');
   const saved=events.filter(e=>e.trace?.verified).length;
   summary.append(el('strong','Session trace'),el('span',run.live?saved+' records verified':'Sample records','dt-mode'));content.append(summary);
   const flow=el('div','','dt-handoff');flow.setAttribute('aria-label','Backend handoff');
   const stages=['Request','Catalog','Tools','Reply'];
   const latest=events.at(-1),position=latest?.type==='answer'?3:latest?.type==='tool'?2:latest?.type==='selection'?1:0;
   stages.forEach((name,i)=>{const n=el('span',name);n.dataset.current=String(i===position);n.dataset.complete=String(i<position);flow.append(n);});content.append(flow);
   const ledger=el('ol','','dt-ledger');ledger.setAttribute('aria-label','Ordered execution records');
   events.forEach((e,i)=>{
    const item=el('li'),d=el('details','','dt-log'),description=TraceModel.describe(e);
    d.dataset.key='event-'+(e.call_id||e.type)+'-'+e.state+'-'+i;d.dataset.tone=description.tone;d.dataset.current=String(i===events.length-1);
    const head=el('summary'),text=el('span','','dt-log-label');text.append(el('span',description.kind,'dt-kind'),el('strong',e.type==='tool'?label(e.name):description.title));
    head.append(text,el('span',String(i+1).padStart(2,'0'),'dt-order'));d.append(head);
    const payload=el('div','','dt-log-body');payload.append(el('p',description.text));
    if(e.type==='selection'){
     payload.append(el('p',(e.selected_tools||[]).map(label).join(', '),'dt-log-tools'));
     const raw=code(payload,'Policy record',{policies:e.policies,selected_tools:e.selected_tools});raw.dataset.key=d.dataset.key+'-raw';
    }else if(e.type==='tool'){
     const raw=code(payload,e.state==='Running'?'Input':'Returned data',e.state==='Running'?e.arguments:e.output);raw.dataset.key=d.dataset.key+'-raw';
    }
    payload.append(el('span',e.example?'Sample event, not saved in Agent Tracer':e.trace?.verified?'Saved and read back from Agent Tracer':e.trace?.status||'Trace not verified','dt-log-status'));
    const meta=code(payload,'Record identifiers',{run_id:e.run_id,call_id:e.call_id,record_id:e.trace?.record_id||'Sample only',timestamp:e.timestamp});meta.dataset.key=d.dataset.key+'-meta';
    d.append(payload);item.append(d);ledger.append(item);
   });content.append(ledger);
   if(!events.length)line(content,'Waiting for the first record','The request, policy and tool calls appear here as they happen.');
  }
  view.body.replaceChildren(content);for(const d of view.body.querySelectorAll('details'))if(opened.has(d.dataset.key))d.open=true;view.body.scrollTop=scroll;
  if(view.follow&&view.selected===3&&events.length!==view.eventCount){const last=view.body.querySelector('.dt-ledger li:last-child');if(last)view.body.scrollTop=Math.max(0,last.offsetTop-view.body.offsetTop-view.body.clientHeight+last.offsetHeight);}
  view.eventCount=events.length;
 }
 StableActivity.render=function(root,run){original(root,run);const host=root._stableView?.review?.querySelector('.sa-review-content');if(!host)return;
  if(current!==run||!view||!host.contains(view.box)){current=run;host.classList.add('dt-host');mount(host,run);}
  draw(run);
 };
})();
