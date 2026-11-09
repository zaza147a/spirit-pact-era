import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {thirdSkills} from '../dist/third-jobs.js';

const run=(kind,job)=>JSON.parse(execFileSync(process.execPath,['tests/extreme-trials-class-30-probe.mjs',kind,job],{
 cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000
}).trim());

test('騎士與舞孃單首領加成直接標於三轉主攻／終結技且範圍不生效',()=>{
 for(const [job,bonus] of [['knight',.097],['performer',.055]]){
  const skills=thirdSkills(job);
  for(const id of [`thirdMain_${job}`,`thirdFinish_${job}`]){
   const skill=skills.find(s=>s.id===id);
   assert.equal(skill.focusedBossBonus,bonus,id);
   assert.match(skill.desc,/面對單獨首領時.*額外\+/);
  }
  assert.equal(skills.find(s=>s.id===`thirdWide_${job}`).focusedBossBonus,undefined);
 }
});

test('騎士與舞孃CLEAR王傷害維持原始基準且能通過30階',()=>{
 for(const [job,baseline] of [['knight',18780297775],['performer',15929785883]]){
  const result=run('clear',job);
  assert.equal(result.cleared,true,job);
  assert.equal(result.damage,baseline,`${job} CLEAR should remain unchanged`);
 }
});
