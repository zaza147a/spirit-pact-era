import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {FUSION_PAIRS,FUSION_SKILLS} from '../dist/pet-fusion.js';
import {SECOND_JOBS} from '../dist/jobs.js';
import {ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const baselinePath='docs/five-boss-full-skill-baseline.json';
const baseline=existsSync(baselinePath)?read(baselinePath):read('docs/five-boss-full-skill-matrix.json');
assert.equal(baseline.rows.length,2400);
if(!existsSync(baselinePath))writeFileSync(baselinePath,JSON.stringify({...baseline,sourceCommit:'b91a8d7e9bd74de31ec7b2a489e23324589687a5'},null,2)+'\n');
const key=r=>r.job+'/'+r.pair+'/'+r.choice.join(',');
const rows=new Map(baseline.rows.map(r=>[key(r),{...r,sourceCommit:'b91a8d7e9bd74de31ec7b2a489e23324589687a5'}]));
const changes=[];
for(const [path,sourceCommit] of [['docs/live-resonance-impact.json','52a1557573e70b6ddf2c4af9cafd6531011af7e8'],['docs/live-melody-auto-impact.json','e79dbfccc71556792bcb66b881bc050affa570b6']]){
 for(const r of read(path).rows.filter(r=>r.kind==='fiveBoss')){
  const k=key(r),old=rows.get(k);assert.ok(old);assert.equal(r.seed,old.seed);assert.equal(r.choice.length,3);
  changes.push({key:k,wasWon:old.won,won:r.won,oldSeconds:old.seconds,seconds:r.seconds,sourceCommit});
  rows.set(k,{job:r.job,pair:r.pair,choice:r.choice,seed:r.seed,won:r.won,kills:r.kills,seconds:r.seconds,alive:r.alive,petDeaths:r.petDeaths,potions:r.potions,sourceCommit});
 }
}
const final=[...rows.values()],wins=final.filter(r=>r.won),times=wins.map(r=>r.seconds).sort((a,b)=>a-b);
const summary=Object.keys(SECOND_JOBS).map(job=>({job,byPair:Object.keys(FUSION_PAIRS).map(pair=>{
 const a=final.filter(r=>r.job===job&&r.pair===pair),w=a.filter(r=>r.won),t=w.map(r=>r.seconds).sort((a,b)=>a-b);
 assert.equal(a.length,20);return {pair,n:a.length,wins:w.length,medianWinSeconds:t[Math.floor(t.length/2)]??null,maxWinSeconds:t.at(-1)??null,choicesWithFailures:a.filter(r=>!r.won).map(r=>r.choice)};
})}));
const cohortSummary=canonical=>{const a=final.filter(r=>ORIGINAL_SIX_KEYS.includes(r.pair)===canonical),w=a.filter(r=>r.won),t=w.map(r=>r.seconds).sort((a,b)=>a-b);return {count:a.length,wins:w.length,medianWinSeconds:t[Math.floor(t.length/2)]};};
const failed=final.filter(r=>!r.won).map(r=>({...r,skillKinds:r.choice.map(i=>FUSION_SKILLS[r.pair][i].kind),classification:r.alive?'survived-but-600s-timeout':'owner-defeated'}));
assert.equal(final.length,2400);assert.equal(new Set(final.map(key)).size,2400);
const report={conditions:'10 third jobs ×12 ordered fusions ×20 triplets, seed731; legal unenhanced Lv200 prior-tier mythic owner/pet reference gear,90% gear/attributes/cards, complete five Lv191 Worldroot bosses,600s. Baseline b91a8d7 plus all100 affected skill sets rerun after live-event fixes; performer defense-support20 rows replaced again after full-SP healing AI fix. Unchanged routes reused explicitly; row sourceCommit retained. This is not2400 same-commit full reruns or universal all-gear/all-seed victory.',count:final.length,wins:wins.length,medianWinSeconds:times[Math.floor(times.length/2)],baselineWins:baseline.wins,canonical:cohortSummary(true),reverse:cohortSummary(false),replayedRows:100,replayExecutions:120,regressions:changes.filter(r=>r.wasWon&&!r.won),summary,failed,changes,rows:final};
writeFileSync('docs/five-boss-full-skill-matrix.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,wins:report.wins,baselineWins:report.baselineWins,failed:failed.length,defeated:failed.filter(r=>!r.alive).length,regressions:report.regressions.length},null,2));
