import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {runBuild} from '../scripts/balance-v24.mjs';
import {readCharacterSlot,writeCharacterSlot,characterSlotKey} from '../dist/character-slots.js';
import {FUSION_PAIRS,fusionKey} from '../dist/pet-fusion.js';
import {reconcileHumanoidStages,humanoidStage} from '../dist/pet-humanoid-evolution.js';
import {petArt} from '../dist/pet-evolution.js';

test('eight slots retain real normalized SSS equipment, ordered skills, humanoid progress and dawn materials across fresh runtimes',async()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const jobs=['knight','wizard','rogue','priest'],pairs=Object.keys(FUSION_PAIRS);
 let checks=0;
 for(let batch=0;batch<3;batch++){
  const expected=[];
  for(let slot=0;slot<8;slot++){
   const job=jobs[slot%jobs.length],pair=pairs[(batch*8+slot)%pairs.length];
   const p=runBuild(job,pair.split('-')[0],{level:201,encounterLevel:201,gearLevel:200,seconds:0,
    scenario:'regional',reborn:true,thirdJob:true,rarity:'mythic',referenceBuild:true,
    referenceQuality:'mythic',fusionPair:pair,enhancement:'SSS',petEnhancement:'SSS',fixture:true}).fixture;
   const pet=p.pets[0];pet.trueForm=true;reconcileHumanoidStages(pet);
   pet.equippedSkills=[`fusion_${pair}_4`,`fusion_${pair}_2`,`fusion_${pair}_1`];
   p.dawnSigil=slot+1;p.dawnUnlocked=true;p.name=`slot-${batch}-${slot}`;
   p.bag=[{id:'dawn_scout_fang',qty:31+slot},{id:'dawn_ram_horn',qty:42+slot},{id:'dawn_ray_membrane',qty:53+slot},{id:'dawn_archon_core',qty:slot+1}];
   p.autoBuyPotions={hp:{enabled:true,id:'red_large',min:10,target:25},sp:{enabled:true,id:'blue_large',min:10,target:25}};
   writeCharacterSlot(storage,slot,p);
   expected.push({name:p.name,pair,skills:pet.equippedSkills.map(id=>id.replace(`fusion_${pair}_`,`fusion_${fusionKey(...pair.split('-'))}_`)),bag:structuredClone(p.bag),gold:p.gold});
  }
  for(let slot=0;slot<8;slot++){
   const c=await runtime(),a=c.api;
   const load=()=>{const result=readCharacterSlot(storage,slot,a.normalize,a.valid);assert.equal(result.error,null);return result.player;};
   const p=load(),pet=p.pets[0],e=expected[slot];
   assert.equal(p.name,e.name);assert.equal(p.dawnSigil,slot+1);assert.equal(p.gold,e.gold);
   assert.deepEqual(p.bag,e.bag);assert.deepEqual(pet.equippedSkills,e.skills);
   assert.equal(humanoidStage(pet),3);assert.equal(petArt(pet),`assets/true-forms/SSS/${e.pair}.webp`);
   for(const g of [...Object.values(p.gear),...Object.values(pet.gear)].filter(Boolean))assert.equal(g.enhancement,'SSS');
   const otherBefore=Array.from({length:8},(_,i)=>i===slot?null:storage.getItem(characterSlotKey(i)));
   pet.gear={head:null,body:null,shoes:null};p.bag[0].qty--;writeCharacterSlot(storage,slot,p);
   const reloaded=load();assert.equal(humanoidStage(reloaded.pets[0]),3);assert.deepEqual(reloaded.pets[0].equippedSkills,e.skills);
   assert.equal(reloaded.bag[0].qty,e.bag[0].qty-1);
   for(let i=0;i<8;i++)if(i!==slot)assert.equal(storage.getItem(characterSlotKey(i)),otherBefore[i],'writing one slot must not alter another');
   checks++;
  }
 }
 assert.equal(checks,24);
});
