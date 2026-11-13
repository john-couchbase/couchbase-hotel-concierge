/* Observable policy selection and tool execution, shared by live and sample runs. */
(()=>{
 const previous=StableActivity.render;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
 const set=(n,t)=>{if(n.textContent!==t)n.textContent=t;};
 function mount(root,run){
  const flow=el('div','simple-flow');flow.dataset.size=run.tools.length<=2?'compact':'full';
  const match=el('section','sf-section sf-match'),matchHead=el('h3','','Matching'),policy=el('strong'),reason=el('p');match.append(matchHead,policy,reason);
  const tools=el('section','sf-section sf-tools'),heading=el('div','sf-heading'),status=el('span','sf-status');status.setAttribute('role','status');heading.append(el('h3','','Tools'),status);const list=el('div','sf-tool-list');list.addEventListener('wheel',()=>{root._simple.follow=false;},{passive:true});list.addEventListener('touchstart',()=>{root._simple.follow=false;},{passive:true});const cost=el('small','sf-cost-note',run.live?'Lower cost · model estimate':'Lower cost · sample estimate');cost.title='Illustrative Nova Lite model tier, not tool pricing or your Capella bill. AWS reference: $0.06 per million input tokens and $0.24 per million output tokens. No per-request token measurement is available here. Checked November 13, 2026.';tools.append(heading,cost,list);
  const decision=el('section','sf-section sf-decision'),title=el('strong'),why=el('p');const usedLink=el('a','sf-used-link','View tools used');decision.append(el('h3','','Decision'),title,why,usedLink);
  const details=el('div','sf-actions'),hub=el('button','','Tools Hub'),trace=el('button','','Session trace');hub.type=trace.type='button';hub.onclick=()=>ToolsHub.open();trace.onclick=()=>ActivityTracer.open(run);details.append(hub,trace);const payload=el('span');
  const handoff=el('div','sf-handoff'),handoffText=el('span');handoff.append(handoffText);match.append(handoff);
  flow.append(match,tools,decision,details);root.append(flow);
  root._simple={run,flow,match,policy,reason,status,list,rows:new Map(),follow:true,decision,title,why,usedLink,payload,handoff,handoffText};return root._simple;
 }
 StableActivity.render=function(root,run){
  previous(root,run);root.classList.add('simple-activity');document.body.classList.add('simple-agent');
  const v=root._simple?.run===run&&root.contains(root._simple.flow)?root._simple:mount(root,run);
  const selection=run.selection,policies=selection?.policies||[],active=run.tools.find(t=>t.state==='Running'),done=run.phase===2;
  set(v.policy,policies.map(p=>p.title).join(' + ')||'Finding the right policy');
  set(v.reason,selection?.selection_summary||'Matching your request to the available instructions.');
  set(v.handoffText,selection?(selection.selected_tools||run.tools.map(t=>t.name)).length+' of '+HotelTools.length+' tools selected':'Selecting tools');v.handoff.dataset.phase=String(run.phase);
  v.match.dataset.active=String(run.phase===0);
  set(v.status,active?'Running: '+DemoCatalog.label(active.name):done?'Checks finished':run.tools.some(t=>t.state==='Returned')?'Reviewing results':'Ready to check');
  for(const t of run.tools){
   const key=t.id||t.name;let row=v.rows.get(key);
   if(!row){const box=el('div','sf-tool'),head=el('div','sf-tool-head'),name=el('strong','',DemoCatalog.label(t.name)),state=el('span','sf-tool-state'),code=el('code','',t.name+'()'),purpose=el('p','sf-purpose',(t.name==='apply_upgrade'?'Apply only if membership, allowance and availability qualify.':t.reason)||run.selection?.tool_purposes?.[t.name]||HotelTools.find(x=>x.name===t.name)?.description||'Selected by the policy'),output=el('p','sf-return');head.append(name,state);const costTag=el('small','sf-tool-cost','Cost not measured');costTag.title='This function has no measured per-call cost. Model pricing applies separately.';box.append(head,code,output,costTag);v.list.append(box);row={box,state,output};v.rows.set(key,row);}
   const state=done&&t.state==='Selected'?'Not called':t.state;
   row.box.dataset.state=state;set(row.state,({Returned:'Used',Failed:'Failed',Selected:run.live?'Policy match':'Sample match',Running:run.live?'Agent choice':'Sample choice','Not called':'Not needed'})[state]||state);row.state.title=state==='Failed'?'The tool was called but failed; this does not mean it was the wrong choice.':state==='Selected'?'Available under the selected policy; not yet called.':state==='Not called'?'The request finished without calling this tool.':'Recorded tool execution, not a claim that this was the best possible option.';
   set(row.output,['Returned','Failed'].includes(state)?t.output||'Result returned':state==='Not called'?'':state==='Running'?'Checking…':'');
  }
  if(active&&v.lastActive!==(active.id||active.name)){v.lastActive=active.id||active.name;const box=v.rows.get(v.lastActive)?.box;if(box&&v.follow)v.list.scrollTop=Math.max(0,box.offsetTop-v.list.offsetTop-v.list.clientHeight+box.offsetHeight);}
  v.decision.dataset.active=String(done);set(v.title,done?run.title:'Waiting for the checks');set(v.why,done?run.reason||run.result||'Response ready.':'The decision appears here when the tools return.');
  const used=[...new Set(run.tools.filter(t=>['Returned','Failed'].includes(t.state)).map(t=>t.name))];
  v.usedLink.hidden=!done||!used.length;v.usedLink.href='/hub?'+new URLSearchParams({mode:run.live?'live':'simulation',tools:used.join(',')});
  const events=TraceModel.events(run,run.live?null:DemoCatalog.list().find(r=>r.id===run.traceId));
  ActivityTracer.update(run,events);
  set(v.payload,JSON.stringify({source:run.live?'Live backend':'Scripted example',policies:policies.map(p=>({name:p.name,version:p.version,rule:p.rule})),selected:selection?.selected_tools||run.tools.map(t=>t.name),events},null,2));
 };
})();
