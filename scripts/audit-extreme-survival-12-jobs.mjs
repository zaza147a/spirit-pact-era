// Real offline combat, all 12 careers and both survival bosses, from floor 31.
// Usage: node scripts/audit-extreme-survival-12-jobs.mjs [job]
import {runtime} from '../tests/runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from '../tests/fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from '../tests/fixtures/spirit-high-level-player.mjs';
import {canonicalFusionKey,FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {equipExtremeBossCards} from '../tests/fixtures/extreme-boss-card-loadout.mjs';
import {affixRange,SPECIAL_AFFIXES} from '../dist/loot.js';

const epoch=1_000_000,day=86_400_000;
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander']
 .filter(job=>!process.argv[2]||job===process.argv[2]);
function legalCommanderSurvival(p){
 const apply=(item,keys,special,pet)=>{
  const affixes=Object.fromEntries(keys.map(key=>{
   const rolled=affixRange(key,item.tier,item.rarity,item.id)[1];
   return [key,pet&&!SPECIAL_AFFIXES.has(key)&&!['atk','matk'].includes(key)?Math.round(rolled*10/3):rolled];
  }));
  affixes[special]=affixRange(special,item.tier,item.rarity,item.id)[1];
  item.affixes=affixes;
 };
 for(const [slot,item] of Object.entries(p.gear)){
  if(item&&slot!=='rightHand'&&slot!=='leftHand')
   apply(item,['def','mdef','flee','VIT','INT'],'hpPct',false);
 }
 for(const pet of p.pets)for(const [slot,item] of Object.entries(pet.gear)){
  if(slot==='head')apply(item,['atk','hit','DEX','VIT','INT'],'damageReduction',true);
  if(slot==='body')apply(item,['hp','def','mdef','VIT','INT'],'hpPct',true);
  if(slot==='shoes')apply(item,['flee','hit','def','VIT','INT'],'hpPct',true);
 }
}
function fixture(job){
 if(!['pactWarrior','spiritCommander'].includes(job))return legacyOptimalPlayer(job);
 const fusion='attack-magic',partner=FUSION_TYPES.find(key=>key!==fusion);
 const p=highLevelSpiritPlayer({level:210,job,pairKey:[fusion,partner].sort().join('+'),dawnSigil:0});
 p.dawnSigil=8;
 const pet=p.pets.find(item=>canonicalFusionKey(item)===fusion);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 if(job==='spiritCommander')legalCommanderSurvival(p);
 return p;
}
for(const job of jobs)for(const kind of ['atk','matk']){
 const c=await runtime(),p=fixture(job);
 equipExtremeBossCards(p);
 p.level=210;p.thirdJob=true;p.location='dawnrift';
 p.extremeProgress={[kind]:{highest:30}};p.extremeCoins=450;
 p.extremeRun={kind,floor:31,startedAt:epoch,stageStartedAt:epoch,
  stageDamage:0,stageKills:0,status:'active'};
 p.offline={at:epoch,enabled:true};
 c.api.setup(p);
 if(['pactWarrior','spiritCommander'].includes(job))for(const pet of p.pets){
  const stats=c.api.petStats(pet);pet.hp=stats.hp;pet.sp=stats.sp;
 }
 c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 const started=performance.now();
 try{
  const {player,summary}=await c.api.simulateOffline(p,epoch+day);
  console.log(JSON.stringify({job,kind,highest:player.extremeProgress[kind].highest,
   failed:player.extremeLastResult?.floor||null,reason:summary?.reason||null,
   simulatedMs:summary?.simulated||0,elapsedMs:Math.round(performance.now()-started),
   coins:player.extremeCoins,stillActive:Boolean(player.extremeRun)}));
 }catch(error){console.log(JSON.stringify({job,kind,error:String(error)}));process.exitCode=1;}
}
