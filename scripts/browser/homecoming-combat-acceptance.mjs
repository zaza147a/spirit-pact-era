import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {runtime} from '../../tests/runtime31-helper.mjs';
import {homecomingPlayer} from '../../tests/fixtures/homecoming-player.mjs';
import {HOMECOMING_ROUTES} from '../../dist/homecoming-data.js';
import {HOMECOMING_ENCOUNTERS,homecomingOpponent} from '../../dist/homecoming-encounters.js';
import {newHomecomingAdventure} from '../../dist/homecoming-adventures.js';

const out=resolve(process.env.BROWSER_QA_OUTPUT||'browser-qa/homecoming-combat'),root=resolve('dist');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/favicon.ico'){res.writeHead(204);return res.end();}const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))throw Error('path');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let browser,passed=false;const rows=[],losses=[],errors=[],requests=[];
const potions=p=>p.bag.filter(x=>/^(red|blue)_/.test(x.id)).reduce((n,x)=>n+x.qty,0);
async function fixture(routeId,step,weak=false){
 const p=homecomingPlayer('knight',routeId),route=HOMECOMING_ROUTES.find(r=>r.id===routeId);
 Object.assign(p,{name:weak?'戰敗流程驗收':'自然戰鬥驗收',location:route.townId,manualPaused:true,dawnNotified:true,autoRevive:false,autoEscapeBoss:false,offline:{at:Date.now(),enabled:false},battleHistory:[]});
 p.homecoming={routes:{[routeId]:{phase:'active',journeyIndex:2,adventure:{...newHomecomingAdventure(routeId),step}}},completedRoutes:{}};
 // A VM is used ONLY to normalize the imported fixture and calculate legal full
 // HP/SP. It never drives the browser fight or supplies damage/victory events.
 if(weak){p.gear=Object.fromEntries(Object.keys(p.gear).map(k=>[k,null]));p.sockets={};p.bag=[];p.autoPotions={playerHp:false,playerSp:false,petHp:false,petSp:false};p.autoBuyPotions={hp:{enabled:false},sp:{enabled:false}};}
 const c=await runtime(),a=c.api;a.setup(a.normalize(p),null);const owner=a.state().player,pet=owner.pets[0];
 assert.ok(a.valid(owner));assert.equal(owner.level,210);assert.equal(owner.dawnSigil,8);assert.equal(Object.values(owner.attributes).reduce((n,v)=>n+v-1,0),438);assert.ok(Object.values(owner.attributes).every(v=>v<=150));assert.ok(a.stat('damageReduction')<=40);assert.ok(a.petStats(pet).damageReduction<=40);
 owner.hp=a.stat('hp');owner.mp=a.stat('mp');pet.hp=a.petStats(pet).hp;pet.sp=a.petStats(pet).sp;
 return {player:owner,legal:{level:owner.level,sigil:8,attributes:438,attributeCap:150,ownerMaxHp:owner.hp,ownerReduction:a.stat('damageReduction'),petMaxHp:pet.hp,petReduction:a.petStats(pet).damageReduction,weak},route};
}
const stored=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-1'))?.player);
async function snapshot(page,routeId){return page.evaluate(id=>{
 const p=JSON.parse(localStorage.getItem('icarus-character-slot-1'))?.player;
 const hp=(selector,label)=>{const row=[...document.querySelectorAll(selector+' .meterline')].find(x=>x.firstElementChild?.textContent.trim()===label);return Number(row?.lastElementChild?.textContent.split('/')[0]?.replaceAll(',','').trim());};
 return {phase:p?.homecoming?.routes[id]?.phase,step:p?.homecoming?.routes[id]?.adventure?.step,hp:hp('#character','HP'),petHp:hp('#companion','夥伴 HP'),reviveVisible:getComputedStyle(document.querySelector('#reviveModal')).display!=='none',visible:document.visibilityState};
 },routeId);}
