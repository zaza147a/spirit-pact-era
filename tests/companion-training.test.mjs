import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {trainingUnlocked,trainingPet,normalizeTraining,trainingRate,awardTrainingProgress} from '../dist/companion-training.js';

const makeOwner=(level=210,petLevel=20)=>({level,dawnSigil:8,reborn:true,activePetId:'front',trainingPetId:'trainee',pets:[{id:'front',hp:100,level:200,loyalty:40},{id:'trainee',hp:50,sp:30,level:petLevel,xp:0,loyalty:0,loyaltyKills:0,loyaltyVersion:2,fusion:true}]});
const options={experienceNeed:()=>1000000,stats:()=>({hp:50,sp:30}),rng:()=>0};

test('all professions share one level-210 and sigil-8 gate',()=>{
 for(const job of ['assassin','hunter','knight','crusader','monk','priest','wizard','sage','bard','rogue','spirit_king','spirit_master'])assert.equal(trainingUnlocked({...makeOwner(),job}),true);
 assert.equal(trainingUnlocked(makeOwner(209)),false);
 assert.equal(trainingUnlocked({...makeOwner(),dawnSigil:7}),false);
});
test('offline trainee receives level-banded EXP without monster level penalty',()=>{
 for(const [level,rate] of [[20,2],[150,2],[151,1.5],[180,1.5],[181,1],[199,1]]){
  const owner=makeOwner(210,level),before=structuredClone(owner.pets[0]);
  assert.equal(trainingRate(level),rate);
  assert.equal(awardTrainingProgress(owner,{level:1,xp:101,boss:false},options).xp,Math.floor(101*rate));
  assert.equal(owner.pets[1].xp,Math.floor(101*rate));
  assert.deepEqual(owner.pets[0],before,'active pet EXP and loyalty unchanged');
 }
});
test('loyalty every 100 kills, plus boss chance, capped at 500',()=>{
 const owner=makeOwner();owner.pets[1].loyaltyKills=99;
 assert.equal(awardTrainingProgress(owner,{xp:10,boss:false},options).loyalty,1);
 assert.equal(owner.pets[1].loyaltyKills,0);
 assert.equal(awardTrainingProgress(owner,{xp:10,boss:true},options).loyalty,1);
 owner.pets[1].loyalty=499;
 assert.equal(awardTrainingProgress(owner,{xp:10,boss:true},options).loyalty,1);
 assert.equal(awardTrainingProgress(owner,{xp:10,boss:true},options).loyalty,0);
 assert.equal(owner.pets[1].loyalty,500);
});
test('training pauses for inactive/dead/invalid pets and excludes trials',()=>{
 const owner=makeOwner();
 assert.equal(awardTrainingProgress(owner,{xp:100},{...options,trial:true}).xp,0);
 owner.activePetId='trainee';assert.equal(trainingPet(owner),null);
 owner.activePetId='front';owner.pets[0].hp=0;assert.equal(trainingPet(owner),null);
 owner.pets[0].hp=100;owner.pets[1].hp=0;assert.equal(normalizeTraining(owner),null);
});
test('game UI wires exchange and targeted +1 loyalty use, gated to village and sigil 8',()=>{
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 for(const fragment of ['renderLoyaltyExchange()','data-loyalty-exchange','data-loyalty-use','consumeStack(player.bag,\'dawn_archon_core\')','addStack(player.bag,\'companion_loyalty_charm\',1)','pet.loyalty=Math.min(LOYALTY_MAX,pet.loyalty+1)','awardTraineeProgress(defeated)','awardTraineeProgress(defeated);'])assert.ok(source.includes(fragment),fragment);
 assert.ok(source.includes('if(!isTown(player.location)||Number(player.dawnSigil)<8)'));
});
