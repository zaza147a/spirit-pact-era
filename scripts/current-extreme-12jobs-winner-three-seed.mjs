// Cross-seed verification of the currently measured bounded winners (not global optima).
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const job=process.env.EXTREME_JOB;
const allowed=['knight','crusader','wizard','sage','assassin','rogue','monk','hunter','performer','priest','pactWarrior','spiritCommander'];
assert.ok(allowed.includes(job));
const modes=(process.env.EXTREME_MODES||'atk,matk,hp,clear').split(',');
const seeds=(process.env.EXTREME_SEEDS||'20261110,20261111,20261112').split(',').map(Number);
assert.ok(modes.every(x=>['atk','matk','hp','clear'].includes(x)));
assert.ok(seeds.length>=3&&seeds.every(Number.isInteger));
const report=JSON.parse(readFileSync('docs/current-extreme-12jobs-four-modes-progress-20261111.json','utf8'));
const row=report.rows.find(x=>x.job===job);assert.ok(row);
const results={job,purpose:'Three-seed confirmation of bounded trial winners; not proof of global optimum',seeds,modes:{}};
for(const mode of modes){
 const entry=row.modes[mode];assert.ok(entry);
 const c=entry.baselineCandidate;assert.ok(c);
 const a=entry.attributeWinner;
 let overrides=c.cardSlot?{[c.cardSlot]:c.cardId}:{};
 let profile=a?.attributeProfile||c.attributeProfile;
 let chosen='attribute-screen';
 if(['hp','clear'].includes(mode)&&entry.multicard){
  overrides=entry.multicard.winner.overrides;
  chosen='multicard-coordinate';
 }
 const trials=[];
 for(const seed of seeds){
  const env={...process.env,EXTREME_JOB:job,EXTREME_FUSION:c.fusion,EXTREME_WEAPON:c.weaponChoice,EXTREME_WEAPON_ID:c.weaponId||'',EXTREME_ATTRIBUTE_PROFILE:profile,EXTREME_CARD_SLOT:'',EXTREME_CARD_ID:'',EXTREME_CARD_OVERRIDES:JSON.stringify(overrides),EXTREME_MODES:mode,EXTREME_SEED:String(seed),EXTREME_FLOOR_CEILING:'500'};
  const r=spawnSync(process.execPath,['scripts/current-extreme-continuous-benchmark.mjs'],{env,encoding:'utf8',maxBuffer:5*1024*1024});
  if(r.status!==0)throw Error(`${job}/${mode}/${seed}: ${r.stderr||r.stdout}`);
  const trial=JSON.parse(r.stdout.trim().split('\n').at(-1));
  assert.equal(trial.job,job);assert.equal(trial.kind,mode);assert.equal(trial.seed,seed);
  assert.deepEqual(trial.cardOverrides,overrides);
  trials.push(trial);
  console.log(JSON.stringify({job,mode,seed,highest:trial.highest,stopped:trial.stopped}));
 }
 const conclusive=trials.every(t=>t.stopped==='first-failure');
 results.modes[mode]={chosen,configuration:{fusion:c.fusion,weaponChoice:c.weaponChoice,weaponId:c.weaponId||null,attributeProfile:profile,cardOverrides:overrides},trials,conclusive,mean:conclusive?trials.reduce((n,t)=>n+t.highest,0)/trials.length:null,range:conclusive?[Math.min(...trials.map(t=>t.highest)),Math.max(...trials.map(t=>t.highest))]:null};
}
writeFileSync(`docs/current-extreme-12jobs-winner-three-seed-${job}-20261111.json`,JSON.stringify(results,null,2)+'\n');
