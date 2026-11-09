import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {runtime} from '../../tests/runtime31-helper.mjs';
import {homecomingPlayer} from '../../tests/fixtures/homecoming-player.mjs';
import {HOMECOMING_ROUTES} from '../../dist/homecoming-data.js';
import {HOMECOMING_ADVENTURES,adventureLocation} from '../../dist/homecoming-adventures.js';
import {homecomingBonuses} from '../../dist/homecoming-state.js';
import {homecomingOpponent} from '../../dist/homecoming-encounters.js';
import {FOURTH_SKILLS,fourthPair} from '../../dist/companion-fourth-skill.js';
const plans=JSON.parse((await readFile('tests/homecoming-state.test.mjs','utf8')).match(/const plans=(.*);\nconst pet=/)[1]);
const out=resolve(process.env.BROWSER_QA_OUTPUT||'browser-qa/homecoming-full-story'),root=resolve('dist');await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/favicon.ico'){res.writeHead(204);return res.end();}const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))throw Error('path');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const rows=[],battles=[],errors=[],requests=[];let browser,page,passed=false,finalBonuses=null;
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-1'))?.player);
const action=(route,kind,choice)=>page.locator(`[data-homecoming="${kind}"][data-route="${route.id}"]${choice===undefined?'':`[data-choice="${choice}"]`}`);
async function enter(){await page.locator('#enterGameBtn').click();await page.locator('#gameShell').waitFor({state:'visible'});}
async function evidence(){await writeFile(resolve(out,'report.json'),JSON.stringify({passed,sourceSha:process.env.GITHUB_SHA||null,browserVersion:browser?.version(),conditions:{job:'knight',level:210,gear:'200 mythic SSS, legal maximum affixes and role-scored boss cards',sigil:8,pets:12,entry:'one fresh character with twelve legal SSS ordered fusion companions; no quest progress injected',clock:'native browser time; no injected damage/victory or fake clock',scope:'12 canonical complete UI stories on one character; optional battle branches covered by the separate eight-node browser report'},rows,battles,finalBonuses,errors,requests},null,2));}
try{
 const seed=homecomingPlayer('knight',HOMECOMING_ROUTES[0].id);seed.pets=HOMECOMING_ROUTES.map(r=>{const pet=homecomingPlayer('knight',r.id).pets[0];pet.id='story-'+r.id;pet.nickname=r.companion;return pet;});
 Object.assign(seed,{name:'十二返鄉全流程',location:'town',activePetId:seed.pets[0].id,secondaryPetId:null,petStances:Object.fromEntries(seed.pets.map(p=>[p.id,'assist'])),manualPaused:true,autoRevive:false,autoEscapeBoss:false,dawnNotified:true,offline:{at:Date.now(),enabled:false},battleHistory:[]});delete seed.homecoming;
 const c=await runtime(),api=c.api;api.setup(api.normalize(seed),null);const owner=api.state().player;
 assert.ok(api.valid(owner));assert.equal(owner.pets.length,12);assert.equal(Object.values(owner.attributes).reduce((n,v)=>n+v-1,0),438);assert.ok(Object.values(owner.attributes).every(v=>v<=150));assert.ok(api.stat('damageReduction')<=40);
 owner.hp=api.stat('hp');owner.mp=api.stat('mp');for(const pet of owner.pets){assert.ok(api.petStats(pet).damageReduction<=40);pet.hp=api.petStats(pet).hp;pet.sp=api.petStats(pet).sp;}
 browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});page=await context.newPage();page.on('dialog',d=>d.accept());page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push({url:r.url(),status:r.status()});});
 await page.goto(base);await page.locator('[data-slot-select="0"]').click();await page.locator('#saveFile').setInputFiles({name:'twelve-stories.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,player:owner}))});await enter();
 for(const [index,route] of HOMECOMING_ROUTES.entries()){
  if(index){await page.locator('[data-tab="pets"]').click();await page.locator('[data-pet-section="manage"]').click();await page.locator(`[data-pet="story-${route.id}"]`).click();}
  await page.locator('#homecomingOpen').click();const before=await read();assert.equal(before.activePetId,'story-'+route.id);assert.equal(before.homecoming.routes[route.id].phase,'letter');
  const reverse=route.id.split('-').reverse().join('-'),expectedShared=index>0&&HOMECOMING_ROUTES.slice(0,index).some(r=>r.id===reverse),card=page.locator(`[data-homecoming-route="${route.id}"]`);
  assert.ok((await card.innerText()).includes(expectedShared?'已解放，可在夥伴技能頁查看':'尚未解放'),'Reverse skill unlock must be independent of story progress');
  await action(route,'begin').click();for(let i=0;i<3;i++){const img=card.locator('.homecoming-journey-art img');await img.evaluate(el=>el.decode());assert.equal(await img.getAttribute('src'),`assets/homecoming/journeys/${route.id}-${i+1}.webp`);if(i<2)await action(route,'next').click();}
  await action(route,'arrive').click();await action(route,'accept').click();
  const choices=[];
  for(const key of plans[route.id]){
   let p=await read(),q=p.homecoming.routes[route.id];assert.equal(q.phase,'active');const node=HOMECOMING_ADVENTURES[route.id].nodes[q.adventure.step],step=q.adventure.step;
   if(p.location!==adventureLocation(route,node))await action(route,'go').click();
   if(key==='WIN'){
    assert.ok(node.combat);const foe=homecomingOpponent(route.id,step);await page.locator('#autoBtn').click();await page.locator('#encounter .enemy-label').filter({hasText:foe.name}).waitFor();const started=Date.now();let done=false;
    while(Date.now()-started<180000){const current=await read(),state=current.homecoming.routes[route.id];if(current.hp<=0)throw Error('Natural defeat: '+route.id+'/'+step);if(state.phase!=='active'||state.adventure.step!==step){done=true;break;}await page.waitForTimeout(250);}
    assert.ok(done,'Natural fight timed out');await page.locator('#autoBtn').click();p=await read();const report=p.battleHistory.filter(r=>r.monster===foe.id&&r.endedAt).at(-1);assert.ok(report);battles.push({routeId:route.id,step,enemy:foe.name,seconds:(report.endedAt-report.startedAt)/1000,metrics:report.metrics});console.log(JSON.stringify({battle:battles.at(-1)}));
   }else {assert.ok(!node.combat);assert.ok(node.choices.some(x=>x.id===key));await action(route,'choose',key).click();const after=await read();assert.notDeepEqual(after.homecoming.routes[route.id].adventure,q.adventure,'Choice must change the real saved state');choices.push({step,choice:key});}
  }
  let ready=await read();assert.equal(ready.homecoming.routes[route.id].phase,'ready');if(ready.location!==route.townId)await action(route,'return').click();ready=await read();assert.equal(ready.location,route.townId);
  await action(route,'claim').click();let saved=await read();assert.equal(saved.homecoming.routes[route.id].phase,'claimed');assert.equal(Object.keys(saved.homecoming.completedRoutes).length,index+1);assert.equal(await action(route,'claim').count(),0);
  const earned=HOMECOMING_ROUTES.slice(0,index+1),expected={damage:(index+1)*.0025,hp:earned.filter(r=>r.inheritance==='hp').length*.01,def:earned.filter(r=>r.inheritance==='def').length*.01,recovery:earned.filter(r=>r.inheritance==='recovery').length*.01,count:index+1};assert.deepEqual(homecomingBonuses(saved),expected);assert.ok((await card.innerText()).includes(route.ending));assert.ok((await card.innerText()).includes('已解放，可在夥伴技能頁查看'));
  await page.locator('[data-tab="pets"]').click();await page.locator('[data-pet-section="active"]').click();const name=FOURTH_SKILLS[fourthPair(saved.pets.find(p=>p.id===saved.activePetId))].name;const skill=page.locator('section.item').filter({has:page.getByRole('heading',{name:'第四格・專屬技能：'+name,exact:true})});assert.ok((await skill.innerText()).includes('已解放'));
  await page.locator('#homecomingOpen').click();await page.locator('#saveBtn').click();await page.screenshot({path:resolve(out,`${String(index+1).padStart(2,'0')}-${route.id}-claimed.png`)});
  await page.locator('#returnEntryBtn').click();const download=page.waitForEvent('download');await page.locator('[data-slot-export="0"]').click();const exported=JSON.parse(await readFile(await (await download).path(),'utf8')).player;assert.deepEqual(homecomingBonuses(exported),expected);
  await page.reload();await enter();await page.locator('#homecomingOpen').click();saved=await read();assert.equal(saved.homecoming.routes[route.id].phase,'claimed');assert.deepEqual(homecomingBonuses(saved),expected);assert.equal(await action(route,'claim').count(),0);assert.equal(saved.offline.enabled,false);
  rows.push({routeId:route.id,companion:route.companion,choices,phase:'claimed',claimedOnce:true,reloadAndExport:true,sharedFourthBefore:expectedShared,fourthSkill:name,bonuses:expected});console.log(JSON.stringify({completed:route.id,count:index+1,bonuses:expected}));await evidence();
 }
 finalBonuses=homecomingBonuses(await read());assert.deepEqual(finalBonuses,{damage:.03,hp:.04,def:.04,recovery:.04,count:12});assert.equal(new Set(rows.map(r=>r.fourthSkill)).size,6);assert.equal(rows.length,12);assert.equal(battles.length,5);assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(requests.length,0,JSON.stringify(requests));
 const summary=await page.locator('#side').innerText();assert.ok(summary.includes('已完成 12／12'));assert.ok(summary.includes('傷害 +3.00%'));await page.screenshot({path:resolve(out,'all-twelve-complete.png')});await page.locator('#returnEntryBtn').click();const finalDownload=page.waitForEvent('download');await page.locator('[data-slot-export="0"]').click();await (await finalDownload).saveAs(resolve(out,'twelve-homecomings-complete.json'));passed=true;
}catch(error){errors.push(error.stack);try{await page?.screenshot({path:resolve(out,'failure.png'),fullPage:true,timeout:5000});}catch{}throw error;}
finally{await evidence();await browser?.close();await new Promise(r=>server.close(r));}
