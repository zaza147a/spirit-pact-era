import test from 'node:test';import assert from 'node:assert/strict';
import {sigilLevel,sigilCost,sigilBonus,upgradeDawnSigil,dawnBossRewards} from '../dist/dawn-sigil.js';
const p=()=>({location:'dawncity',hp:100,bag:['dawn_scout_fang','dawn_ram_horn','dawn_ray_membrane','dawn_archon_crystal','dawn_archon_core'].map(id=>({id,qty:999}))});
test('sigil advances precisely eight tiers',()=>{const player=p();for(let i=1;i<=8;i++)assert.equal(upgradeDawnSigil(player).level,i);assert.equal(sigilLevel(player),8);assert.ok(upgradeDawnSigil(player).error);assert.equal(sigilBonus(player).petDamage,1.16);});
test('late tiers require archon core',()=>{assert.equal(sigilCost(4).dawn_archon_core,undefined);assert.ok(sigilCost(5).dawn_archon_core>0);});
test('boss guarantee is reserved for archon',()=>{assert.deepEqual(dawnBossRewards({id:'dawn-archon'}),[{id:'dawn_archon_core',qty:1}]);assert.deepEqual(dawnBossRewards({id:'dawn-scout'}),[]);});
test('no accidental out-of-town upgrade',()=>{const player=p();player.location='dawnrift';assert.ok(upgradeDawnSigil(player).error);assert.equal(sigilLevel(player),0);});