async function open(f){
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true}),page=await context.newPage();
 page.on('dialog',d=>d.accept());page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push({url:r.url(),status:r.status()});});
 await page.goto(base);await page.locator('[data-slot-select="0"]').click();await page.locator('#saveFile').setInputFiles({name:'natural-combat.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,player:f.player}))});await page.locator('#enterGameBtn').click();await page.locator('#gameShell').waitFor({state:'visible'});await page.locator('#homecomingOpen').click();
 assert.equal((await stored(page)).homecoming.routes[f.route.id].adventure.step,f.player.homecoming.routes[f.route.id].adventure.step);
 return {context,page};
}
async function exportPlayer(page){await page.locator('#returnEntryBtn').click();const d=page.waitForEvent('download');await page.locator('[data-slot-export="0"]').click();return JSON.parse(await readFile(await (await d).path(),'utf8')).player;}
try{
 browser=await chromium.launch({headless:true});
 for(const [routeId,nodes] of Object.entries(HOMECOMING_ENCOUNTERS))for(const step of Object.keys(nodes)){
  const f=await fixture(routeId,step),{context,page}=await open(f),foe=homecomingOpponent(routeId,step),tag=routeId+'-'+step;
  const before=await stored(page);await page.locator(`[data-homecoming="go"][data-route="${routeId}"]`).click();await page.locator('#autoBtn').click();
  await page.locator('#encounter .enemy-label').filter({hasText:foe.name}).waitFor();
  await page.locator(`#encounter img[src="${foe.artPath}"]`).evaluate(el=>el.decode());
  await page.screenshot({path:resolve(out,tag+'-start.png')});
  const started=Date.now();let minHp=f.legal.ownerMaxHp,petDeaths=0,petAlive=true,observed=null;
  while(Date.now()-started<180000){
   observed=await snapshot(page,routeId);assert.equal(observed.visible,'visible','Real foreground time is required');
   if(Number.isFinite(observed.hp))minHp=Math.min(minHp,observed.hp);
   if(petAlive&&observed.petHp<=0)petDeaths++;petAlive=observed.petHp>0;
   if(observed.reviveVisible)throw Error('Natural build defeated: '+tag);
   if(observed.phase!=='active'||observed.step!==step)break;
   await page.waitForTimeout(250);
  }
  assert.ok(observed&&(observed.phase!=='active'||observed.step!==step),'Natural fight timed out: '+tag);
  await page.locator('#autoBtn').click();await page.locator('#saveBtn').click();
  const saved=await stored(page),report=saved.battleHistory.find(x=>x.monster===foe.id&&x.endedAt);
  assert.ok(report,'Actual completed battle report missing');assert.equal(report.outcome,foe.nonlethal?'演武通過':'任務戰鬥完成');
  const damage=['playerDamage','playerBuffDamage','petDamage','resonanceDamage','buffDamage'].reduce((n,k)=>n+(report.metrics[k]||0),0);assert.ok(damage>=foe.hp,'No natural damage evidence');
  assert.ok(saved.hp>0);assert.equal(saved.gold,before.gold);assert.equal(saved.xp,before.xp);assert.equal(saved.jobXp,before.jobXp);assert.equal(saved.kills,before.kills);assert.deepEqual(saved.cards,before.cards);assert.deepEqual(Object.keys(saved.homecoming.completedRoutes),[]);assert.equal(saved.offline.enabled,false);
  assert.ok(saved.bag.every(x=>/^(red|blue)_/.test(x.id)),'Unexpected story loot');
  await page.screenshot({path:resolve(out,tag+'-win.png')});
  const exported=await exportPlayer(page);assert.equal(exported.homecoming.routes[routeId].phase,saved.homecoming.routes[routeId].phase);assert.equal(exported.homecoming.routes[routeId].adventure.step,saved.homecoming.routes[routeId].adventure.step);
  await page.reload();await page.locator('#enterGameBtn').click();await page.locator('#gameShell').waitFor({state:'visible'});const resumed=await stored(page);assert.equal(resumed.homecoming.routes[routeId].phase,saved.homecoming.routes[routeId].phase);assert.equal(resumed.homecoming.routes[routeId].adventure.step,saved.homecoming.routes[routeId].adventure.step);
  rows.push({routeId,step,enemy:foe.name,boss:foe.boss,nonlethal:foe.nonlethal,seconds:(report.endedAt-report.startedAt)/1000,minHpPercent:+(minHp/f.legal.ownerMaxHp*100).toFixed(2),petDeaths,potions:potions(before)-potions(saved),nextPhase:saved.homecoming.routes[routeId].phase,nextStep:saved.homecoming.routes[routeId].adventure.step,damage,enemyHp:foe.hp,metrics:report.metrics,legal:f.legal,exportAndReload:true});
  console.log(JSON.stringify(rows.at(-1)));await context.close();
 }
 // Legal unequipped controls verify defeat/return/save behavior. These are not
 // difficulty benchmarks: auto attacks and all supplies stay OFF intentionally.
 for(const [routeId,step] of [['attack-magic','breach'],['support-attack','duel']]){
  const f=await fixture(routeId,step,true),{context,page}=await open(f),before=await stored(page);await page.locator(`[data-homecoming="go"][data-route="${routeId}"]`).click();
  await page.locator('#reviveTown').waitFor({state:'visible',timeout:60000});const defeated=await stored(page);assert.equal(defeated.hp,0);assert.equal(defeated.homecoming.routes[routeId].adventure.step,step);assert.equal(defeated.homecoming.routes[routeId].phase,'active');
  await page.screenshot({path:resolve(out,routeId+'-defeat.png')});await page.locator('#reviveTown').click();await page.locator('#saveBtn').click();
  const saved=await exportPlayer(page);assert.equal(saved.location,f.route.townId);assert.equal(saved.hp,f.legal.ownerMaxHp);assert.equal(saved.gold,before.gold);assert.equal(saved.homecoming.routes[routeId].adventure.step,step);assert.equal(saved.homecoming.routes[routeId].phase,'active');assert.equal(saved.offline.enabled,false);
  await page.reload();await page.locator('#enterGameBtn').click();await page.locator('#gameShell').waitFor({state:'visible'});const resumed=await stored(page);assert.equal(resumed.location,f.route.townId);assert.equal(resumed.homecoming.routes[routeId].adventure.step,step);
  losses.push({routeId,step,town:saved.location,questUnchanged:true,fullHp:saved.hp,freeReturn:true,exportAndReload:true,conditions:'Legal unequipped control; no attacks or supplies; not a balance sample'});console.log(JSON.stringify(losses.at(-1)));await context.close();
 }
 assert.equal(rows.length,8);assert.equal(losses.length,2);assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(requests.length,0,JSON.stringify(requests));passed=true;
}catch(error){errors.push(error.stack);for(const c of browser?.contexts()||[])for(const p of c.pages())try{await p.screenshot({path:resolve(out,'failure.png'),fullPage:true,timeout:5000});}catch{}throw error;}
finally{
 const browserVersion=browser?.version();await browser?.close();await new Promise(r=>server.close(r));
 await writeFile(resolve(out,'report.json'),JSON.stringify({passed,sourceSha:process.env.GITHUB_SHA||null,browserVersion,conditions:{job:'knight',level:210,gear:'200 mythic SSS, legal maximum affixes and role-scored boss cards',pet:'matching SSS humanoid fusion',sigil:8,fourthSkill:false,clock:'real browser wall time; no injected damage or victory, no fake clock',entry:'imported legitimate fixtures at each battle node, then actual Go and Auto buttons',scope:'8 normal wins plus 2 unequipped defeat controls; not an all-class ranking or complete narrative walkthrough'},rows,losses,errors,requests},null,2));
}
