import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fusionKey} from '../dist/pet-fusion.js';
const code=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const pairs=[
 ['attack','defense','attack-defense'],
 ['defense','support','defense-support'],
 ['attack','support','attack-support']
];
test('all formerly order-sensitive fusion combat roles share canonical key',()=>{
 for(const [a,b,key] of pairs){
  assert.equal(fusionKey(a,b),key);
  assert.equal(fusionKey(b,a),key);
 }
});
test('wizard, knight and performer special combat triggers do not require ordered main/sub',()=>{
 const ordered=[
  /pet\.fusion\?\.main==='defense'&&pet\.fusion\?\.sub==='support'/,
  /pet\.fusion\?\.main==='attack'&&pet\.fusion\?\.sub==='defense'/,
  /pet\.fusion\?\.main==='attack'&&pet\.fusion\?\.sub==='support'/
 ];
 for(const re of ordered)assert.doesNotMatch(code,re);
 assert.match(code,/petEffects\.markWardOnly=player\.job==='wizard'&&fusionKey\(/);
 assert.match(code,/event==='shieldBreak'&&player\.job==='knight'&&fusionKey\(/);
 assert.match(code,/event==='thirdHit_wizard'&&player\.job==='wizard'&&fusionKey\(/);
 assert.match(code,/function isHealingMelody\(skill\).*fusionKey\(/);
 assert.match(code,/import \{[^}]*fusionKey[^}]*\} from '\.\/pet-fusion\.js/);
});
test('browser live telemetry counts monster attacks, player actions and pet casts',()=>{
 assert.match(code,/__lingqiCombatTestSink\.enemyActions\+\+/);
 assert.match(code,/__lingqiCombatTestSink\.playerActions\+\+/);
 assert.match(code,/__lingqiCombatTestSink\.petCasts\.push\(/);
 assert.match(code,/owner\+petDirect!==totalFromHits/);
});
