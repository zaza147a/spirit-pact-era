// Actual offline rewards/restocks, separate from infinite-potion stress fixtures.
import {writeFileSync} from 'node:fs';
import {runBuild} from './balance-v24.mjs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {JUNK_ITEMS} from '../dist/adventure-economy.js';
import {ITEMS} from '../dist/catalog.js';

const levels=[60,70,80,90,99,110,120,130,140,150],jobs=Object.keys(SECOND_JOBS),rows=[];
for(const level of levels)for(const job of jobs)for(const seedStart of [42,137]){
 const c=await runtime(),p=runBuild(job,'attack',{level,gearLevel:level<=99?level:level<=110?90:level<=130?110:130,
  rarity:level<=99?'uncommon':'legendary',referenceQuality:'legendary',
  referenceBuild:level>=101,gearStrength:.8,allocationStrength:.8,cardStrength:.8,
  reborn:level>=101,seconds:0,fixture:true}).fixture;
 let seed=seedStart;
 c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 c.rand=(lo,hi)=>lo+Math.floor(c.Math.random()*(hi-lo+1));
 p.gold=10000;p.bag=[{id:'red_large',qty:25},{id:'blue_large',qty:25}];
 p.autoSellJunk=Object.keys(JUNK_ITEMS);p.autoEscapeBoss=true;p.autoRevive=true;
 p.autoBuyPotions={hp:{enabled:true,id:'red_large',min:10,target:25},sp:{enabled:true,id:'blue_large',min:10,target:25}};
 p.offline={at:1000000,enabled:true};
 const {summary}=await c.api.simulateOffline(p,1060000);
 const potionValue=Object.entries(summary.potions||{}).reduce((sum,[id,count])=>sum+(ITEMS[id]?.cost||0)*count,0);
 rows.push({level,job,seed:seedStart,kills:summary.kills||0,junkGold:summary.junkGold||0,
  consumedPotionValue:potionValue,junkCoverage:(summary.junkGold||0)/Math.max(1,potionValue),
  stoppedReason:summary.reason||null,revives:summary.revives||0});
}
const summary=levels.map(level=>{const a=rows.filter(x=>x.level===level),avg=k=>a.reduce((sum,r)=>sum+r[k],0)/a.length;
 return {level,n:a.length,avgKills:avg('kills'),avgJunkGold:avg('junkGold'),avgPotionValue:avg('consumedPotionValue'),
  coverage:avg('junkGold')/Math.max(1,avg('consumedPotionValue')),
  belowBreakEven:a.filter(r=>r.junkCoverage<1).length,revives:a.reduce((s,r)=>s+r.revives,0)};});
const output={conditions:'60 seconds real offline runtime, two seeds, ten jobs, reference or previous-stage 80% gear; large potions auto-buy/sell selected junk. Report covers junk versus potion replacement only, not gear/cards or all income.',summary,rows};
writeFileSync('docs/map-economy-audit.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
