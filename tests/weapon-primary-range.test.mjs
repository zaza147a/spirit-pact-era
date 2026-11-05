import test from 'node:test';
import assert from 'node:assert/strict';
import {affixRange,rollGear,rebalanceGear,gearStatValue,GEAR_BASE,WEAPON_PRIMARY_AFFIX_BONUSES} from '../dist/loot.js';

test('published weapon primary affixes apply to newly rolled gear',()=>{
 for(const [id,key,bonus] of [['oneStaff','matk',.95],['twoStaff','matk',1.10],['spellFist','matk',1.10],['twoSword','atk',1.15],['twoSpear','atk',1.15],['offDagger','atk',.45],['katar','atk',1.10]]){
  assert.equal(WEAPON_PRIMARY_AFFIX_BONUSES[id],bonus);
  const g=rollGear(id,200,'mythic',()=>.5);
  const [min,max]=affixRange(key,g.tier,'mythic',id);
  assert.ok(g.affixes[key]>=min&&g.affixes[key]<=max,`${id} ${g.affixes[key]} ∉ [${min},${max}]`);
 }
});

test('previous katar +60% primary ATK is converted once to the current 110% range',()=>{
 const previous=rollGear('katar',200,'mythic',()=>.5);
 const normal=previous.affixes.atk;
 previous.affixes.atk=Math.round(normal*1.6/1.10);
 previous.weaponPrimaryBonusVersion=1;
 const migrated=rebalanceGear(previous);
 assert.ok(Math.abs(migrated.affixes.atk-normal)<=1);
 assert.equal(migrated.weaponPrimaryBonusVersion,4);
 assert.equal(rebalanceGear(migrated).affixes.atk,migrated.affixes.atk);
});

test('all innate weapon traits stay fixed through SSS while rolled affixes enhance',()=>{
 for(const [id,base] of Object.entries(GEAR_BASE)){
  if(!base.weaponType)continue;
  for(const key of ['critDmg','ignoreDef','damageReduction','aspdPct']){
   if(!base[key])continue;
   const g=rollGear(id,200,'mythic',()=>.5);
   g.affixes[key]=0;
   const before=gearStatValue(g,key);
   g.enhancement='SSS';
   assert.equal(gearStatValue(g,key),before,`${id} ${key} changed with enhancement`);
   assert.ok(before<=60,`${id} ${key} exceeds +60`);
   g.affixes[key]=10;
   assert.equal(gearStatValue(g,key),before+32,`${id} ${key} random affix should still scale`);
  }
 }
});

test('legacy single-hand staff affix migrates once, without repeated reduction',()=>{
 const legacy=rollGear('oneStaff',200,'mythic',()=>.5);
 const original=Math.round(legacy.affixes.matk/.95);
 legacy.affixes.matk=original;
 delete legacy.weaponPrimaryBonusVersion;
 const first=rebalanceGear(legacy);
 assert.equal(first.affixes.matk,Math.round(original*.95));
 assert.equal(first.weaponPrimaryBonusVersion,1);
 assert.equal(rebalanceGear(first).affixes.matk,first.affixes.matk);
});
