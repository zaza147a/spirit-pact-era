import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spiritSinglePetProfile} from '../dist/spirit-single-pet-profiles.js';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const between=(start,end)=>game.slice(game.indexOf(start),game.indexOf(end,game.indexOf(start)));

test('owner main attacks use the pact pet profile and its damage channel',()=>{
 const playerAttack=between('function playerAttack(','function autoCastJobs(');
 assert.match(playerAttack,/spiritMainProfile\(chosen\)/);
 assert.match(playerAttack,/spiritAttackIsMagic\(spiritMorph/);
 assert.match(playerAttack,/offensiveSource\(spiritMorph\?/);
 assert.match(playerAttack,/action=spiritMorph\?\.name/);
 const p=spiritSinglePetProfile({job:'pactWarrior',thirdJob:false},{role:'magic'});
 assert.equal(p.source,'owner');
 assert.equal(p.kind,'magic');
});

test('commander pet attacks apply the one fused pet profile without extra pet lanes',()=>{
 const petAttack=between('function petAttack(','function absorbDamageWithMana(');
 assert.match(petAttack,/spiritSinglePetProfile\(player,pet\)/);
 assert.match(petAttack,/attackSource=morph\?/);
 assert.match(petAttack,/hitDamage\(attackSource,/);
 const p=spiritSinglePetProfile({job:'spiritCommander',thirdJob:true},{fusion:{main:'magic',sub:'support'}});
 assert.equal(p.source,'pet');
 assert.equal(p.fusion,'magic-support');
});
