import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TRUE_FORMS,trueFormArt,trueFormName} from '../dist/pet-true-form.js';
import {petArt,petForm} from '../dist/pet-evolution.js';
import {reconcileHumanoidStages,humanoidStage,HUMANOID_STAGES} from '../dist/pet-humanoid-evolution.js';
import {readCharacterSlot,writeCharacterSlot} from '../dist/character-slots.js';

const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v))};};
const load=(s,slot)=>{const r=readCharacterSlot(s,slot,p=>p,p=>Array.isArray(p.pets));assert.equal(r.error,null);return r.player;};

test('all 12 true forms advance S → SS → SSS across four save slots; gear removal cannot revert artwork',()=>{
 const s=storage(),keys=Object.keys(TRUE_FORMS);
 assert.equal(keys.length,12);
 for(const [index,key] of keys.entries()){
  const [main,sub]=key.split('-'),slot=index%4;
  const pet={id:`pet-${index}`,nickname:`契約${index}`,species:'fang',trueForm:true,fusion:{main,sub},
   equippedSkills:[`fusion_${key}_1`,`fusion_${key}_2`,`fusion_${key}_4`],gear:{head:{enhancement:'A'},body:{enhancement:'A'},shoes:{enhancement:'A'}}};
  const name=`角色${index}`,player={name,pets:[pet],activePetId:pet.id};
  writeCharacterSlot(s,slot,player);
  assert.equal(humanoidStage(load(s,slot).pets[0]),0);
  for(const [rank,stage] of [['S',1],['SS',2],['SSS',3]]){
   const restored=load(s,slot),current=restored.pets[0];
   for(const item of Object.values(current.gear))item.enhancement=rank;
   const evolution=reconcileHumanoidStages(current);
   assert.equal(evolution.changed,true,key+'/'+rank);
   assert.equal(evolution.stage,stage,key+'/'+rank);
   assert.equal(HUMANOID_STAGES[evolution.stage].label,`${['','成長期','成熟期','高階'][stage]}人形`);
   writeCharacterSlot(s,slot,restored);
   const reloaded=load(s,slot),saved=reloaded.pets[0];
   assert.equal(reloaded.name,name);
   assert.equal(saved.humanoidStage,stage);
   assert.equal(trueFormArt(saved),`assets/true-forms/${rank}/${key}.webp`);
   assert.equal(petArt(saved),trueFormArt(saved));
   assert.equal(petForm(saved),trueFormName(saved));
   assert.deepEqual(saved.equippedSkills,pet.equippedSkills);
  }
  const last=load(s,slot);last.pets[0].gear={head:null,body:null,shoes:null};
  assert.equal(reconcileHumanoidStages(last.pets[0]).changed,false);
  writeCharacterSlot(s,slot,last);
  assert.equal(petArt(load(s,slot).pets[0]),`assets/true-forms/SSS/${key}.webp`);
 }
});

test('pet enhancement success toast resolves the real stage label, not an undefined property',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/進化成\$\{HUMANOID_STAGES\[evolution\.stage\]\.label\}/);
 assert.doesNotMatch(game,/進化成\$\{evolution\.label\}/);
});

test('star sigil crystal titan catches up to SSS when equipped gear was already upgraded',()=>{
 const pet={id:'star-titan',species:'fang',trueForm:true,humanoidStage:2,
  fusion:{main:'defense',sub:'magic'},gear:{head:{enhancement:'SSS'},body:{enhancement:'SSS'},shoes:{enhancement:'SSS'}}};
 assert.equal(trueFormName(pet),'星曜符衛・成熟期人形');
 const evolution=reconcileHumanoidStages(pet);
 assert.equal(evolution.changed,true);
 assert.equal(evolution.stage,3);
 assert.equal(trueFormArt(pet),'assets/true-forms/SSS/defense-magic.webp');
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/function completePendingPetEvolution\(\)/);
 assert.match(game,/data-reconcile-pet-evolution/);
 assert.match(game,/let petEvolutionNotice=null/);
});
