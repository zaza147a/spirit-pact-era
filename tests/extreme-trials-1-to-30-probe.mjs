// Repeatable end-to-end combat diagnostic. This is not a balancing assertion:
// one fixture build failing does not prove the profession has no legal clear.
// Usage: node tests/extreme-trials-1-to-30-probe.mjs [kind] [job] [fusion]
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from './fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {canonicalFusionKey,FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {beginExtremeRun} from '../dist/extreme-trials.js';
import {equipExtremeBossCards} from './fixtures/extreme-boss-card-loadout.mjs';

const start=1000000;
const kinds=['atk','matk','hp','clear'].filter(k=>!process.argv[2]||process.argv[2]===k);
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'].filter(j=>!process.argv[3]||process.argv[3]===j);

function createBuild(job){
 if(!['pactWarrior','spiritCommander'].includes(job))return legacyOptimalPlayer(job);
 const fusion=process.argv[4]||'attack-magic',partner=FUSION_TYPES.find(k=>k!==fusion);
 if(!FUSION_TYPES.includes(fusion))throw Error('無效融合寵 '+fusion);
 const p=highLevelSpiritPlayer({level:210,job,pairKey:[fusion,partner].sort().join('+'),dawnSigil:0});
 p.dawnSigil=8;
 const pet=p.pets.find(item=>canonicalFusionKey(item)===fusion);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 return p;
}

for(const kind of kinds)for(const job of jobs){
 const c=await runtime(),p=createBuild(job);
 equipExtremeBossCards(p);
 p.location='dawncity';p.extremeProgress={};p.extremeCoins=0;
 const entry=beginExtremeRun(p,kind,1,start);
 if(entry.error){console.log(JSON.stringify({kind,job,error:entry.error}));continue;}
 p.extremeRun=entry.run;p.location='dawnrift';p.offline={at:start,enabled:true};
 c.api.setup(p);
 if(job==='pactWarrior'||job==='spiritCommander')for(const pet of p.pets){const s=c.api.petStats(pet);pet.hp=s.hp;pet.sp=s.sp;}
 c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 const duration=(kind==='atk'||kind==='matk'?20:30)*30*1000;
 try{
  const {player,summary}=await c.api.simulateOffline(p,start+duration);
  const highest=player.extremeProgress?.[kind]?.highest||0;
  console.log(JSON.stringify({kind,job,highest,cleared30:highest>=30,
   runFloor:player.extremeRun?.floor||null,simulatedMs:summary?.simulated||0,
   extremeCoins:player.extremeCoins||0,reason:summary?.reason||null}));
 }catch(error){console.log(JSON.stringify({kind,job,error:String(error)}));}
}
