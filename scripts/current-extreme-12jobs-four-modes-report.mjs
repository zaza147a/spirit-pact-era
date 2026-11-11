// Summarize measured legal 12-job Extreme Trial results without inventing missing data.
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
const jobs=['knight','crusader','wizard','sage','assassin','rogue','monk','hunter','performer','priest','pactWarrior','spiritCommander'];
const modes=['atk','matk','hp','clear'];
const rows=[];
for(const job of jobs){
 const row={job,modes:{}};
 for(const mode of modes){
  const path=`docs/current-extreme-seeded-v3-${job}-${mode}-20261111.json`;
  if(!existsSync(path)){row.modes[mode]={status:'missing baseline'};continue;}
  const base=JSON.parse(readFileSync(path,'utf8'));
  const baseline=base.results?.map(x=>x.highest)||[];
  const candidate=base.candidate;
  const out={baselineSeeds:baseline,baselineStops:base.results?.map(x=>x.stopped)||[],baselineMean:baseline.length?baseline.reduce((a,b)=>a+b,0)/baseline.length:null,baselineCandidate:candidate};
  const attr=job==='pactWarrior'||job==='spiritCommander'?
    `docs/current-extreme-seeded-v3-${job}-${mode==='atk'||mode==='matk'?'defense-attributes':'attribute-search'}-20261111.json`:
    `docs/current-extreme-seeded-v3-attribute-${job}-${mode==='atk'||mode==='matk'?'atk-matk-':'-'}summary-20261111.json`;
  if(existsSync(attr)){
   const a=JSON.parse(readFileSync(attr,'utf8'));
   if(a.modes?.[mode]){out.attributeWinner=a.modes[mode].best;out.attributeCensored=a.modes[mode].censored||[];}
   else if(a.best?.[mode])out.attributeWinner=a.best[mode];
  }
  const card=`docs/current-extreme-multicard-coordinate-${job}-${mode}-20261111.json`;
  if(existsSync(card)){const c=JSON.parse(readFileSync(card,'utf8'));out.multicard={baseline:c.baseline.highest,winner:c.winner,evaluations:c.evaluations};}
  row.modes[mode]=out;
 }
 rows.push(row);
}
const report={title:'12 jobs x four real Extreme Trial modes: measured candidate inventory',warning:'Different seed, equipment, card, and attribute constraints cannot be ranked against each other as a global optimum. Baseline three-seed means are comparable within their tested setup; other scores are bounded screens.',rows};
writeFileSync('docs/current-extreme-12jobs-four-modes-progress-20261111.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({jobs:rows.length,baselineModes:rows.flatMap(x=>Object.values(x.modes)).filter(x=>x.baselineMean!==null).length,attributeModes:rows.flatMap(x=>Object.values(x.modes)).filter(x=>x.attributeWinner).length,multicardModes:rows.flatMap(x=>Object.values(x.modes)).filter(x=>x.multicard).length}));
