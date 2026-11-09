import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {thirdSkills} from '../dist/third-jobs.js';

function snapshot(job){
 const output=execFileSync(process.execPath,['tests/extreme-trials-class-30-probe.mjs','clear',job],{
  cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000,
  env:{...process.env,EXTREME_CLEAR_KILLS_SNAPSHOT:'1'}
 });
 return JSON.parse(output.trim());
}

test('騎士與修羅以公開終結倍率取代部分AOE倍率',()=>{
 for(const [job,wide,finish] of [['knight',10,23],['monk',8,23]]){
  const skills=thirdSkills(job);
  assert.equal(skills.find(skill=>skill.id===`thirdWide_${job}`).thirdGrowth.ratio,wide);
  assert.equal(skills.find(skill=>skill.id===`thirdFinish_${job}`).thirdGrowth.ratio,finish);
 }
});

test('CLEAR王第30階大法師實際擊殺數高於萬靈、騎士與修羅',()=>{
 const wizard=snapshot('wizard'),commander=snapshot('spiritCommander');
 const knight=snapshot('knight'),monk=snapshot('monk');
 assert.ok(wizard.stageKills>=38,`wizard kills ${wizard.stageKills}`);
 for(const result of [commander,knight,monk]){
  assert.ok(wizard.stageKills>result.stageKills,
   `wizard ${wizard.stageKills} must beat ${result.job} ${result.stageKills}`);
 }
});
