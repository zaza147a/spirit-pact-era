// Screen seven legal attribute profiles for one old job using each mode's verified v3 candidate.
// Every result is from the real in-game Extreme Trial. This is a bounded screen, not a global optimum.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {ATTRIBUTE_PROFILES} from '../tests/fixtures/current-210-endgame-player.mjs';
const job=process.env.EXTREME_JOB;
assert.ok(['knight','crusader','wizard','sage','assassin','rogue','monk','hunter','performer','priest'].includes(job));
const summary={job,profiles:ATTRIBUTE_PROFILES,modes:{},conditions:'Actual Extreme Trial; retain per-mode seeded-v3 baseline fusion, weapon, optional single boss card; vary legal attribute profile only; fixed seed 20261110; bounded search'};
for(const mode of ['hp','clear']){
 const source=JSON.parse(readFileSync(`docs/current-extreme-seeded-v3-${job}-${mode}-20261111.json`,'utf8'));
 const c=source.candidate;
 assert.equal(c.job,job);assert.equal(c.kind,mode);
 const output=`docs/current-extreme-seeded-v3-attribute-${job}-${mode}-20261111.json`;
 const env={...process.env,EXTREME_JOB:job,EXTREME_FUSIONS:c.fusion,EXTREME_WEAPONS:c.weaponChoice,EXTREME_WEAPON_ID:c.weaponId||'',EXTREME_CARD_SLOT:c.cardSlot||'',EXTREME_CARD_ID:c.cardId||'',EXTREME_PROFILES:ATTRIBUTE_PROFILES.join(','),EXTREME_MODES:mode,EXTREME_OUTPUT:output,EXTREME_SEED:'20261110'};
 const result=spawnSync(process.execPath,['scripts/current-extreme-candidate-search.mjs'],{env,encoding:'utf8',maxBuffer:1024*1024*4});
 if(result.status!==0)throw Error(`${job}/${mode}: ${result.stderr||result.stdout}`);
 const report=JSON.parse(readFileSync(output,'utf8'));
 assert.equal(report.completed,ATTRIBUTE_PROFILES.length);
 assert.equal(report.results.length,ATTRIBUTE_PROFILES.length);
 assert.ok(report.results.every(r=>r.stopped==='first-failure'));
 summary.modes[mode]={baseline:c,output,best:report.best[mode],scores:report.results.map(x=>({profile:x.attributeProfile,highest:x.highest})).sort((a,b)=>b.highest-a.highest)};
 console.log(JSON.stringify({job,mode,best:summary.modes[mode].best.highest,profile:summary.modes[mode].best.attributeProfile}));
}
writeFileSync(`docs/current-extreme-seeded-v3-attribute-${job}-summary-20261111.json`,JSON.stringify(summary,null,2)+'\n');
