// Compare equal-seed legal candidates; never replace a stronger verified baseline.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const source=JSON.parse(readFileSync('docs/current-extreme-12jobs-four-modes-three-seed-ranking-20261111.json','utf8'));
const baseline=JSON.parse(readFileSync('docs/current-extreme-12jobs-four-modes-progress-20261111.json','utf8'));
const modes=['atk','matk','hp','clear'];
const rows=source.rows.map(row=>{
 const b=baseline.rows.find(x=>x.job===row.job);assert.ok(b);
 const result={job:row.job,modes:{}};
 for(const mode of modes){
  const previous=b.modes[mode],tested=row.modes[mode];
  assert.ok(previous.baselineSeeds.length===3);
  assert.ok(previous.baselineStops.every(s=>s==='first-failure'));
  assert.ok(tested.conclusive);
  const old=previous.baselineMean,newMean=tested.mean;
  const keepBaseline=old>newMean;
  result.modes[mode]={chosen:keepBaseline?'seeded-v3-baseline':'three-seed-search-candidate',baselineMean:old,searchMean:newMean,improvement:Math.max(old,newMean)-old,verifiedMean:Math.max(old,newMean),verifiedRange:keepBaseline?[Math.min(...previous.baselineSeeds),Math.max(...previous.baselineSeeds)]:tested.range,configuration:keepBaseline?previous.baselineCandidate:tested.configuration,baselineSeeds:previous.baselineSeeds,searchSeeds:tested.highest};
 }
 return result;
});
// Include earlier three-seed matched-card weapon tiebreak for spiritCommander, which\n// used identical seeds and the actual trial engine; do not discard stronger evidence.\nconst tie=JSON.parse(readFileSync('docs/current-extreme-seeded-v3-spiritCommander-weapon-tiebreak-20261111.json','utf8'));\nconst commander=rows.find(r=>r.job==='spiritCommander');\nfor(const mode of ['hp','clear']){\n const trials=tie.rows.filter(r=>r.kind===mode&&r.weaponChoice==='aspdPct'&&r.attributeProfile==='agi-luk'&&r.fusion==='attack-magic'&&r.cardSlot==='accessory2'&&r.cardId==='boss_celestial');\n assert.equal(trials.length,3);assert.deepEqual(trials.map(t=>t.seed),[20261110,20261111,20261112]);\n assert.ok(trials.every(t=>t.stopped==='first-failure'));\n const mean=trials.reduce((a,t)=>a+t.highest,0)/3;\n const current=commander.modes[mode];\n if(mean>current.verifiedMean){\n  current.chosen='prior-weapon-tiebreak';current.verifiedMean=mean;\n  current.verifiedRange=[Math.min(...trials.map(t=>t.highest)),Math.max(...trials.map(t=>t.highest))];\n  current.configuration={fusion:'attack-magic',weaponChoice:'aspdPct',weaponId:null,attributeProfile:'agi-luk',cardOverrides:{accessory2:'boss_celestial'}};\n  current.additionalVerifiedSeeds=trials.map(t=>t.highest);\n }\n}\nconst ranking=Object.fromEntries(modes.map(mode=>[mode,rows.slice().sort((a,b)=>b.modes[mode].verifiedMean-a.modes[mode].verifiedMean).map(r=>({job:r.job,mean:r.modes[mode].verifiedMean,range:r.modes[mode].verifiedRange,chosen:r.modes[mode].chosen}))]));
const report={purpose:'Choose the better measured legal configuration per job/mode across the same three RNG seeds; still bounded, not global optimal',jobs:12,comparisons:48,rows,ranking,baselineRetained:rows.flatMap(r=>Object.values(r.modes)).filter(m=>m.chosen==='seeded-v3-baseline').length};
writeFileSync('docs/current-extreme-12jobs-best-verified-three-seed-20261111.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({comparisons:48,baselineRetained:report.baselineRetained,leaders:Object.fromEntries(modes.map(m=>[m,ranking[m][0]]))}));
