import test from 'node:test';
import assert from 'node:assert/strict';
import {noviceMonsterStats,normalMonsterStats} from '../dist/progression.js';
import {monsterRuntimeStats,monsterHitChance,monsterAttackPower,monsterDefenseAgainst,incomingMonsterDamage,outgoingHitDamage} from '../dist/combat-balance.js';

test('all progression enemies expose separate finite physical and magical attack and defense',()=>{
 for(const level of [1,10,50,51,99,110,130,150,160,180,200]){
  const base=level<=50?noviceMonsterStats(level):normalMonsterStats(level),m={...base,...monsterRuntimeStats({level,...base})};
  for(const key of ['atk','matk','def','mdef'])assert.ok(Number.isFinite(m[key])&&m[key]>=0,`${level} ${key}`);
 }
});

test('magical monsters use MATK versus MDEF, rather than ATK versus DEF',()=>{
 const monster={level:180,atk:5000,matk:9500,def:400,mdef:300,attackType:'magic'};
 const foe={...monster,...monsterRuntimeStats(monster)};
 assert.equal(monsterAttackPower(foe),9500);
 assert.equal(monsterDefenseAgainst(foe,true),300);
 assert.equal(monsterDefenseAgainst(foe,false),400);
 assert.ok(incomingMonsterDamage(monsterAttackPower(foe),100,1)>incomingMonsterDamage(monsterAttackPower(foe),1200,1));
 assert.equal(outgoingHitDamage(1000,monsterDefenseAgainst(foe,true),1),700);
 assert.equal(outgoingHitDamage(1000,monsterDefenseAgainst(foe,false),1),600);
});

test('high-tier encounters include magical pressure against armor-only tanks',()=>{
 const levels=[151,152,153,171,172,173,191,192,193,210];
 const roles=levels.map(level=>monsterRuntimeStats({level,...normalMonsterStats(Math.min(200,level))}).attackType);
 assert.ok(roles.includes('magic'));
 assert.ok(roles.includes('physical'));
 const caster=monsterRuntimeStats({level:210,atk:1000,def:200});
 assert.equal(caster.attackType,'magic');
 assert.ok(caster.matk>0&&caster.mdef>0);
});
test('FLEE has only partial effect against incoming magic',()=>{
 assert.equal(monsterHitChance(500,900,false),monsterHitChance(500,900));
 assert.ok(monsterHitChance(500,900,true)>monsterHitChance(500,900,false));
 assert.ok(monsterHitChance(500,0,true)>=monsterHitChance(500,900,true));
});
