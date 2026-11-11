// Rank the tested bounded candidates only after all 144 actual trials finish.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const jobs=['knight','crusader','wizard','sage','assassin','rogue','monk','hunter','performer','priest','pactWarrior','spiritCommander'];
const modes=['atk','matk','hp','clear'];
const rows=jobs.map(job=>{
 const r=JSON.parse(readFileSync(`docs/current-extreme-12jobs-winner-three-seed-${job}-20261111.json`,'utf8'));
 assert.equal(r.job,job);
 const out={job,modes:{}};
 for(const mode of modes){
  const m=r.modes[mode];assert.ok(m&&m.trials.length===3);
  assert.deepEqual(m.trials.map(t=>t.seed),r.seeds);
  assert.ok(m.trials.every(t=>t.job===job&&t.kind===mode));
  out.modes[mode]={mean:m.mean,range:m.range,conclusive:m.conclusive,stops:m.trials.map(t=>t.stopped),configuration:m.configuration,highest:m.trials.map(t=>t.highest)};
 }
 return out;
});
const ranking=Object.fromEntries(modes.map(mode=>[mode,rows.filter(x=>x.modes[mode].conclusive).sort((a,b)=>b.modes[mode].mean-a.modes[mode].mean).map(x=>({job:x.job,mean:x.modes[mode].mean,range:x.modes[mode].range}))]));
const censored=rows.flatMap(r=>modes.filter(m=>!r.modes[m].conclusive).map(mode=>({job:r.job,mode,stops:r.modes[mode].stops})));
const report={purpose:'Three-seed real Extreme Trial confirmation of the 12-job bounded search winners; not global optimization',jobs:jobs.length,trialCount:jobs.length*modes.length*3,ranking,censored,rows};
writeFileSync('docs/current-extreme-12jobs-four-modes-three-seed-ranking-20261111.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({jobs:report.jobs,trialCount:report.trialCount,censored,leaders:Object.fromEntries(modes.map(m=>[m,ranking[m][0]]))}));
