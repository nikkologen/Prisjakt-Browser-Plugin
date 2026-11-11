const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../src/queue');
test('queue limits concurrent work and continues after rejection',async()=>{
 const queue=globalThis.PJLow.createQueue(4);let active=0,max=0;
 const results=await Promise.allSettled(Array.from({length:12},(_,i)=>queue(async()=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,2));active--;if(i===2)throw Error('expected');return i;})));
 assert.equal(max,4);assert.equal(active,0);assert.equal(results.filter(r=>r.status==='fulfilled').length,11);
});
