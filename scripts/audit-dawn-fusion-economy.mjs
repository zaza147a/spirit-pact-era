// Every ordered fusion: dawn field income must cover consumables without
// selling materials reserved for the sigil. SSS gear is mandatory.
import {writeFileSync} from 'node:fs';
import {runBuild} from './balance-v24.mjs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {FUSION_PAIRS} from '../dist/pet-fusion.js';
import {JUNK_ITEMS} from '../dist/adventure-economy.js';
import {ITEMS} from '../dist/catalog.js';

const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS),levels=[201,210],seeds=[42,137],rows=[];
for(const level of levels)for(const pair of pairs)for(const job of jobs)for(const seedStart of seeds){
 const p=runBuild(job,pair.split('-')[0],{level,encounterLevel:level,gearLevel:200,
  seconds:0,seed:seedStart,scenario:'regional',reborn:true,thirdJob:true,
  rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',fusionPair:pair,
  gearStrength:.9,allocationStrength:.9,cardStrength:.9,
  enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0,fixture:true}).fixture;
 const c=await runtime();let seed=seedStart;
 c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 c.rand=(lo,hi)=>lo+Math.floor(c.Math.random()*(hi-lo+1));
 p.gold=10000;p.bag=[{id:'red_large',qty:25},{id:'blue_large',qty:25}];
 p.autoSellJunk=Object.keys(JUNK_ITEMS);p.autoEscapeBoss=true;p.autoRevive=true;
 p.autoBuyPotions={hp:{enabled:true,id:'red_large',min:10,target:25},sp:{enabled:true,id:'blue_large',min:10,target:25}};
 p.offline={at:1000000,enabled:true};
 const {summary,player}=await c.api.simulateOffline(p,1060000);
 const potionValue=Object.entries(summary.potions||{}).reduce((s,[id,n])=>s+(ITEMS[id]?.cost||0)*n,0);
 const dawnMaterials=player.bag.filter(e=>ITEMS[e.id]?.dawnJunk).reduce((s,e)=>s+e.qty,0);
 rows.push({level,pair,job,seed:seedStart,kills:summary.kills||0,coins:summary.goldEarned||0,
  potionValue,netGold:summary.gold||0,coverage:(summary.goldEarned||0)/Math.max(1,potionValue),
  dawnMaterials,revives:summary.revives||0,reason:summary.reason||''});
}
const mean=(a,k)=>a.reduce((s,r)=>s+r[k],0)/Math.max(1,a.length);
const group=a=>({samples:a.length,avgKills:mean(a,'kills'),avgCoins:mean(a,'coins'),avgPotionValue:mean(a,'potionValue'),
 avgCoverage:mean(a,'coins')/Math.max(1,mean(a,'potionValue')),belowBreakEven:a.filter(r=>r.coverage<1).length,
 revives:a.reduce((s,r)=>s+r.revives,0),avgMaterials:mean(a,'dawnMaterials'),stopped:a.filter(r=>!r.reason.includes('已完成')).length});
const summary=levels.map(level=>({level,...group(rows.filter(r=>r.level===level)),
 byPair:pairs.map(pair=>({pair,...group(rows.filter(r=>r.level===level&&r.pair===pair))}))}));
const report={conditions:'201 and 210 Dawn Rift actual 60-second offline farming, ten jobs × twelve ordered fusion pairs × two deterministic seeds per level (480 samples). Mandatory player/pet SSS gear, sigil 0, 90% reference power; sell ordinary junk but NEVER sigil materials. Spendable gold includes field coins and any class bounty; potions valued at shop price.',count:rows.length,summary,rows};
writeFileSync('docs/dawn-fusion-economy-matrix.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:rows.length,summary:summary.map(({byPair,...s})=>s)},null,2));
