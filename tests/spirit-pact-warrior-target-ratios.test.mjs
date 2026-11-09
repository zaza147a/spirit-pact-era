import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {thirdSkills} from '../dist/third-jobs.js';
import {spiritTargetDamageFactor} from '../dist/spirit-target-damage.js';

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
