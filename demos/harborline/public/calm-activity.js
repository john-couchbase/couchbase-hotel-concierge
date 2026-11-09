/* Present one decision; keep the full inspection map on demand. */
function simplifyActivity(){
 const root=$('decision-route');if(typeof guidedRun!=='undefined'&&guidedRun){renderGuidedRun(root);return;}if(root.hidden||!root.children.length)return;
 if(!root.querySelector('.activity-detail')){
  const detail=document.createElement('details');detail.className='activity-detail';const toggle=document.createElement('summary');toggle.textContent='Show details';detail.append(toggle);
  const content=document.createElement('div');content.className='activity-detail-content';while(root.firstChild)content.append(root.firstChild);detail.append(content);
  const overview=document.createElement('div');overview.className='activity-overview';overview.innerHTML='<p class="calm-title"></p><p class="calm-reason"></p><div class="calm-tools" aria-label="Simulated functions"></div><div class="calm-result" aria-live="polite"></div>';root.append(overview,detail);
 }
 const messages=$('decision-messages'),active=messages.querySelector('.message-active'),decision=messages.querySelector('.message-decision p'),result=messages.querySelector('.message-result p'),reason=messages.querySelector('.message-decision .message-note');
 const overview=root.querySelector('.activity-overview');
 let lens=overview.querySelector('.decision-lens');
 if(!lens){lens=document.createElement('div');lens.className='decision-lens';lens.setAttribute('aria-label','Simulated decision stages');
  const shapes=['<path d="M8 12l12-6 12 6-12 6z M8 19l12 6 12-6 M8 26l12 6 12-6"/>','<path d="M13 10L5 20l8 10 M27 10l8 10-8 10 M23 8l-6 24"/>','<path d="M20 5l15 15-15 15L5 20z M14 20h12 M20 14v12"/>'];
  ['Context','Tools','Decision'].forEach((name,i)=>{const stage=document.createElement('div');stage.className='lens-stage lens-'+i;stage.innerHTML='<div class="lens-symbol"><svg viewBox="0 0 40 40" aria-hidden="true">'+shapes[i]+'</svg><span class="lens-orbit" aria-hidden="true"></span></div><span>'+name+'</span>';lens.append(stage);});overview.prepend(lens);
 }
 const phase=active?1:decision||result?2:0;
 lens.dataset.phase=phase;lens.dataset.running=!!active;
 Array.from(lens.children).forEach((el,i)=>{el.classList.toggle('is-current',i===phase);el.setAttribute('aria-current',i===phase?'step':'false');});
 const title=active?'Checking '+active.querySelector('.message-label').textContent.toLowerCase():decision?.textContent||root.querySelector('.flow-request strong')?.textContent||'Reviewing your request';
 const selected=Array.from(root.querySelectorAll('.flow-selected .flow-detail')).map(n=>n.textContent.split('\n')[0]);
 const check=active?.querySelector('.message-label')?.textContent;
 const checkFunctions={'Membership':'check_loyalty_tier','Stay allowance':'find_reservations','Room inventory':'find_reservations','Restaurant hours':'get_outlet_hours','Table inventory':'book_restaurant','Reservation':'find_reservations','Departure schedule':'check_departure_schedule'};
 const functions=active&&checkFunctions[check]?[checkFunctions[check]]:selected;
 const tools=root.querySelector('.calm-tools');const signature=JSON.stringify([functions,!!active]);
 if(tools.dataset.signature!==signature){
  tools.dataset.signature=signature;tools.dataset.guidedSignature="";tools.replaceChildren();tools.hidden=!functions.length;
  if(functions.length){const label=document.createElement('p');label.className='function-caption';label.textContent=active?'Running · simulated':'Functions used · simulated';tools.append(label);
   for(const name of functions){const row=document.createElement('div');row.className='function-line'+(active?' is-running':'');const signal=document.createElement('span');signal.className='function-signal';signal.setAttribute('aria-hidden','true');const code=document.createElement('code');code.textContent=name+'()';row.append(signal,code);tools.append(row);}
  }
 }
 const firstWhy=root.querySelector('.flow-selected .flow-detail')?.textContent.split('\n\n')[1];
 const values={'.calm-title':title,'.calm-reason':reason?.textContent||firstWhy||(active?'The next step follows this check.':'Using the current request and saved context.'),'.calm-result':result?.textContent||''};
 for(const [selector,value] of Object.entries(values)){const el=root.querySelector(selector);if(el.textContent!==value)el.textContent=value;el.hidden=!value;}
 if(typeof renderGuidedRun==='function')renderGuidedRun(root);
}
const fullRoute=showDecisionRoute;showDecisionRoute=function(...args){if(typeof guidedRun!=='undefined'&&guidedRun){renderGuidedRun($('decision-route'));return;}fullRoute(...args);simplifyActivity();};
const fullActivity=activity;activity=function(...args){const result=fullActivity(...args);simplifyActivity();return result;};
new MutationObserver(simplifyActivity).observe($('decision-messages'),{childList:true,subtree:true,characterData:true});
// Suspend loading motion in background tabs; execution timing stays unchanged.
document.addEventListener('visibilitychange',()=>document.documentElement.classList.toggle('motion-suspended',document.hidden));
