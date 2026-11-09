// Diagnostic, not a pass/fail balance gate: exercise actual stage-30 combat
// against the currently checked-in fixture builds, without granting stages 1–29.
// Usage: node tests/extreme-trials-class-30-probe.mjs [atk|matk|hp|clear] [job]
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from './fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {canonicalFusionKey} from '../dist/spirit-job-rules.js';

const epoch=1000000;
const kinds=['atk','matk','hp','clear'].filter(kind=>!process.argv[2]||process.argv[2]===kind);
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'].filter(job=>!process.argv[3]||process.argv[3]===job);

function build(job){
 if(!['pactWarrior','spiritCommander'].includes(job))return legacyOptimalPlayer(job);
 const p=highLevelSpiritPlayer({level:210,job,pairKey:'attack-magic+defense-support',dawnSigil:0});
 p.dawnSigil=8; // The actual endgame target; fixture builder only exposes 0/4.
 const pet=p.pets.find(item=>canonicalFusionKey(item)==='attack-magic');
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 return p;
}

for(const kind of kinds)for(const job of jobs){
 const c=await runtime(),p=build(job);
 p.level=210;p.thirdJob=true;p.location='dawnrift';
 p.extremeProgress={[kind]:{highest:29}};
 p.extremeRun={kind,floor:30,startedAt:epoch,stageStartedAt:epoch,status:'active',stageDamage:0,stageKills:0};
 p.offline={at:epoch,enabled:true};
 c.api.setup(p);c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 const duration=kind==='atk'||kind==='matk'?20500:30500;
 try{
  const {player,summary}=await c.api.simulateOffline(p,epoch+duration);
  console.log(JSON.stringify({kind,job,cleared:(player.extremeProgress?.[kind]?.highest||0)>=30,
   highest:player.extremeProgress?.[kind]?.highest||0,next:player.extremeRun?.floor||null,
   durationMs:summary?.simulated||0,reason:summary?.reason||null,
   damage:summary?.damage?.total||0}));
 }catch(error){console.log(JSON.stringify({kind,job,error:String(error)}));}
}
