import assert from 'node:assert/strict';
import {SECOND_JOBS} from '../dist/jobs.js';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {currentEndgamePlayer,FUSIONS} from './fixtures/current-210-endgame-player.mjs';

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
