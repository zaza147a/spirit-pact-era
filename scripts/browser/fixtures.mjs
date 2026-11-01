import {runBuild} from '../balance-v24.mjs';
import {TRUE_FORMS} from '../../dist/pet-true-form.js';
import {reconcileHumanoidStages} from '../../dist/pet-humanoid-evolution.js';
export function browserFixtures(){
 const pairs=Object.keys(TRUE_FORMS),ranks=['S','SS','SSS','A'];
 return ranks.map((rank,slot)=>{
  let owner;
  const pets=(slot===3?pairs.slice(0,1):pairs).map(pair=>{
   const p=runBuild('knight',pair.split('-')[0],{level:200,gearLevel:190,seconds:0,scenario:'regional',reborn:true,thirdJob:true,
    referenceBuild:true,referenceQuality:'mythic',rarity:'mythic',fusionPair:pair,enhancement:'SSS',petEnhancement:rank,fixture:true}).fixture;
   owner ||= p;const pet=p.pets[0];pet.id=`qa-${slot}-${pair}`;pet.nickname=`QA-${pair}`;pet.loyalty=500;pet.trueForm=slot!==3;
   reconcileHumanoidStages(pet);return pet;
  });
  owner.name=`QA-${rank}`;owner.pets=pets;owner.activePetId=pets[0].id;owner.location='skycity';owner.manualPaused=true;
  owner.offline={at:Date.now(),enabled:false};owner.dawnNotified=true;
  owner.bag=[{id:'red_large',qty:50},{id:'blue_large',qty:50},...['S','SS','SSS'].map(r=>({id:'rank_core_'+r,qty:3}))];
  return {version:2,player:owner};
 });
}
