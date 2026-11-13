/* Viewport-sized, observable walkthrough. No inferred similarity scores. */
const ProcessScreen=(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const dialog=el('dialog','','ps-screen'),head=el('header'),identity=el('div'),title=el('h2','Inside the request'),request=el('p','','ps-request'),close=el('button','Back to chat');close.onclick=()=>dialog.close();identity.append(title,request);head.append(identity,close);
 const nav=el('nav','','ps-nav'),body=el('section','','ps-body'),foot=el('footer'),back=el('button','Back'),status=el('span'),next=el('button','Next'),follow=el('button','Follow run');foot.append(back,status,follow,next);dialog.append(head,nav,body,foot);document.body.append(dialog);
 let disposeMeaning=null;dialog.addEventListener('close',()=>{disposeMeaning?.();disposeMeaning=null;});
 let run=null,step=0,following=true,page=0,signature='';
 const names=['Prompt matching','Selected policy','Tool calls','Tools Hub'];
 const tabs=names.map((name,i)=>{const b=el('button',name);b.onclick=()=>{following=false;step=i;page=0;draw();};nav.append(b);return b;});
 back.onclick=()=>{following=false;step=Math.max(0,step-1);page=0;draw();};next.onclick=()=>{following=false;step=Math.min(3,step+1);page=0;draw();};follow.onclick=()=>{following=true;advance();draw();};
 function advance(){step=run.phase===2?3:run.phase===1?2:run.selection?1:0;}
 function events(){return TraceModel.events(run,run.live?null:DemoCatalog.list().find(r=>r.id===run.traceId));}
 function card(label,value,cls=''){const c=el('article','',cls);c.append(el('h3',label),el('p',value));return c;}
 function draw(){
  const ev=events(),sel=run.selection,policies=sel?.policies||[],text=ev.find(e=>e.type==='request')?.text||'Guest request';request.textContent=text;
  tabs.forEach((b,i)=>b.setAttribute('aria-current',i===step?'step':'false'));back.disabled=step===0;next.disabled=step===3;follow.hidden=following;status.textContent=run.live?'Live backend events':'Scripted example';
  const key=JSON.stringify(step===0?[step,text,sel]:[step,page,innerWidth,ev,run.tools,run.phase]);if(key===signature)return;signature=key;const content=el('div','','ps-content');
  if(step===0){content.append(el('h3','From words to the right tools'));}
  if(step===1){content.append(el('h3','Instructions chosen for this request'));const grid=el('div','','ps-grid');
   for(const p of policies){const c=card(p.title,p.rule,'ps-selected');c.append(el('code',p.version));grid.append(c);}if(!policies.length)grid.append(card('Matching','Waiting for the selected policy.'));content.append(grid);
   const alternatives=el('div','','ps-alternatives');for(const p of HotelPolicies.filter(p=>!policies.some(x=>x.name===p.name)))alternatives.append(el('span',p.title));content.append(el('p','Other available policies','ps-note'),alternatives);
  }
  if(step===2){content.append(el('h3',run.phase===2?'Checks completed':'Tools working on your request'));const grid=el('div','','ps-grid');for(const t of run.tools){const c=card(DemoCatalog.label(t.name),t.reason||'Selected by the policy');c.dataset.state=t.state;c.prepend(el('span',t.state==='Returned'?'Result returned':t.state,'ps-state'));c.append(el('code',t.name+'()'));if(['Returned','Failed'].includes(t.state))c.append(el('p',t.output,'ps-result'));grid.append(c);}content.append(grid);}
  if(step===3){content.append(card(run.phase===2?run.title:'Tools Hub',run.phase===2?run.reason:'Compare the available functions with this request.','ps-outcome'));const selected=new Set(sel?.selected_tools||run.tools.map(t=>t.name)),all=[...HotelTools].sort((a,b)=>Number(selected.has(b.name))-Number(selected.has(a.name)));const size=matchMedia('(max-width:600px)').matches?4:12,total=Math.ceil(all.length/size);page=Math.min(page,total-1);const grid=el('div','','ps-grid ps-catalog');for(const t of all.slice(page*size,(page+1)*size)){const used=run.tools.find(x=>x.name===t.name),state=used?.state;const c=card(DemoCatalog.label(t.name),['Returned','Failed','Running'].includes(state)?state==='Running'?'Running':state==='Failed'?'Failed':'Called':selected.has(t.name)?'Selected, not called':'Not selected',selected.has(t.name)?'ps-selected':'');c.append(el('code',t.name));grid.append(c);}content.append(grid);if(total>1){const paging=el('div','','ps-paging');for(let i=0;i<total;i++){const b=el('button','Tools '+(i*size+1)+'–'+Math.min((i+1)*size,all.length));b.onclick=()=>{page=i;draw();};paging.append(b);}content.append(paging);}const trace=el('button','Open session trace');trace.onclick=()=>ActivityTracer.open(run);content.append(trace);}
  disposeMeaning?.();disposeMeaning=null;body.replaceChildren(content);if(step===0)disposeMeaning=MeaningAnimation.mount(content,{text,run});
 }
 window.addEventListener('resize',()=>{if(dialog.open)draw();});
 const original=StableActivity.render;StableActivity.render=function(root,r){original(root,r);const changed=run!==r;run=r;if(changed){signature='';page=0;following=true;step=0;}if(dialog.open){if(following&&!changed)advance();draw();}};
 const open=el('button','View process','quiet-button');open.onclick=()=>{if(!run)return;step=0;following=false;signature='';draw();dialog.showModal();};document.querySelector('.decision-head').append(open);
 return {open(){open.click();}};
})();
