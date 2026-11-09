/* Browser-only catalog and event ledger. No network, embeddings or SQL execution. */
const DemoCatalog=(()=>{
 const definitions=[
  ['loyalty-upgrade','Upgrade','guided-scenario.js',['check_loyalty_tier','find_reservations','apply_upgrade']],
  ['dining-and-spa','Dinner','guided-scenario.js',['get_outlet_hours','book_restaurant','get_menu']],
  ['late-checkout','Late checkout','guided-scenario.js',['find_reservations','check_departure_schedule','update_checkout']],
  ['cancel-reservation','Cancel a booking','guided-run.js',['search_memory','find_reservations','cancel_reservation','update_memory']],
  ['room_search_policy','Find a room','app.js',['validate_stay','search_rooms','quote_room']],
  ['room_confirmation_policy','Confirm a room','app.js',['check_room_availability','create_reservation','update_reservation']]
 ].map(([name,label,source,tools])=>({name,label,source,tools}));
 let revision=1,serial=0;const records=new Map();
 const labels={search_memory:'Recall the saved request',check_departure_schedule:'Check the next arrival',update_checkout:'Update checkout time',cancel_reservation:'Cancel the booking',update_memory:'Save the new status',check_loyalty_tier:'Check membership',find_reservations:'Find the guest’s stay',apply_upgrade:'Upgrade the room',get_outlet_hours:'Check restaurant hours',book_restaurant:'Reserve a table',get_menu:'Read the menu',validate_stay:'Check stay dates',search_rooms:'Find available rooms',quote_room:'Calculate the price',check_room_availability:'Recheck availability',create_reservation:'Save the booking',update_reservation:'Update the booking'};
 const label=name=>labels[name]||name.replaceAll('_',' ');
 const tools=[...new Set(definitions.flatMap(p=>p.tools))];
 function publish(){return 'demo-v'+(++revision);}
 function interrupt(){for(const r of records.values())if(r.status==='Running')r.status='Interrupted';}
 function capture(run,request=''){
  if(!run.traceId)run.traceId='RUN-'+String(++serial).padStart(3,'0');
  let record=records.get(run.traceId);
  if(!record){interrupt();record={id:run.traceId,request,policy:run.prompt,revision:'demo-v'+revision,source:definitions.find(p=>p.name===run.prompt)?.source||'demo fixture',rule:run.policy,selected:run.tools.map(t=>t.name),excluded:tools.filter(n=>!run.tools.some(t=>t.name===n)),events:[],states:{},status:'Running',result:'',response:'',saved:'',mode:'Scripted simulation · browser memory only'};records.set(record.id,record);}
  if(record.status==='Complete'){if(run.saved)record.saved=run.saved;return record;}
  for(const t of run.tools){if(record.states[t.name]!==t.state){record.events.push({time:new Date().toISOString(),tool:t.name,state:t.state,output:t.state==='Returned'?t.output:t.state==='Not called'?t.reason:''});record.states[t.name]=t.state;}}
  if(run.result){record.result=run.result;record.response=run.response||run.result;record.saved=run.saved||'';record.status='Complete';}
  return record;
 }
 function list(){return [...records.values()].map(r=>structuredClone(r));}
 function usage(){const counts={};for(const r of records.values())for(const e of r.events)if(e.state==='Returned')counts[e.tool]=(counts[e.tool]||0)+1;return Object.entries(counts).sort((a,b)=>b[1]-a[1]);}
 return {label,definitions,tools,publish,interrupt,capture,list,usage,version:()=> 'demo-v'+revision};
})();
