import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {FOURTH_SKILLS} from '../../dist/companion-fourth-skill.js';
const root=resolve('dist'),out=resolve(process.env.BROWSER_QA_OUTPUT||'browser-qa/homecoming-fourth');await mkdir(out,{recursive:true});
const save=JSON.parse(await readFile('docs/homecoming-main-integration/complete-save.json','utf8'));
// Test-only instrumentation is served in memory. Repository gameplay bytes stay unchanged.
// Fixture energy/SP/targets isolate boundaries; time and all skill damage use the real browser runtime.
const bridge=`
window.fourthQA={
 setup(saved,pair){resetSession();player=normalize(saved.player||saved);const pet=player.pets.find(p=>fourthPair(p)===pair);if(!pet)throw Error('missing pet');player.activePetId=pet.id;player.location='dawnrift';player.hp=stat('hp');pet.hp=petStats(pet).hp;pet.sp=100;auto=true;gameRunning=false;activeSlot=0;report=null;enemies=[0,1,2,3].map(i=>({...DAWN_BOSS,id:'qa-target-'+i,instanceId:'qa-'+i,hp:1e15,maxHp:1e15,def:0,mdef:0,atk:1,matk:1,slotIndex:i}));enemy=enemies[0];fourthState(pet);$('entryScreen').hidden=true;$('gameShell').hidden=false;render();},
 snapshot(){const p=activePet(),s=fourthState(p);return {pair:fourthPair(p),energy:s.energy,casts:s.casts,events:s.events,sp:p.sp,nextCast:s.nextCast,now:gameNow(),auto,hp:player.hp,petHp:p.hp,targetHp:enemies.map(e=>e.hp),ui:renderCompanionFourthSlot(p)};},
 fixture(v){const p=activePet(),s=fourthState(p);if('energy'in v)s.energy=v.energy;if('sp'in v)p.sp=v.sp;if('auto'in v)auto=v.auto;if('ownerHp'in v)player.hp=v.ownerHp;if('petHp'in v)p.hp=v.petHp;if('town'in v)player.location=v.town?'town':'dawnrift';if('control'in v)controlEffect=v.control?{until:gameNow()+60000}:null;},
 tick(){tickCompanionFourth(gameNow());},event(e){fourthOwnerEvent(e);},
 start(){this.stop();window.qaTicker=setInterval(()=>{if(!document.hidden)tickCompanionFourth(gameNow());},20);},stop(){clearInterval(window.qaTicker);},
 show(){render();$('side').innerHTML=renderCompanionFourthSlot(activePet());},
 reset(){resetSession();}
};
`;
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://local').pathname);if(path==='/favicon.ico'){res.writeHead(204);return res.end();}const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))throw Error('path');let data=await readFile(file);if(file===resolve(root,'game.js')){let source=data.toString();assert.equal((source.match(/\ninit\(\);/g)||[]).length,1);data=Buffer.from(source.replace('\ninit();','\n'+bridge+'\ninit();'));}res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);}catch(e){res.writeHead(404);res.end(String(e));}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser,page,passed=false;const rows=[],errors=[],requests=[];
try{
 browser=await chromium.launch({headless:true});page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push({status:r.status(),url:r.url()});});page.on('dialog',d=>d.accept());await page.goto(`http://127.0.0.1:${server.address().port}`);await page.waitForFunction(()=>!!window.fourthQA);
 const snap=()=>page.evaluate(()=>fourthQA.snapshot()),fixture=v=>page.evaluate(v=>fourthQA.fixture(v),v),tick=()=>page.evaluate(()=>fourthQA.tick());
 for(const [pair,skill]of Object.entries(FOURTH_SKILLS)){
  await page.evaluate(({save,pair})=>fourthQA.setup(save,pair),{save,pair});
  // Actual owner-event dispatch credits the configured event once, suppressing same-frame duplicates.
  const event=Object.keys(skill.events)[0];await page.evaluate(e=>{fourthQA.event(e);fourthQA.event(e);},event);let s=await snap();assert.equal(s.events,1);assert.equal(s.energy,skill.events[event]);
  await fixture({energy:100,sp:19});await tick();assert.equal((await snap()).casts,0);assert.equal((await snap()).sp,19);
  for(const blocker of [{auto:false},{ownerHp:0},{petHp:0},{town:true},{control:true}]){
   await fixture({auto:true,ownerHp:100,petHp:100,town:false,control:false,sp:100,...blocker});await tick();assert.equal((await snap()).casts,0,JSON.stringify(blocker));assert.equal((await snap()).energy,100);}
  await fixture({auto:true,ownerHp:100,petHp:100,town:false,control:false,sp:20});const before=await snap();await tick();s=await snap();assert.equal(s.casts,1);assert.equal(s.sp,0);assert.equal(s.energy,0);assert.ok(s.targetHp[0]<before.targetHp[0]);assert.equal(s.targetHp.filter((hp,i)=>hp<before.targetHp[i]).length,skill.targets);
  await fixture({energy:100,sp:100});await tick();assert.equal((await snap()).casts,1);assert.equal((await snap()).sp,100);await page.waitForTimeout(skill.cooldown+80);await tick();s=await snap();assert.equal(s.casts,2);assert.equal(s.sp,80);assert.equal(s.energy,0);
  await page.evaluate(()=>fourthQA.show());assert.ok((await page.locator('#side').innerText()).includes(skill.name));assert.ok((await page.locator('#side').innerText()).includes('消耗 SP 20'));await page.screenshot({path:resolve(out,pair+'.png')});
  rows.push({pair,name:skill.name,event,eventPoints:skill.events[event],spPerCast:20,cooldownMs:skill.cooldown,casts:s.casts,targets:skill.targets,blockers:['SP19','auto off','owner dead','pet dead','town','control'],passed:true});
 }
 // Real-time fallback and actual auto button, with no injected events, damage or clock.
 await page.evaluate(({save})=>fourthQA.setup(save,'attack-magic'),{save});await fixture({energy:0,sp:100});await page.evaluate(()=>fourthQA.start());await page.waitForTimeout(1200);let a=await snap();assert.ok(a.energy>=3&&a.energy<=8);
 await page.locator('#autoBtn').click();assert.equal((await snap()).auto,false);const paused=await snap();await page.waitForTimeout(1200);assert.equal((await snap()).energy,paused.energy);assert.equal((await snap()).casts,0);
 await page.locator('#autoBtn').click();const resumedAt=Date.now();await page.waitForFunction(()=>fourthQA.snapshot().casts===1,{},{timeout:29000});let done=await snap();assert.equal(done.sp,80);assert.ok(Date.now()-resumedAt>=22000);await page.evaluate(()=>fourthQA.stop());
 const fallback={passed:true,firstWindowEnergy:a.energy,pausedEnergy:paused.energy,resumeToCastMs:Date.now()-resumedAt,spAfter:done.sp};
 // A delayed frame can add at most 4, rather than banking the whole elapsed interval.
 await fixture({energy:0});await page.waitForTimeout(1200);await tick();assert.ok((await snap()).energy<=4);await page.evaluate(()=>fourthQA.reset());assert.equal((await snap()).energy,0);
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);passed=true;await writeFile(resolve(out,'report.json'),JSON.stringify({passed,sourceSha:process.env.GITHUB_SHA,browserVersion:browser.version(),scope:'controlled fixtures for resource/cooldown/target boundaries; native clock fallback and real pause button; not a natural DPS benchmark',rows,fallback,errors,requests},null,2));
}catch(error){await writeFile(resolve(out,'failure.json'),JSON.stringify({passed:false,error:String(error.stack),rows,errors,requests},null,2));throw error;}finally{await browser?.close();await new Promise(r=>server.close(r));}console.log(JSON.stringify({passed,skills:rows.length}));
