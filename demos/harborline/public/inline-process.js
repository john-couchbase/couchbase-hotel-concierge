/* Compact presentation of recorded events; never delays or fabricates backend calls. */
(()=>{
 const original=StableActivity.render;let current=null,dispose=null,advanceTimer=null,view=null,story=null,toolTimer=null;
 let presenting=false;
 const lockedSelectors='#chat-form,#quick-replies,#chat-action,#receipt-actions,#saved-activity,[data-intent],.receipt-card';
 function lock(value){
  presenting=value;
  document.querySelectorAll(lockedSelectors).forEach(n=>n.inert=value);
  if(view){view.buttons.forEach(b=>b.disabled=value);view.toolNav.inert=value;view.details.disabled=value;view.root.dataset.presenting=String(value);}
 }
 document.addEventListener('click',e=>{if(presenting&&e.target.closest(lockedSelectors)){e.preventDefault();e.stopImmediatePropagation();}},true);
 const sendRequest=submit;
 submit=function(...args){if(presenting)return;return sendRequest(...args);};
 function clean(){lock(false);view?.nav.remove();view?.animation.remove();view?.details.remove();view?.toolNav.remove();clearInterval(toolTimer);if(view?.dialog){view.dialog.close();view.dialog.remove();}story?.dispose();story=null;dispose?.();dispose=null;clearTimeout(advanceTimer);}
 const screens=['meaning','tools','decision'];
 const ready=run=>run.phase===2||(!busy&&!run.tools.some(t=>t.state==='Running')); 
 function focusTool(index){
  const rows=[...view.root.querySelectorAll('.sf-tool')];
  if(!rows.length)return;
  view.toolIndex=Math.min(index,rows.length-1);
  rows.forEach((row,i)=>{row.hidden=false;row.dataset.focused=String(i===view.toolIndex);});
  view.toolNav.replaceChildren(...rows.map((row,i)=>{const b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.setAttribute('aria-label',row.querySelector('strong')?.textContent||'Tool '+(i+1));b.setAttribute('aria-current',i===view.toolIndex?'step':'false');b.onclick=()=>{clearInterval(toolTimer);clearTimeout(advanceTimer);view.manual=true;focusTool(i);};return b;}));
 }
 function show(screen){if(!view)return;clearInterval(toolTimer);if(screen==='tools'){focusTool(0);const count=view.root.querySelectorAll('.sf-tool').length;toolTimer=setInterval(()=>{if(view.toolIndex<count-1)focusTool(view.toolIndex+1);else clearInterval(toolTimer);},Math.max(400,2400/Math.max(count,1)));}
view.root.dataset.screen=screen;view.buttons.forEach((b,i)=>b.setAttribute('aria-current',screens[i]===screen?'step':'false'));view.animation.hidden=screen!=='meaning';if(screen==='decision'){lock(false);const list=view.root.querySelector('.sf-tool-list');if(list)list.scrollTop=0;}}
 StableActivity.render=function(root,run){
  if(!run.live&&!run.selection){const p=HotelPolicies.find(p=>p.id===run.intent);if(p)run.selection={policies:[{name:p.name,title:p.title,version:p.version,rule:p.content}],selected_tools:run.tools.map(t=>t.name),selection_summary:p.description,candidates:HotelPolicies.map(c=>({name:c.name,title:c.title,selected:c.name===p.name}))};}
  original(root,run);
  if(current!==run||!view||!root.contains(view.nav)||(!view.selectionReady&&run.selection)){
   if(view){view.nav.remove();view.animation.remove();view.details.remove();view.dialog.close();view.dialog.remove();}
   clean();root.querySelectorAll('.ip-nav,.ip-animation,.ip-details,.ip-tool-nav').forEach(n=>n.remove());current=run;root.classList.add('inline-process');
   const nav=document.createElement('nav');nav.className='ip-nav';nav.setAttribute('aria-label','Request process');
   const animation=document.createElement('div');animation.className='ip-animation';
   const buttons=['Meaning','Tools','Decision'].map((name,i)=>{const b=document.createElement('button');b.textContent=name;b.type='button';b.onclick=()=>{view.manual=true;clearTimeout(advanceTimer);show(screens[i]);};nav.append(b);return b;});
   const dialog=document.createElement('dialog');dialog.className='ip-detail-dialog';dialog.setAttribute('aria-label','Backend details');
   const header=document.createElement('header'),heading=document.createElement('strong'),close=document.createElement('button');heading.textContent='Backend details';close.textContent='Close';close.type='button';close.onclick=()=>dialog.close();header.append(heading,close);
   const detailNav=document.createElement('nav');detailNav.className='ip-detail-nav';
   const storyHost=document.createElement('section');storyHost.className='backend-story';
   const detailButtons=['Catalog','Prompt','Trace','Query'].map(name=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=()=>{detailButtons.forEach(x=>x.setAttribute('aria-current',x===b?'page':'false'));story.show(name.toLowerCase());};detailNav.append(b);return b;});
   dialog.append(header,detailNav,storyHost);document.body.append(dialog);
   const details=document.createElement('button');details.className='ip-details';details.textContent='Backend details';details.type='button';details.onclick=()=>{detailButtons[0].click();dialog.showModal();close.focus();};
   const toolNav=document.createElement('nav');toolNav.className='ip-tool-nav';toolNav.setAttribute('aria-label','Review tool checks');root.querySelector('.sf-tools').prepend(toolNav);root.prepend(nav,animation);root.append(details);view={toolNav,toolIndex:0,root,nav,animation,buttons,storyHost,details,dialog,selectionReady:!!run.selection};story=BackendStory.mount(storyHost,run,()=>{});show('meaning');lock(true);
   const events=TraceModel.events(run,run.live?null:DemoCatalog.list().find(r=>r.id===run.traceId));
   let text=events.find(e=>e.type==='request')?.text||document.querySelector('#chat-log .user:last-child p')?.textContent||'Guest request';
   if(['room','dining'].includes(run.intent)&&!/(room|dinner|table|restaurant)/i.test(text)){const previous=[...document.querySelectorAll('#chat-log .user p')].map(n=>n.textContent).reverse().find(t=>/(room|dinner|table|restaurant)/i.test(t));if(previous)text=previous;}
   dispose=MeaningAnimation.mount(animation,{text,run,durations:[500,650,800,650],holdMs:900,onComplete:()=>{if(current!==run||view.manual)return;show('tools');advanceTimer=setTimeout(()=>{if(current===run&&!view.manual&&ready(run))show('decision');else if(current===run)view.awaitingDecision=true;},2400);}});
   const playback=animation.querySelector('.ma-head button');if(playback)playback.hidden=true;
  }
  lock(presenting);
  root.classList.add('inline-process');
  if(view.awaitingDecision&&ready(run)&&!view.manual){view.awaitingDecision=false;show('decision');}
  // The real calls may finish before the slower explanatory animation.
  if(view.root.dataset.screen==='tools'&&run.phase===2){const status=root.querySelector('.sf-status');if(status)status.textContent='Recorded checks';}
 };
 const reset=clearActivity;clearActivity=function(...args){clean();current=null;view=null;return reset(...args);};
})();
