/* A stable observable activity record; events update text, never replace the live layout. */
const StableActivity=(()=>{
 const glyphs=['<path d="M8 12l12-6 12 6-12 6z M8 19l12 6 12-6 M8 26l12 6 12-6"/>','<path d="M13 10L5 20l8 10 M27 10l8 10-8 10 M23 8l-6 24"/>','<path d="M20 5l15 15-15 15L5 20z M14 20h12 M20 14v12"/>'];
 const titles={check_departure_schedule:'Checking the next arrival',update_checkout:'Updating checkout time',check_room_availability:'Checking final availability',create_reservation:'Saving your booking',update_reservation:'Updating your booking',validate_stay:'Checking your dates',search_rooms:'Finding rooms that fit',quote_room:'Calculating your stay',check_loyalty_tier:'Checking membership',find_reservations:'Checking this stay',apply_upgrade:'Applying the upgrade',get_outlet_hours:'Checking opening hours',book_restaurant:'Requesting the table'};
 function label(name){return typeof DemoCatalog!=='undefined'?DemoCatalog.label(name):name.replaceAll('_',' ');}
 function text(el,value){if(el.textContent!==value)el.textContent=value;}
 function element(tag,cls,copy){const el=document.createElement(tag);if(cls)el.className=cls;if(copy)el.textContent=copy;return el;}
 function mount(root,run){
  root.replaceChildren();root.className='stable-activity';
  const stages=element('div','sa-stages');stages.setAttribute('aria-label','Simulated decision stages');
  ['Context','Tools','Decision'].forEach((name,i)=>{const step=element('div','sa-stage');step.dataset.stage=i;step.innerHTML='<span class="sa-symbol"><svg viewBox="0 0 40 40" aria-hidden="true">'+glyphs[i]+'</svg></span><span>'+name+'</span>';stages.append(step);});
  const summary=element('section','sa-summary');summary.setAttribute('aria-label','Current activity');const title=element('h3'),description=element('p');const currentTool=element('code','sa-current-tool');summary.append(title,description,currentTool);
  const tools=element('section','sa-tools');tools.append(element('h3','', 'Tools selected'));
  const rows=new Map();for(const t of run.tools){const row=element('div','sa-tool');row.dataset.tool=t.name;const head=element('div','sa-tool-head'),name=element('code','',t.name+'()'),state=element('span','sa-state');const identity=element('div','sa-tool-identity');identity.append(element('strong','',label(t.name)),name);head.append(identity,state);const output=element('p','sa-output');row.append(head,output);tools.append(row);rows.set(t.id||t.name,{row,state,output});}
  const memory=element('p','sa-memory');
  const review=element('details','sa-review');review.open=true;const reviewHeading=element('summary');reviewHeading.append(element('span','sa-details-title','Activity details'));const liveTool=element('span','sa-live-tool','Preparing checks');liveTool.setAttribute('role','status');liveTool.setAttribute('aria-live','polite');reviewHeading.append(liveTool);review.append(reviewHeading);const content=element('div','sa-review-content');
  const catalog=element('details','sa-explanation-toggle sa-catalog');catalog.append(element('summary','','Why this policy?'));const catalogBody=element('div');
  const record=!run.live&&typeof DemoCatalog!=='undefined'?DemoCatalog.capture(run):null;
  if(record){catalogBody.append(element('p','',run.intent==='checkout'?'Late checkout uses the active stay and next-arrival schedule.':run.intent==='cancel'?'Cancellation requires an active request and your explicit approval.':run.intent==='upgrade'?'An upgrade request uses membership, upgrade allowance and room availability rules.':run.intent==='dining'?'A dinner request uses restaurant hours and table availability rules.':run.prompt==='room_confirmation_policy'?'Booking a room requires your approval and a final availability check.':'Finding a room requires dates, guest count and prices.'),element('p','',record.policy+' · '+record.revision),element('p','',record.selected.length+' selected of '+DemoCatalog.tools.length+' demo tools'),element('p','',record.selected.map(label).join(' · ')),element('p','',record.excluded.length+' other tools were left out of this request.'),element('p','','Rule-based demo selection. No embeddings or live catalog request.'));}
  catalog.append(catalogBody);content.append(catalog,tools,memory);
  const explanation=element('details','sa-explanation-toggle');explanation.append(element('summary','','Why this result?'));const explanationBody=element('div');
  const policy=element('section');policy.append(element('h4','','Rule applied'),element('p','',run.policy));explanationBody.append(policy);
  const why=element('section');why.append(element('h4','','What each tool checks'));for(const t of run.tools){const item=element('div','sa-explanation');item.append(element('code','',t.name+'()'),element('p','',t.reason));why.append(item);}explanationBody.append(why);
  const sdk=element('details','sa-sdk');sdk.append(element('summary','','SDK example'));const query=run.intent==='checkout'?'check departure schedule and update checkout time':run.intent==='cancel'?'find the selected reservation and cancel only after approval':run.intent==='room'?'find available hotel rooms and calculate the stay price':run.intent==='upgrade'?'help a guest with a room upgrade':'book a restaurant table';sdk.append(element('pre','','catalog.find(kind="prompt", name="'+run.prompt+'")\n'+'catalog.find(kind="tool", query="'+query+'", limit=3)'),element('p','','Illustrative only. The catalog retrieves definitions; the agent framework executes tools. This demo stores history locally.'));explanationBody.append(sdk);explanation.append(explanationBody);content.append(explanation);review.append(content);
  root.append(stages,summary);
  let detailsCard=document.getElementById?.('activity-details-card');
  if(!detailsCard&&root.closest){
   const panel=root.closest('.decision-panel');let column=panel.closest('.agent-column');
   if(!column){column=element('div','agent-column');panel.before(column);column.append(panel);}
   const chat=document.querySelector('.chat-panel');
   if(chat&&typeof ResizeObserver!=='undefined'){
    let lastWidth=0;
    const fit=()=>{
     const box=chat.getBoundingClientRect();
     // Preserve the run's frame when chat replies arrive; refit on a real resize.
     if(!lastWidth||Math.abs(box.width-lastWidth)>1){
      column.style.setProperty('--chat-panel-height',box.height+'px');lastWidth=box.width;
     }
    };
    const observer=new ResizeObserver(fit);observer.observe(chat);fit();
   }
   detailsCard=element('section','panel activity-details-card stable-activity');detailsCard.id='activity-details-card';column.append(detailsCard);
  }
  if(detailsCard)detailsCard.replaceChildren(review);else root.append(review);
  root._stableView={run,stages,summary,title,description,currentTool,rows,tools,why,memory,review,content,liveTool,explanation,catalog,catalogBody,policy,following:true,lastActive:null};
  // Reveal disclosures inside this scrollport, never by scrolling the whole page.
  const reveal=(target)=>{
   if(!detailsCard||!target.getBoundingClientRect)return;
   const card=detailsCard.getBoundingClientRect(),heading=reviewHeading.getBoundingClientRect();
   detailsCard.scrollTop+=target.getBoundingClientRect().top-card.top-heading.height-12;
  };
  explanation.addEventListener?.('toggle',()=>{if(explanation.open)reveal(explanation);});
  catalog.addEventListener?.('toggle',()=>{if(catalog.open)reveal(catalog);});
  sdk.addEventListener?.('toggle',()=>{if(sdk.open)reveal(sdk);});
  review.addEventListener?.('toggle',()=>{if(detailsCard)detailsCard.scrollTop=0;});
  root._stableView.reveal=reveal;
  if(detailsCard){
   const pause=()=>{if(root._stableView?.run===run)root._stableView.following=false;};
   detailsCard.onwheel=pause;detailsCard.ontouchstart=pause;
   detailsCard.onkeydown=e=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key))pause();};
  }
 }
 function render(root,run){
  
  if(!run.live&&typeof DemoCatalog!=='undefined'){
   const request=typeof document.querySelectorAll==='function'?[...document.querySelectorAll('#chat-log .user p')].at(-1)?.textContent||'':'';
   DemoCatalog.capture(run,request);
  }
  if(!root._stableView||root._stableView.run!==run||!root.contains(root._stableView.stages))mount(root,run);
  const v=root._stableView;root.className='stable-activity';root.hidden=false;
  if(run.live&&run.selection){
   const e=run.selection,key=JSON.stringify(e);
   v.catalog.hidden=false;
   if(v.selectionKey!==key){v.selectionKey=key;v.catalogBody.replaceChildren();
    for(const p of e.policies){const section=element('section');section.append(element('h4','',p.title),element('code','sa-policy-version','Policy version · '+p.version),element('p','',p.rule));v.catalogBody.append(section);}
    v.catalogBody.append(element('p','sa-selection-method',e.method+' · '+e.excluded_count+' other tools not sent'));
    text(v.policy.querySelector('p'),run.policy);
   }
   text(v.tools.querySelector('h3'),'Selected for this request');
  }
  const active=run.tools.find(t=>t.state==='Running');
  const blocked=run.tools.filter(t=>t.state==='Failed').length;
  text(v.liveTool,active?'Now · '+label(active.name):run.phase===2?run.tools.filter(t=>t.state!=='Selected'&&t.state!=='Not called').length+' called · '+run.tools.filter(t=>t.state==='Not called').length+' not called'+(blocked?' · '+blocked+' blocked':''):run.tools.length+' tools selected');
  v.liveTool.dataset.running=String(!!active);
  [...v.stages.children].forEach((step,i)=>{step.dataset.current=String(i===run.phase);step.setAttribute('aria-current',i===run.phase?'step':'false');});
  v.summary.dataset.phase=String(run.phase);v.summary.dataset.running=String(!!active);
  text(v.currentTool,active?active.name+'()':run.prompt+' · '+run.tools.length+' tools · simulated catalog');v.currentTool.hidden=false;
  text(v.title,active?(titles[active.name]||'Checking your request'):run.title);
  text(v.description,run.result|| (run.phase===0?(run.intent==='checkout'?'Your checkout request uses the active stay and departure schedule.':run.intent==='cancel'?'Your cancellation requires a saved request and explicit approval.':run.intent==='upgrade'?'Your upgrade request matches the membership and stay-allowance policy.':run.intent==='dining'?'Your dinner request matches the restaurant hours and reservation policy.':'Your room request matches the dates, capacity and pricing policy.'):run.reason));
  for(const t of run.tools){let item=v.rows.get(t.id||t.name);if(!item){const row=element('div','sa-tool'),head=element('div','sa-tool-head'),identity=element('div','sa-tool-identity'),state=element('span','sa-state'),output=element('p','sa-output');row.dataset.tool=t.name;identity.append(element('strong','',label(t.name)),element('code','',t.name+'()'));head.append(identity,state);row.append(head,output);v.tools.append(row);item={row,state,output};v.rows.set(t.id||t.name,item);const explanation=element('div','sa-explanation');explanation.append(element('code','',t.name+'()'),element('p','',t.reason));v.why.append(explanation);}item.row.dataset.state=t.state;item.row.setAttribute('aria-current',t.state==='Running'?'step':'false');text(item.state,t.state==='Returned'?'Returned':t.state==='Selected'?'Selected':t.state==='Not called'?'Not called':t.state==='Failed'?'Blocked':'Running');text(item.output,(t.state==='Returned'||t.state==='Failed')?t.output:t.state==='Not called'?t.reason:t.state==='Running'?'Waiting for the tool result…':'Waiting for this check.');}
  text(v.memory,run.saved||'Simulation · no live hotel actions');
  if(active&&v.lastActive!==active.name){
   v.lastActive=active.name;
   // Preserve a reader's explanation; the pinned tool label stays visible there.
   if(v.following&&v.review.open&&!v.explanation.open&&!v.catalog.open)v.reveal(v.rows.get(active.id||active.name).row);
  }

 }
 return {render};
})();
