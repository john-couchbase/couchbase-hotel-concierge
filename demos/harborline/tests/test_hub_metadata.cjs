const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('public/hub.js','utf8');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync('public/tool-manifest.js','utf8')+'\n'+fs.readFileSync('public/policy-manifest.js','utf8')+'\n'+src.slice(src.indexOf('function sampleRecords()'),src.indexOf(' function tab('))+'\nthis.rows=sampleRecords();',context);
for(const row of context.rows){assert.equal(row.location.bucket,'vector-learning');assert.equal(row.location.scope,'agent_catalog');assert.equal(row.location.collection,row.kind==='tool'?'tools':'prompts');assert.ok(row.record.version.identifier);assert.ok(row.record.version.timestamp);assert.match(row.record.source,/simulation/);}
const ui=fs.readFileSync('public/simple-activity.js','utf8');assert.match(ui,/\['Returned','Failed'\]\.includes\(t.state\)/);
console.log('Passed: all simulated catalog metadata populated; tool link includes executed states only.');
