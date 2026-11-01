// Long-haul stress test for the tightest Dawn Rift economy in the 480-case audit.
import {writeFileSync} from 'node:fs';
import {runBuild} from './balance-v24.mjs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {JUNK_ITEMS} from '../dist/adventure-economy.js';
import {ITEMS} from '../dist/catalog.js';
import {OFFLINE_CAP_MS} from '../dist/offline-rules.js';

const rows=[];
for(const level of [201,210])for(const seedStart of [42,137]){
 const p=runBuild('sage','magic',{level,encounterLevel:level,gearLevel:200,
  seconds:0,seed:seedStart,scenario:'regional',reborn:true,thirdJob:true,
  rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',fusionPair:'magic-support',
  gearStrength:.9,allocationStrength:.9,cardStrength:.9,
  enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0,fixture:true}).fixture;
 const c=await runtime();let seed=seedStart;
 c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 c.rand=(lo,hi)=>lo+Math.floor(c.Math.random()*(hi-lo+1));
 p.gold=10000;p.bag=[{id:'red_large',qty:25},{id:'blue_large',qty:25}];
 p.autoSellJunk=Object.keys(JUNK_ITEMS);p.autoEscapeBoss=true;p.autoRevive=true;
 p.autoBuyPotions={hp:{enabled:true,id:'red_large',min:10,target:25},sp:{enabled:true,id:'blue_large',min:10,target:25}};
 p.offline={at:1000000,enabled:true};
 const {player,summary}=await c.api.simulateOffline(p,1000000+OFFLINE_CAP_MS/48);
 const potionValue=Object.entries(summary.potions||{}).reduce((s,[id,n])=>s+(ITEMS[id]?.cost||0)*n,0);
 const dawnMaterials=player.bag.filter(e=>ITEMS[e.id]?.dawnJunk).reduce((s,e)=>s+e.qty,0);
 rows.push({level,job:'sage',pair:'magic-support',seed:seedStart,
  duration:summary.duration,simulated:summary.simulated,kills:summary.kills||0,
  earned:summary.goldEarned||0,spent:summary.spent||0,potionValue,
  coverage:(summary.goldEarned||0)/Math.max(1,potionValue),netGold:summary.gold||0,
  remainingGold:player.gold,materials:dawnMaterials,revives:summary.revives||0,
  reason:summary.reason||'',valid:c.api.valid(player)});
 console.log('completed',level,seedStart,summary.simulated,summary.kills,summary.reason);
}
const report={conditions:'Four 30-minute continuous offline simulations of the worst 60-second Dawn Rift economy: sage magic-support at levels 201 and 210, seeds 42/137, zero sigil, reference mythic+SSS owner and companion, 10k starting coins, 25 initial HP and SP potions each, buy replenishments; materials protected from auto-sale. This does NOT replace six-hour or full 24-hour runtime tests.',rows};
writeFileSync('docs/dawn-longhaul-economy.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
