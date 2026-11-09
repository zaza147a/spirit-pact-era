// Diagnostic, not a pass/fail balance gate: exercise actual stage-30 combat
// against the currently checked-in fixture builds, without granting stages 1–29.
// Usage: node tests/extreme-trials-class-30-probe.mjs [atk|matk|hp|clear] [job] [fusion]
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from './fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {canonicalFusionKey,FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {equipExtremeBossCards} from './fixtures/extreme-boss-card-loadout.mjs';
import {CARDS} from '../dist/catalog.js';
import {bossCardEquipAllowed} from '../dist/boss-card-runtime.js';
import {equipPactMagicLoadout} from './fixtures/extreme-pact-magic-loadout.mjs';

const epoch=1000000;
const kinds=['atk','matk','hp','clear'].filter(kind=>!process.argv[2]||process.argv[2]===kind);
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'].filter(job=>!process.argv[3]||process.argv[3]===job);

function build(job){
 if(!['pactWarrior','spiritCommander'].includes(job))return legacyOptimalPlayer(job);
 const fusion=process.argv[4]||'attack-magic';
 if(!FUSION_TYPES.includes(fusion))throw Error(`unknown fusion ${fusion}`);
 const partner=FUSION_TYPES.find(key=>key!==fusion);
 const p=highLevelSpiritPlayer({level:210,job,pairKey:[fusion,partner].sort().join('+'),dawnSigil:0});
 p.dawnSigil=8; // The actual endgame target; fixture builder only exposes 0/4.
 const pet=p.pets.find(item=>canonicalFusionKey(item)===fusion);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 if(job==='pactWarrior'&&process.argv[6]==='magic-build')equipPactMagicLoadout(p);
 return p;
}

for(const kind of kinds)for(const job of jobs){
 const c=await runtime(),p=build(job);
 // Compare legal saves with the strongest actual auto-cast priority. Do not
 // overwrite the user's checked-in save: this is an in-memory combat setting.
 if(process.env.EXTREME_LEGACY_ROTATION!=='1'&&p.autoSkills?.order){
  const priority=id=>id.startsWith('thirdFinish_')?0:id.startsWith('thirdWide_')?1:id.startsWith('thirdMain_')?2:-1;
  p.autoSkills.order.sort((a,b)=>priority(a)-priority(b));
 }
 equipExtremeBossCards(p);
 const weaponCard=process.argv[5];
 if(weaponCard){
  if(!CARDS[weaponCard]?.boss||!bossCardEquipAllowed(CARDS[weaponCard],'rightHand',job))throw Error(`illegal weapon boss card ${weaponCard}`);
  p.sockets.rightHand=weaponCard;
 }
 p.level=210;p.thirdJob=true;p.location='dawnrift';
 p.extremeProgress={[kind]:{highest:29}};
 p.extremeRun={kind,floor:30,startedAt:epoch,stageStartedAt:epoch,status:'active',stageDamage:0,stageKills:0};
 p.offline={at:epoch,enabled:true};
 c.api.setup(p);
 if(job==='pactWarrior'||job==='spiritCommander')for(const pet of p.pets){const stats=c.api.petStats(pet);pet.hp=stats.hp;pet.sp=stats.sp;}
 c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 const duration=kind==='atk'||kind==='matk'?20500:kind==='clear'&&process.env.EXTREME_CLEAR_KILLS_SNAPSHOT==='1'?29900:30500;
 try{
  const {player,summary}=await c.api.simulateOffline(p,epoch+duration);
  console.log(JSON.stringify({kind,job,weaponCard:p.sockets.rightHand,fusion:job==='pactWarrior'||job==='spiritCommander'?(process.argv[4]||'attack-magic'):null,cleared:(player.extremeProgress?.[kind]?.highest||0)>=30,
   highest:player.extremeProgress?.[kind]?.highest||0,next:player.extremeRun?.floor||null,
   durationMs:summary?.simulated||0,reason:summary?.reason||null,
   damage:summary?.damage?.total||0,...(kind==='clear'&&process.env.EXTREME_CLEAR_KILLS_SNAPSHOT==='1'?{stageKills:player.extremeRun?.stageKills??null}:{})}));
 }catch(error){console.log(JSON.stringify({kind,job,error:String(error)}));}
}
