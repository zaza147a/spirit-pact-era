import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

for(const fusion of ['attack-magic','defense-support']){
 test(`萬靈${fusion}合法高生存SSS詞條與十槽王卡可連過MATK王30階`,()=>{
  const output=execFileSync(process.execPath,[
   'tests/extreme-trials-1-to-30-probe.mjs','matk','spiritCommander',fusion,'survival'
  ],{cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000});
  const result=JSON.parse(output.trim());
  assert.equal(result.cleared30,true,JSON.stringify(result));
  assert.equal(result.highest,30);
  assert.equal(result.extremeCoins,450);
 });
}
