// Runs only against a disposable local HTTP server in GitHub Actions.
// Never points Playwright at the published GitHub Pages website.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';

const root=resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!path.startsWith(root+sep))throw Error('Outside application');
  const bytes=await readFile(path);
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});
  res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('dialog',d=>d.accept());
 await page.goto(base);
 await page.locator('#slotGrid [data-slot-new="0"]').click();
 await page.locator('#createModal').waitFor({state:'visible'});
 const spirit=page.locator('#classChoices [data-class="spiritist"]');
 assert.equal(await spirit.count(),1,'missing spirit first job');
 assert.equal(await spirit.isEnabled(),true,'spirit first job must not have a Lv210 gate');
 await spirit.click();
 await page.locator('#nameInput').fill('御靈使審核');
 await page.locator('#createBtn').click();
 await page.getByRole('heading',{name:'御靈使審核',exact:true}).waitFor();
 let slot=await page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-1')));
 assert.equal(slot.player.job,'spiritist');
 assert.equal(slot.player.level,1);
 await page.locator('[data-slot-select="0"]').click();
 await page.locator('#enterGameBtn').click();
 await page.locator('#gameShell').waitFor({state:'visible'});
 await page.locator('#returnEntryBtn').click();
 await page.locator('#entryScreen').waitFor({state:'visible'});
 await page.locator('#slotGrid [data-slot-new="7"]').click();
 await page.locator('#classChoices [data-class="spiritist"]').click();
 await page.locator('#nameInput').fill('第八格御靈使');
 await page.locator('#createBtn').click();
 await page.getByRole('heading',{name:'第八格御靈使',exact:true}).waitFor();
 slot=await page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-8')));
 assert.equal(slot.player.job,'spiritist');
 assert.equal(slot.player.level,1);
 const original=await page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-1')));
 assert.equal(original.player.name,'御靈使審核','slot eight creation overwrote slot one');
 await page.reload();
 await page.getByRole('heading',{name:'御靈使審核',exact:true}).waitFor();
 await page.getByRole('heading',{name:'第八格御靈使',exact:true}).waitFor();
 for(const [index,job] of [[1,'pactWarrior'],[2,'spiritCommander']]){
  const bytes=await readFile(resolve(`tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`));
  const saved=JSON.parse(bytes.toString('utf8')).player;
  assert.equal(saved.thirdJob,true,`${job} fixture is not third job`);
  await page.locator(`#slotGrid [data-slot-import="${index}"]`).click();
  await page.locator('#saveFile').setInputFiles({name:`${job}.json`,mimeType:'application/json',buffer:bytes});
  await page.getByRole('heading',{name:saved.name,exact:true}).waitFor();
  await page.locator(`[data-slot-select="${index}"]`).click();
  await page.locator('#enterGameBtn').click();
  await page.locator('#gameShell').waitFor({state:'visible'});
  await page.locator('[data-tab="bag"]').click();
  await page.locator('[data-tab="pets"]').click();
  await page.locator('#area [data-open="warehouse"]').click();
  await page.locator('#warehouseModal').waitFor({state:'visible'});
  await page.locator('#warehouseModal button[aria-label="關閉倉庫"]').click();
  await page.locator('#returnEntryBtn').click();
  await page.locator('#entryScreen').waitFor({state:'visible'});
  const imported=await page.evaluate(i=>JSON.parse(localStorage.getItem(`icarus-character-slot-${i+1}`)),index);
  assert.equal(imported.player.job,job);
  assert.equal(imported.player.thirdJob,true);
 }
 // Exercise the actual guild transfer UI with a legal first-job threshold save.
 const first=await page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-1')));
 first.player.level=50;
 first.player.jobLevel=40;
 first.player.location='town';
 first.player.offline={at:0,enabled:false};
 first.player.manualPaused=true;
 await page.locator('#slotGrid [data-slot-import="3"]').click();
 await page.locator('#saveFile').setInputFiles({name:'first-transfer.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(first))});
 await page.locator('[data-slot-select="3"]').click();
 await page.locator('#enterGameBtn').click();
 await page.locator('#townTransferBtn').click();
 const secondButton=page.locator('[data-transfer="pactWarrior"]');
 assert.equal(await secondButton.isEnabled(),true,'eligible first job cannot second-transfer');
 await secondButton.click();
 await page.locator('#returnEntryBtn').click();
 const second=await page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-4')));
 assert.equal(second.player.job,'pactWarrior');
 assert.equal(second.player.jobLevel,1);
 assert.equal(second.player.gear.rightHand.id,'staffSword');
 // Test third-job UI separately from the long combat quest, with legal completed quest state.
 for(const [index,job] of [[4,'pactWarrior'],[5,'spiritCommander']]){
  const bytes=await readFile(resolve(`tests/fixtures/spirit-single-pet-optimal-210/${job}-210-sss-sigil8-optimal.json`));
  const save=JSON.parse(bytes.toString('utf8'));
  save.player.thirdJob=false;
  save.player.level=150;
  save.player.jobLevel=70;
  save.player.location='skycity';
  save.player.quests??={};
  save.player.quests.dual_spirit_pact={started:true,kills:20,done:true};
  save.player.bag.push({id:'proof_third_awakening',qty:1});
  save.player.offline={at:0,enabled:false};
  save.player.manualPaused=true;
  await page.locator(`#slotGrid [data-slot-import="${index}"]`).click();
  await page.locator('#saveFile').setInputFiles({name:`${job}-prethird.json`,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await page.locator(`[data-slot-select="${index}"]`).click();
  await page.locator('#enterGameBtn').click();
  await page.locator('#townThirdBtn').click();
  const thirdButton=page.locator('[data-third-transfer]');
  assert.equal(await thirdButton.isEnabled(),true,`${job} cannot third-transfer with legal completed quest`);
  await thirdButton.click();
  await page.locator('#returnEntryBtn').click();
  const completed=await page.evaluate(i=>JSON.parse(localStorage.getItem(`icarus-character-slot-${i+1}`)),index);
  assert.equal(completed.player.thirdJob,true);
  assert.equal(completed.player.jobLevel,1);
 }
 assert.deepEqual(errors,[],'uncaught browser runtime errors');
 console.log(JSON.stringify({passed:true,firstJob:'spiritist',level:1,slots:[1,8],reloaded:true,thirdJobs:['pactWarrior','spiritCommander'],warehouse:true,secondTransfer:true,thirdTransfer:true}));
 await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
