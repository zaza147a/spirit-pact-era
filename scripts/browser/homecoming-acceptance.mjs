import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {HOMECOMING_ROUTES} from '../../dist/homecoming-data.js';
import {homecomingPlayer} from '../../tests/fixtures/homecoming-player.mjs';

// Disposable browser profiles and file imports only; never touch a real player's saves.
const root=resolve('dist'),out=resolve(process.env.BROWSER_QA_OUTPUT||'browser-qa/homecoming');
await mkdir(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(path==='/favicon.ico'){res.writeHead(204);return res.end();}
  const file=resolve(root,'.'+(path==='/'?'/index.html':path));
  if(!file.startsWith(root+'/'))throw Error('Invalid path');
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
const rows=[],errors=[],requests=[],journeyRows=[];
let browser,passed=false;
async function enter(page){await page.locator('#enterGameBtn').click();await page.locator('#gameShell').waitFor({state:'visible'});}
async function exported(page){
 await page.locator('#returnEntryBtn').click();
 const download=page.waitForEvent('download');await page.locator('[data-slot-export="0"]').click();
 return JSON.parse(await readFile(await (await download).path(),'utf8')).player;
}
try{
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE_PATH?{executablePath:process.env.BROWSER_EXECUTABLE_PATH}:{})});
 for(const viewport of [{width:1440,height:1000},{width:1280,height:800}]){
  for(const [index,route] of HOMECOMING_ROUTES.entries()){
   const context=await browser.newContext({viewport,acceptDownloads:true});
   let page=await context.newPage();
   const attach=p=>{
    p.on('pageerror',e=>errors.push({width:viewport.width,route:route.id,error:e.message}));
    p.on('dialog',d=>d.accept());
    p.on('response',r=>{if(r.status()>=400)requests.push({route:route.id,url:r.url(),status:r.status()});});
   };attach(page);
   const p=homecomingPlayer('knight',route.id);
   Object.assign(p,{name:`返鄉驗收${index+1}`,location:'town',manualPaused:true,dawnNotified:true,offline:{at:Date.now(),enabled:false}});
   await page.goto(base);await page.locator('[data-slot-select="0"]').click();
   await page.locator('#saveFile').setInputFiles({name:'homecoming-qa.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,player:p}))});
   await page.locator('#enterGameBtn').waitFor({state:'visible'});await enter(page);
   await page.locator('#homecomingOpen').click();
   await page.locator(`[data-homecoming="begin"][data-route="${route.id}"]`).click();
   for(let step=0;step<3;step++){
    const img=page.locator('.homecoming-journey-art img');await img.waitFor();assert.equal(await img.count(),1);
    await img.evaluate(el=>el.decode());await img.scrollIntoViewIfNeeded();
    assert.equal(await img.getAttribute('src'),`assets/homecoming/journeys/${route.id}-${step+1}.webp`);
    const geometry=await img.evaluate(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,viewportWidth:innerWidth,scrollWidth:document.documentElement.scrollWidth};});
    assert.equal(geometry.naturalWidth,1280);assert.equal(geometry.naturalHeight,720);
    assert.ok(geometry.width>120&&geometry.height>60);assert.ok(Math.abs(geometry.width/geometry.height-16/9)<.015);
    assert.ok(geometry.scrollWidth<=geometry.viewportWidth+1,'Horizontal page overflow');
    const shot=`${viewport.width}-${route.id}-${step+1}.png`;
    await img.screenshot({path:resolve(out,shot)});
    journeyRows.push({width:viewport.width,route:route.id,page:step+1,geometry,screenshot:shot});
    if(step===1){
     // Reload uses the saved imported character, with no localStorage injection.
     await page.reload();await enter(page);
     await page.locator('.homecoming-journey-art img').waitFor();
     assert.equal(await page.locator('.homecoming-journey-art img').getAttribute('src'),`assets/homecoming/journeys/${route.id}-2.webp`);
    }
    if(step<2)await page.locator(`[data-homecoming="next"][data-route="${route.id}"]`).click();
   }
   // Closing and reopening the tab must resume page three without replaying departure.
   await page.close();page=await context.newPage();attach(page);await page.goto(base);await enter(page);
   assert.equal(await page.locator('.homecoming-journey-art img').getAttribute('src'),`assets/homecoming/journeys/${route.id}-3.webp`);
   await page.locator(`[data-homecoming="arrive"][data-route="${route.id}"]`).click();
   await page.locator(`[data-homecoming="accept"][data-route="${route.id}"]`).waitFor();
   assert.ok((await page.locator('#area').innerText()).includes(route.npc),'Correct home NPC');
   assert.equal(await page.locator('.homecoming-journey-art img').count(),0);
   await page.locator(`[data-homecoming="accept"][data-route="${route.id}"]`).click();
   const scene=page.locator('.homecoming-card .homecoming-scene img');await scene.evaluate(el=>el.decode());
   assert.equal(await scene.getAttribute('src'),`assets/homecoming/scenes/${route.id}.webp`);
   if(index===0||index===11)await page.screenshot({path:resolve(out,`${viewport.width}-${route.id}-arrival-viewport.png`)});
   const saved=await exported(page);
   assert.equal(saved.homecoming.routes[route.id].phase,'active');assert.equal(saved.location,route.townId);
   assert.equal(saved.offline.enabled,false);assert.equal(saved.manualPaused,true);
   await enter(page);await page.locator('#homecomingOpen').click();
   assert.equal(await page.locator(`[data-homecoming="begin"][data-route="${route.id}"]`).count(),0);
   assert.equal(await page.locator('.homecoming-journey-art img').count(),0);
   rows.push({width:viewport.width,route:route.id,loadedPages:3,reloadPage:2,reopenedPage:3,arrival:saved.location,phase:saved.homecoming.routes[route.id].phase});
   console.log(JSON.stringify(rows.at(-1)));await context.close();
  }
 }
 // Independent preview checks its own localStorage namespace and all 36 images.
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push({phase:'preview',error:e.message}));
 await page.goto(base+'/homecoming-preview.html');await page.locator('#discover').click();
 for(const route of HOMECOMING_ROUTES){
  await page.locator(`[data-action="begin"][data-route="${route.id}"]`).click();
  for(let step=0;step<3;step++){
   const card=page.locator('article').filter({has:page.locator(`[data-action="${step<2?'next':'arrive'}"][data-route="${route.id}"]`)});
   const img=card.locator('.homecoming-journey-art img');await img.evaluate(el=>el.decode());
   assert.equal(await img.getAttribute('src'),`assets/homecoming/journeys/${route.id}-${step+1}.webp`);
   if(step<2)await card.locator('[data-action="next"]').click();
  }
  await page.locator(`[data-action="arrive"][data-route="${route.id}"]`).click();
  await page.locator(`[data-action="accept"][data-route="${route.id}"]`).click();
 }
 await context.close();
 assert.equal(rows.length,24);assert.equal(journeyRows.length,72);assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(requests.length,0,JSON.stringify(requests));passed=true;
}catch(error){errors.push({phase:'acceptance',error:error.stack});for(const c of browser?.contexts()||[])for(const p of c.pages())try{await p.screenshot({path:resolve(out,'failure.png'),fullPage:true,timeout:5000});}catch{}throw error;}
finally{
 const browserVersion=browser?browser.version():null;await browser?.close();await new Promise(r=>server.close(r));
 await writeFile(resolve(out,'report.json'),JSON.stringify({passed,browserVersion,sourceSha:process.env.GITHUB_SHA||null,desktopWidths:[1440,1280],rows,journeyRows,errors,requests,scope:'Real desktop Chromium: 12 routes × 3 pages × 2 widths; actual save-file import, page-two reload, page-three tab reopen, arrival/NPC/accept/export/re-entry, isolated preview. No combat balance or mobile coverage claimed.'},null,2));
}
