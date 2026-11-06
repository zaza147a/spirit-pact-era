import test from 'node:test';
import assert from 'node:assert/strict';
import {nextDualPetActions,recordDualPetAction,clearInactivePetTimers,dualPetRegen} from '../dist/dual-pet-scheduler.js';

const player=(job='spiritist')=>({
 job,activePetId:'a',secondaryPetId:'b',
 pets:[{id:'a',hp:100,sp:4},{id:'b',hp:90,sp:7}]
});
test('single-active-pet scheduler does not grant a second pet extra attacks',()=>{
 const p=player(), clock={};
 assert.deepEqual(nextDualPetActions(p,1000,()=>140,clock).map(x=>x.petId),['a']);
 recordDualPetAction(clock,'a','attack',1000);
 assert.deepEqual(nextDualPetActions(p,1050,()=>140,clock).map(x=>x.petId),[]);
 assert.deepEqual(nextDualPetActions(p,1120,()=>140,clock).map(x=>x.petId),[]);
 assert.deepEqual(nextDualPetActions(p,1190,()=>140,clock).map(x=>x.petId),['a']);
});
test('existing jobs and dead pets do not get extra attacks',()=>{
 const p=player('wizard');
 assert.deepEqual(nextDualPetActions(p,1000,()=>140).map(x=>x.petId),['a']);
 p.job='spiritist';p.pets[1].hp=0;
 assert.deepEqual(nextDualPetActions(p,1000,()=>140).map(x=>x.petId),['a']);
});
test('only active pet regenerates SP and inactive pet timer is cleared',()=>{
 const p=player();dualPetRegen(p,pet=>pet.id==='a'?3:4,()=>10);
 assert.deepEqual(p.pets.map(x=>x.sp),[7,7]);
 p.secondaryPetId=null;
 const timers={a:{attackAt:1},b:{attackAt:1}};
 clearInactivePetTimers(timers,p);
 assert.deepEqual(Object.keys(timers),['a']);
});
