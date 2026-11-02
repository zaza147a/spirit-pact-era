// ACTUAL gameplay engine end-to-end, not an attack-rate formula.
// Requires Chromium and the test-only ?lingqi_combat_test hook on the isolated branch.
// Usage: node tests/real-combat-browser-benchmark.mjs smoke|full
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,join} from 'node:path';

const dist=resolve('dist'),port=8788;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURI(new URL(req.url,'http://127.0.0.1').pathname);
  const path=resolve(dist,'.'+pathname.replace(/^\//,'/'));
  if(!path.startsWith(dist+'/')&&path!==dist){res.writeHead(403);return res.end();}
  const file=path===dist?join(dist,'index.html'):path;
  const payload=await readFile(file);
  res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream'});res.end(payload);
 }catch(e){res.writeHead(404);res.end('Not Found: '+String(e));}
});
const jobs={
 knight:['blade+shield','oneSpear+shield','twoSword','twoSpear'],
 crusader:['blade+shield','oneSpear+shield'],wizard:['oneStaff+shield','twoStaff'],
 sage:['oneStaff+shield','twoStaff','spellFist'],assassin:['rifle+shield','rifle+offDagger','katar'],
 rogue:['rifle+shield'],priest:['mace+shield'],monk:['knuckles'],
 hunter:['shortBow','longBow','crossbow'],performer:['instrument','shortBow','longBow']
};
const fusions=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const mode=process.argv[2]||'smoke';
const plans=mode==='full'?[200,210].flatMap(level=>Object.keys(jobs).flatMap(job=>fusions.map(fusion=>({level,job,fusion})))):[
 {level:200,job:'assassin',fusion:'attack-magic'},
 {level:200,job:'wizard',fusion:'magic-support'},
 {level:210,job:'knight',fusion:'attack-defense'},
 {level:210,job:'hunter',fusion:'attack-magic'}
];
await new Promise(ok=>server.listen(port,'127.0.0.1',ok));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',err=>errors.push(err.message));
await page.goto('http://127.0.0.1:'+port+'/index.html?lingqi_combat_test',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>Boolean(globalThis.__lingqiCombatHarness),null,{timeout:30000});
const rows=[];
try{
 for(const plan of plans){
  const specs=jobs[plan.job];
  // Every legal weapon is tested, not merely a guessed best choice.
  for(const weaponBuild of specs){
   const attr=plan.job==='wizard'||plan.job==='sage'||plan.job==='priest'?'INT':plan.job==='hunter'||plan.job==='performer'?'DEX':'STR';
   const cap=plan.level===210?150:120;
   const allocations=[{STR:1,AGI:cap,VIT:20,INT:1,DEX:cap,LUK:cap},{STR:cap,AGI:cap,VIT:20,INT:cap,DEX:cap,LUK:cap}];
   // Legalize to point budget; retain strict max stat, give remaining to main stat.
   const unique=allocations.map(a=>{
    const out={STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1},budget=(plan.level-1)*2+20;
    for(const k of [attr,'LUK','AGI','DEX','VIT','STR','INT']){
     const can=Math.min(cap-1,budget);
     const take=Math.min(Math.max(0,(a[k]||1)-1),can);
     out[k]+=take;budget-=take;
    }return out;
   });
   for(const [allocationIndex,attributes] of unique.entries()){
    const variants=plan.level===210?[4,8]:[0];
    for(const sigil of variants)for(const target of ['mob','boss']){
     const outcome=await page.evaluate(({plan,weaponBuild,attributes,sigil,target})=>{
      let seed=0x51A8D00D;
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const h=globalThis.__lingqiCombatHarness;
      const panel=h.configure({...plan,weaponBuild,attributes,sigil});
      return {panel,...h.fight({boss:target==='boss',durationMs:target==='boss'?60000:20000,enemyAttackEnabled:true})};
     },{plan,weaponBuild,attributes,sigil,target});
     rows.push({...plan,weaponBuild,attributes,allocationIndex,sigil,target,...outcome});
     if(rows.length%20===0)console.log('real combat result',rows.length,'last',plan.job,weaponBuild,target);
    }
   }
  }
 }
 await mkdir('test-results',{recursive:true});
 const file='test-results/lv200-lv210-'+mode+'-actual-combat.json';
 await writeFile(file,JSON.stringify({kind:'ACTUAL_GAME_COMBATTICK_RUNTIME',mode,rows,errors},null,2));
 console.log('Actual combat results',rows.length,'errors',errors.length,'file',file);
 if(errors.length)throw Error('Browser JS errors: '+JSON.stringify(errors.slice(0,5)));
 if(!rows.length||rows.some(x=>!Number.isFinite(x.totalDamage)||x.ticks===0))throw Error('Invalid actual combat records');
 if(!rows.some(x=>x.hits>0))throw Error('No combat damage was observed: runtime harness invalid');
}finally{await browser.close();server.close();}
