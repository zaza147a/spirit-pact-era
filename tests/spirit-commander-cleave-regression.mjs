// Isolated production-function checks for commander-only additional targets.
// Covers 1, 2, 3, 5 live enemies; protects legacy pet damage and no duplicate events.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
function extract(name,next){
 const start=game.indexOf('function '+name+'('),end=game.indexOf('\nfunction '+next+'(',start);
 assert.ok(start>=0&&end>start,name+' source boundary');
 return game.slice(start,end);
}
const attack=extract('petAttack','enemyAttack');
const ability=extract('petAutoAbility','tickDamageOverTime');
let cases=0;
function scenario({job,count,kind='attack',splash=0}){
 const pet={id:'first',species:'fang',nickname:'Test',hp:100,sp:100,rarity:'mythic',equippedSkills:['magic1']};
 const player={job,hp:100,mp:100,activePetId:'first',secondaryPetId:'second',location:'worldroot'};
 const enemies=Array.from({length:count},(_,i)=>({instanceId:'target'+i,hp:1000,maxHp:1000,flee:0}));
 const hits=[],events=[],ctx={
  player,enemies,enemy:enemies[0],auto:true,dirty:false,report:null,timers:{pet:0,petById:{},petAbilityById:{}},
  petSkillTimers:{},classBuffs:{},SPECIES:{fang:{skill:'Bite'}},gameNow:()=>1000,
  chooseAttackTarget:()=>{},commanderTransferredPetStats:(_pet,s)=>s,
  petStats:()=>({aspd:193,aspdPct:0,crit:0,hit:100,ignoreDef:0,critDmg:140}),
  companionRole:()=> 'attack',aspdAttackIntervalMs:()=>100,
  hitChance:()=>1,petOffensivePower:()=>100,monsterDefenseAgainst:()=>0,hitDamage:d=>d,
  dealPetDamage:(amount)=>{ctx.enemy.hp-=amount;hits.push({id:ctx.enemy.instanceId,amount});return amount;},
  multiTargets:(pool,primary,limit,max)=>[primary,...pool.filter(x=>x!==primary&&x.hp>0)].slice(0,Math.min(limit,max)),
  encounterLimit:()=>5,finishVictims:()=>{},
  message:()=>{},render:()=>{},damageText:()=>'',classBuffPower:()=>0,
  emitEvent:ev=>events.push(ev),award:()=>{},stat:()=>100,
  activePet:()=>pet,combatPetFactor:()=>1,
  effectsForPet:()=>({}),defaultPetSkills:()=>['magic1'],
  petSkillById:()=>({id:'magic1',kind:'magic',unlock:0,splash}),
  petSkillStatus:()=> '可施放',petSkillEffect:()=>({value:100})
 };
 if(kind==='attack')vm.runInNewContext(attack+'\nthis.fire=petAttack',ctx);
 else vm.runInNewContext(ability+'\nthis.fire=petAutoAbility',ctx);
 if(kind==='attack')ctx.fire(pet,1);
 else ctx.fire(pet,{ignoreDef:0},1000);
 return {hits,events};
}
for(const count of [1,2,3,5]){
 for(const job of ['spiritCommander','pactWarrior','wizard']){
  const a=scenario({job,count,kind:'attack'});
  assert.equal(a.hits.length,job==='spiritCommander'?Math.min(count,2):1,job+' '+count+' attack target count');
  assert.equal(a.hits[0].amount,100);
  if(a.hits[1])assert.equal(a.hits[1].amount,50);
  assert.ok(a.events.length<=1,'secondary target cannot multiply event');
  const skill=scenario({job,count,kind:'skill'});
  assert.equal(skill.hits.length,job==='spiritCommander'?count:1,job+' '+count+' skill target count');
  assert.equal(skill.hits[0].amount,100);
  for(const secondary of skill.hits.slice(1))assert.equal(secondary.amount,60);
  cases+=2;
 }
}
for(const job of ['spiritCommander','pactWarrior']){
 const a=scenario({job,count:5,kind:'skill',splash:.3});
 assert.equal(a.hits.length,job==='spiritCommander'?5:4,'native splash cap stays unchanged on legacy job');
 assert.equal(a.hits[0].amount,100);
 for(const extra of a.hits.slice(1))assert.equal(extra.amount,30,'native splash coefficient retained');
 cases++;
}
console.log('Commander-only secondary-target combat regression passed: '+cases+' cases.');
