const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const context=vm.createContext({TraceModel:{events:r=>r.traceEvents},HotelPolicies:[{name:'room',description:'Find rooms'}]});
vm.runInContext(fs.readFileSync('public/backend-story.js','utf8')+';this.story=BackendStory;',context);
const run={live:true,traceEvents:[{type:'tool',state:'Running',name:'search_rooms'},{type:'tool',state:'Returned',name:'search_rooms'},{type:'tool',state:'Running',name:'search_rooms'},{type:'tool',state:'Failed',name:'search_rooms'}],selection:{policies:[{name:'room',title:'Room',version:'hash:one',rule:'Ask first'}],selected_tools:['search_rooms','quote_room']}};
assert.deepEqual(JSON.parse(JSON.stringify(context.story.counts(run))),[{tool:'search_rooms',calls:2}]);
const prompt=context.story.prompt(run)[0];assert.equal(prompt.version,'hash:one');assert.equal(prompt.content,'Ask first');assert.equal(prompt.tools.length,2);
run.traceEvents=[];assert.equal(context.story.counts(run).length,0);
console.log('Backend story tests passed: actual calls only, repeated calls, policy revision and bindings, empty events.');
