/* Readable session evidence. Sample runs are explicitly distinguished from backend traces. */
const ActivityTracer=(()=>{
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const dialog=el('dialog','','sf-tracer'),header=el('header'),title=el('h2','Session trace'),close=el('button','Close'),source=el('p','','sf-trace-source'),log=el('div','','sf-trace-log');
 dialog.setAttribute('aria-label','Session trace');close.type='button';close.onclick=()=>dialog.close();header.append(title,close);dialog.append(header,source,log);document.body.append(dialog);
 let current=null,events=[],rows=[];
 function draw(){
  source.textContent=current.live?'Backend events for this request':'Scripted example using the same event structure';
  events.forEach((event,i)=>{
   let row=rows[i];if(!row){const box=el('details','','sf-event'),head=el('summary'),tag=el('span','','sf-event-tag'),name=el('strong'),text=el('p'),pre=el('pre');const identity=el('span','','sf-event-identity');identity.append(tag,name);head.append(identity,text);box.append(head,pre);log.append(box);row={box,tag,name,text,pre};rows.push(row);}
   const d=TraceModel.describe(event);row.box.dataset.kind=d.tone;row.tag.textContent=d.kind;row.name.textContent=d.title;row.text.textContent=d.text||'';row.pre.textContent=JSON.stringify(event,null,2);
  });
 }
 return {
  open(run){if(current!==run){current=run;events=TraceModel.events(run,run.live?null:DemoCatalog.list().find(r=>r.id===run.traceId));rows=[];log.replaceChildren();}draw();dialog.showModal();close.focus();},
  update(run,next){if(current!==run){if(!dialog.open)return;current=run;rows=[];log.replaceChildren();}events=next;if(dialog.open)draw();}
 };
})();
