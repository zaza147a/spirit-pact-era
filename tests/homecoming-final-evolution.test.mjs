import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOMECOMING_ROUTES} from '../dist/homecoming-data.js';
import {normalizeHomecoming,homecomingTransition} from '../dist/homecoming-state.js';
import {trueFormArt} from '../dist/pet-true-form.js';

const makePet=id=>({id:'pet-'+id,fusion:{main:id.split('-')[0],sub:id.split('-')[1]},trueForm:true,humanoidStage:3,hp:100});

test('all twelve permanent quest-evolved illustrations exist in WebP format',()=>{
 for(const {id} of HOMECOMING_ROUTES){
  const bytes=readFileSync(new URL(`../dist/assets/true-forms/homecoming/${id}.webp`,import.meta.url));
  assert.equal(bytes.toString('ascii',0,4),'RIFF',id);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',id);
  const pet=makePet(id);
  assert.equal(trueFormArt(pet),`assets/true-forms/SSS/${id}.webp`);
  pet.homecomingEvolved=true;
  assert.equal(trueFormArt(pet),`assets/true-forms/homecoming/${id}.webp`);
 }
});

test('quest completion permanently evolves its matching companion and retains old saves',()=>{
 const id='attack-magic',pet=makePet(id);
 const player={job:'knight',dawnSigil:8,pets:[pet],location:'hc_1_town',homecoming:{routes:{[id]:{phase:'ready'}},completedRoutes:{}}};
 homecomingTransition(player,id,'claim',{pet});
 assert.equal(pet.homecomingEvolved,true);
 assert.equal(trueFormArt(pet),`assets/true-forms/homecoming/${id}.webp`);
 delete pet.homecomingEvolved;
 normalizeHomecoming(player);
 assert.equal(pet.homecomingEvolved,true);
});
