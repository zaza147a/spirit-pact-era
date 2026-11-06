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
 assert.deepEqual(errors,[],'uncaught browser runtime errors');
 console.log(JSON.stringify({passed:true,firstJob:'spiritist',level:1,slots:[1,8],reloaded:true}));
 await context.close();
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
