import assert from 'node:assert/strict';
import {SECOND_JOBS} from '../dist/jobs.js';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {currentEndgamePlayer,FUSIONS,WEAPON_VARIANTS} from './fixtures/current-210-endgame-player.mjs';
import {GEAR_BASE} from '../dist/loot.js';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';

let count=0;
for(const job of Object.keys(SECOND_JOBS))for(const fusion of FUSIONS)for(const weaponChoice of ['critDmg','aspdPct']){
 const p=currentEndgamePlayer(job,{fusion,weaponChoice});
 assert.equal(Object.values(p.homecoming.routes).filter(q=>q.phase==='claimed').length,HOMECOMING_ROUTES.length);
 assert.ok(p.pets[0].homecomingEvolved);
 assert.equal(p.pets.length,1);
 assert.equal(p.secondaryPetId,null);
 assert.equal(p.petStances[p.pets[0].id],job==='pactWarrior'?'assimilate':'assist');
 count++;
}
assert.equal(count,144);
console.log(`current 210 endgame loadouts: ${count}/144 legal fixture configurations`);
let weaponVariants=0;
for(const [job,variants] of Object.entries(WEAPON_VARIANTS))for(const weaponId of variants){
 const p=currentEndgamePlayer(job,{weaponId});
 assert.equal(p.gear.rightHand.id,weaponId==='rifle+offDagger'?'rifle':weaponId);
 assert.equal(p.pets.length,1);
 assert.equal(p.gear.rightHand.enhancement,'SSS');
 assert.ok(GEAR_BASE[p.gear.rightHand.id].hands!==2||!p.gear.leftHand);
 assert.equal(weaponId==='rifle+offDagger',p.gear.leftHand?.id==='offDagger');
 weaponVariants++;
}
assert.equal(weaponVariants,23);
console.log(`current 210 endgame weapon variants: ${weaponVariants}/23 legal loadouts`);
let cardVariants=0;
for(const job of Object.keys(SECOND_JOBS)){
 const baseline=currentEndgamePlayer(job);
 for(const [slot,item] of Object.entries(baseline.gear)){
  if(!item)continue;
  for(const [cardId,card] of Object.entries(CARDS)){
   if(!card.boss||cardId===baseline.sockets[slot]||!cardAllowedInSlot(card,slot,job))continue;
   const p=currentEndgamePlayer(job,{cardOverrides:{[slot]:cardId}});
   assert.equal(p.sockets[slot],cardId);
   cardVariants++;
  }
 }
}
assert.ok(cardVariants>100);
console.log(`current 210 endgame legal boss-card substitutions: ${cardVariants} checked`);
