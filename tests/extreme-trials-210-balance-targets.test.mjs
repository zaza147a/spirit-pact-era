import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const cases=[
 ['monk',2.3,Infinity],['performer',2.3,Infinity],['crusader',2.3,Infinity],
 ['pactWarrior',3.3,3.7],['spiritCommander',4.1,4.4]
];
for(const [job,lower,upper] of cases){
 test(`210全王卡 ${job} 第30階單體平均DPS校準`,()=>{
  const output=execFileSync(process.execPath,['tests/extreme-trials-class-30-probe.mjs','hp',job],{
   cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000
  });
  const result=JSON.parse(output.trim());
  assert.equal(result.cleared,true,JSON.stringify(result));
  const averageDpsE=result.damage/30.5/1e8;
  assert.ok(averageDpsE>=lower,`${job} ${averageDpsE.toFixed(3)}億 DPS must reach ${lower}`);
  assert.ok(averageDpsE<=upper,`${job} ${averageDpsE.toFixed(3)}億 DPS exceeds ${upper}`);
 });
}
