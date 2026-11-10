// V8 independent 210 benchmark policy. Never imported by production gameplay.
// No numbers or winners are copied from older ranking reports.
import assert from 'node:assert/strict';
import {GEAR_BASE, PET_GEAR_BASE, affixRange, primaryAffix} from '../../dist/loot.js';
import {CARDS, SLOTS} from '../../dist/catalog.js';
import {cardAllowedInSlot} from '../../dist/card-effects.js';
import {SECOND_JOBS} from '../../dist/jobs.js';

export const BENCHMARK_CONDITIONS = Object.freeze({
 level:210, equipmentLevel:200, rarity:'mythic', enhancement:'SSS', dawnSigil:8,
 companionCount:1, companionLevel:200, companionRarity:'mythic',
 homecomingRequired:true, seconds:180,
});

export function attackAttribute(job, attackType=null) {
 if (attackType === 'magic') return 'INT';
 if (attackType === 'ranged') return 'DEX';
 if (attackType === 'melee') return 'STR';
 const metadata=SECOND_JOBS[job];
 assert.ok(metadata, `unknown job ${job}`);
 if (metadata.attribute==='INT'||['wizard','sage'].includes(job))return 'INT';
 if (metadata.range==='ranged') return 'DEX';
 return 'STR';
}

function affixValue(item,key){
 const [low,high]=affixRange(key,item.tier,item.rarity,item.id);
 void low;
 return high;
}

export function optimizeAffixes(item,{job,attackType=null,weaponChoice='critDmg'}={}){
 assert.ok(item?.id&&job,'requires a generated item and job');
 const weapon=!!GEAR_BASE[item.id]?.weaponType;
 const pet=!!PET_GEAR_BASE[item.id];
 const main=attackAttribute(job,attackType);
 let ordinary,special;
 if (pet){
  // Companion equipment is a separate three-slot system; this policy is for owner gear.
  return item;
 } else if(weapon){
  assert.ok(['critDmg','aspdPct'].includes(weaponChoice));
  ordinary=[primaryAffix(item.id),...(item.id==='staffSword'?['matk']:[]),'LUK',main,'hit','crit','DEX','STR','INT'];
  special=weaponChoice;
 } else {
  ordinary=['def','mdef','flee','LUK',main];
  special='hpPct';
 }
 ordinary=[...new Set(ordinary)].slice(0,5);
 assert.equal(ordinary.length,5,`not enough distinct affixes for ${item.id}`);
 const affixes=Object.fromEntries([...ordinary,special].map(key=>[key,affixValue(item,key)]));
 return {...item,affixes};
}

export function selectBossCards(player){
 const candidates=Object.entries(CARDS).filter(([id,card])=>card.boss&&id!=='boss_petland');
 const used=new Set();
 for(const slot of Object.keys(SLOTS)){
  if(!player.gear[slot]){player.sockets[slot]=null;continue;}
  const legal=candidates.filter(([id,card])=>!used.has(id)&&cardAllowedInSlot(card,slot,player.job));
  assert.ok(legal.length,`no boss card for ${slot}`);
  const main=attackAttribute(player.job);
  const defense=['armor','leftHand','garment','shoes'].includes(slot);
  const score=([,card])=>{
   const e=card.effects||{};
   return defense?(e.hpPct||0)*3+(e.defPct||0)+(e.mdefPct||0)+(e.fleePct||0)
    :(e[main]||0)*3+(e.LUK||0)*2+(e.critDmg||0)+(e.atkPct||0)+(e.matkPct||0);
  };
  legal.sort((a,b)=>score(b)-score(a));
  player.sockets[slot]=legal[0][0];used.add(legal[0][0]);
 }
 return player;
}

export function validateOwnerLoadout(player){
 assert.equal(player.level,210);
 assert.equal(player.dawnSigil,8);
 assert.equal(player.pets.length,1,'single companion required');
 assert.equal(player.secondaryPetId,null);
 for(const [slot,item] of Object.entries(player.gear)){
  if(!item)continue;
  assert.equal(item.level,200,slot);
  assert.equal(item.rarity,'mythic',slot);
  assert.equal(item.enhancement,'SSS',slot);
  const weapon=!!GEAR_BASE[item.id]?.weaponType;
  assert.equal(Object.keys(item.affixes).length,6,slot);
  const keys=Object.keys(item.affixes);
  if(weapon){assert.ok(keys.includes('LUK')&&keys.includes(attackAttribute(player.job))||keys.includes('LUK')&&item.id==='staffSword');assert.ok(keys.includes('critDmg')||keys.includes('aspdPct'));}
  else assert.deepEqual(new Set(keys),new Set(['def','mdef','flee','LUK',attackAttribute(player.job),'hpPct']));
  const card=CARDS[player.sockets[slot]];
  assert.ok(card?.boss&&cardAllowedInSlot(card,slot,player.job),`boss card ${slot}`);
 }
}
