// Actual encounter simulation through the production offline Worker.
// Six unordered fusion species × two jobs × Lv200/Lv210, 120 s each.
// Fixed synthetic equipment / no sigil / no boss, not an optimized DPS ranking.
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {FUSION_TYPES,canonicalFusionKey} from '../dist/spirit-job-rules.js';
import {fusionSkills} from '../dist/pet-fusion.js';
import {rollGear,GEAR_BASE,PET_GEAR_BASE,SPECIAL_AFFIXES,affixRange} from '../dist/loot.js';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot,cardEffectsFor} from '../dist/card-effects.js';

const START=2000000000000,DURATION=Number(process.env.SPIRIT_DURATION_MS||120000),allowBoss=process.env.SPIRIT_ALLOW_BOSS==='1';
const bossCards=process.env.SPIRIT_BOSS_CARDS==='1';
const survivalAffixes=process.env.SPIRIT_SURVIVAL_AFFIXES==='1';
function prioritizeSurvivalAffix(player){
 for(const gear of [...Object.values(player.gear),...player.pets.flatMap(pet=>Object.values(pet.gear||{}))]){
  if(!gear)continue;
  const base=GEAR_BASE[gear.id]||PET_GEAR_BASE[gear.id];
  const weapon=!!base?.weaponType||base?.petSlot==='head';
  const preferred=weapon?'damageReduction':'hpPct';
  const next={...gear.affixes};
  for(const key of Object.keys(next))if(SPECIAL_AFFIXES.has(key))delete next[key];
  const allowed=weapon?['aspdPct','crit','critDmg','damageReduction']:['fleePct','damageReduction','hpPct'];
  assert.ok(allowed.includes(preferred));
  next[preferred]=affixRange(preferred,gear.tier,gear.rarity,gear.id)[1];
  assert.equal(Object.keys(next).length,Object.keys(gear.affixes).length,'preserve rolled mythic affix count');
  gear.affixes=next;
 }
}
function equipBossCards(player){
 for(const slot of Object.keys(SLOTS)){
  if(!player.gear[slot]){player.sockets[slot]=null;continue;}
  let best=null,bestScore=-Infinity;
  for(const [id,card] of Object.entries(CARDS)){
   if(!card.boss||card.map==='dawnrift'||card.map==='legacy'||!cardAllowedInSlot(card,slot,player.job))continue;
   const effects=cardEffectsFor(card,200),score=Object.entries(effects).reduce((total,[key,value])=>{
    const weight={hpPct:8,damageReduction:12,defPct:5,mdefPct:4,fleePct:2,
     VIT:5,STR:player.job==='pactWarrior'?3:1,INT:player.job==='spiritCommander'?3:1,
     atkPct:3,matkPct:3,crit:2,critDmg:2,aspdPct:2,ignoreDef:2}[key]||0;
    return total+Math.min(100,value)*weight;
   },0);
   if(score>bestScore){best=id;bestScore=score;}
  }
  assert.ok(best,`boss card missing for ${slot}`);player.sockets[slot]=best;
 }
}

