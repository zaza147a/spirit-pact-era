// Reproducibility audit: repeat identical actual-engine trials, never infer determinism from seed alone.
import {readFileSync,writeFileSync,appendFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const cases=[['knight','atk'],['crusader','atk'],['pactWarrior','hp'],['spiritCommander','hp']];
const repeats=Number(process.env.EXTREME_REPEATS||3);
const output='docs/current-extreme-repeatability-audit-v2-20261111.json';
const report={seed:20261110,repeats,cases:[]};
for(const [job,mode] of cases){
 const saved=JSON.parse(readFileSync(`docs/current-extreme-multiseed-${job}-${mode}-20261111.json`));
 const candidate=saved.candidate;
 const original=saved.results.find(x=>x.seed===20261110);
 const observed=[];
 for(let i=0;i<repeats;i++){
  const env={...process.env,EXTREME_JOB:job,EXTREME_FUSION:candidate.fusion,EXTREME_WEAPON:candidate.weaponChoice,EXTREME_WEAPON_ID:candidate.weaponId||'',EXTREME_ATTRIBUTE_PROFILE:candidate.attributeProfile,EXTREME_CARD_SLOT:candidate.cardSlot||'',EXTREME_CARD_ID:candidate.cardId||'',EXTREME_MODES:mode,EXTREME_SEED:'20261110',EXTREME_FLOOR_CEILING:'500'};
  const p=spawnSync(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{env,encoding:'utf8',maxBuffer:1024*1024*5});
  if(p.status!==0)throw Error(p.stderr||p.stdout);
  const x=JSON.parse(p.stdout.trim().split('\n').at(-1));
  assert.equal(x.stopped,'first-failure');
  observed.push({highest:x.highest,ticks:x.ticks,nextFloor:x.nextFloor});
  report.cases.push({job,mode,iteration:i+1,original:{highest:original.highest,ticks:original.ticks},observed:observed.at(-1)});
  writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report.cases.at(-1)));
 }
}
const old=readFileSync('docs/handoff-12-jobs-loadout-2026-11-10.md','utf8');
const n=Math.max(...[...old.matchAll(/^## 分段交接 (\d+)：/gm)].map(x=>+x[1]))+1;
const lines=cases.map(([job,mode])=>{const rows=report.cases.filter(x=>x.job===job&&x.mode===mode);const nums=rows.map(x=>x.observed.highest);return `- ${job}/${mode}: 原跨種子記錄 ${rows[0].original.highest} 層；同種子重跑 ${nums.join('、')} 層；${new Set(nums.concat(rows[0].original.highest)).size===1?'一致':'存在重現差異'}。`;});
appendFileSync('docs/handoff-12-jobs-loadout-2026-11-10.md',`\n## 分段交接 ${n}：同種子重現性稽核\n\n- 針對完全相同候選配置與種子 20261110，直接重跑正式極限試煉，每組 ${repeats} 次，保存原始 ticks／最高層數。\n${lines.join('\n')}\n- 原始 JSON：\`${output}\`。如結果不一致，後續比較需使用重複試驗分布，不可將單次層數當成確定性最優。正式版未修改。\n`);
