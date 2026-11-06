import test from 'node:test';
import assert from 'node:assert/strict';
import {spiritPreFusionAttack,spiritPreFusionIsMagic} from '../dist/spirit-dual-offense.js';
import {readFileSync} from 'node:fs';
import {JOB_SKILLS} from '../dist/job-skills.js';

const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
test('pre-fusion Pact branch receives the same bounded ATK/MATK contribution',()=>{
 for(const job of ['spiritist','pactWarrior']){
  assert.equal(spiritPreFusionAttack(job,false,10000,2000),10500);
  assert.equal(spiritPreFusionAttack(job,false,2000,10000),10500);
  assert.equal(spiritPreFusionAttack(job,false,6000,6000),7500);
 }
});
test('third-job fusion and all other professions retain their previous attack source',()=>{
 assert.equal(spiritPreFusionAttack('pactWarrior',true,10000,2000),null);
 assert.equal(spiritPreFusionAttack('spiritCommander',false,10000,2000),null);
 assert.equal(spiritPreFusionAttack('knight',false,10000,2000),null);
 assert.match(source,/spiritPreFusionAttack\(player\.job,player\.thirdJob,atk,matk\)/);
});
test('pre-fusion damage element follows the higher ATK/MATK, physical on equal values',()=>{
 for(const job of ['spiritist','pactWarrior']){
  assert.equal(spiritPreFusionIsMagic(job,false,10000,2000),false);
  assert.equal(spiritPreFusionIsMagic(job,false,2000,10000),true);
  assert.equal(spiritPreFusionIsMagic(job,false,6000,6000),false);
  assert.equal(spiritPreFusionIsMagic(job,true,2000,10000),null);
 }
 assert.equal(spiritPreFusionIsMagic('spiritCommander',false,2000,10000),null);
 assert.match(source,/magical=preFusionMagic\?\?spiritAttackIsMagic/);
 assert.match(source,/preFusionMagic=spiritPreFusionIsMagic\(player\.job,player\.thirdJob/);
 assert.match(source,/monsterDefenseAgainst\(primary,magical\)/);
});
test('pre-fusion spirit attack tooltips explain dynamic physical/magic defense',()=>{
 for(const job of ['spiritist','pactWarrior'])for(const skill of JOB_SKILLS[job]){
  if(!['physical','magic'].includes(skill.kind)||skill.thirdOnly)continue;
  assert.match(skill.desc,/較高的ATK／MATK/);
  assert.match(skill.desc,/MATK較高時計為魔法傷害（對MDEF/);
  assert.match(skill.desc,/ATK較高或相同時計為物理傷害（對DEF/);
 }
});
test('single-fusion second jobs no longer describe a two-pet attack lane',()=>{
 const pact=JOB_SKILLS.pactWarrior.find(s=>s.id==='pactWave');
 const command=JOB_SKILLS.spiritCommander.find(s=>s.id==='spiritFocus');
 const passive=JOB_SKILLS.spiritCommander.find(s=>s.id==='commandFocus');
 assert.match(pact.desc,/夥伴同化時不獨立攻擊/);
 assert.match(command.desc,/唯一融合夥伴/);
 assert.match(passive.desc,/融合夥伴系數/);
});
