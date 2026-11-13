const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c=vm.createContext({});vm.runInContext(fs.readFileSync('public/live-response-fixtures.js','utf8'),c);
assert.equal(vm.runInContext("LiveResponseFixtures.rooms([{name:'Harbor King',rate:18900}])",c),'Harbor King at 189 USD/night. Choose a room for the total.');
assert.equal(vm.runInContext("LiveResponseFixtures.dinner({guests:2,date:'2026-12-18',hour:20,reference:'DEMO-FRESH'})",c),'Dinner saved for 2 on 2026-12-18 at 20:00. Reference: DEMO-FRESH.');
console.log('Live-derived fixtures use runtime values and convert cents to dollars.');
