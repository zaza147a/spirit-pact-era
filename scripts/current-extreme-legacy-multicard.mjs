// Run bounded multi-card coordinate search for one legacy job, retaining the best
// previously measured per-mode loadout and legal attribute-profile candidate.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const job=process.env.EXTREME_JOB;
assert.ok(['knight','crusader','wizard','sage','assassin','rogue','monk','hunter','performer','priest'].includes(job));
const summary=JSON.parse(readFileSync(`docs/current-extreme-seeded-v3-attribute-${job}-summary-20261111.json`,'utf8'));
const results={job,modes:{},description:'Actual trials; bounded greedy multi-card coordinate search; not global optimum'};
for(const mode of ['hp','clear']){
 const baseline=summary.modes[mode].baseline;
 const profile=summary.modes[mode].best.attributeProfile;
 const overrides=baseline.cardSlot?{[baseline.cardSlot]:baseline.cardId}:{};
 const output=`docs/current-extreme-multicard-coordinate-${job}-${mode}-20261111.json`;
 const env={...process.env,EXTREME_JOB:job,EXTREME_MODE:mode,EXTREME_FUSION:baseline.fusion,EXTREME_WEAPON:baseline.weaponChoice,EXTREME_WEAPON_ID:baseline.weaponId||'',EXTREME_ATTRIBUTE_PROFILE:profile,EXTREME_CARD_OVERRIDES:JSON.stringify(overrides),EXTREME_OUTPUT:output,EXTREME_CARD_MAX_SLOTS:'5',EXTREME_CARD_MAX_CARDS:'6',EXTREME_CARD_PASSES:'2'};
 const r=spawnSync(process.execPath,['scripts/current-extreme-multicard-coordinate-search.mjs'],{env,encoding:'utf8',maxBuffer:4*1024*1024});
 if(r.status!==0)throw Error(r.stderr||r.stdout);
 const report=JSON.parse(readFileSync(output,'utf8'));
 assert.equal(report.job,job);assert.equal(report.mode,mode);
 results.modes[mode]={baseline,profile,output,evaluations:report.evaluations,winner:report.winner};
 console.log(JSON.stringify({job,mode,baseline:report.baseline.highest,winner:report.winner.highest,evaluations:report.evaluations}));
}
writeFileSync(`docs/current-extreme-multicard-coordinate-${job}-summary-20261111.json`,JSON.stringify(results,null,2)+'\n');
