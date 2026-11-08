import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from 'playwright';
import {starterPlayer} from '../../tests/fixtures/starter-player.mjs';

const root=resolve('dist'),out=resolve('browser-qa/character-order');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json'};
const server=createServer(async(req,res)=>{
 try{
  const name=new URL(req.url,'http://localhost').pathname;
  const path=resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!path.startsWith(root+'/'))throw Error('outside dist');
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});res.end(await readFile(path));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
let browser;const errors=[],result={};
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',error=>errors.push(error.message));
 page.on('dialog',dialog=>dialog.accept());
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.evaluate(player=>{
  for(let index=0;index<8;index++){
   const p=structuredClone(player);p.name='排序測試角色'+(index+1);p.manualPaused=true;
   p.offline={at:Date.now(),enabled:false};
   localStorage.setItem(`icarus-character-slot-${index+1}`,JSON.stringify({version:2,player:p}));
  }
 },starterPlayer());
 await page.reload();
 const order=()=>page.locator('#slotGrid [data-slot-select]').evaluateAll(elements=>elements.map(el=>Number(el.dataset.slotSelect)));
 assert.deepEqual(await order(),[0,1,2,3,4,5,6,7]);
 const card=page.locator('.slot-card').filter({has:page.locator('[data-slot-select="3"]')});
 await card.getByRole('button',{name:/向前移動/}).click();
 assert.deepEqual(await order(),[0,1,3,2,4,5,6,7]);
 assert.equal(await page.locator('[data-slot-select="3"] h2').textContent(),'排序測試角色4');
 await page.screenshot({path:resolve(out,'after-reorder.png'),fullPage:true});
 await page.reload();
 assert.deepEqual(await order(),[0,1,3,2,4,5,6,7]);
 await page.locator('[data-slot-select="3"]').click();
 assert.match(await page.locator('#entrySelection').textContent(),/第 4 格/);
 assert.match(await page.locator('#enterGameBtn').textContent(),/排序測試角色4/);
 const slot3=await page.evaluate(()=>JSON.parse(localStorage.getItem('icarus-character-slot-4')).player.name);
 assert.equal(slot3,'排序測試角色4');
 assert.deepEqual(errors,[]);
 result.passed=true;result.order=await order();result.browserVersion=browser.version();
 console.log('Character order browser acceptance passed');
}catch(error){result.passed=false;result.error=String(error.stack);throw error;
}finally{
 result.errors=errors;await writeFile(resolve(out,'report.json'),JSON.stringify(result,null,2));
 await browser?.close();await new Promise(done=>server.close(done));
}
