import test from 'node:test';
import assert from 'node:assert/strict';
import {nextDualPetActions,recordDualPetAction,clearInactivePetTimers,dualPetRegen} from '../dist/dual-pet-scheduler.js';

const player=(job='spiritist')=>({
 job,activePetId:'a',secondaryPetId:'b',
 pets:[{id:'a',hp:100,sp:4},{id:'b',hp:90,sp:7}]
});
test('each pet has an independent attack clock',()=>{
 const p=player(), clock={};
 assert.deepEqual(nextDualPetActions(p,1000,()=>140,clock).map(x=>x.petId),['a','b']);
 recordDualPetAction(clock,'a','attack',1000);
 assert.deepEqual(nextDualPetActions(p,1050,()=>140,clock).map(x=>x.petId),['b']);
 recordDualPetAction(clock,'b','attack',1050);
 assert.deepEqual(nextDualPetActions(p,1120,()=>140,clock).map(x=>x.petId),[]);
 assert.deepEqual(nextDualPetActions(p,1190,()=>140,clock).map(x=>x.petId),['a','b']);
});
test('existing jobs and dead pets do not get extra attacks',()=>{
 const p=player('wizard');
 assert.deepEqual(nextDualPetActions(p,1000,()=>140).map(x=>x.petId),['a']);
 p.job='spiritist';p.pets[1].hp=0;
 assert.deepEqual(nextDualPetActions(p,1000,()=>140).map(x=>x.petId),['a']);
});
test('per-pet SP regen is independent and capped by existing stat calculator',()=>{
 const p=player();dualPetRegen(p,pet=>pet.id==='a'?3:4,()=>10);
 assert.deepEqual(p.pets.map(x=>x.sp),[7,10]);
 p.secondaryPetId=null;
 clearInactivePetTimers({a:{attackAt:1},b:{attackAt:1}},p);
});
