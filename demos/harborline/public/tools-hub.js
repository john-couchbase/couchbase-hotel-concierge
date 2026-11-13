/* Inspect published application contracts and the current request's tool states. */
const ToolsHub=(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 let current=null,selectedOnly=false;
 const dialog=el('dialog','','catalog-dialog tool-hub-dialog');dialog.setAttribute('aria-labelledby','tool-hub-title');
 const header=el('header'),intro=el('div'),title=el('h2','Tools Hub');title.id='tool-hub-title';const caption=el('p','Application tool definitions');intro.append(title,caption);
 const close=el('button','Close','quiet-button');close.type='button';close.onclick=()=>dialog.close();header.append(intro,close);
 const controls=el('div','','hub-controls'),search=el('input');search.type='search';search.placeholder='Find a tool';search.setAttribute('aria-label','Find a tool');
 const filter=el('button','Selected tools','quiet-button');filter.type='button';filter.setAttribute('aria-pressed','false');filter.onclick=()=>{selectedOnly=!selectedOnly;filter.setAttribute('aria-pressed',String(selectedOnly));render();};
 controls.append(search,filter);const counts=el('p','','hub-counts'),body=el('div','','hub-tools');search.oninput=render;dialog.append(header,controls,counts,body);document.body.append(dialog);
 const open=el('button','Tools Hub','quiet-button hub-open');open.type='button';open.onclick=()=>window.HotelWorkspace.openHub();document.querySelector('.decision-head').append(open);
 function render(){
  const scroll=dialog.scrollTop;const focused=document.activeElement?.closest('.hub-tool')?.dataset.tool;
  const expanded=new Set([...body.querySelectorAll('details[open]')].map(d=>d.dataset.tool));body.replaceChildren();
  const selected=new Set(current?.selection?.selected_tools||current?.tools.map(t=>t.name)||[]);
  const called=new Set(current?.tools.filter(t=>['Running','Returned','Failed'].includes(t.state)).map(t=>t.name)||[]);
  counts.textContent=HotelTools.length+' available, '+selected.size+' selected, '+called.size+' called';
  caption.textContent=current?(current.live?'Live request':'Simulation')+' — application tool contracts':'Application tool contracts; choose a request to see selection.';
  const query=search.value.trim().toLowerCase();
  for(const tool of [...HotelTools].sort((a,b)=>Number(selected.has(b.name))-Number(selected.has(a.name)))){if(selectedOnly&&!selected.has(tool.name))continue;if(query&&!(tool.name+' '+tool.description).toLowerCase().includes(query))continue;
   const row=el('details','','hub-tool');row.dataset.tool=tool.name;row.open=expanded.has(tool.name);
   const summary=el('summary'),identity=el('span','','hub-identity');identity.append(el('strong',DemoCatalog.label(tool.name)),el('code',tool.name));
   const state=current?.tools.find(t=>t.name===tool.name)?.state;
   const status=state==='Running'?'Running':state==='Failed'?'Failed':called.has(tool.name)?'Called':selected.has(tool.name)?'Selected':'Not selected';
   row.dataset.selected=String(selected.has(tool.name));summary.append(identity,el('span',status,'hub-state'));row.append(summary);
   const detail=el('div','','hub-detail');detail.append(el('p',tool.description));
   const inputs=Object.entries(tool.inputs);detail.append(el('h3','Inputs'),el('p',inputs.length?inputs.map(([name,type])=>name+' ('+type+')').join(', '):'No arguments; uses the current guest session.'));
   detail.append(el('h3','Used by'));for(const p of HotelPolicies.filter(p=>p.tools.includes(tool.name))){detail.append(el('p',p.title),el('code',p.version));}
   if(current?.selection?.tool_purposes?.[tool.name])detail.append(el('h3','Loaded catalog description'),el('p',current.selection.tool_purposes[tool.name]));
   row.append(detail);body.append(row);
  }
  if(!body.children.length)body.append(el('p','No tools match this filter.'));
  if(focused){const item=[...body.querySelectorAll('.hub-tool')].find(x=>x.dataset.tool===focused);item?.querySelector('summary').focus({preventScroll:true});}dialog.scrollTop=scroll;
 }
 return {open(){window.HotelWorkspace.openHub();},update(run){current=run;if(dialog.open)render();}};
})();
const clearBeforeToolsHub=clearActivity;
clearActivity=function(...args){ToolsHub.update(null);return clearBeforeToolsHub(...args);};
