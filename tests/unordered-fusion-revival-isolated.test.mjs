import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fusionKey,fusedPair,companionRole,fusionSkills,defaultFusionSkills,fusionArt,FUSION_PAIRS} from '../dist/pet-fusion.js';
import {fusionDirectOutputFactor} from '../dist/pet-effects.js';
import {migratePetSkills} from '../dist/pet-abilities.js';
import {companionResonance} from '../dist/fusion-resonance.js';
import {SECOND_JOBS} from '../dist/jobs.js';

const PAIRS=['attack-magic','attack-defense','attack-support','magic-defense','magic-support','defense-support'];
const pairPets=key=>{const [a,b]=key.split('-');return [
 {species:'fang',fusion:{main:a,sub:b},rarity:'mythic',ascended:true,level:200,equippedSkills:[]},
 {species:'wisp',fusion:{main:b,sub:a},rarity:'mythic',ascended:true,level:200,equippedSkills:[]}
];};
for(const key of PAIRS)test('unordered fusion abilities, skills and visuals '+key,()=>{
 const [a,b]=pairPets(key);
 assert.equal(fusionKey(a.fusion.main,a.fusion.sub),fusionKey(b.fusion.main,b.fusion.sub));
 assert.deepEqual(fusedPair(a),fusedPair(b));
 assert.equal(companionRole(a),companionRole(b));
 assert.deepEqual(fusionSkills(a),fusionSkills(b));
 assert.deepEqual(defaultFusionSkills(a),defaultFusionSkills(b));
 assert.equal(fusionDirectOutputFactor(a),fusionDirectOutputFactor(b));
 assert.notEqual(fusionArt(a),fusionArt(b),'reverse order must keep a distinct visual');
});
test('reverse-order saved skills migrate to canonical IDs preserving slots',()=>{
 const pet={fusion:{main:'magic',sub:'attack'},equippedSkills:['fusion_magic-attack_0','fusion_magic-attack_3','fusion_magic-attack_5']};
 migratePetSkills(pet,'magic');
 assert.deepEqual(pet.equippedSkills,['fusion_attack-magic_0','fusion_attack-magic_3','fusion_attack-magic_5']);
});
test('all ten classes have six identical fused resonance mechanisms across swapped order',()=>{
 const jobs=Object.keys(SECOND_JOBS);assert.equal(jobs.length,10);
 let checked=0;
 for(const job of jobs)for(const key of PAIRS){
  const [a,b]=pairPets(key),player={job,level:200,thirdJob:true,reborn:true,jobSkills:{}};
  const forward=companionResonance(player,a),reverse=companionResonance(player,b);
  assert.ok(forward,job+' '+key+' absent');
  assert.deepEqual(forward,reverse,job+' '+key+' reversed ability changed');
  checked++;
 }
 assert.equal(checked,60);
});
test('trial failure returns to town and only place revival requires timer',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/const trialDefeat=player\.hp<=0/);
 assert.match(game,/if\(trialDefeat\)window\.alert\('挑戰失敗/);
 assert.match(game,/if\(mode==='place'&&deathRemaining\(player,gameNow\(\)\)\)/);
 assert.match(game,/\$\('reviveTown'\)\.disabled=false/);
 assert.match(game,/player\.location='skycity'/);
});
