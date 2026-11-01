import assert from 'node:assert/strict';
import {runBuild} from './balance-v24.mjs';
import {runtime} from '../tests/runtime31-helper.mjs';
import {upgradeDawnSigil,sigilCost} from '../dist/dawn-sigil.js';
import {readCharacterSlot,writeCharacterSlot} from '../dist/character-slots.js';
import {JUNK_ITEMS} from '../dist/adventure-economy.js';
import {DAWN_BOSS} from '../dist/dawn-world.js';

// Only the starting character/equipment is a fixture. Materials, coins, potion
// replenishment, experience, upgrades and the final boss reward use game code.
export async function runProgression(job,pair,seedStart=42){
 const c=await runtime(),a=c.api;
 let seed=seedStart;
 c.Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 c.rand=(lo,hi)=>lo+Math.floor(c.Math.random()*(hi-lo+1));
 const target=c.chooseMonsterTarget,bossEncounter=c.canEncounterBoss,delay=c.encounterDelay,replacement=c.replacementDelay;
 c.chooseMonsterTarget=(player,pet,role,guarding)=>target(player,pet,role,guarding,c.Math.random);
 c.canEncounterBoss=(location,enemies,now,next=0)=>bossEncounter(location,enemies,now,next,c.Math.random);
 c.encounterDelay=()=>delay(c.Math.random);c.replacementDelay=()=>replacement(c.Math.random);
 let p=runBuild(job,pair.split('-')[0],{level:201,encounterLevel:201,gearLevel:200,
  seconds:0,seed:seedStart,scenario:'regional',reborn:true,thirdJob:true,
  rarity:'mythic',referenceBuild:true,referenceQuality:'mythic',fusionPair:pair,
  enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0,fixture:true}).fixture;
 p.dawnUnlocked=true;p.gold=10000;p.bag=[{id:'red_large',qty:25},{id:'blue_large',qty:25}];
 p.autoSellJunk=Object.keys(JUNK_ITEMS);p.autoEscapeBoss=true;p.autoRevive=false;
 p.autoBuyPotions={hp:{enabled:true,id:'red_large',min:10,target:25},sp:{enabled:true,id:'blue_large',min:10,target:25}};
 const required=Object.fromEntries(Object.keys(sigilCost(1)).map(id=>[id,0]));
 for(let rank=1;rank<=4;rank++)for(const [id,qty] of Object.entries(sigilCost(rank)))required[id]+=qty;
 const quantity=id=>p.bag.find(e=>e.id===id)?.qty||0;
 let clock=1000000,kills=0,earned=0,spent=0,purchased=0;
 for(let minute=0;minute<30&&!Object.entries(required).every(([id,n])=>quantity(id)>=n);minute++){
  p.offline={at:clock,enabled:true};
  const result=await a.simulateOffline(p,clock+60000);p=result.player;clock+=60000;
  assert.equal(result.summary.simulated,60000,job+'/'+pair+' farm stopped');
  assert.ok(p.hp>0,job+'/'+pair+' farm death');
  kills+=result.summary.kills;earned+=result.summary.goldEarned;spent+=result.summary.spent;
  purchased+=Object.values(result.summary.purchased).reduce((s,n)=>s+n,0);
 }
 assert.ok(Object.entries(required).every(([id,n])=>quantity(id)>=n),'field materials missing');
 assert.ok(!quantity('dawn_archon_core'),'boss must not be killed before preparation');
 const farmMaterials=Object.fromEntries(Object.keys(required).map(id=>[id,quantity(id)]));
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const reload=()=>{writeCharacterSlot(storage,0,p);const loaded=readCharacterSlot(storage,0,a.normalize,a.valid);assert.equal(loaded.error,null);p=loaded.player;};
 reload();a.setup(p,null);a.travel('dawncity');assert.equal(p.location,'dawncity');
 for(let rank=1;rank<=4;rank++){
  assert.equal(upgradeDawnSigil(p).level,rank);reload();assert.equal(p.dawnSigil,rank);
 }
 const beforeFailed=JSON.stringify(p);assert.ok(upgradeDawnSigil(p).error);assert.equal(JSON.stringify(p),beforeFailed);
 // Prepare with paid/consumed ordinary supplies rather than assigning HP/SP.
 a.setup(p,null);c.setTime(clock+10000);
 const companion=p.pets.find(q=>q.id===p.activePetId);
 for(let i=0;i<12;i++){
  a.autoBuyPotions();
  for(const [id,key,max] of [['red_large','hp',a.stat('hp')],['blue_large','mp',a.stat('mp')]])if(p[key]<max){const index=p.bag.findIndex(e=>e.id===id);if(index>=0)a.useItem(index);}
  for(const [id,key,max] of [['red_large','hp',c.petStats(companion).hp],['blue_large','sp',c.petStats(companion).sp]])if(companion[key]<max){const index=p.bag.findIndex(e=>e.id===id);if(index>=0)a.usePetItem(index);}
 }
 const preparedHp=p.hp,preparedPetHp=companion.hp;
 a.travel('dawnrift');assert.equal(p.location,'dawnrift');
 p.autoEscapeBoss=false;
 // Force the encounter selection, not its stats, damage, health or outcome.
 c.canEncounterBoss=()=>true;c.setTime(clock+10000);a.addEncounter(clock+10000);
 const boss=a.state().enemies.find(e=>e.id===DAWN_BOSS.id);
 assert.ok(boss);assert.equal(boss.hp,DAWN_BOSS.hp);assert.equal(boss.atk,DAWN_BOSS.atk);
 c.canEncounterBoss=()=>false;
 let elapsed=0;
 for(;elapsed<240000&&boss.hp>0&&p.hp>0;elapsed+=20){c.setTime(clock+10000+elapsed);a.combatTick(clock+10000+elapsed);if(elapsed%4000===0&&p.hp>0)a.autoBuyPotions();}
 if(boss.hp<=0){a.setEnemies([boss,...a.state().enemies.filter(e=>e!==boss)]);a.award();}
 const won=boss.hp<=0&&p.hp>0,core=quantity('dawn_archon_core');
 reload();
 return {job,pair,seed:seedStart,startLevel:201,endLevel:p.level,farmSeconds:(clock-1000000)/1000,
  kills,earned,spent,purchased,farmMaterials,required,sigil:p.dawnSigil,won,
  bossSeconds:elapsed/1000,bossRemainingHp:boss.hp,remainingHp:p.hp,core,
  preparedHp,preparedPetHp,remainingGold:p.gold,valid:a.valid(p)};
}
