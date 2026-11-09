import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {equipPactMagicLoadout} from './fixtures/extreme-pact-magic-loadout.mjs';
import {affixRange,SPECIAL_AFFIXES} from '../dist/loot.js';
import {canonicalFusionKey} from '../dist/spirit-job-rules.js';

const run=(file,args)=>JSON.parse(execFileSync(process.execPath,[file,...args],{
 cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000
}).trim());

test('君王魔法融合使用INT、MATK與合法SSS魔法夥伴裝備',()=>{
 for(const fusion of ['magic-defense','magic-support']){
  const partner=fusion==='magic-defense'?'attack-magic':'attack-defense';
  const player=highLevelSpiritPlayer({level:210,job:'pactWarrior',pairKey:[fusion,partner].sort().join('+'),dawnSigil:0});
  player.pets=[player.pets.find(p=>canonicalFusionKey(p)===fusion)];
  equipPactMagicLoadout(player);
  assert.equal(player.attributes.INT,150);
  assert.equal(player.attributes.STR,1);
  assert.equal(player.gear.rightHand.id,'staffSword');
  assert.ok(player.gear.rightHand.affixes.matk>0);
  for(const pet of player.pets){
   assert.equal(pet.gear.head.id,'petCirclet');
   assert.equal(pet.gear.body.id,'petRobe');
   assert.equal(pet.gear.head.enhancement,'SSS');
   assert.equal(pet.gear.body.enhancement,'SSS');
  }
  for(const item of [...Object.values(player.gear),...player.pets.flatMap(p=>Object.values(p.gear))]){
   if(!item)continue;
   assert.equal(item.enhancement,'SSS');
   assert.equal(Object.keys(item.affixes).length,6);
   const pet=!!item.id.startsWith('pet');
   for(const [key,value] of Object.entries(item.affixes)){
    const max=affixRange(key,item.tier,item.rarity,item.id)[1];
    const expected=pet&&!SPECIAL_AFFIXES.has(key)&&!['atk','matk'].includes(key)?Math.round(max*10/3):max;
    assert.ok(value<=expected,`${item.id}/${key}`);
   }
  }
 }
});

test('君王魔防與魔輔魔法配裝HP王第30階均約3.2億且通關',()=>{
 for(const fusion of ['magic-defense','magic-support']){
  const result=run('tests/extreme-trials-class-30-probe.mjs',['hp','pactWarrior',fusion,'dawn-archon','magic-build']);
  const dps=result.damage/30.5/1e8;
  assert.equal(result.cleared,true,`${fusion} ${dps}`);
  assert.ok(dps>=3.1&&dps<=3.3,`${fusion} ${dps}`);
 }
});
