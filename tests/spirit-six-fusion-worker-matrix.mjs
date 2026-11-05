// Actual encounter simulation through the production offline Worker.
// Six unordered fusion species × two jobs × Lv200/Lv210, 120 s each.
// Fixed synthetic equipment / no sigil / no boss, not an optimized DPS ranking.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {FUSION_TYPES,canonicalFusionKey} from '../dist/spirit-job-rules.js';
import {rollGear} from '../dist/loot.js';

const START=2000000000000,DURATION=120000;

async function evaluate(job,level,fusion,build='baseline'){
 const partner=FUSION_TYPES.find(x=>x!==fusion);
 const pairKey=[fusion,partner].sort().join('+');
 const p=highLevelSpiritPlayer({job,level,pairKey});
 if(build==='physical'||build==='magical'){
  // Swap only the primary STR/INT budget; all other legal stats are held fixed.
  const main=build==='physical'?'STR':'INT',other=main==='STR'?'INT':'STR';
  const transferred=p.attributes.STR+p.attributes.INT-1;
  p.attributes[main]=transferred;p.attributes[other]=1;
 }
 const pet=p.pets.find(unit=>canonicalFusionKey(unit)===fusion);
 assert.ok(pet,`missing generated fusion ${fusion}`);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 p.gear.rightHand=rollGear('staffSword',200,'mythic',()=>.25);
 if(level===210)p.gear.rightHand.enhancement='SSS';
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs',import.meta.url),
  {type:'module',workerData:{seed:9100+level+(job==='pactWarrior'?1:2)}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error(`timeout ${job} ${level} ${fusion}`)),30000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    else if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });
   worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player:p,now:START+DURATION});
  });
  const summary=result.summary,targets=summary.spiritEnemyTargets||{},damage=summary.damage;
  assert.equal(summary.simulated,DURATION);
  assert.equal(result.player.pets.length,1);
  assert.equal(targets.pet2||0,0);
  assert.equal(damage.pet2||0,0);
  if(job==='pactWarrior'){
   assert.equal(targets.pet1||0,0);
   assert.equal(damage.pet1||0,0);
   assert.ok(targets.owner>0);
  }else{
   assert.equal(targets.owner||0,0);
   assert.ok(targets.pet1>0);
   assert.ok(summary.spiritPetMain?.hits>0,'commander must have real successful pet main attacks');
   if(fusion==='defense-support'){
    assert.ok(summary.guardian?.triggers>0,'guardian must trigger during real incoming combat');
    assert.ok(summary.guardian.echoUses>0,'healing conversion must be consumed by real attacks');
    assert.ok(summary.guardian.overheal>=0&&summary.guardian.effectiveHeal>=0);
    assert.ok(summary.guardian.waveDamage>0,'guardian must deal actual retaliatory damage');
    assert.ok(summary.guardian.waveHits>0&&summary.guardian.waveHits<=summary.guardian.triggers*3,'one wave may hit at most three foes');
   }
  }
  return {job,level,fusion,build,kills:summary.kills,dps:Math.round(damage.total/(DURATION/1000)),
   ownerDps:Math.round(damage.player/(DURATION/1000)),petDps:Math.round((damage.pet1||0)/(DURATION/1000)),
   ownerHits:targets.owner||0,petHits:targets.pet1||0,
   potions:Object.values(summary.potions||{}).reduce((sum,n)=>sum+n,0),
   endedOwnerHp:result.player.hp,endedPetHp:result.player.pets[0].hp,
   guardian:summary.guardian||null,
   petMain:summary.spiritPetMain||null,skillCasts:summary.skillCasts||{}};
 }finally{await worker.terminate();}
}

const rows=[];
for(const level of [200,210].filter(x=>!process.env.SPIRIT_LEVEL_FILTER||String(x)===process.env.SPIRIT_LEVEL_FILTER))for(const job of ['pactWarrior','spiritCommander'].filter(x=>!process.env.SPIRIT_JOB_FILTER||x===process.env.SPIRIT_JOB_FILTER)){
 for(const fusion of FUSION_TYPES.filter(x=>!process.env.SPIRIT_FUSION_FILTER||x===process.env.SPIRIT_FUSION_FILTER))for(const build of process.env.SPIRIT_BUILD_SWEEP==='1'?['physical','magical']:['baseline'])
  rows.push(await evaluate(job,level,fusion,build));
}
console.log(JSON.stringify({condition:'120s real Worker; single fusion pet; fixed synthetic gear; no boss; sigil0',rows},null,2));
