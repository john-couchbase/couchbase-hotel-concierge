/* Opt-in spotlight tour, adapted from the Air demo. Does not run inference. */
(()=>{
 const trigger=document.querySelector('.catalog-open');if(!trigger)return;
 trigger.textContent='Show me around';
 const steps=[['.chat-panel','Ask the concierge','Type a request, or choose a suggested reply.'],['.decision-panel','Watch the checks','Meaning, tools, and decision appear here as the request runs.'],['.decision-panel','Review what happened','Open saved activity to revisit earlier requests and their results.'],['.top-right','Choose your mode','Simulation uses sample records. Live data calls the connected backend.']];
 let index=0,layer,target,origin,savedWasOpen=false;
 function close(){const saved=document.querySelector('#saved-activity');if(saved&&saved.getAttribute('aria-expanded')!==String(savedWasOpen))saved.click();layer?.remove();layer=null;window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);document.removeEventListener('keydown',keys);origin?.focus();}
 function keys(e){if(e.key==='Escape')close();if(e.key==='Tab'){const b=[...layer.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===b[0]){e.preventDefault();b.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===b.at(-1)){e.preventDefault();b[0].focus();}}}
 function position(){
  if(!layer||!target)return;
  const r=target.getBoundingClientRect(),ring=layer.querySelector('.ht-ring'),card=layer.querySelector('.ht-card');
  const w=Math.min(360,innerWidth-24);card.style.width=w+'px';const h=card.offsetHeight;
  let left=Math.max(8,r.left-8),right=Math.min(innerWidth-8,r.right+8),top=Math.max(8,r.top-8),bottom=Math.min(innerHeight-8,r.bottom+8);
  let x,y;
  if(innerWidth-right>=w+28){x=right+18;y=Math.max(12,Math.min(top,innerHeight-h-12));}
  else if(left>=w+28){x=left-w-18;y=Math.max(12,Math.min(top,innerHeight-h-12));}
  else {x=Math.max(12,Math.min(left,innerWidth-w-12));if(top>=h+28){y=top-h-18;}else{y=innerHeight-h-12;bottom=Math.min(bottom,y-18);}}
  Object.assign(ring.style,{top:top+'px',left:left+'px',width:(right-left)+'px',height:Math.max(30,bottom-top)+'px'});
  Object.assign(card.style,{left:x+'px',top:y+'px'});
 }

 function show(){const saved=document.querySelector('#saved-activity');if(saved&&saved.getAttribute('aria-expanded')!==String(index===2||savedWasOpen))saved.click();const [selector,title,copy]=steps[index];target=document.querySelector(selector);if(!target){close();return;}layer.querySelector('small').textContent=(index+1)+' of '+steps.length;layer.querySelector('h2').textContent=title;layer.querySelector('p').textContent=copy;layer.querySelector('.ht-back').disabled=index===0;layer.querySelector('.ht-next').textContent=index===steps.length-1?'Done':'Next';target.scrollIntoView({block:'start',behavior:'instant'});position();}
 trigger.onclick=()=>{origin=trigger;savedWasOpen=document.querySelector('#saved-activity')?.getAttribute('aria-expanded')==='true';index=0;layer=document.createElement('div');layer.className='hotel-tour';layer.innerHTML='<div class="ht-ring" aria-hidden="true"></div><aside class="ht-card" role="dialog" aria-modal="true" aria-label="Show me around"><small></small><h2></h2><p></p><nav><button class="ht-close">Close</button><button class="ht-back">Back</button><button class="ht-next">Next</button></nav></aside>';document.body.append(layer);layer.querySelector('.ht-close').onclick=close;layer.querySelector('.ht-back').onclick=()=>{index--;show();};layer.querySelector('.ht-next').onclick=()=>{if(++index===steps.length)close();else show();};window.addEventListener('resize',position);window.addEventListener('scroll',position,true);document.addEventListener('keydown',keys);show();layer.querySelector('.ht-next').focus();};
})();
