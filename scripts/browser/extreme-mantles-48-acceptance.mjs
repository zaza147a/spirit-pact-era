// Actual browser: click all 48 wardrobes, verify character/selection views,
// save screenshots and JSON. Does not deploy or alter player cloud data.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from '../../tests/fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from '../../tests/fixtures/spirit-high-level-player.mjs';
import {claimExtremeCharacterStage,syncExtremeHonorOwnership} from '../../dist/extreme-trials-rewards.js';
import {extremeMantleArt} from '../../dist/extreme-mantle-catalog.js';

const out=resolve('browser-qa/extreme-mantles-48');
await mkdir(out,{recursive:true});
const root=resolve('dist');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const route=new URL(req.url,'http://127.0.0.1').pathname;
  const filepath=resolve(root,'.'+(route==='/'?'/index.html':route));
  if(!filepath.startsWith(root+'/'))throw Error('path outside dist');
  res.writeHead(200,{'Content-Type':mime[extname(filepath)]||'application/octet-stream'});
  res.end(await readFile(filepath));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const base=`http://127.0.0.1:${server.address().port}`;
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'];
const kinds=['atk','matk','hp','clear'];
const errors=[],results=[];
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('dialog',dialog=>dialog.accept());
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto(base);
 for(const job of jobs){
  const p=LEGACY_OPTIMAL_BUILD_NAMES.includes(job)?legacyOptimalPlayer(job):highLevelSpiritPlayer({level:210,job,dawnSigil:0});
  p.name=`極限戰袍驗收-${job}`;
  p.manualPaused=true;
  p.offline={at:Date.now(),enabled:false};
  p.dawnNotified=true;
  for(const kind of kinds)claimExtremeCharacterStage(p,kind,30);
  syncExtremeHonorOwnership(p);
  await page.locator('[data-slot-select="0"]').click();
  await page.locator('#saveFile').setInputFiles({name:`${job}.json`,mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,player:p}))});
  await page.getByRole('heading',{name:p.name,exact:true}).waitFor();
  await page.locator('#enterGameBtn').click();
  await page.locator('[data-tab="character"]').click();
  await page.locator('[data-character-section="outfits"]').click();
  for(const kind of kinds){
   const filename=`${job}-${kind}`;
   const button=page.locator(`[data-extreme-cosmetic="mantle"][data-extreme-kind="${kind}"]`);
   assert.equal(await button.isEnabled(),true,`${filename} is locked unexpectedly`);
   await button.click();
   const art=page.locator('#characterPanel img.extreme-outfit-equipped').first();
   await art.waitFor();
   await art.evaluate(img=>img.decode());
   assert.ok((await art.getAttribute('src')).endsWith(extremeMantleArt(job,kind)),`${filename} wrong character image`);
   assert.deepEqual(await art.evaluate(img=>[img.naturalWidth,img.naturalHeight]),[1024,1536],`${filename} broken image`);
   await page.screenshot({path:resolve(out,`${filename}-character.png`),fullPage:true});
   await page.locator('#returnEntryBtn').click();
   const lobby=page.locator('[data-slot-select="0"] img.extreme-outfit-equipped').first();
   await lobby.waitFor();
   await lobby.evaluate(img=>img.decode());
   assert.ok((await lobby.getAttribute('src')).endsWith(extremeMantleArt(job,kind)),`${filename} wrong lobby image`);
   await page.screenshot({path:resolve(out,`${filename}-lobby.png`),fullPage:true});
   results.push({job,kind,character:true,lobby:true,asset:extremeMantleArt(job,kind)});
   await page.locator('#enterGameBtn').click();
   await page.locator('[data-tab="character"]').click();
   await page.locator('[data-character-section="outfits"]').click();
  }
  // After the last mantle, return to the lobby before importing the next job.
  await page.locator('#returnEntryBtn').click();
 }
 assert.equal(results.length,48);
 assert.deepEqual(errors,[],'Browser page errors');
}catch(error){errors.push(error.stack||error.message);throw error;}
finally{
 if(browser)await browser.close();
 await new Promise(done=>server.close(done));
 await writeFile(resolve(out,'result.json'),JSON.stringify({passed:results.length===48&&errors.length===0,results,errors},null,2)+'\n');
}
console.log('PASS 48/48 mantle selections and 96 real browser screenshots');
