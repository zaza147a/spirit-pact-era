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
 assert.deepEqual(errors,[],'uncaught browser runtime errors');
 console.log(JSON.stringify({passed:true,firstJob:'spiritist',level:1,slots:[1,8],reloaded:true,thirdJobs:['pactWarrior','spiritCommander'],warehouse:true}));
 await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
