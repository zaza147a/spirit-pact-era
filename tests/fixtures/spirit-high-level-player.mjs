// Synthetic, deterministic progression-state fixture for integration testing.
// Not a player export or a DPS-optimal equipment prescription.
// Lv200 191-200 wilderness: no enhancement. Lv210 dawn: SSS equipment, sigil 0.
// The special Lv200 five-boss trial has its OWN enhancement benchmark.
import {starterPlayer} from './starter-player.mjs';
import {makePet,petStats,CARDS,SLOTS} from '../../dist/catalog.js';
import {fusePets} from '../../dist/pet-fusion.js';
import {rollGear,rollPetGear,GEAR_BASE,RARITIES} from '../../dist/loot.js';
import {allocationBudget} from '../../dist/growth-v5.js';
import {attributeCap} from '../../dist/adventure-progression.js';
import {SPIRIT_TRIAL_ID,DUAL_FUSION_TYPES} from '../../dist/spirit-job-rules.js';
import {cardAllowedInSlot} from '../../dist/card-effects.js';

function seeded(seed=0x1a2b3c4d){
 return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
export function highLevelSpiritPlayer({level=200,job='pactWarrior',pairKey='attack-magic+defense-support',allowBoss=false,dawnSigil=0,gearRarity='mythic'}={}){
 if(![200,210].includes(level)||!['pactWarrior','spiritCommander'].includes(job))
  throw Error('unsupported high-level spirit fixture');
 if(!DUAL_FUSION_TYPES.includes(pairKey))throw Error('invalid unordered dual fusion pairing');
 if(!RARITIES.some(r=>r.id===gearRarity))throw Error('invalid gear rarity');
 if(![0,4].includes(dawnSigil)||(dawnSigil!==0&&level!==210))throw Error('unsupported dawn farming stage');
 const rng=seeded(level+(job==='pactWarrior'?101:202)),p=starterPlayer();
 p.name='SpiritIntegrationFixture';p.job=job;p.level=level;p.reborn=true;p.thirdJob=true;
 p.dawnUnlocked=level>=210;p.dawnSigil=dawnSigil;p.autoEscapeBoss=!allowBoss;
 p.location=level>=210?'dawnrift':'worldroot';
 p.jobLevel=70;p.secondJobLevel=70;p.jobXp=0;p.jobPoints=0;p.xp=0;
 p.firstJobLevel=50;
 // Persist each stage's *legal* skill budget: 49 first, 69 second, 69 third.
 const first={spiritOrder:10,spiritPulse:10,spiritWard:10,spiritRecover:10,spiritBond:5,spiritSense:4};
 const second=job==='pactWarrior'
  ?{pactSlash:10,pactWave:10,pactGuard:10,pactBurst:10,pactTraining:5,pactSurvival:5}
  :{spiritCommand:10,spiritFocus:10,spiritShield:10,spiritSweep:10,commandFocus:5,commandSurvival:5};
 second['rebirthBuff_'+job]=10;second['rebirthMain_'+job]=9;
 const third={['thirdMain_'+job]:10,['thirdWide_'+job]:10,['thirdFinish_'+job]:10,
  ['thirdUtility_'+job]:10,['thirdStance_'+job]:9};
 for(let index=0;index<4;index++)third['thirdPassive'+index+'_'+job]=5;
 const points=loadout=>Object.values(loadout).reduce((a,b)=>a+b,0);
 if(points(first)!==49||points(second)!==69||points(third)!==69)throw Error('invalid job skill budget');
 p.jobSkills={...first,...second,...third};
 p.autoSkills={version:2,order:['thirdStance_'+job,'thirdUtility_'+job,
  'thirdWide_'+job,'thirdFinish_'+job,'thirdMain_'+job],disabled:[]};
 p.quests={[SPIRIT_TRIAL_ID]:{started:true,kills:24,done:true}};
 const allocated=job==='pactWarrior'
  ?level===210?{STR:150,VIT:120,AGI:100,DEX:70,LUK:3,INT:1}:{STR:120,VIT:120,AGI:100,DEX:78,LUK:5,INT:1}
  :level===210?{INT:150,VIT:120,DEX:100,LUK:70,AGI:3,STR:1}:{INT:120,VIT:120,DEX:100,LUK:78,AGI:5,STR:1};
 p.attributes=allocated;p.statPoints=0;
 const allocatedPoints=Object.values(allocated).reduce((sum,x)=>sum+x-1,0);
 if(allocatedPoints!==allocationBudget(level,true)||Math.max(...Object.values(allocated))>attributeCap(p))
  throw Error('illegal attribute allocation');
 p.location='skycity';
 const speciesByRole={attack:'fang',magic:'wisp',defense:'shell',support:'sprout'};
 const sourceSpecies=pairKey.split('+').flatMap(fusion=>fusion.split('-').map(role=>speciesByRole[role]));
 p.pets=sourceSpecies.map((species,index)=>{
  const pet=makePet(species);
  pet.id='fusion-source-'+index;pet.rarity='mythic';pet.ascended=true;pet.level=150;
  pet.iv={hp:2,atk:2,def:2,matk:2,sp:2,aspd:2};
  pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;
  return pet;
 });
 for(const [a,b] of [['fusion-source-0','fusion-source-1'],['fusion-source-2','fusion-source-3']]){
  const result=fusePets(p,a,b);
  if(result.error)throw Error('production fusion rejected fixture: '+result.error);
 }
 for(const pet of p.pets){
  pet.level=200;pet.xp=0;pet.hp=petStats(pet).hp;pet.sp=petStats(pet).sp;
  pet.gear=Object.fromEntries([['head','petHelm'],['body','petArmor'],['shoes','petBoots']].map(([slot,id],index)=>{
   const gear=rollPetGear(id,200,gearRarity,rng);
   gear.uid='fixture-'+pet.id+'-'+slot;
   // Lv200 wilderness baseline is unenhanced; Lv201+ expects SSS gear.
   if(level>=210)gear.enhancement='SSS';
   return [slot,gear];
  }));
 }
 p.activePetId=p.pets[0].id;p.secondaryPetId=p.pets[1].id;
 p.petStances=Object.fromEntries(p.pets.map(pet=>[pet.id,'assist']));
 for(const [slot,id] of [['headUpper','helm'],['headMiddle','visor'],['headLower','mask'],['armor','plate'],['rightHand','staffSword'],['leftHand','shield'],['garment','cloak'],['shoes','boots'],['accessory1','chip'],['accessory2','ring']]){
  if(GEAR_BASE[id].jobs&&!GEAR_BASE[id].jobs.includes(job))throw Error('illegal weapon '+id);
  const gear=rollGear(id,200,gearRarity,rng);
  gear.uid='fixture-player-'+slot;
  if(level>=210)gear.enhancement='SSS';
  p.gear[slot]=gear;
 }
 // Use ten obtainable normal 191-200 cards, each in its legal gear slot.
 // This is a complete, fixed card baseline, not an optimized card build.
 const candidates=Array.from({length:10},(_,i)=>'world_'+(191+i));
 for(const slot of Object.keys(SLOTS)){
  const id=candidates.find(id=>cardAllowedInSlot(CARDS[id],slot));
  if(!id)throw Error('no legal worldroot card for '+slot);
  p.sockets[slot]=id;
 }
 p.location=level>=210?'dawnrift':'worldroot';
 p.hp=999999;p.mp=999999;p.gold=50000000;
 p.bag=[{id:'red_large',qty:5000},{id:'blue_large',qty:5000}];
 p.autoPotions={playerHp:true,playerSp:true,petHp:true,petSp:true};
 p.autoRevive=true;p.autoSalvage=true;p.salvageInventory=true;
 p.keepRarity=true;p.salvageMaxRarity='mythic';p.keepTier=false;p.keepStat=false;
 return p;
}
