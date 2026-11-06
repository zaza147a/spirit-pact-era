import test from 'node:test';
import assert from 'node:assert/strict';
import {spiritPreFusionAttack} from '../dist/spirit-dual-offense.js';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
test('pre-fusion Pact branch receives the same bounded ATK/MATK contribution',()=>{
 for(const job of ['spiritist','pactWarrior']){
  assert.equal(spiritPreFusionAttack(job,false,10000,2000),10500);
  assert.equal(spiritPreFusionAttack(job,false,2000,10000),10500);
  assert.equal(spiritPreFusionAttack(job,false,6000,6000),7500);
 }
});
test('third-job fusion and all other professions retain their previous attack source',()=>{
 assert.equal(spiritPreFusionAttack('pactWarrior',true,10000,2000),null);
 assert.equal(spiritPreFusionAttack('spiritCommander',false,10000,2000),null);
 assert.equal(spiritPreFusionAttack('knight',false,10000,2000),null);
 assert.match(source,/spiritPreFusionAttack\(player\.job,player\.thirdJob,atk,matk\)/);
});
