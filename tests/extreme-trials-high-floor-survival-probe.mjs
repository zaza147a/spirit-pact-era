// Diagnostic only: direct 50/70/100-floor combat is not proof of an entire
// 1-to-N clear, and these fixtures do not cover every legal defensive build.
// Usage: node tests/extreme-trials-high-floor-survival-probe.mjs [atk|matk|hp|clear] [shield]
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer,LEGACY_OPTIMAL_BUILD_NAMES} from './fixtures/legacy-optimal-player.mjs';
import {highLevelSpiritPlayer} from './fixtures/spirit-high-level-player.mjs';
import {canonicalFusionKey,FUSION_TYPES} from '../dist/spirit-job-rules.js';
import {equipExtremeBossCards} from './fixtures/extreme-boss-card-loadout.mjs';
import {rollGear} from '../dist/loot.js';

const kinds=['atk','matk','hp','clear'].filter(kind=>!process.argv[2]||kind===process.argv[2]);
const floors=[50,70,100];
const jobs=[...LEGACY_OPTIMAL_BUILD_NAMES,'pactWarrior','spiritCommander'];
const epoch=1000000;
const addShield=process.argv[3]==='shield';

function build(job){
 if(!['pactWarrior','spiritCommander'].includes(job))return legacyOptimalPlayer(job);
 const fusion='attack-magic',partner=FUSION_TYPES.find(key=>key!==fusion);
 const p=highLevelSpiritPlayer({level:210,job,pairKey:[fusion,partner].sort().join('+'),dawnSigil:0});
 p.dawnSigil=8;
 const pet=p.pets.find(item=>canonicalFusionKey(item)===fusion);
 p.pets=[pet];p.activePetId=pet.id;p.secondaryPetId=null;
 p.petStances={[pet.id]:job==='pactWarrior'?'assimilate':'assist'};
 return p;
}

for(const kind of kinds)for(const floor of floors)for(const job of jobs){
 const c=await runtime(),p=build(job);
 equipExtremeBossCards(p);
 p.level=210;p.thirdJob=true;p.location='dawnrift';
 p.extremeProgress={[kind]:{highest:floor-1}};
 p.extremeRun={kind,floor,startedAt:epoch,stageStartedAt:epoch,status:'active',stageDamage:0,stageKills:0};
 p.offline={at:epoch,enabled:true};
 c.api.setup(p);
 if(job==='pactWarrior'||job==='spiritCommander')for(const pet of p.pets){const stats=c.api.petStats(pet);pet.hp=stats.hp;pet.sp=stats.sp;}
 const weaponBefore=p.gear.rightHand?.id||null;
 const defBefore=c.api.stat('def'),mdefBefore=c.api.stat('mdef');
 const atkBefore=c.api.stat('atk'),matkBefore=c.api.stat('matk');
 if(addShield){
  // A legal unenhanced Lv200 mythic shield. Equip through actual game useItem,
  // including the two-handed weapon displacement and bag-space checks.
  p.bag.push(rollGear('shield',200,'mythic',()=>.5));
  c.api.useItem(p.bag.length-1);
 }
 c.api.clearStatSnapshots();
 const weaponAfter=p.gear.rightHand?.id||null;
 const defAfter=c.api.stat('def'),mdefAfter=c.api.stat('mdef');
 const atkAfter=c.api.stat('atk'),matkAfter=c.api.stat('matk');
 c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 try{
  const duration=kind==='atk'||kind==='matk'?20500:30500;
  const {player,summary}=await c.api.simulateOffline(p,epoch+duration);
  const cleared=(player.extremeProgress?.[kind]?.highest||0)>=floor;
  console.log(JSON.stringify({kind,floor,job,shield:addShield,weaponBefore,weaponAfter,
   defBefore,defAfter,mdefBefore,mdefAfter,atkBefore,atkAfter,matkBefore,matkAfter,
   cleared,elapsedMs:summary?.simulated||0,reason:summary?.reason||null}));
 }catch(error){console.log(JSON.stringify({kind,floor,job,error:String(error)}));}
}
