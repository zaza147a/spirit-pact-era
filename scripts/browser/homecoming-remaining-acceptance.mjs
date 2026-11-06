import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {HOMECOMING_ROUTES as ROUTES} from '../../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES as A,newHomecomingAdventure,advanceAdventure,adventureChoiceError,adventureLocation} from '../../dist/homecoming-adventures.js';
const root=resolve('dist'),out=resolve(process.env.BROWSER_QA_OUTPUT||'browser-qa/homecoming-remaining');await mkdir(out,{recursive:true});
const saved=JSON.parse(await readFile('docs/homecoming-main-integration/complete-save.json','utf8'));
const bridge=`
if(typeof window!=='undefined')window.remainingQA={
 load(saved,id,adventure){resetSession();player=normalize(saved.player||saved);const pet=player.pets.find(p=>homecomingIdentity(p)===id);player.pets=[pet];player.activePetId=pet.id;player.homecoming={routes:{[id]:{phase:'active',journeyIndex:2,adventure}},completedRoutes:{}};normalizeHomecoming(player);const route=HOMECOMING_ROUTES.find(r=>r.id===id);player.location=adventureLocation(route,HOMECOMING_ADVENTURES[id].nodes[adventure.step]);player.manualPaused=true;player.offline={at:Date.now(),enabled:false};auto=false;gameRunning=true;activeSlot=0;player.hp=stat('hp');pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;$('entryScreen').hidden=true;$('gameShell').hidden=false;tab='homecoming';selectedContinent=route.continentId;renderMapChoices();spawn();save();render();renderSide(true);},
 snapshot(){return {homecoming:structuredClone(player.homecoming),location:player.location,hp:player.hp,sp:activePet().sp,gold:player.gold,kills:player.kills,energy:fourthState(activePet()).energy,casts:fourthState(activePet()).casts,backgroundPaused,settlingOffline,offline:structuredClone(player.offline),auto};},
 action(id,a,c){return homecomingAction(id,a,c);},
 primeEnergy(n){fourthState(activePet()).energy=n;},
 async worker(duration){const p=structuredClone(player);p.offline={at:Date.now()-duration,enabled:true};return await new Promise((resolve,reject)=>{const w=new Worker(new URL('offline-worker.js?v=6.5.78-homecoming-20261106',document.baseURI),{type:'module'});w.onmessage=e=>{if(e.data.type==='result'){w.terminate();resolve(e.data.result);}if(e.data.type==='error'){w.terminate();reject(Error(e.data.message));}};w.onerror=e=>reject(Error(e.message));w.postMessage({player:p,now:Date.now()});});},
 normalField(){player.location='dawnrift';player.manualPaused=false;auto=true;player.offline={at:Date.now()-12000,enabled:true};spawn();save();player.offline={at:Date.now()-12000,enabled:true};},
 async settle(){return await settleOffline();},
 stop(){gameRunning=false;}
};
`;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/favicon.ico'){res.writeHead(204);return res.end();}const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))throw Error('path');let data=await readFile(file);if(file===resolve(root,'game.js'))data=Buffer.from(data.toString().replace('\ninit();','\n'+bridge+'\ninit();'));res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);}catch(e){res.writeHead(404);res.end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const rows=[],negative=[],lifecycle=[],errors=[],requests=[];let browser,passed=false;
try{
 browser=await chromium.launch({headless:false});const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('dialog',d=>d.accept());page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push({url:r.url(),status:r.status()});});await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>!!window.remainingQA);
 const load=(id,a)=>page.evaluate(({saved,id,a})=>remainingQA.load(saved,id,a),{saved,id,a}),snap=()=>page.evaluate(()=>remainingQA.snapshot());
 for(const route of ROUTES){
  const pending=[newHomecomingAdventure(route.id)],seen=new Set(),good=new Map(),bad=new Map();
  while(pending.length){const a=pending.shift(),key=a.step+JSON.stringify(a.vars);if(seen.has(key))continue;seen.add(key);assert.ok(seen.size<100000);const node=A[route.id].nodes[a.step];if(node.combat){const next=structuredClone(a);if(!advanceAdventure(route,next,null,{victory:true}))pending.push(next);continue;}
   for(const c of node.choices){const key=a.step+':'+c.id;if(adventureChoiceError(a,c)){if(!bad.has(key))bad.set(key,{a:structuredClone(a),c});continue;}if(!good.has(key))good.set(key,{a:structuredClone(a),c});const next=structuredClone(a),done=advanceAdventure(route,next,c.id);if(!done&&Object.values(next.vars).every(v=>v<=8))pending.push(next);}
  }
  assert.equal(good.size,Object.values(A[route.id].nodes).reduce((n,x)=>n+(x.choices?.length||0),0),'all options reachable '+route.id);
  for(const {a,c}of good.values()){
   await load(route.id,a);const expected=structuredClone(a),done=advanceAdventure(route,expected,c.id);await page.locator(`[data-homecoming="choose"][data-route="${route.id}"][data-choice="${c.id}"]`).click();const after=await snap();assert.deepEqual(after.homecoming.routes[route.id].adventure,expected);assert.equal(after.homecoming.routes[route.id].phase,done?'ready':'active');rows.push({route:route.id,step:a.step,choice:c.id,next:expected.step,phase:done?'ready':'active'});
  }
  for(const {a,c}of bad.values()){
   await load(route.id,a);const before=(await snap()).homecoming;await page.locator(`[data-homecoming="choose"][data-route="${route.id}"][data-choice="${c.id}"]`).click();assert.deepEqual((await snap()).homecoming,before);negative.push({route:route.id,step:a.step,choice:c.id,guard:'unmet requirement'});
  }
  await load(route.id,newHomecomingAdventure(route.id));const before=(await snap()).homecoming;for(const [action,choice]of [['choose','unknown-choice'],['claim',null],['next',null],['arrive',null]]){const result=await page.evaluate(({id,action,choice})=>remainingQA.action(id,action,choice),{id:route.id,action,choice});assert.equal(result,false);assert.deepEqual((await snap()).homecoming,before);negative.push({route:route.id,guard:'invalid '+action});}
  console.log(JSON.stringify({route:route.id,options:good.size,rejected:bad.size}));
 }
 // Native tab visibility and return, using the real visibilitychange handler.
 const route=ROUTES[0];await load(route.id,newHomecomingAdventure(route.id));await page.evaluate(()=>remainingQA.primeEnergy(61));const before=await snap();const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForFunction(()=>document.hidden,null,{polling:100});await page.waitForTimeout(11000);const hidden=await snap();assert.equal(hidden.backgroundPaused,true);assert.equal(hidden.energy,61);assert.deepEqual(hidden.homecoming,before.homecoming);assert.equal(hidden.kills,before.kills);await page.bringToFront();await page.waitForFunction(()=>!document.hidden&&!remainingQA.snapshot().backgroundPaused&&!remainingQA.snapshot().settlingOffline);const returned=await snap();assert.deepEqual(returned.homecoming,before.homecoming);assert.equal(returned.energy,0);assert.equal(returned.offline.enabled,false);lifecycle.push({case:'native hidden homecoming tab and return',seconds:11,energyHidden:hidden.energy,energyReturned:returned.energy,noStoryProgress:true,noOfflineReward:true});await other.close();
 // Real Worker refuses to advance a homecoming map even when fed enabled stale timestamps.
 for(const seconds of [12,3600,86401]){const start=await snap(),result=await page.evaluate(ms=>remainingQA.worker(ms),seconds*1000);assert.equal(result.summary,null);assert.deepEqual(result.player.homecoming,start.homecoming);assert.equal(result.player.gold,start.gold);assert.equal(result.player.kills,start.kills);lifecycle.push({case:'homecoming Worker exclusion',seconds,summary:null});}
 // Normal field still settles with a real Worker and preserves all story state.
 const story=(await snap()).homecoming;await page.evaluate(()=>remainingQA.normalField());const result=await page.evaluate(()=>remainingQA.settle());assert.ok(result&&result.simulated>=10000);assert.deepEqual((await snap()).homecoming,story);assert.equal((await snap()).settlingOffline,false);lifecycle.push({case:'normal field real Worker settlement',simulatedMs:result.simulated,storyUnchanged:true});
 await page.evaluate(()=>remainingQA.stop());await page.screenshot({path:resolve(out,'remaining-complete.png')});assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);passed=true;await writeFile(resolve(out,'report.json'),JSON.stringify({passed,sourceSha:process.env.GITHUB_SHA,browserVersion:browser.version(),scope:'reachable controlled quest fixtures; actual UI choices and native headed Chromium tab visibility; actual Worker without artificial victories',rows,negative,lifecycle,errors,requests},null,2));
}catch(e){await writeFile(resolve(out,'failure.json'),JSON.stringify({passed:false,error:String(e.stack),rows,negative,lifecycle,errors,requests},null,2));throw e;}finally{await browser?.close();await new Promise(r=>server.close(r));}console.log(JSON.stringify({passed,choices:rows.length,negative:negative.length,lifecycle:lifecycle.length}));
