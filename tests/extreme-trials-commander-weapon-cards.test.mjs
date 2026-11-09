import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {CARDS} from '../dist/catalog.js';
import {bossCardEquipAllowed} from '../dist/boss-card-runtime.js';

test('萬靈同一套十槽王卡配置下，210專卡單體輸出優於全部其他合法武器王卡',()=>{
 const candidates=Object.entries(CARDS).filter(([,card])=>card.boss&&bossCardEquipAllowed(card,'rightHand','spiritCommander')).map(([id])=>id);
 assert.deepEqual(candidates.sort(),['boss_astral','boss_zenith','dawn-archon'].sort());
 const outcomes=new Map();
 for(const id of candidates){
  const stdout=execFileSync(process.execPath,['tests/extreme-trials-class-30-probe.mjs','hp','spiritCommander','attack-magic',id],{
   cwd:new URL('..',import.meta.url),encoding:'utf8',timeout:120000
  });
  const result=JSON.parse(stdout.trim());
  assert.equal(result.cleared,true,id);
  outcomes.set(id,result.damage);
 }
 const exclusive=outcomes.get('dawn-archon');
 for(const [id,damage] of outcomes)if(id!=='dawn-archon')assert.ok(exclusive>damage,`${id}: ${damage} >= 210 card ${exclusive}`);
 const dps=exclusive/30.5/1e8;
 assert.ok(dps>=2.8&&dps<=3.0,`210 card DPS ${dps}`);
});
