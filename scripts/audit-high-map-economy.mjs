// High-tier real offline farming: junk income vs actual potion consumption.
// 201+ MUST use SSS equipment on both owner and pet, even at zero dawn sigil.
import {writeFileSync} from 'node:fs';
import {runBuild} from './balance-v24.mjs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {JUNK_ITEMS} from '../dist/adventure-economy.js';
import {ITEMS} from '../dist/catalog.js';

const tiers=[[151,150],[171,151],[191,171],[200,190],[201,200],[210,200]];
const jobs=Object.keys(SECOND_JOBS),rows=[];
for(const [level,gearLevel] of tiers)for(const job of jobs)for(const seedStart of [42,137]){
 const fixture=runBuild(job,'attack',{level,encounterLevel:level,gearLevel,seconds:0,seed:seedStart,
  scenario:'regional',reborn:true,thirdJob:true,rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',
  fusionPair:'attack-magic',gearStrength:.9,allocationStrength:.9,cardStrength:.9,
  enhancement:level>=201?'SSS':null,petEnhancement:level>=201?'SSS':null,dawnSigil:0,fixture:true}).fixture;
 const c=await runtime();let seed=seedStart;
 c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 c.rand=(lo,hi)=>lo+Math.floor(c.Math.random()*(hi-lo+1));
 fixture.gold=10000;fixture.bag=[{id:'red_large',qty:25},{id:'blue_large',qty:25}];
 fixture.autoSellJunk=Object.keys(JUNK_ITEMS);fixture.autoEscapeBoss=true;fixture.autoRevive=true;
 fixture.autoBuyPotions={hp:{enabled:true,id:'red_large',min:10,target:25},sp:{enabled:true,id:'blue_large',min:10,target:25}};
 fixture.offline={at:1000000,enabled:true};
 const {player,summary}=await c.api.simulateOffline(fixture,1060000);
 const consumedPotionValue=Object.entries(summary.potions||{}).reduce((sum,[id,n])=>sum+(ITEMS[id]?.cost||0)*n,0);
 const dawnMaterials=player.bag.filter(entry=>ITEMS[entry.id]?.dawnJunk).map(entry=>({id:entry.id,qty:entry.qty}));
 const reservedDawnValue=dawnMaterials.reduce((sum,entry)=>sum+entry.qty*(ITEMS[entry.id]?.cost||0),0);
 rows.push({level,job,seed:seedStart,kills:summary.kills||0,junkGold:summary.junkGold||0,
  consumedPotionValue,junkCoverage:(summary.junkGold||0)/Math.max(1,consumedPotionValue),
  reservedDawnValue,dawnMaterials,stoppedReason:summary.reason||null,revives:summary.revives||0});
}
const mean=(rows,key)=>rows.reduce((sum,row)=>sum+row[key],0)/Math.max(1,rows.length);
const summary=tiers.map(([level,gearLevel])=>{const matches=rows.filter(row=>row.level===level);
 return {level,gearLevel,n:matches.length,avgKills:mean(matches,'kills'),avgJunkGold:mean(matches,'junkGold'),
  avgPotionValue:mean(matches,'consumedPotionValue'),avgReservedDawnValue:mean(matches,'reservedDawnValue'),coverage:mean(matches,'junkGold')/Math.max(1,mean(matches,'consumedPotionValue')),
  belowBreakEven:matches.filter(row=>row.junkCoverage<1).length,revives:matches.reduce((n,row)=>n+row.revives,0)};
});
const output={conditions:'60s real offline runtime per case; 10 jobs × 6 high tiers × 2 seeds; nearest prior-stage 90% mythic reference gear and attack-magic fused pet for 151–200; mandatory SSS owner/pet gear for 201/210; dawn sigil zero, auto-buy large potions, sell allowed junk. Dawn materials are intentionally protected from AUTO-sale and valued separately as reserved sigil resources, not cash income. Junk cash vs potion replacement only, not cards/gear income.',summary,rows};
writeFileSync('docs/high-map-economy-batch.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
