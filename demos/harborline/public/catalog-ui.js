/* Optional catalog workspace; keep the chat and active-run geometry unchanged. */
(()=>{
 const dialog=document.createElement('dialog');dialog.className='catalog-dialog';dialog.setAttribute('aria-labelledby','catalog-title');
 dialog.innerHTML='<header><div><h2 id="catalog-title">How the concierge works</h2><p>Hotel requests · Simulated catalog</p></div><button type="button" class="quiet-button" aria-label="Close catalog">Close</button></header><nav aria-label="Catalog views"><button data-view="walkthrough" aria-pressed="false">Walkthrough</button><button data-view="catalog" aria-pressed="true">Catalog</button><button data-view="runs" aria-pressed="false">Run history</button><button data-view="usage" aria-pressed="false">Tool calls</button></nav><div class="catalog-body"></div>';
 document.body.append(dialog);document.getElementById('restart').addEventListener('click',()=>DemoCatalog.interrupt());const body=dialog.querySelector('.catalog-body');let view='walkthrough';
 const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text)x.textContent=text;if(cls)x.className=cls;return x;};
 function render(){body.replaceChildren();dialog.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  if(view==='walkthrough'){
   body.append(el('p','One guest. Two requests. Different policies and tools.','catalog-count'));
   for(const [title,copy] of [
    ['Upgrade, then ask again','Watch the first upgrade succeed and the second skip the upgrade tool.'],
    ['Switch to dinner','Choose Plan dinner. New policy, new tools; the same guest context.'],
    ['Review the evidence','Run history shows the result. Tool calls shows how often each tool responded.']]){
     const section=el('section',null,'walkthrough-step');section.append(el('h3',title),el('p',copy));body.append(section);
   }
   const start=el('button','Start upgrade example','booking-primary');start.disabled=typeof busy!=='undefined'&&busy;start.onclick=()=>{dialog.close();startUpgradeExample();};body.insertBefore(start,body.children[1]);body.append(el('p','Selected: ready to use. Running: working now. Returned: a response arrived. All actions are simulated.','catalog-note'));
  }else if(view==='catalog'){
   body.append(el('p',`${DemoCatalog.definitions.length} policies · ${DemoCatalog.tools.length} tools · ${DemoCatalog.version()}`,'catalog-count'));
   body.append(el('p','Publish definitions, match a policy, then call only the tools the request needs. Selection is scripted in this demo.'));
   const publish=el('button','Publish a demo version','booking-primary');publish.onclick=()=>{DemoCatalog.publish();render();};body.append(publish);
   body.append(el('p','Publishes these same definitions in browser memory. New runs use the new revision; earlier runs retain theirs. No Capella changes.','catalog-note'));
   for(const p of DemoCatalog.definitions){const d=el('details');d.append(el('summary',p.label));const content=el('div');content.append(el('code',p.name),el('p',`${DemoCatalog.version()} · Source: ${p.source}`),el('p',p.tools.map(DemoCatalog.label).join(' · ')));d.append(content);body.append(d);}
  }else if(view==='runs'){
   const refresh=el('button','Refresh history','quiet-button');refresh.onclick=render;body.append(refresh);const runs=DemoCatalog.list().reverse();if(!runs.length)body.append(el('p','Run the upgrade example or find a room to record its checks here. Records last until page reload.'));
   for(const r of runs){const d=el('details');d.append(el('summary',`${r.id} · ${DemoCatalog.definitions.find(p=>p.name===r.policy)?.label||r.policy} · ${r.status}`));const content=el('div');content.append(el('p',r.request||'Hotel request'),el('p',`${r.revision} · ${r.source}`),el('p',r.rule));
    const list=el('ol');for(const e of r.events){const li=el('li');li.dataset.state=e.state;li.append(el('strong',DemoCatalog.label(e.tool)),el('span',e.state,'event-status'),el('p',e.output|| (e.state==='Selected'?'Available for this request.':e.state==='Running'?'Waiting for a response.':'')));list.append(li);}content.append(list,el('p',r.response||r.result||(r.status==='Interrupted'?'Stopped before completion.':'Run in progress.')));
    const raw=el('details');raw.append(el('summary','JSON record'),el('pre',JSON.stringify(r,null,2)));content.append(raw);d.append(content);body.append(d);}
  }else{
   body.append(el('p','How many times each tool returned a response. A response can include an unavailable result.'));
   const counts=DemoCatalog.usage();if(!counts.length)body.append(el('p','No returned calls yet.'));
   for(const [name,count] of counts){const row=el('div',null,'catalog-usage');row.append(el('span',DemoCatalog.label(name)),el('strong',String(count)));body.append(row);}
   const sql=el('details');sql.append(el('summary','SQL++ equivalent'),el('pre','SELECT e.tool, COUNT(*) AS calls\nFROM `demo_traces` AS r\nUNNEST r.events AS e\nWHERE e.state = "Returned"\nGROUP BY e.tool\nORDER BY calls DESC;'),el('p','Illustrative query for this JSON schema. Counts above are computed in JavaScript; no Couchbase query is executed.'));body.append(sql);
  }
 }
 dialog.querySelector('header button').onclick=()=>dialog.close();dialog.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});
 const open=document.createElement('button');open.type='button';open.className='quiet-button catalog-open';open.textContent='Explore the demo';open.onclick=()=>{render();dialog.showModal();};document.querySelector('.intro>div').append(open);
})();
