import test from 'node:test';import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {petLevelCap,normalizePetLevel,ascendPet} from '../dist/pet-ascension.js';
test('owner rebirth never unlocks pet levels; every rarity needs its own special evolution',()=>{
 for(const rarity of ['common','rare','uncommon','legendary','mythic']){
  assert.equal(petLevelCap({rarity,ascended:false},true),99);
  assert.equal(petLevelCap({rarity,ascended:true},false),150);
 }
});
test('legacy excess pet levels and XP are sealed without item loss, then restored by paid special evolution',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('舊寵等級','hunter'));
 const pet=c.makePet('fang');Object.assign(pet,{level:120,xp:321,rarity:'legendary',evolution:4,ascended:false,loyalty:100,loyaltyVersion:2});
 const gear=c.rollPetGear('petArmor',120,'legendary');pet.gear.body=gear;p.pets=[pet];p.reborn=true;
 a.normalize(p);assert.equal(pet.level,99);assert.equal(pet.xp,0);assert.equal(pet.sealedProgress.level,120);assert.equal(pet.sealedProgress.xp,321);assert.equal(pet.gear.body.uid,gear.uid);
 const current=c.petStats(pet),without=c.petStats({...pet,gear:{...pet.gear,body:null}});assert.equal(current.hp,without.hp);assert.equal(current.def,without.def);
 a.normalize(p);assert.equal(pet.sealedProgress.level,120);
 const r=ascendPet(pet,[{id:'essence_4',qty:30},{id:'ascension_core',qty:10}],'town');assert.ok(!r.error);assert.equal(pet.level,120);assert.equal(pet.xp,321);assert.equal(pet.sealedProgress,undefined);assert.ok(c.petStats(pet).hp>current.hp);
 normalizePetLevel(pet);assert.equal(pet.level,120);assert.equal(pet.xp,321);
});
test('unascended level99 pet receives no battle XP even when owner is reborn',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('寵物封頂','hunter'));
 Object.assign(p,{reborn:true,level:99,location:'celestial'});const pet=c.makePet('fang');Object.assign(pet,{level:99,evolution:4,xp:0,rarity:'legendary',ascended:false,hp:100});p.pets=[pet];p.activePetId=pet.id;
 a.setup(p,{id:'world_99',level:99,hp:0,xp:999999,gold:0});a.award();assert.equal(pet.level,99);assert.equal(pet.xp,0);
});
test('worn gear and socket cards survive rebirth and loading even when the new class or level cannot normally equip it',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('裝備保留','knight'));
 Object.assign(p,{level:99,jobLevel:50,location:'town',quests:Object.fromEntries(['volcano','abyss','ruins','eclipse','celestial'].map(id=>[id,{done:true}]))});
 p.gear.rightHand=c.rollGear('twoSpear',99,'legendary');p.sockets.rightHand='fang';const uid=p.gear.rightHand.uid;a.setup(p,null);a.rebirthCharacter();assert.equal(p.job,'swordsman');assert.equal(p.gear.rightHand.uid,uid);a.normalize(p);assert.equal(p.gear.rightHand.uid,uid);assert.equal(p.sockets.rightHand,'fang');
});
