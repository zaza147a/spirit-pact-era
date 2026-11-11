// Cross-seed verification of the best currently recorded legal single-card candidate.
// All simulations invoke the existing actual extreme-trial engine.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync,appendFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {WEAPON_VARIANTS,currentEndgamePlayer} from '../tests/fixtures/current-210-endgame-player.mjs';
const job=process.env.EXTREME_JOB;
assert.ok(WEAPON_VARIANTS[job]);
const modes=(process.env.EXTREME_MODES||'atk,matk,hp,clear').split(',');
const seeds=(process.env.EXTREME_SEEDS||'20261110,20261111,20261112').split(',').map(Number);
const baseWeapon=currentEndgamePlayer(job).gear.rightHand.id;
for(const mode of modes){
 assert.ok(['atk','matk','hp','clear'].includes(mode));
 const first=JSON.parse(readFileSync(`docs/current-extreme-${job}-search-20261110.json`));
 const refine=JSON.parse(readFileSync(`docs/current-extreme-refine-${job}-${mode}-20261111.json`));
 const candidates=[first.best[mode],...refine.results];
 for(const id of WEAPON_VARIANTS[job].filter(x=>x!==baseWeapon)){
  candidates.push(...JSON.parse(readFileSync(`docs/current-extreme-weapon-${job}-${id.replaceAll('+','-')}-${mode}-20261111.json`)).results);
 }
 const baseline=candidates.sort((a,b)=>b.highest-a.highest)[0];
 // The card refinement script uses exactly this baseline. Read only the validated reports.
 const {CARDS}=await import('../dist/catalog.js');
 const {cardAllowedInSlot}=await import('../dist/card-effects.js');
 const p=currentEndgamePlayer(job,{fusion:baseline.fusion,weaponChoice:baseline.weaponChoice,attributeProfile:baseline.attributeProfile,weaponId:baseline.weaponId});
 const swaps=Object.entries(p.gear).filter(([,g])=>g).flatMap(([slot])=>Object.entries(CARDS).filter(([id,c])=>c.boss&&id!==p.sockets[slot]&&cardAllowedInSlot(c,slot,job)).map(([id])=>({slot,id})));
 for(const {slot,id} of swaps){
  const path=`docs/current-extreme-card-${job}-${mode}-${slot}-${id}-20261111.json`;
  const data=JSON.parse(readFileSync(path));
  assert.equal(data.completed,1,path);
  candidates.push(...data.results);
 }
 const winner=candidates.sort((a,b)=>b.highest-a.highest)[0];
 const path=`docs/current-extreme-multiseed-${job}-${mode}-20261111.json`;
 let results=[];
 if(existsSync(path)){
  const old=JSON.parse(readFileSync(path));
  assert.deepEqual(old.candidate,winner);
  results=old.results;
 }
 for(const seed of seeds){
  if(results.some(r=>r.seed===seed))continue;
  const env={...process.env,EXTREME_JOB:job,EXTREME_FUSION:winner.fusion,EXTREME_WEAPON:winner.weaponChoice,EXTREME_WEAPON_ID:winner.weaponId||'',EXTREME_ATTRIBUTE_PROFILE:winner.attributeProfile,EXTREME_CARD_SLOT:winner.cardSlot||'',EXTREME_CARD_ID:winner.cardId||'',EXTREME_MODES:mode,EXTREME_SEED:String(seed),EXTREME_FLOOR_CEILING:'500'};
  const run=spawnSync(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{env,encoding:'utf8',maxBuffer:1024*1024*5});
  if(run.status!==0)throw Error(run.stderr||run.stdout);
  const result=JSON.parse(run.stdout.trim().split('\n').at(-1));
  assert.equal(result.stopped,'first-failure');
  assert.equal(result.nextFloor,result.highest+1);
  results.push(result);
  writeFileSync(path,JSON.stringify({job,mode,candidate:winner,results},null,2)+'\n');
  console.log(JSON.stringify({job,mode,seed,highest:result.highest}));
 }
 assert.equal(results.length,seeds.length);
 const avg=results.reduce((s,r)=>s+r.highest,0)/results.length;
 const handoff='docs/handoff-12-jobs-loadout-2026-11-10.md';
 const prev=readFileSync(handoff,'utf8');
 const number=[...prev.matchAll(/^## 分段交接 (\d+)：/gm)].map(x=>+x[1]).reduce((a,b)=>Math.max(a,b),0)+1;
 appendFileSync(handoff,`\n## 分段交接 ${number}：${job} ${mode.toUpperCase()} 多種子實戰複測\n\n- 使用目前已驗證的固定基準／合法單卡最佳候選，種子 ${seeds.join('、')}，實際極限試煉均至首次失敗。\n- 最高層數：${results.map(x=>x.highest).join('、')}；平均 ${avg.toFixed(2)} 層。原始報告：\`${path}\`。\n- 本段為跨種子穩定性驗證，並非跨多張卡、全部融合與配點的全域搜尋。正式版未變更。\n`);
}
