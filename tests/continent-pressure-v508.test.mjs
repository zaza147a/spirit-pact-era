import test from 'node:test';import assert from 'node:assert/strict';
import {normalMonsterStats} from '../dist/progression.js';import {monsterCombatStats,hitChance} from '../dist/combat-balance.js';
import {referenceGear,referenceAttributes,referenceCards} from '../scripts/reference-builds-v508.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';import {CARDS} from '../dist/catalog.js';import {affixRange} from '../dist/loot.js';
const previous=level=>{const n=level-51,power=32;return {hp:Math.round((2400+n*82+n*n*1.05)*(1+power*.045)*2.5),atk:Math.round((125+n*5.2+power*12)*2.5),def:Math.round(20+level*.4+power*.35),xp:Math.round(1150+n*62+n*n*.75)};};
test('all101–110 monster HP/ATK/DEF/EXP and combat ratings remain exactly unchanged',()=>{for(let level=101;level<=110;level++){
 assert.deepEqual(normalMonsterStats(level),previous(level));assert.deepEqual(monsterCombatStats({level}),{hit:75+level*2,flee:60+level*2,aspd:Math.min(165,150+(level-51)*.2)});
}});
test('111+ gains HP, damage and tiered accuracy pressure without reducing player stats or changing XP/defense',()=>{
 for(const level of [111,120,121,130,131,140,141,150]){
  const s=normalMonsterStats(level),r=monsterCombatStats({level}),n=level-51,power=level<=130?64:128;
  assert.equal(s.hp,Math.round((2400+n*82+n*n*1.05)*(1+power*.045)*2.5*1.8));
  assert.equal(s.atk,Math.round((125+n*5.2+power*12)*2.5*(level<=130?1.6:1.3)));
  assert.equal(s.xp,Math.round(1150+n*62+n*n*.75));assert.ok(hitChance(r.hit,1500)>hitChance(75+level*2,1500));
  const boss=monsterCombatStats({level,boss:true});assert.equal(boss.hit,r.hit+20);
 }
});
test('reference loadouts use legal top legendary affix values, legal attributes and previous-tier cards for every job',()=>{
 for(const job of Object.keys(SECOND_JOBS))for(const [level,gearLevel]of[[111,110],[121,110],[131,130],[141,130]]){
  const attrs=referenceAttributes(level,job);assert.equal(Object.values(attrs).reduce((n,v)=>n+v-1,0),(level-1)*2+20);assert.ok(Object.values(attrs).every(v=>v>=1&&v<=120));
  const gear=referenceGear(SECOND_JOBS[job].weapon,gearLevel,SECOND_JOBS[job].attribute);assert.equal(gear.rarity,'legendary');assert.equal(Object.keys(gear.affixes).length,5);
  for(const [key,value]of Object.entries(gear.affixes))assert.equal(value,affixRange(key,gear.tier,'legendary')[1]);
  for(const [slot,id]of Object.entries(referenceCards(job,level,gearLevel))){assert.ok(CARDS[id].slots.includes(slot));if(id.startsWith('world_'))assert.ok(Number(id.slice(6))<=gearLevel);}
 }
});
