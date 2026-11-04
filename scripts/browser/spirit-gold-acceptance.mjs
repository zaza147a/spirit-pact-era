import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {highLevelSpiritPlayer} from '../../tests/fixtures/spirit-high-level-player.mjs';
import {COSMETIC_JOBS,cosmeticOutfitArt} from '../../dist/cosmetic-gallery.js';

const root=resolve('dist'),out=resolve('browser-qa/spirit-gold');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const name=new URL(req.url,'http://localhost').pathname;
  const path=resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!path.startsWith(root+'/'))throw Error('path');
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});
  res.end(await readFile(path));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true});
const page=await context.newPage(),results=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('dialog',dialog=>dialog.accept());
try{
 for(const job of ['pactWarrior','spiritCommander']){
  await page.goto(base);
  const fixture=highLevelSpiritPlayer({level:200,job});
  fixture.name=job==='pactWarrior'?'時裝驗收-靈契':'時裝驗收-萬靈';
  fixture.location='skycity';
  fixture.manualPaused=true;
  fixture.offline={at:Date.now(),enabled:false};
  fixture.dawnNotified=true;
  fixture.thirdJob=true;
  fixture.outfitUnlocks=['S','SS','SSS'];
  fixture.gold=500_000_000;
  fixture.bag.push({id:'gold_bar',qty:55});
  await page.locator('[data-slot-select="0"]').click();
  await page.locator('#saveFile').setInputFiles({name:job+'.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,player:fixture}))});
  console.log('Import status',job,await page.locator('#toast').innerText().catch(()=>''));
  await page.getByRole('heading',{name:fixture.name,exact:true}).waitFor();
  await page.locator('#enterGameBtn').click();
  await page.locator('[data-tab="character"]').click();
  await page.locator('[data-character-section="outfits"]').click();
  assert.equal(await page.locator('.cosmetic-tile').count(),3);
  assert.ok((await page.locator('#side').innerText()).includes('36 套幻化'));
  for(let i=0;i<3;i++){
   const id=job+'-'+i,src=cosmeticOutfitArt(job,i);
   const tile=page.locator('.cosmetic-tile').nth(i),img=tile.locator('img');
   assert.equal(await img.getAttribute('src'),src);
   const dims=await img.evaluate(async el=>{await el.decode();return [el.naturalWidth,el.naturalHeight]});
   assert.deepEqual(dims,[1024,1536]);
   assert.ok((await tile.innerText()).includes(COSMETIC_JOBS[job][i]));
   await page.locator('[data-cosmetic-outfit="'+id+'"]').click();
   console.log('After outfit click',job,i,await page.locator('#toast').innerText().catch(()=>''),await page.locator('#character .hero img').evaluateAll(imgs=>imgs.map(i=>({className:i.className,src:i.getAttribute('src'),visible:i.getBoundingClientRect().height}))).catch(()=>[]),await page.evaluate(()=>localStorage.getItem('spirit-pact-cosmetic-collection-v1')));
   await page.locator('#character img.cosmetic-equipped').waitFor({state:'attached'});
   assert.equal(await page.locator('#character img.cosmetic-equipped').getAttribute('src'),src);
   results.push({job,variant:i,src,dims,pass:true});
  }
  const store=await page.evaluate(()=>JSON.parse(localStorage.getItem('spirit-pact-cosmetic-collection-v1')));
  assert.ok([0,1,2].every(i=>store.outfits.includes(job+'-'+i)));
  await page.screenshot({path:resolve(out,job+'-desktop.png'),fullPage:true});
  await page.setViewportSize({width:360,height:800});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'mobile overflow '+job);
  await page.screenshot({path:resolve(out,job+'-mobile.png'),fullPage:true});
  await page.reload();
  const remembered=await page.evaluate(()=>JSON.parse(localStorage.getItem('spirit-pact-cosmetic-collection-v1')));
  assert.ok([0,1,2].every(i=>remembered.outfits.includes(job+'-'+i)));
 }
 assert.equal(results.length,6);
 assert.deepEqual(errors,[]);
 console.log('PASS six gold costumes: decoded, bought, equipped, persisted, mobile layout');
}finally{
 await writeFile(resolve(out,'results.json'),JSON.stringify({results,errors},null,2)+'\n');
 await context.close();
 await browser.close();
 await new Promise(r=>server.close(r));
}
