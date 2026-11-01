import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTER_SLOT_COUNT,readCharacterSlot,readCharacterSlots,writeCharacterSlot,migrateLegacyCharacter} from '../dist/character-slots.js';
import {RESELECT_LEDGER_KEY} from '../dist/reselect-ledger.js';
import {migrateLegacyReselect,reselectionPet} from '../dist/pet-legacy-reselect.js';

function storage(){const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value))};}
const initial=()=>({version:50,name:'既有角色',job:'knight',location:'town',pets:[{id:'old-fused-200',species:'fang',level:200,fusion:{main:'attack',sub:'magic'},gear:{head:{uid:'preserved'}},loyalty:500}]});
const normalize=p=>migrateLegacyReselect(p);
const valid=p=>!!p?.name&&Array.isArray(p.pets);

test('four slots remain isolated and legacy character migration cannot overwrite occupied slots',()=>{
 const s=storage();assert.equal(CHARACTER_SLOT_COUNT,4);
 for(let i=0;i<4;i++)writeCharacterSlot(s,i,{version:51,name:'角色'+i,pets:[]});
 assert.equal(migrateLegacyCharacter(s,initial()),false);
 assert.deepEqual(readCharacterSlots(s,normalize,valid).map(r=>r.player.name),['角色0','角色1','角色2','角色3']);
 assert.equal(migrateLegacyCharacter(s,initial()),false);
});

test('importing the same pre-v51 backup repeatedly cannot restore spent reselects in any slot',()=>{
 const s=storage(),old=initial(),importOld=index=>writeCharacterSlot(s,index,normalize(structuredClone(old)));
 importOld(0);
 let p=readCharacterSlot(s,0,normalize,valid).player;
 assert.equal(p.pets[0].fusionReselectRemaining,10);
 for(let i=0;i<3;i++){
  const key=i%2?'attack-magic':'magic-defense';
  assert.equal(reselectionPet(p,p.pets[0],key,()=>[]).remaining,9-i);
 }
 writeCharacterSlot(s,0,p);
 assert.equal(readCharacterSlot(s,0,normalize,valid).player.pets[0].fusionReselectRemaining,7);
 importOld(0);
 assert.equal(readCharacterSlot(s,0,normalize,valid).player.pets[0].fusionReselectRemaining,7,'same-slot replay cannot refresh allowance');
 importOld(3);
 assert.equal(readCharacterSlot(s,3,normalize,valid).player.pets[0].fusionReselectRemaining,7,'cross-slot replay cannot refresh allowance');
 assert.ok(s.getItem(RESELECT_LEDGER_KEY),'spent allowance was recorded separately from exportable character files');
});

test('distinct pets keep separate allowances and imported backups cannot increase a zero balance',()=>{
 const s=storage(),first=normalize(initial());
 first.pets[0].fusionReselectRemaining=0;
 writeCharacterSlot(s,0,first);
 writeCharacterSlot(s,2,normalize(initial()));
 assert.equal(readCharacterSlot(s,2,normalize,valid).player.pets[0].fusionReselectRemaining,0);
 const unrelated=initial();unrelated.pets[0].id='unrelated-old-pet';
 writeCharacterSlot(s,1,normalize(unrelated));
 assert.equal(readCharacterSlot(s,1,normalize,valid).player.pets[0].fusionReselectRemaining,10);
});
