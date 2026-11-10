import {petLevelCap,LOYALTY_MAX,LOYALTY_PER_POINT,BOSS_LOYALTY_CHANCE,normalizeLoyalty} from './pet-ascension.js';

export const TRAINING_LEVEL=210;
export const TRAINING_SIGIL=8;

export function trainingUnlocked(owner){return Number(owner?.level)>=TRAINING_LEVEL&&Number(owner?.dawnSigil)>=TRAINING_SIGIL;}

export function trainingPet(owner){
 if(!trainingUnlocked(owner)||typeof owner?.trainingPetId!=='string')return null;
 if(!owner.pets?.some(p=>p.id===owner.activePetId&&p.hp>0))return null;
 const pet=owner.pets?.find(p=>p.id===owner.trainingPetId);
 return pet&&pet.id!==owner.activePetId&&pet.id!==owner.secondaryPetId&&pet.hp>0&&pet.level<200?pet:null;
}

export function normalizeTraining(owner){
 if(!trainingUnlocked(owner)||!owner.pets?.some(p=>p.id===owner.trainingPetId&&p.id!==owner.activePetId&&p.id!==owner.secondaryPetId&&p.hp>0&&p.level<200))owner.trainingPetId=null;
 return owner.trainingPetId;
}

export function trainingRate(level){return level<=150?2:level<=180?1.5:1;}

// Independent, passive progression. No level-gap penalty, damage or active-roster change.
export function awardTrainingProgress(owner,defeated,{trial=false,rng=Math.random,experienceNeed,stats}={}){
 const pet=trainingPet(owner);
 if(!pet||trial||!defeated||typeof experienceNeed!=='function'||typeof stats!=='function')return {xp:0,loyalty:0,levels:0};
 normalizeLoyalty(pet);
 const beforeLoyalty=pet.loyalty;
 if(pet.loyalty<LOYALTY_MAX){
  pet.loyaltyKills++;
  if(pet.loyaltyKills>=LOYALTY_PER_POINT){pet.loyaltyKills=0;pet.loyalty++;}
  if(defeated.boss&&pet.loyalty<LOYALTY_MAX&&rng()<BOSS_LOYALTY_CHANCE)pet.loyalty++;
  if(pet.loyalty>=LOYALTY_MAX){pet.loyalty=LOYALTY_MAX;pet.loyaltyKills=0;}
 }
 const cap=petLevelCap(pet,owner.reborn);
 const gained=pet.level<cap?Math.floor(Math.max(0,Number(defeated.xp)||0)*trainingRate(pet.level)):0;
 let levels=0;
 pet.xp+=gained;
 while(pet.level<cap&&pet.xp>=experienceNeed(pet)){
  pet.xp-=experienceNeed(pet);pet.level++;levels++;
  const newStats=stats(pet);pet.hp=newStats.hp;pet.sp=newStats.sp;
 }
 if(pet.level>=cap)pet.xp=0;
 return {xp:gained,loyalty:pet.loyalty-beforeLoyalty,levels};
}
