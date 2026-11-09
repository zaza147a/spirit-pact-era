import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const jobs=['monk','performer','crusader','knight','hunter','rogue','wizard','pactWarrior','spiritCommander'];
for(const job of jobs){
 test(`210全王卡 ${job} 第30階HP王達標即通關且戰鬥正常結算`,()=>{
  const output=execFileSync(process.execPath,['tests/extreme-trials-class-30-probe.mjs','hp',job],{
   cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000
  });
  const result=JSON.parse(output.trim());
  assert.equal(result.cleared,true,JSON.stringify(result));
  assert.ok(result.damage>0,`${job} must deal real combat damage`);
  assert.ok(result.highest>=30,`${job} must receive the achieved stage`);
  assert.ok(result.durationMs<=30500,`${job} settlement must not exceed its offline window`);
 });
}
