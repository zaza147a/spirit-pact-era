import {chromium,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {browserFixtures,continuousFailureFixture} from './fixtures.mjs';
import {trueFormName} from '../../dist/pet-true-form.js';
const out=resolve(process.env.BROWSER_QA_OUTPUT||'browser-qa');await mkdir(out,{recursive:true});
const root=resolve('dist'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const path=resolve(root,'.'+(name==='/'?'/index.html':name));if(!path.startsWith(root+'/'))throw Error('path');
  const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const engine=process.env.BROWSER_ENGINE||'chromium';assert.ok(['chromium','webkit'].includes(engine));
const browser=await ({chromium,webkit})[engine].launch({headless:true});const rows=[],errors=[],touchRows=[];let passed=false;
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,acceptDownloads:true,...(name==='mobile'?{isMobile:true,hasTouch:true}:{})});
  let page=await context.newPage();const attach=p=>{p.on('pageerror',e=>errors.push({viewport:name,error:e.message}));p.on('dialog',d=>d.accept());};attach(page);
  const fixtures=browserFixtures();await page.goto(base);await page.locator('#slotGrid .slot-card').first().waitFor();
  for(let slot=0;slot<4;slot++){
   await page.locator(`[data-slot-select="${slot}"]`).click();
   await page.locator('#saveFile').setInputFiles({name:`qa-${slot}.json`,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixtures[slot]))});
   await page.getByRole('heading',{name:fixtures[slot].player.name,exact:true}).waitFor();
  }
  // Real reload and tab closure, rather than replacing browser localStorage.
  await page.reload();await page.getByRole('heading',{name:'QA-SSS',exact:true}).waitFor();
  await page.close();page=await context.newPage();attach(page);await page.goto(base);
  for(let slot=0;slot<3;slot++){
   const rank=['S','SS','SSS'][slot];await page.locator(`[data-slot-select="${slot}"]`).click();await page.locator('#enterGameBtn').click();
   await page.locator('#gameShell').waitFor({state:'visible'});await page.locator('[data-tab="pets"]').click();
   for(const [index,pet] of fixtures[slot].player.pets.entries()){
    if(index){await page.locator('[data-pet-section="manage"]').click();await page.locator(`[data-pet="${pet.id}"]`).click();}
    else await page.locator('[data-pet-section="active"]').click();
    const image=page.locator('#side img.companion-art').first();await image.waitFor();await image.scrollIntoViewIfNeeded();
    await image.evaluate(img=>img.decode());const src=await image.getAttribute('src');
    const pair=pet.fusion.main+'-'+pet.fusion.sub;
    assert.equal(src,`assets/true-forms/${rank}/${pair}.webp`);assert.equal(await image.getAttribute('alt'),trueFormName(pet)+' · 神話');
    const geometry=await image.evaluate(img=>({width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height,naturalWidth:img.naturalWidth,fit:getComputedStyle(img).objectFit}));
    assert.ok(geometry.width>0&&geometry.height>0&&geometry.naturalWidth>0);assert.equal(geometry.fit,'contain');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'page exceeds viewport');
    await image.screenshot({path:resolve(out,`${name}-${rank}-${pair}.png`)});
    if(index===0){await page.screenshot({path:resolve(out,`${name}-${rank}-viewport.png`)});await page.screenshot({path:resolve(out,`${name}-${rank}-screen.png`),fullPage:true});}
    rows.push({viewport:name,rank,pair,src,name:trueFormName(pet),geometry});
   }
   await page.locator('#saveBtn').click();await page.locator('#returnEntryBtn').click();
  }
  // Exercise the actual touch-event path in the mobile browser context.
  // Resizing a viewport does not prove physical device or OS keyboard behavior.
  if(name==='mobile'){
   for(const viewport of [{width:320,height:568},{width:360,height:800},{width:430,height:932},{width:844,height:390}]){
    await page.setViewportSize(viewport);
    await page.evaluate(()=>{globalThis.qaTouches={start:0,end:0,pointer:0};if(globalThis.qaTouchProbeInstalled)return;globalThis.qaTouchProbeInstalled=true;window.addEventListener('touchstart',()=>qaTouches.start++,{capture:true,passive:true});window.addEventListener('touchend',()=>qaTouches.end++,{capture:true,passive:true});window.addEventListener('pointerup',e=>{if(e.pointerType==='touch')qaTouches.pointer++;},{capture:true});});
    await page.locator('[data-slot-select="0"]').tap();await page.locator('#enterGameBtn').tap();
    await page.locator('[data-tab="pets"]').tap();await page.locator('[data-pet-section="manage"]').tap();
    // Tapping an already active companion withdraws it; switch via another one first.
    await page.locator(`[data-pet="${fixtures[0].player.pets[1].id}"]`).tap();
    await page.locator('[data-pet-section="manage"]').tap();
    await page.locator(`[data-pet="${fixtures[0].player.pets[0].id}"]`).tap();
    await page.locator('[data-pet-section="active"]').tap();
    const art=page.locator('#side img.companion-art').first();await art.scrollIntoViewIfNeeded();await art.evaluate(img=>img.decode());
    assert.equal(await art.getAttribute('src'),'assets/true-forms/S/attack-magic.webp');
    await page.locator('[data-tab="settings"]').tap();
    const target=page.locator('[data-autobuy-target="hp"]');await target.tap();await target.fill('37');
    await page.waitForTimeout(500);assert.equal(await target.inputValue(),'37');
    assert.ok(await target.evaluate(el=>document.activeElement===el));
    await page.locator('#saveBtn').tap();
    const state=await page.evaluate(()=>({touches:{...qaTouches},maxTouchPoints:navigator.maxTouchPoints,innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    touchRows.push({...viewport,...state});console.log('Touch probe '+JSON.stringify({...viewport,...state}));
    // Headless device metadata may report maxTouchPoints=0 despite real touch dispatch.
    // Require the eleven actual tap gestures in all three event streams instead.
    assert.ok(state.touches.start>=11&&state.touches.end>=11&&state.touches.pointer>=11,'tap must generate actual touch events: '+JSON.stringify(state));
    assert.ok(state.scrollWidth<=state.innerWidth+1,'touch layout exceeds viewport');
    await page.screenshot({path:resolve(out,`touch-${viewport.width}x${viewport.height}.png`)});
    await page.locator('#returnEntryBtn').tap();
   }
   await page.setViewportSize({width:390,height:844});
  }
  // Actual loyalty reveal, followed by paid A→S→SS→SSS pet enhancement clicks.
  await page.locator('[data-slot-select="3"]').click();await page.locator('#enterGameBtn').click();
  await page.locator('#evolutionModal').waitFor({state:'visible',timeout:15000});
  await page.locator('#evolutionClose').waitFor({state:'visible'});
  await page.waitForFunction(()=>!document.querySelector('#evolutionClose').disabled);
  await page.locator('#evolutionAfter').evaluate(img=>Promise.all(img.getAnimations().map(animation=>animation.finished)));
  await page.locator('#evolutionAfter').evaluate(img=>img.decode());
  const finalReveal=await page.locator('#evolutionAfter').evaluate(img=>({src:img.getAttribute('src'),filter:getComputedStyle(img).filter,opacity:getComputedStyle(img).opacity}));
  assert.ok(finalReveal.src.includes('/juvenile/'));assert.equal(finalReveal.opacity,'1');
  const blur=/blur\(([\d.]+)px\)/.exec(finalReveal.filter),invert=/invert\(([\d.]+)\)/.exec(finalReveal.filter);
  assert.ok(!finalReveal.filter.includes('brightness(0)')&&(!blur||Number(blur[1])===0)&&(!invert||Number(invert[1])===0),'completed reveal must show full-color art');

  await page.screenshot({path:resolve(out,`${name}-loyalty-viewport.png`)});await page.screenshot({path:resolve(out,`${name}-loyalty-reveal.png`),fullPage:true});await page.locator('#evolutionClose').click();
  await page.locator('#area [data-open="enhancement"]').click();
  for(const rank of ['S','SS','SSS']){
   for(const slot of ['head','body','shoes'])await page.locator(`[data-enhance-pet="${slot}"]`).click();
   assert.ok((await page.locator('#toast').innerText()).includes('進化成'),'stage success toast missing');
   assert.ok(!(await page.locator('#toast').innerText()).includes('undefined'));
   await page.screenshot({path:resolve(out,`${name}-upgrade-${rank}.png`),fullPage:true});
  }
  await page.locator('#returnEntryBtn').click();
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-slot-export="3"]').click();const download=await downloadPromise;
  const saved=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(saved.player.pets[0].humanoidStage,3);
  assert.deepEqual(saved.player.pets[0].equippedSkills,fixtures[3].player.pets[0].equippedSkills);
  for(const rank of ['S','SS','SSS'])assert.equal(saved.player.bag.find(e=>e.id==='rank_core_'+rank),undefined,'paid cores must be consumed');
  await page.locator('[data-slot-select="3"]').click();await page.locator('#saveFile').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});
  await page.locator('#enterGameBtn').click();await page.locator('#gameShell').waitFor({state:'visible'});
  await page.locator('[data-tab="pets"]').click();await page.locator('[data-pet-section="active"]').click();
  assert.ok((await page.locator('#side img.companion-art').first().getAttribute('src')).includes('/SSS/'));
  // Input remains focused while live battle updates the surrounding UI.
  await page.locator('#mapSelect').selectOption('worldroot');await page.locator('#autoBtn').click();await page.locator('[data-tab="settings"]').click();
  const input=page.locator('[data-autobuy-target="hp"]');await input.fill('37');await input.focus();
  await page.waitForTimeout(1500);assert.equal(await input.inputValue(),'37');assert.equal(await input.evaluate(el=>document.activeElement===el),true);
  await page.screenshot({path:resolve(out,`${name}-battle-input.png`),fullPage:true});
  await page.locator('#saveBtn').click();await page.close();
  await new Promise(resolve=>setTimeout(resolve,11000));
  page=await context.newPage();attach(page);await page.goto(base);
  await page.locator('[data-slot-select="3"]').click();await page.locator('#enterGameBtn').click();
  await page.locator('#offlineModal').waitFor({state:'visible',timeout:30000});
  assert.ok((await page.locator('#offlineContent').innerText()).includes('實際掛機'));
  await page.screenshot({path:resolve(out,`${name}-offline-restore.png`)});
  await page.locator('#offlineClose').click();await page.locator('#returnEntryBtn').click();await page.reload();
  for(const name of ['QA-S','QA-SS','QA-SSS','QA-A'])await page.getByRole('heading',{name,exact:true}).waitFor();
  // A deliberately unprepared test save verifies continuous-trial failure
  // stopping through the actual UI, even with ordinary auto-revival enabled.
  const failing=continuousFailureFixture(saved);
  await page.locator('[data-slot-select="3"]').click();await page.locator('#saveFile').setInputFiles({name:'failure-fixture.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(failing))});
  await page.locator('#enterGameBtn').click();await page.locator('#area [data-open="trials"]').click();
  await page.locator('[data-continuous-trial="worldroot"]').click();
  await page.locator('#reviveModal').waitFor({state:'visible',timeout:30000});
  await page.screenshot({path:resolve(out,`${name}-continuous-failure.png`)});await page.locator('#reviveLater').click();
  await page.waitForTimeout(16000);await page.locator('#returnEntryBtn').click();
  const stoppedDownload=page.waitForEvent('download');await page.locator('[data-slot-export="3"]').click();
  const stopped=JSON.parse(await readFile(await (await stoppedDownload).path(),'utf8')).player;
  assert.equal(stopped.hp,0,'continuous trial must not auto-revive and restart');assert.equal(stopped.trialRun,undefined);
  assert.ok(stopped.autoStoppedReason.includes('戰敗'));assert.equal(stopped.bag.find(e=>e.id==='ticket_worldroot').qty,1,'failure consumes only the entered round');
  assert.equal(stopped.offline.enabled,false);
  await context.close();
 }
 assert.equal(touchRows.length,4);assert.equal(rows.length,72);assert.equal(errors.length,0,JSON.stringify(errors));passed=true;
}catch(error){errors.push({phase:'acceptance',error:error.message});throw error;}finally{await browser.close();await new Promise(r=>server.close(r));await writeFile(resolve(out,'browser-acceptance.json'),JSON.stringify({engine,passed,rows,touchRows,errors,checks:'72 displayed stage sprites at1440/390 widths; actual four-slot import/reload/tab reopen/export/roundtrip; loyalty reveal and paid S/SS/SSS clicks; live battle input focus; actual continuous-trial failure, ticket use and no auto-revive restart. Touch taps at320/360/430/844 widths verify actual touch events, tabs, input focus, save and no horizontal overflow. Mobile is browser viewport emulation, not a physical handset; WebKit is an engine check, not physical Safari.'},null,2));}
console.log('Browser acceptance passed: '+rows.length+' displayed stage sprites, four slots, paid evolution, backup, offline restore and live input.');
