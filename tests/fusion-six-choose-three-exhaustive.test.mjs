import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {FUSION_PAIRS,fusionSkills,petSkillLimit} from '../dist/pet-fusion.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {migratePetSkills} from '../dist/pet-abilities.js';
import {readCharacterSlot,writeCharacterSlot} from '../dist/character-slots.js';

const combinations=Array.from({length:6},(_,a)=>Array.from({length:6-a-1},(_,b)=>Array.from({length:6-a-b-2},(_,c)=>[a,a+b+1,a+b+c+2]))).flat(2);
const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};};

test('all 2880 twelve-job/fusion/three-skill choices keep their order through UI, migration and save-load',async()=>{
 assert.equal(combinations.length,20,'six choose three must have twenty distinct choices');
 const jobs=Object.keys(SECOND_JOBS),pairs=Object.keys(FUSION_PAIRS);
 let checked=0;
 for(const job of jobs){
  const c=await runtime(),a=c.api;
  for(const pair of pairs){
   const p=a.normalize(a.fresh('三選測試',job)),pet=c.makePet('fang');
   Object.assign(pet,{id:'six-pick',level:150,rarity:'mythic',ascended:true,
    fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
   p.pets=[pet];p.activePetId=pet.id;
   a.setup(p,null);
   a.setEnemies([{id:'world_151',map:'starshore',instanceId:'six-choice-foe',hp:1e12,maxHp:1e12,def:50,atk:0,hit:0,flee:0,level:151}]);
   const skills=fusionSkills(pet).map(x=>x.id);
   assert.equal(skills.length,6,job+'/'+pair+' did not offer six skills');
   assert.equal(petSkillLimit(pet),3);
   for(const selected of combinations){
    pet.equippedSkills=[];
    const expected=selected.map(i=>skills[i]);
    for(const id of expected)a.togglePetSkill(pet.id,id);
    assert.deepEqual(pet.equippedSkills,expected,job+'/'+pair+'/'+selected+' UI selection mismatch');
    const forbidden=skills.find(id=>!expected.includes(id));
    a.togglePetSkill(pet.id,forbidden);
    assert.deepEqual(pet.equippedSkills,expected,job+'/'+pair+'/'+selected+' admitted fourth skill');
    migratePetSkills(pet,FUSION_PAIRS[pair].role);
    a.normalize(p);
    assert.deepEqual(pet.equippedSkills,expected,job+'/'+pair+'/'+selected+' lost a selection during migration');
    const s=storage();writeCharacterSlot(s,0,p);
    const restored=readCharacterSlot(s,0,a.normalize,a.valid);
    assert.equal(restored.error,null,job+'/'+pair+'/'+selected+' failed save validation');
    assert.deepEqual(restored.player.pets[0].equippedSkills,expected,job+'/'+pair+'/'+selected+' lost order after load');
    const now=1e6+checked*20000;c.setTime(now);
    p.hp=Math.max(1,Math.floor(a.stat('hp')*.5));p.mp=0;p.shield=0;
    const stats=c.petStats(pet);pet.hp=Math.max(1,Math.floor(stats.hp*.5));pet.sp=stats.sp;
    const opening=fusionSkills(pet).find(s=>s.id===expected[0]);
    assert.equal(a.petSkillStatus(pet,opening,now),'可施放',job+'/'+pair+'/'+selected+' first selected ability was unusable');
    a.petAutoAbility(pet,stats,now);
    assert.match(a.petSkillStatus(pet,opening,now),/冷卻/,job+'/'+pair+'/'+selected+' did not execute selected combat skill');
    for(let slot=1;slot<3;slot++){
     const at=now+slot*900;c.setTime(at);
     p.hp=Math.max(1,Math.floor(a.stat('hp')*.5));p.mp=0;p.shield=0;
     pet.hp=Math.max(1,Math.floor(stats.hp*.5));pet.sp=stats.sp;
     const next=fusionSkills(pet).find(s=>s.id===expected[slot]);
     assert.equal(a.petSkillStatus(pet,next,at),'可施放',job+'/'+pair+'/'+selected+' slot '+slot+' was unusable');
     a.petAutoAbility(pet,stats,at);
     assert.match(a.petSkillStatus(pet,next,at),/冷卻/,job+'/'+pair+'/'+selected+' did not execute slot '+slot);
    }
    checked++;
   }
  }
 }
 assert.equal(checked,Object.keys(SECOND_JOBS).length*12*20);
});
