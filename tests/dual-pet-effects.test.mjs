import test from 'node:test';
import assert from 'node:assert/strict';
import {
 ensurePetEffects,clearInactiveEffects,expirePetEffects,
 applyPetShield,consumePetShield,markPetTarget,consumePetMark,
 beginPetDot,readyPetDot
} from '../dist/dual-pet-effects.js';

test('same fusion skill on two pets never overwrites the other state',()=>{
 const registry={};
 const a=ensurePetEffects(registry,'a'),b=ensurePetEffects(registry,'b');
 markPetTarget(a,'monster1',3,120);markPetTarget(b,'monster2',2,180);
 assert.equal(consumePetMark(a,'monster1'),120);
 assert.equal(consumePetMark(a,'monster2'),0);
 assert.equal(b.markHits,2);
 beginPetDot(a,'bleed',{targetId:'monster1',power:10,ticks:3,interval:1000,now:0});
 beginPetDot(b,'bleed',{targetId:'monster2',power:20,ticks:4,interval:1500,now:0});
 assert.equal(readyPetDot(a,'bleed',999,()=>true),null);
 assert.deepEqual(readyPetDot(a,'bleed',1000,()=>true),{targetId:'monster1',power:10,kind:'bleed'});
 assert.equal(b.bleedTicks,4);
 assert.deepEqual(readyPetDot(b,'bleed',1500,()=>true),{targetId:'monster2',power:20,kind:'bleed'});
});

test('pet shields are capped and independent',()=>{
 const r={},a=ensurePetEffects(r,'a'),b=ensurePetEffects(r,'b');
 assert.equal(applyPetShield(a,1000,1000,100),250);
 assert.equal(applyPetShield(a,1000,1000,101),0);
 assert.equal(applyPetShield(b,30,1000,100),30);
 assert.equal(consumePetShield(a,90),90);
 assert.equal(b.shield,30);
 expirePetEffects(a,7000);assert.equal(a.shield,0);
 assert.equal(b.shield,30);
});

test('removing one active pet clears only that pet effect state',()=>{
 const r={},a=ensurePetEffects(r,'a'),b=ensurePetEffects(r,'b');
 a.shield=10;b.shield=20;
 clearInactiveEffects(r,['b']);
 assert.equal(r.a,undefined);
 assert.equal(r.b.shield,20);
});
