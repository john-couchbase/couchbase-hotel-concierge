const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Node {
 constructor(){this.children=[];this.dataset={};this.className='';this.classList={add(){}};}
 append(...nodes){for(const n of nodes){n.remove();n.parent=this;this.children.push(n);}}
 prepend(...nodes){this.append(...nodes);}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;}
 replaceChildren(...nodes){for(const n of [...this.children])n.remove();this.append(...nodes);}
 contains(n){return this.children.some(c=>c===n||c.contains(n));}
 setAttribute(){} close(){} showModal(){} focus(){}
 querySelectorAll(s){return this.children.flatMap(c=>[...(s.split(',').some(x=>x.trim()==='.'+c.className)?[c]:[]),...c.querySelectorAll(s)]);}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
}
const root=new Node(),tools=new Node();tools.className='sf-tools';root.append(tools);
let completion,submitted=0,disposed=0;const timers=new Map();let serial=0;
const body=new Node(),controls=new Node();
const context=vm.createContext({busy:false,document:{body,createElement:()=>new Node(),querySelectorAll:()=>[controls],querySelector:()=>null,addEventListener(){}},StableActivity:{render(){}},submit(){submitted++;},clearActivity(){},HotelPolicies:[],TraceModel:{events:()=>[]},DemoCatalog:{list:()=>[]},BackendStory:{mount:()=>({dispose(){},show(){}})},MeaningAnimation:{mount:(host,options)=>{completion=options.onComplete;assert.equal(options.durations.reduce((a,b)=>a+b,0)+options.holdMs+2400+100,9600);return()=>disposed++;}},setTimeout:fn=>{timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id),setInterval:()=>++serial,clearInterval(){}});
vm.runInContext(fs.readFileSync('public/inline-process.js','utf8'),context);
const run={live:false,intent:'room',phase:2,tools:[]};
context.StableActivity.render(root,run);
context.submit('duplicate');assert.equal(submitted,0);
assert.equal(root.querySelectorAll('.ip-nav').length,1);
// Same record rendered again after clear: the original production duplication path.
context.clearActivity();context.StableActivity.render(root,run);
assert.equal(root.querySelectorAll('.ip-nav').length,1);assert.equal(root.querySelectorAll('.ip-details').length,1);assert.equal(root.querySelectorAll('.ip-tool-nav').length,1);assert.equal(body.children.length,1);assert.equal(disposed,1);
completion();for(const fn of [...timers.values()])fn();
assert.equal(root.dataset.screen,'decision');assert.equal(root.dataset.presenting,'false');
context.submit('next');assert.equal(submitted,1);
for(let i=0;i<20;i++){context.StableActivity.render(root,run);assert.equal(root.querySelectorAll('.ip-nav').length,1);}
context.clearActivity();assert.equal(body.children.length,0);assert.equal(root.querySelectorAll('.ip-nav').length,0);
console.log('Passed: reset/remount singleton, repeated updates, request lock, paced timing, unlock, disposal.');
