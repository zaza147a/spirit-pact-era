import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {thirdSkills,THIRD_MAIN_CURVES} from '../dist/third-jobs.js';

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

test('大法師AOE回撤後CLEAR仍可達36隻，且不假稱仍為第一',()=>{
 const wizard=snapshot('wizard'),commander=snapshot('spiritCommander');
 const knight=snapshot('knight'),monk=snapshot('monk');
 assert.equal(thirdSkills('wizard').find(s=>s.id==='thirdWide_wizard').thirdGrowth.ratio,1.5);
 assert.equal(THIRD_MAIN_CURVES.wizard.at(-1),6.65);
 assert.equal(wizard.stageKills,36);
 assert.ok(commander.stageKills>wizard.stageKills,'萬靈仍為CLEAR第一');
 assert.ok(wizard.stageKills>knight.stageKills&&wizard.stageKills>monk.stageKills);
});
