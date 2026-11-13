/* Presentation of public policy contracts and captured events, not a Capella admin connection. */
const BackendStory=(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=String(text);if(cls)n.className=cls;return n;};
 function events(run){return TraceModel.events(run,run.live?null:DemoCatalog.list().find(r=>r.id===run.traceId));}
 function counts(run){const out={};for(const e of events(run))if(e.type==='tool'&&e.state==='Running')out[e.name]=(out[e.name]||0)+1;return Object.entries(out).map(([tool,calls])=>({tool,calls}));}
 function prompt(run){return (run.selection?.policies||[]).map(p=>({record:'prompt',name:p.name,description:HotelPolicies.find(x=>x.name===p.name)?.description||p.title,version:p.version,tools:run.selection.selected_tools||[],content:p.rule}));}
 function mount(host,run,onNext){
  let screen='',timer=null,paused=false,disposed=false,shown=0;const rows=new Map();
  const top=el('div',undefined,'bs-head'),title=el('strong'),pause=el('button','Pause');pause.type='button';top.append(title,pause);const body=el('div',undefined,'bs-body'),note=el('p',undefined,'bs-note');host.append(top,body,note);
  function later(fn,ms){clearTimeout(timer);if(!paused&&!disposed)timer=setTimeout(fn,ms);}
  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Continue':'Pause';if(paused)clearTimeout(timer);else if(screen==='trace')reveal();else later(()=>onNext(screen),5000);};
  function render(next){screen=next;clearTimeout(timer);body.replaceChildren();rows.clear();shown=0;pause.hidden=false;pause.textContent=paused?'Continue':'Pause';
   if(screen==='catalog'){
    title.textContent='Catalog: choose the relevant tools';note.textContent='Available application functions. Only selected definitions are sent to the model.';
    const selected=new Set(run.selection?.selected_tools||run.tools.map(t=>t.name));const caption=el('p',HotelTools.length+' available functions','bs-caption'),grid=el('div',undefined,'bs-catalog'),chosen=el('div',undefined,'bs-chosen');body.append(caption,grid,chosen);
    for(const t of HotelTools){const chip=el('span',DemoCatalog.label(t.name),'bs-tool');chip.dataset.selected=String(selected.has(t.name));grid.append(chip);}
    chosen.append(el('strong','Sent to the model'));for(const name of selected)chosen.append(el('code',name+'()'));
    later(()=>{grid.dataset.filtered='true';chosen.dataset.visible='true';caption.textContent=selected.size+' selected; '+(HotelTools.length-selected.size)+' left out';later(()=>onNext(screen),5500);},2200);
   }
   if(screen==='prompt'){
    title.textContent='Prompts Hub: instructions for this request';note.textContent='Public policy record with the content revision and selected tool bindings.';
    for(const p of prompt(run)){const pre=el('pre',JSON.stringify(p,null,2));pre.className='bs-prompt';body.append(pre);}if(!prompt(run).length)body.append(el('p','Waiting for the selected policy.'));later(()=>onNext(screen),8000);
   }
   if(screen==='trace'){
    title.textContent='Agent Tracer: session events';note.textContent=run.live?'Captured backend events. Expand a row to inspect its payload and persistence status.':'Animated sample events, using the backend’s user, system, tool and assistant roles.';reveal();
   }
   if(screen==='query'){
    title.textContent='Query the captured activity';pause.hidden=true;note.textContent='Local preview only. No database query is executed. SQL++ uses captured events supplied as $events.';
    const sql='SELECT e.name AS tool, COUNT(*) AS calls\nFROM $events AS e\nWHERE e.type = "tool" AND e.state = "Running"\nGROUP BY e.name;';body.append(el('pre',sql));const actions=el('div',undefined,'bs-query-actions'),execute=el('button','Preview results'),copy=el('button','Copy SQL++'),result=el('div',undefined,'bs-query-result');execute.type=copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(sql);copy.textContent='Copied';}catch{copy.textContent='Select the query to copy';}};execute.onclick=()=>{result.replaceChildren();const table=el('table');const tr=el('tr');tr.append(el('th','Tool'),el('th','Calls'));table.append(tr);for(const c of counts(run)){const row=el('tr');row.append(el('td',c.tool),el('td',c.calls));table.append(row);}result.append(table,el('p',counts(run).length?'Computed from this request’s recorded tool calls.':'No tool calls recorded for this request.'));execute.textContent='Refresh results';};actions.append(execute,copy);body.append(actions,result);
   }
  }
  function reveal(){if(disposed||screen!=='trace'||paused)return;const ev=events(run);if(shown<ev.length){const e=ev[shown],d=TraceModel.describe(e),row=el('details',undefined,'bs-event'),summary=el('summary'),role=e.type==='request'?'User':e.type==='selection'?'System':e.type==='answer'?'Assistant':e.state==='Running'?'Tool call':'Tool result';summary.append(el('span',role,'bs-role'),el('strong',d.title),el('p',d.text));row.append(summary,el('pre',JSON.stringify(e,null,2)));row.dataset.kind=d.tone;body.append(row);shown++;body.scrollTop=body.scrollHeight;later(reveal,1500);}else if(run.phase===2)later(()=>onNext(screen),4500);else later(reveal,1000);}
  body.addEventListener('wheel',()=>{if(screen==='trace'){paused=true;pause.textContent='Continue';clearTimeout(timer);}},{passive:true});
  return {show:render,dispose(){disposed=true;clearTimeout(timer);}};
 }
 return {mount,counts,prompt};
})();
