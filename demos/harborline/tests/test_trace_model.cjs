const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={};vm.createContext(ctx);
for(const f of ['policy-manifest.js','guided-scenario.js','trace-model.js'])vm.runInContext(fs.readFileSync('public/'+f,'utf8'),ctx);
const evaluate=s=>JSON.parse(vm.runInContext('JSON.stringify('+s+')',ctx));
const manifest=JSON.parse(fs.readFileSync('lib/policies.json','utf8'));
for(const intent of ['upgrade','dining']){
 const fixture=evaluate(`GuidedScenario.create('${intent}',{tier:'Gold',used:false,available:true,ref:'DEMO-TEST',date:'2026-12-01',day:'Dec 1',guests:2})`);
 const policy=manifest.find(p=>p.id===intent);const published=evaluate(`HotelPolicies.find(p=>p.id==='${intent}')`);assert.equal(published.content,policy.content);assert.equal(published.version,'sha256:'+require('node:crypto').createHash('sha256').update(policy.content).digest('hex').slice(0,12));assert.equal(fixture.prompt,policy.name);assert.deepEqual(fixture.tools.map(t=>t.name),policy.tools);
}
const denied=evaluate("GuidedScenario.create('upgrade',{tier:'Silver',used:false,available:true,ref:'TEST'})");assert.equal(denied.tools.at(-1).call,false);
const events=evaluate(`TraceModel.events({live:false,selection:{policies:[{title:'Room upgrade'}]}},{id:'SAMPLE-1',request:'Upgrade',events:[{tool:'apply_upgrade',state:'Running',arguments:{},time:'2026-11-12T12:00:00Z'},{tool:'apply_upgrade',state:'Returned',result:{extra_charge:0},time:'2026-11-12T12:00:01Z'}],status:'Complete',response:'Upgraded'})`);
assert.deepEqual(events.map(e=>e.type),['request','selection','tool','tool','answer']);assert.equal(events[2].call_id,events[3].call_id);assert.equal(events[3].output.extra_charge,0);assert.ok(events.every(e=>e.example&&!e.trace.verified));
assert.deepEqual(evaluate("TraceModel.events({live:true,traceEvents:[{type:'answer',trace:{verified:true}}]},null)"),[{type:'answer',trace:{verified:true}}]);
console.log('Trace contracts passed: policy parity, execution order, blocked upgrade, sample labels, live passthrough.');
