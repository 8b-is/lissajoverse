import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html', import.meta.url),'utf8');
const source=html.slice(html.indexOf("  const btnRecord ="),html.indexOf('  // ── boot'));
function setup(){
 const button={classList:{add(){},remove(){}},addEventListener(_,f){this.click=f}}, status={};
 const pending=[];
 const context=vm.createContext({document:{getElementById:id=>id==='btn-record'?button:status},Date,Math,navigator:{userAgent:'synthetic'},setInterval:()=>1,clearInterval(){},fetch:(_,options)=>new Promise((resolve,reject)=>pending.push({resolve,reject,body:JSON.parse(options.body)}))});
 vm.runInContext(source+'\nthis.fixture={set:(id,items)=>{sessionId=id;frames=items;recording=true;uploadedTotal=0},upload:uploadFrames,snapshot:()=>({sessionId,frames,uploadedTotal})};',context);
 return {api:context.fixture,pending,status};
}
const results=[];
for(const outcome of ['failure','success','current-failure','current-success']){
 const f=setup();f.api.set('old',[{t:1,marker:'old'}]);const job=f.api.upload();
 if(!outcome.startsWith('current-')) {
  f.api.set('new',[{t:2,marker:'new'}]);
  f.status.textContent='new session capturing';
  f.status.className='new session';
 }
 if(outcome.endsWith('failure'))f.pending[0].reject(new Error('synthetic offline'));
 else f.pending[0].resolve({ok:true,json:async()=>({path:'old-session'})});
 await job;
 const actual=JSON.parse(JSON.stringify(f.api.snapshot()));
 assert.equal(f.pending[0].body.session,'old');
 if(outcome.startsWith('current-')) {
  assert.equal(actual.sessionId,'old');
  assert.equal(actual.uploadedTotal,outcome.endsWith('success')?1:0);
  assert.deepEqual(actual.frames,outcome.endsWith('failure')?[{t:1,marker:'old'}]:[]);
 } else {
  assert.equal(f.status.textContent,'new session capturing');
  assert.equal(f.status.className,'new session');
  assert.equal(actual.sessionId,'new');
  assert.equal(actual.uploadedTotal,0);
  assert.deepEqual(actual.frames,[{t:2,marker:'new'}]);
 }
 results.push({outcome,passed:true});
}
console.log(JSON.stringify({source:'index.html recording block',network:'mocked only',results},null,2));
