import test from 'node:test';
import assert from 'node:assert/strict';
import {affixRange,rollGear,rebalanceGear,WEAPON_PRIMARY_AFFIX_BONUSES} from '../dist/loot.js';

test('published weapon primary affixes apply to newly rolled gear',()=>{
 for(const [id,key,bonus] of [['oneStaff','matk',.95],['twoStaff','matk',1.10],['spellFist','matk',1.10],['twoSword','atk',1.15],['twoSpear','atk',1.15],['offDagger','atk',.45],['katar','atk',1.60]]){
  assert.equal(WEAPON_PRIMARY_AFFIX_BONUSES[id],bonus);
  const g=rollGear(id,200,'mythic',()=>.5);
  const [min,max]=affixRange(key,g.tier,'mythic',id);
  assert.ok(g.affixes[key]>=min&&g.affixes[key]<=max,`${id} ${g.affixes[key]} ∉ [${min},${max}]`);
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
