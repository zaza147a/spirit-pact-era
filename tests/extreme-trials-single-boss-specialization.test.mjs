import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {thirdSkills} from '../dist/third-jobs.js';

const run=(kind,job)=>JSON.parse(execFileSync(process.execPath,['tests/extreme-trials-class-30-probe.mjs',kind,job],{
 cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000
}).trim());

test('騎士與舞孃以可見倍率調整取代10%／6%單王額外加成',()=>{
 for(const [job,wideRatio,finishRatio] of [['knight',10,23],['performer',15,20]]){
  const skills=thirdSkills(job);
  for(const id of [`thirdMain_${job}`,`thirdFinish_${job}`,`thirdWide_${job}`]){
   const skill=skills.find(s=>s.id===id);
   assert.equal(skill.focusedBossBonus,undefined,id);
   assert.doesNotMatch(skill.desc,/面對單獨首領時.*額外\+/);
  }
  assert.equal(skills.find(s=>s.id===`thirdFinish_${job}`).thirdGrowth.ratio,finishRatio);
  assert.equal(skills.find(s=>s.id===`thirdWide_${job}`).thirdGrowth.ratio,wideRatio);
 }
});

test('騎士削減AOE、舞孃保持倍率後CLEAR王皆能通過30階',()=>{
 for(const [job,minimum] of [['knight',18000000000],['performer',17000000000]]){
  const result=run('clear',job);
  assert.equal(result.cleared,true,job);
  assert.ok(result.damage>=minimum,`${job} CLEAR should benefit from AoE multiplier`);
 }
});