async function evaluate(job,level,fusion,build='baseline'){
 const partner=FUSION_TYPES.find(x=>x!==fusion);
 const pairKey=[fusion,partner].sort().join('+');
 const p=highLevelSpiritPlayer({job,level,pairKey,allowBoss});
 if(build==='physical'||build==='magical'){
  // Swap only the primary STR/INT budget; all other legal stats are held fixed.
  const main=build==='physical'?'STR':'INT',other=main==='STR'?'INT':'STR';
  const transferred=p.attributes.STR+p.attributes.INT-1;
  p.attributes[main]=transferred;p.attributes[other]=1;
 }
 const pet=p.pets.find(unit=>canonicalFusionKey(unit)===fusion);
 const requestedSkills=process.env.SPIRIT_SKILL_INDEXES;
 if(requestedSkills){
  const pool=fusionSkills(pet)||[];
  const indices=requestedSkills.split(',').map(value=>Number(value.trim()));
  assert.equal(indices.length,3,'SPIRIT_SKILL_INDEXES requires exactly three indices');
  assert.ok(indices.every(index=>Number.isInteger(index)&&index>=0&&index<pool.length),'skill index outside fusion skill pool');
  assert.equal(new Set(indices).size,3,'skill choices must be distinct');
  pet.equippedSkills=indices.map(index=>pool[index].id);
 }
 assert.ok(pet,`missing generated fusion ${fusion}`);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 p.gear.rightHand=rollGear('staffSword',200,'mythic',()=>.25);
 if(level===210)p.gear.rightHand.enhancement='SSS';
 if(bossCards)equipBossCards(p);
 if(survivalAffixes)prioritizeSurvivalAffix(p);
 const worker=new Worker(new URL('./offline-worker-node-entry.mjs',import.meta.url),
  {type:'module',workerData:{seed:Number(process.env.SPIRIT_SEED||9100+level+(job==='pactWarrior'?1:2))}});
 try{
  const result=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error(`timeout ${job} ${level} ${fusion}`)),90000);
   worker.on('message',m=>{
    if(m.type==='result'){clearTimeout(timeout);resolve(m.result);}
    else if(m.type==='error'){clearTimeout(timeout);reject(Error(m.stack||m.message));}
   });
   worker.on('error',error=>{clearTimeout(timeout);reject(error);});
   worker.postMessage({player:p,now:START+DURATION});
  });
  const summary=result.summary,targets=summary.spiritEnemyTargets||{},damage=summary.damage;
  assert.ok(summary.simulated>0&&summary.simulated<=DURATION);
  if(bossCards)assert.ok(Object.values(p.sockets).every(id=>!id||(CARDS[id]?.boss&&CARDS[id].map!=='dawnrift'&&CARDS[id].map!=='legacy')),'boss-card build must exclude Lv210 and unobtainable legacy cards');
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
    assert.ok(summary.guardian.waveHits>0,'active healing verdict must hit real enemies');
    assert.ok(summary.guardian.overheal>=0&&summary.guardian.effectiveHeal>=0);
    assert.ok(summary.guardian.waveDamage>0,'guardian must deal actual retaliatory damage');
    assert.ok(summary.guardian.waveHits>0&&summary.guardian.waveHits<=summary.guardian.triggers*3,'one wave may hit at most three foes');
   }
  }
  const bossCores=(result.player.bag.find(item=>item.id==='dawn_archon_core')?.qty||0)-(p.bag.find(item=>item.id==='dawn_archon_core')?.qty||0);
  return {job,level,fusion,build,equippedSkillIds:[...pet.equippedSkills],kills:summary.kills,simulatedSeconds:summary.simulated/1000,bossCores,bossesEncountered:summary.bossesEncountered||0,revives:summary.revives||0,spiritDefeats:summary.spiritDefeats||null,
   dps:Math.round(damage.total/(summary.simulated/1000)),
   ownerDps:Math.round(damage.player/(summary.simulated/1000)),petDps:Math.round((damage.pet1||0)/(summary.simulated/1000)),
   ownerHits:targets.owner||0,petHits:targets.pet1||0,
   potions:Object.values(summary.potions||{}).reduce((sum,n)=>sum+n,0),
   endedOwnerHp:result.player.hp,endedPetHp:result.player.pets[0].hp,
   guardian:summary.guardian||null,guardianConversion:summary.guardianConversion||null,
   magicAttunement:summary.magicAttunement||null,bulwarkAssault:summary.bulwarkAssault||null,
   petMain:summary.spiritPetMain||null,skillCasts:summary.skillCasts||{}};
 }finally{await worker.terminate();}
}

const rows=[];
for(const level of [200,210].filter(x=>!process.env.SPIRIT_LEVEL_FILTER||String(x)===process.env.SPIRIT_LEVEL_FILTER))for(const job of ['pactWarrior','spiritCommander'].filter(x=>!process.env.SPIRIT_JOB_FILTER||x===process.env.SPIRIT_JOB_FILTER)){
 for(const fusion of FUSION_TYPES.filter(x=>!process.env.SPIRIT_FUSION_FILTER||x===process.env.SPIRIT_FUSION_FILTER))for(const build of process.env.SPIRIT_BUILD_SWEEP==='1'?['physical','magical']:['baseline'])
  rows.push(await evaluate(job,level,fusion,build));
}
console.log(JSON.stringify({condition:`${DURATION/1000}s real Worker; single fusion pet; ${bossCards?'legal boss cards':'normal cards'}; ${survivalAffixes?'survival mythic specials':'original mythic specials'}; boss ${allowBoss?'enabled':'escaped'}; sigil0; skill slots ${process.env.SPIRIT_SKILL_INDEXES||'default'}`,rows},null,2));
