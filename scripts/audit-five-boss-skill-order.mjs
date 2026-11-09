// Detect whether five weak Wizard loadouts are order-sensitive, without
// changing any coefficient or granting extra skills.
import {readFileSync,writeFileSync} from 'node:fs';
import {Worker} from 'node:worker_threads';

const failed=JSON.parse(readFileSync('docs/five-boss-skill-combos-tuned.json','utf8')).rows.filter(r=>!r.won);
const permutations=choice=>[
 [choice[0],choice[1],choice[2]],[choice[0],choice[2],choice[1]],
 [choice[1],choice[0],choice[2]],[choice[1],choice[2],choice[0]],
 [choice[2],choice[0],choice[1]],[choice[2],choice[1],choice[0]]];
const cases=failed.flatMap(row=>permutations(row.choice).flatMap(order=>[42,137,731].map(seed=>({
 job:row.job,pair:row.pair,choice:row.choice,order,seed,
 options:{level:200,encounterLevel:200,gearLevel:190,seconds:600,seed,
  scenario:'trialChain',trialMap:'worldroot',fusionPair:row.pair,
  petSkills:order.map(i=>`fusion_${row.pair}_${i}`),enhancement:null,reborn:true,thirdJob:true,
  referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',
  gearStrength:.9,allocationStrength:.9,cardStrength:.9}
 }))));
const rows=Array(cases.length),workers=Array.from({length:6},()=>new Worker(new URL('./balance-worker-v508.mjs',import.meta.url)));
await new Promise((resolve,reject)=>{let next=0,done=0,failed=false;
 const send=w=>{if(next<cases.length){const i=next++,r=cases[i];w.postMessage({index:i,job:r.job,role:r.pair.split('-')[0],options:r.options});}};
 for(const w of workers){w.on('error',error=>{if(!failed){failed=true;reject(error);}});w.on('message',m=>{
  if(failed)return;if(m.error){failed=true;reject(Error(m.error));return;}
  const c=cases[m.index],r=m.result;
  rows[m.index]={job:c.job,pair:c.pair,choice:c.choice,order:c.order,seed:c.seed,
   won:!!r.chainComplete,kills:r.chainKills,seconds:r.elapsed,alive:r.alive};
  if(++done===cases.length)resolve();else send(w);
 });send(w);}
});
await Promise.all(workers.map(w=>w.terminate()));
const groups=failed.map(f=>({job:f.job,pair:f.pair,choice:f.choice,
 orders:permutations(f.choice).map(order=>{const a=rows.filter(r=>r.job===f.job&&r.pair===f.pair&&r.choice.join(',')===f.choice.join(',')&&r.order.join(',')===order.join(','));
 return {order,wins:a.filter(r=>r.won).length,runs:a.length,meanKills:a.reduce((s,r)=>s+r.kills,0)/a.length};})}));
const report={conditions:'Five Wizard loadouts failing the tuned 600s Worldroot five-boss chain, all 6 selected-skill orderings × seeds 42/137/731, identical legal Lv200 mythic gear and three skills. Investigates ordering, not coefficients.',count:rows.length,wins:rows.filter(r=>r.won).length,groups,rows};
writeFileSync('docs/five-boss-skill-order-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:report.count,wins:report.wins,groups},null,2));
