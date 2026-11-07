import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {TOWER_FROST_JOBS} from '../../dist/tower-costumes.js';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=resolve('dist'),output=resolve('browser-qa/tower-frost');
await mkdir(output,{recursive:true});
const baseSource=JSON.parse(await readFile('docs/homecoming-main-integration/complete-save.json','utf8'));
const fixture=baseSource.player||baseSource;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{const name=new URL(req.url,'http://localhost').pathname;
  if(name==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const path=resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!path.startsWith(root+'/'))throw Error('outside dist');
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});
  res.end(await readFile(path));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;const errors=[],missing=[],rows=[];
try{
 browser=await chromium.launch({headless:true,executablePath:chromium.executablePath(),args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();
 page.on('dialog',d=>d.accept());
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)missing.push({status:r.status(),url:r.url()});});
 const base=`http://127.0.0.1:${server.address().port}`;
 await page.goto(base);
 for(let batch=0;batch<2;batch++){
  const jobs=TOWER_FROST_JOBS.slice(batch*8,batch*8+8);
  await page.evaluate(({jobs,fixture})=>{
   for(let i=0;i<8;i++){
    const id=jobs[i];if(!id){localStorage.removeItem('icarus-character-slot-'+(i+1));continue;}
    const p=structuredClone(fixture);
    Object.assign(p,{name:'冰-'+id.slice(0,10),job:id,reborn:true,thirdJob:true,manualPaused:true,towerProgress:{highest:30},towerCostume:'frost',selectedOutfit:null,cosmeticOutfit:null,offline:{at:Date.now(),enabled:false}});
    localStorage.setItem('icarus-character-slot-'+(i+1),JSON.stringify({version:2,player:p}));
   }
  },{jobs,fixture});
  await page.reload();
  const images=page.locator('#slotGrid img.tower-frost-equipped');
  assert.equal(await images.count(),jobs.length,'all unlocked tower costumes visible in lobby');
  const measurements=await images.evaluateAll(imgs=>Promise.all(imgs.map(async img=>{
   await img.decode();const box=img.getBoundingClientRect();const stage=img.closest('.slot-art-stage').getBoundingClientRect();
   return {src:img.getAttribute('src'),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,objectFit:getComputedStyle(img).objectFit,width:box.width,height:box.height,stageHeight:stage.height};
  })));
  for(let i=0;i<jobs.length;i++){
   const img=measurements[i];assert.ok(img.src.includes(`outfit-${jobs[i]}-frost.webp`));
   assert.ok(img.naturalWidth>=900&&img.naturalHeight>=1300,'high-resolution source');
   assert.equal(img.objectFit,'contain','no cropping on lobby art');
   assert.ok(img.height>0&&img.width>0&&img.stageHeight>0);
   rows.push({job:jobs[i],...img});
  }
  await page.screenshot({path:resolve(output,`lobby-${batch+1}.png`),fullPage:true});
 }
 await page.locator('[data-slot-select="0"]').click();
 await page.locator('#enterGameBtn').click();
 const home=page.locator('#character .hero img.tower-frost-equipped');
 await home.waitFor();await home.evaluate(x=>x.decode());
 assert.ok((await home.getAttribute('src')).includes(`outfit-${TOWER_FROST_JOBS[8]}-frost.webp`),'home portrait matches selected character');
 await page.locator('[data-tab="character"]').click();
 await page.locator('[data-character-section="outfits"]').click();
 const button=page.locator('[data-tower-costume]');
 await button.waitFor();assert.equal(await button.isDisabled(),false);
 await button.click();
 assert.equal(await page.locator('#character .hero img.tower-frost-equipped').count(),0,'unequip restores default art');
 await button.click();
 await page.locator('#character .hero img.tower-frost-equipped').waitFor();
 await page.locator('#returnEntryBtn').click();
 await page.reload();
 assert.ok((await page.locator('[data-slot-select="0"] img').getAttribute('src')).includes('frost.webp'),'selection persists after refresh');
 assert.deepEqual(errors,[],'browser JS errors');assert.deepEqual(missing,[],'missing assets');
 await writeFile(resolve(output,'report.json'),JSON.stringify({passed:true,rows,errors,missing,browserVersion:browser.version()},null,2));
 console.log(`Tower frost browser QA passed: ${rows.length} professions, lobby + home + wardrobe + persistence`);
}catch(error){await writeFile(resolve(output,'report.json'),JSON.stringify({passed:false,error:String(error.stack),rows,errors,missing},null,2));throw error;
}finally{await browser?.close();await new Promise(r=>server.close(r));}
