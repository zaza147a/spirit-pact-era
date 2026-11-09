import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';

const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const root=resolve('dist'),out=resolve('browser-qa/tower-presentation');
await mkdir(out,{recursive:true});
const source=JSON.parse(await readFile('docs/homecoming-main-integration/complete-save.json','utf8'));
const fixture=source.player||source;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const name=new URL(req.url,'http://localhost').pathname;
  if(name==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const path=resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!path.startsWith(root+'/'))throw Error('invalid path');
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});
  res.end(await readFile(path));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:950}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 page.on('dialog',dialog=>dialog.accept());
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(fixture=>{
  const character=structuredClone(fixture);
  Object.assign(character,{name:'終境驗收',location:'dawncity',level:210,thirdJob:true,reborn:true,dawnUnlocked:true,manualPaused:true,autoRevive:false,
   extraHonorTitles:['黃金冒險者','大陸典藏家'],towerHonorSelection:{title:'大陸典藏家',frame:'永凍名稱框'},
   towerProgress:{highest:30,claimed:[10,20,30]},offline:{at:Date.now(),enabled:false}});
  localStorage.setItem('icarus-character-slot-1',JSON.stringify({version:2,player:character}));
 },fixture);
 await page.reload();
 assert.equal(await page.locator('.slot-select h2.tower-frame-frost').count(),1,'lobby name frame');
 assert.equal(await page.locator('.slot-select .tower-honor-title').innerText(),'大陸典藏家');
 await page.locator('[data-slot-select="0"]').click();
 await page.locator('#enterGameBtn').click();
 await page.locator('#renameCharacterBtn.tower-frame-frost').waitFor();
 assert.equal(await page.locator('#character .tower-honor-title').innerText(),'✦ 大陸典藏家');
 await page.locator('.tower-gatekeeper [data-open="trials"]').waitFor();
 await page.screenshot({path:resolve(out,'dawn-city.png'),fullPage:true});
 await page.locator('.tower-gatekeeper [data-open="trials"]').click();
 await page.locator('.tower-intro').waitFor();
 await page.screenshot({path:resolve(out,'tower-panel.png'),fullPage:true});
 const artPaths=['monster-dawn.webp','monster-flame.webp','monster-frost.webp'];
 for(const asset of artPaths){const response=await page.request.get(`/assets/tower/${asset}`);assert.equal(response.status(),200);}
 assert.deepEqual(errors,[],'browser console errors');
 console.log('Tower presentation browser acceptance passed');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
