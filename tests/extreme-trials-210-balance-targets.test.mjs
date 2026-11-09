import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const cases=[
 ['monk',2.60,2.70],['performer',2.50,2.60],['crusader',2.48,2.60],['knight',2.60,2.70],
 ['hunter',2.60,2.70],['rogue',2.47,2.57],['wizard',2.55,2.65],
 ['pactWarrior',3.1,3.3],['spiritCommander',2.8,3.0]
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
