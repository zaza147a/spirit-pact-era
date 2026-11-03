import test from 'node:test';import assert from 'node:assert/strict';
import {sigilLevel,sigilCost,sigilBonus,upgradeDawnSigil,dawnBossRewards,dawnArchonPreparationFactor} from '../dist/dawn-sigil.js';
import {DAWN_MONSTERS,DAWN_BOSS} from '../dist/dawn-world.js';
const p=()=>({location:'dawncity',hp:100,bag:['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane','dawn_archon_crystal','dawn_archon_core'].map(id=>({id,qty:20000}))});
test('sigil advances precisely eight tiers',()=>{const player=p();for(let i=1;i<=8;i++)assert.equal(upgradeDawnSigil(player).level,i);assert.equal(sigilLevel(player),8);assert.ok(upgradeDawnSigil(player).error);assert.equal(sigilBonus(player).petDamage,1.16);});
test('late tiers require archon core',()=>{assert.equal(sigilCost(4).dawn_archon_core,undefined);assert.ok(sigilCost(5).dawn_archon_core>0);});
test('boss guarantee is reserved for archon',()=>{assert.deepEqual(dawnBossRewards({id:'dawn-archon'}),[{id:'dawn_archon_core',qty:1}]);assert.deepEqual(dawnBossRewards({id:'dawn-scout'}),[]);});
test('no accidental out-of-town upgrade',()=>{const player=p();player.location='dawnrift';assert.ok(upgradeDawnSigil(player).error);assert.equal(sigilLevel(player),0);});
test('SSS-only Archon still requires farmable sigil preparation',()=>{
 const player=p();
 for(const [rank,factor] of [[0,.34],[1,.44],[2,.54],[3,.75],[4,1],[5,1.025],[8,1.1]]){
  player.dawnSigil=rank;
  assert.ok(Math.abs(dawnArchonPreparationFactor(player)-factor)<1e-9,'rank '+rank);
 }
 assert.equal(sigilCost(4).dawn_archon_core,undefined,'the guaranteed clear checkpoint must not require killing the boss first');
});
test('four pre-boss ranks require 15 hours of field kills at 20 kills per minute',()=>{
 const fieldMaterials=['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane'];
 assert.deepEqual(DAWN_MONSTERS.map(m=>m.junkId),fieldMaterials);
 assert.equal(DAWN_BOSS.junkId,'dawn_archon_crystal');
 const materials={};
 for(let tier=1;tier<=4;tier++){
  const cost=sigilCost(tier);
  assert.equal(cost.dawn_archon_core,undefined,'the pre-boss plan must not require a boss kill');
  assert.equal(cost.dawn_archon_crystal,undefined,'the pre-boss plan must not require boss-only crystals');
  for(const key of fieldMaterials)materials[key]=(materials[key]||0)+cost[key];
 }
 for(const key of fieldMaterials)assert.equal(materials[key],6000);
 const player={location:'dawncity',hp:100,bag:fieldMaterials.map(id=>({id,qty:6000}))};
 for(let tier=1;tier<=4;tier++)assert.equal(upgradeDawnSigil(player).level,tier);
 assert.equal(player.bag.length,0,'all field materials are consumed with no hidden boss dependency');
 assert.ok(upgradeDawnSigil(player).error,'tier V must not be obtainable without an Archon core');
});

// Three field mobs are equally likely and drop one guaranteed material each.
test('each of the eight upgrades follows the requested 1/2/4/8-hour cycle',()=>{
 const materials=['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane'];
 for(let rank=1;rank<=8;rank++){
  const hours=2**((rank-1)%4),cost=sigilCost(rank);
  for(const id of materials)assert.equal(cost[id],hours*20*60/3,'rank '+rank+' '+id);
  assert.equal(materials.reduce((sum,id)=>sum+cost[id],0),hours*20*60);
  assert.equal(cost.dawn_archon_core===undefined,rank<=4);
 }
 assert.equal(Array.from({length:8},(_,i)=>sigilCost(i+1)).reduce((sum,c)=>sum+materials.reduce((n,id)=>n+c[id],0),0),36000);
});
