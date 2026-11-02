import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fusionSkills,defaultFusionSkills} from '../dist/pet-fusion.js';
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const pairs=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
test('all six fused companions have three valid equipped abilities in the real battle fixture',()=>{
 for(const key of pairs){
  const [main,sub]=key.split('-'),pet={fusion:{main,sub}};
  const available=fusionSkills(pet),selected=defaultFusionSkills(pet);
  assert.equal(available.length,6,key);
  assert.equal(selected.length,3,key);
  for(const id of selected)assert.ok(available.some(s=>s.id===id),key+' missing '+id);
 }
 assert.match(game,/spec\.petSkills\?\.length\?spec\.petSkills:defaultFusionSkills\(pet\)/);
 assert.match(game,/Invalid three pet skills/);
});
test('combat fixture standardizes potion supply for all 120 scenarios',()=>{
 assert.match(game,/p\.gold=200_000_000/);
 assert.match(game,/id:'red_large',qty:500/);
 assert.match(game,/id:'blue_large',qty:500/);
 assert.match(game,/p\.autoPotions=\{playerHp:true,playerSp:true,petHp:true,petSp:true\}/);
});
