import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {thirdSkills} from '../dist/third-jobs.js';
import {spiritTargetDamageFactor} from '../dist/spirit-target-damage.js';
import {runtime} from './runtime31-helper.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';

test('君王三轉主攻與範圍技只打三體：主體100%，兩副體75%',()=>{
 const skills=thirdSkills('pactWarrior');
 for(const id of ['thirdMain_pactWarrior','thirdWide_pactWarrior']){
  const skill=skills.find(s=>s.id===id);
  assert.equal(skill.targets,3,id);
  assert.equal(skill.primaryTargetPower,1,id);
  assert.equal(skill.secondaryTargetPower,.75,id);
  assert.match(skill.desc,/主目標100%，其餘兩體各75%/);
 }
 const script=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(script,/kingThreeTargets=player\.job==='pactWarrior'.*targetCount=kingThreeTargets\?3:/);
 assert.equal(spiritTargetDamageFactor('pactWarrior','playerDamage',{secondary:false}),1);
 assert.equal(spiritTargetDamageFactor('pactWarrior','playerDamage',{secondary:true}),1);
});

test('君王三轉主攻／範圍技實際命中三隻同防禦怪物，副體各為主體75%',async()=>{
 for(const id of ['thirdMain_pactWarrior','thirdWide_pactWarrior']){
  const c=await runtime({captureDamage:true}),a=c.api;
  const p=highLevelSpiritPlayer({level:210,job:'pactWarrior',pairKey:'attack-magic+defense-support',dawnSigil:0});
  p.jobSkills[id]=10;p.dawnSigil=8;p.location='dawnrift';
  p.mp=1e12;
  const foes=Array.from({length:4},(_,i)=>({id:'world_200',instanceId:`ratio-${i}`,level:200,hp:1e15,maxHp:1e15,def:0,mdef:0,flee:0,atk:0,hit:0,boss:false}));
  a.setup(p,foes[0]);a.setEnemies(foes);
  c.Math.random=()=>.9;c.rand=()=>100;
  a.playerAttack(true,id,true);
  const dealt=foes.map(foe=>1e15-foe.hp);
  assert.ok(dealt[0]>0,`${id} has primary damage`);
  assert.ok(Math.abs(dealt[1]/dealt[0]-.75)<.001,`${id} secondary 1 ${dealt}`);
  assert.ok(Math.abs(dealt[2]/dealt[0]-.75)<.001,`${id} secondary 2 ${dealt}`);
  assert.equal(dealt[3],0,`${id} must not hit fourth target`);
 }
});
