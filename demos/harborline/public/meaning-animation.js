/* Teaching illustration, not tokenization or hidden model reasoning. */
const MeaningAnimation=(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 function mount(host,{text,run,durations=[1200,1600,2400,1800],onComplete=null,holdMs=4500}){
  const box=el('section','','ma-box'),head=el('div','','ma-head'),label=el('strong','Read the request'),control=el('button','Pause');control.type='button';head.append(label,control);
  const stage=el('div','','ma-stage'),sentence=el('div','','ma-sentence'),groups=el('div','','ma-groups'),meaning=el('div','','ma-meaning'),matches=el('div','','ma-matches');
  sentence.tabIndex=0;sentence.setAttribute('aria-label','Full request');
  const words=text.match(/\S+/g)||['Guest','request'];words.forEach(w=>sentence.append(el('span',w,'ma-word')));
  const policies=run.selection?.policies||[];
  const selectedNames=run.selection?.selected_tools||run.tools.map(t=>t.name);
  const intent=run.intent||'';
  const actionPattern=/upgrade|book|reserve|find|cancel|change|check|help/i;
  const subjectPattern=/room|suite|stay|dinner|table|restaurant|checkout|reservation|booking/i;
  const clusters=[{name:'Request',test:()=>false},{name:'Action',test:w=>actionPattern.test(w)},{name:'Subject',test:w=>subjectPattern.test(w)}];
  const buckets=clusters.map(c=>{const b=el('div','','ma-group');b.append(el('span',c.name,'ma-group-label'),el('div','','ma-group-words'));b.lastChild.tabIndex=0;groups.append(b);return b;});
  const normalized={upgrade:'Request a room upgrade',dining:'Reserve a dinner table',room:'Find a room',checkout:'Request a later checkout',cancel:'Cancel a booking'}[intent]||policies.map(p=>p.title).join(' and ')||'Understand the guest request';
  meaning.append(el('span','Combined meaning','ma-group-label'),el('strong',normalized));
  const policyBox=el('div','','ma-policy'),toolBox=el('div','','ma-selected-tools');policyBox.append(el('h3','Policy match'));
  const candidates=run.selection?.candidates||HotelPolicies.map(p=>({...p,selected:policies.some(x=>x.name===p.name)}));
  [...candidates].sort((a,b)=>Number(b.selected)-Number(a.selected)).slice(0,4).forEach((p,i)=>{const row=el('div','','ma-candidate');row.dataset.selected=String(p.selected);row.append(el('span',p.title));const rail=el('span','','ma-rail'),fill=el('i');fill.style.width=(p.selected?94:Math.max(18,64-i*12))+'%';rail.append(fill);row.append(rail,el('small',p.selected?'Selected':'Alternative'));policyBox.append(row);});
  toolBox.append(el('h3','Tools sent to the agent'));for(const name of selectedNames)toolBox.append(el('span',DemoCatalog.label(name),'ma-tool'));
  matches.append(policyBox,toolBox);stage.append(sentence,groups,meaning,matches);
  const note=el('p','Illustrative grouping. Policy and tools reflect this request.','ma-note');
  box.append(head,stage,note);host.append(box);
  let phase=0,timer=null,paused=false,disposed=false;
  const titles=['Read the request','Separate the words','Group related words','Combine the meaning','Match policy and tools'];
  const originals=[...sentence.children];
  function paint(){
   [sentence,groups,meaning,matches].forEach((n,i)=>n.setAttribute('aria-hidden',String(i!==(phase<2?0:phase-1))));box.dataset.phase=phase;label.textContent=titles[phase];control.textContent=phase===4?'Replay':paused?'Continue':'Pause';
   if(phase===2){
    originals.forEach((word)=>{const group=subjectPattern.test(word.textContent)?2:actionPattern.test(word.textContent)?1:0;const destination=buckets[group].lastChild;const before=word.getBoundingClientRect();destination.append(word);const after=word.getBoundingClientRect();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)word.animate([{transform:`translate(${before.left-after.left}px,${before.top-after.top}px)`},{transform:'translate(0,0)'}],{duration:850,easing:'cubic-bezier(.22,1,.36,1)'});});
   }
  }
  function schedule(){clearTimeout(timer);if(paused||disposed)return;if(phase<4)timer=setTimeout(()=>{phase++;paint();schedule();},durations[phase]);else if(onComplete)timer=setTimeout(()=>{if(!disposed)onComplete();},holdMs);}
  function replay(){clearTimeout(timer);originals.forEach(w=>sentence.append(w));phase=0;paused=false;paint();schedule();}
  control.onclick=()=>{if(phase===4){replay();return;}paused=!paused;paint();schedule();};
  // Start only after the native dialog and layout are visible.
  timer=setTimeout(()=>{if(disposed)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){phase=4;paint();schedule();}else{paint();schedule();}},100);
  box.dataset.phase=0;[groups,meaning,matches].forEach(n=>n.setAttribute('aria-hidden','true'));
  return ()=>{disposed=true;clearTimeout(timer);};
 }
 return {mount};
})();
