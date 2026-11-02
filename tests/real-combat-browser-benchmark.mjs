// ACTUAL gameplay engine end-to-end, not an attack-rate formula.
// Requires Chromium and the test-only ?lingqi_combat_test hook on the isolated branch.
// Usage: node tests/real-combat-browser-benchmark.mjs smoke|full
import {chromium} from 'playwright';
import {WORLD_MONSTERS} from '../dist/world-data.js';
import {DAWN_MONSTERS} from '../dist/dawn-world.js';
import {allocationBudget} from '../dist/growth-v5.js';
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
const errors=[],httpFailures=[];
page.on('pageerror',err=>errors.push(err.stack||err.message));
page.on('response',resp=>{if(resp.status()>=400)httpFailures.push({status:resp.status(),url:resp.url()});});
const rows=[],fusionChecks=[];let currentCase=null;
try{
 await page.goto('http://127.0.0.1:'+port+'/index.html?lingqi_combat_test',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>Boolean(globalThis.__lingqiCombatHarness),null,{timeout:30000});
 for(const plan of plans){
  const specs=jobs[plan.job];
  // Every legal weapon is tested, not merely a guessed best choice.
  for(const weaponBuild of specs){
   const attr=plan.job==='wizard'||plan.job==='sage'||plan.job==='priest'?'INT':plan.job==='hunter'||plan.job==='performer'?'DEX':'STR';
   const cap=plan.level===210?150:120;
   const allocations=[{STR:1,AGI:cap,VIT:20,INT:1,DEX:cap,LUK:cap},{STR:cap,AGI:cap,VIT:20,INT:cap,DEX:cap,LUK:cap}];
   // Legalize to point budget; retain strict max stat, give remaining to main stat.
   const unique=allocations.map(a=>{
    const out={STR:1,AGI:1,VIT:1,INT:1,DEX:1,LUK:1};
    let budget=allocationBudget(plan.level,true);
    for(const k of [...new Set([attr,'LUK','AGI','DEX','VIT','STR','INT'])]){
     const take=Math.min(cap-out[k],budget,Math.max(0,(a[k]||1)-out[k]));
     out[k]+=take;budget-=take;
    }
    const total=Object.values(out).reduce((n,v)=>n+v-1,0);
    if(total>allocationBudget(plan.level,true)||Object.values(out).some(x=>x>cap))throw Error('Illegal point allocation');
    return out;
   });
   for(const [allocationIndex,attributes] of unique.entries()){
    const variants=plan.level===210?[4,8]:[0];
    const monsters=mode==='full'?(plan.level===200?WORLD_MONSTERS.filter(m=>m.map==='worldroot').map(m=>m.id):DAWN_MONSTERS.map(m=>m.id)):[plan.level===200?'world_200':'dawn-ray'];
    for(const sigil of variants)for(const target of [...monsters,'boss']){
     currentCase={...plan,weaponBuild,attributes,allocationIndex,sigil,target};
     const outcome=await page.evaluate(({plan,weaponBuild,attributes,sigil,target})=>{
      let seed=0x51A8D00D;
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const h=globalThis.__lingqiCombatHarness;
      const panel=h.configure({...plan,weaponBuild,attributes,sigil});
      return {panel,...h.fight({boss:target==='boss',monsterId:target==='boss'?null:target,durationMs:target==='boss'?60000:20000,enemyAttackEnabled:true})};
     },{plan,weaponBuild,attributes,sigil,target});
     rows.push({...plan,weaponBuild,attributes,allocationIndex,sigil,target,...outcome});
     if(rows.length%20===0)console.log('real combat result',rows.length,'last',plan.job,weaponBuild,target);
    }
   }
  }
 }
 if(mode==='smoke'){
  const checks=[];
  for(const fusion of fusions){
   const run=async reverseFusion=>page.evaluate(({fusion,reverseFusion})=>{
    let seed=0x51A8D00D;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const h=globalThis.__lingqiCombatHarness;
    h.configure({level:200,job:'assassin',fusion,reverseFusion,weaponBuild:'rifle+offDagger',
      attributes:{STR:120,AGI:100,VIT:1,INT:1,DEX:80,LUK:120}});
    return h.fight({monsterId:'world_200',durationMs:12000,enemyAttackEnabled:true});
   },{fusion,reverseFusion});
   const forward=await run(false),reverse=await run(true);
   const select=r=>({totalDamage:r.totalDamage,ownerDamage:r.ownerDamage,
      petAttributedDamage:r.petAttributedDamage,kill:r.kill,dead:r.dead,
      elapsedMs:r.elapsedMs,petCasts:r.petCasts.map(x=>[x.at,x.id,x.kind])});
   const equal=JSON.stringify(select(forward))===JSON.stringify(select(reverse));
   checks.push({fusion,equal,forward:select(forward),reverse:select(reverse)});
   if(!equal)throw Error('Real combat fusion order is NOT mechanically identical: '+fusion);
  }
  fusionChecks.push(...checks);
 }
 await mkdir('test-results',{recursive:true});
 const file='test-results/lv200-lv210-'+mode+'-actual-combat.json';
 await writeFile(file,JSON.stringify({kind:'ACTUAL_GAME_COMBATTICK_RUNTIME',mode,rows,fusionChecks,errors,httpFailures},null,2));
 console.log('Actual combat results',rows.length,'errors',errors.length,'file',file);
 if(errors.length||httpFailures.length)throw Error('Browser JS or missing module errors: '+JSON.stringify({errors:errors.slice(0,5),httpFailures:httpFailures.slice(0,8)}));
 if(!rows.length||rows.some(x=>!Number.isFinite(x.totalDamage)||x.ticks===0))throw Error('Invalid actual combat records');
 if(!rows.some(x=>x.hits>0))throw Error('No combat damage was observed: runtime harness invalid');
 if(!rows.some(x=>x.enemyActions>0))throw Error('No real enemy turns observed: defense/survival test invalid');
 if(!rows.some(x=>x.playerActions>0))throw Error('No player attack actions observed: full combat test invalid');
 if(!rows.some(x=>x.petCasts?.length>0))throw Error('No pet skills were actually cast: six-fusion test invalid');
 if(rows.some(x=>!x.damageReconciled))throw Error('Some combat runs failed owner/pet damage reconciliation');
 if(mode==='full')for(const plan of plans){const subset=rows.filter(x=>x.level===plan.level&&x.job===plan.job&&x.fusion===plan.fusion);const expected=plan.level===200?11:4;if(new Set(subset.map(x=>x.target)).size!==expected)throw Error('Incomplete source map encounter coverage '+JSON.stringify(plan));}
}catch(error){
 await mkdir('test-results',{recursive:true});
 const failure={kind:'ACTUAL_GAME_COMBATTICK_FAILURE',mode,error:String(error),stack:error?.stack,
  errors,httpFailures,currentCase,completedRows:rows.length,lastComplete:rows.at(-1)||null,
  fusionChecks,runAt:new Date().toISOString()};
 const file='test-results/lv200-lv210-'+mode+'-failure.json';
 await writeFile(file,JSON.stringify(failure,null,2));
 console.error('Actual combat failed; diagnostic artifact:',file,error);
 process.exitCode=1;
}finally{await browser.close();server.close();}
