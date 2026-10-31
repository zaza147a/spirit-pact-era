// Permanent humanoid evolution stages, separate from the loyalty true-form reveal.
// This module is safe to import in old saves; it does not retroactively grant stages.
export const HUMANOID_STAGES=Object.freeze([
  Object.freeze({rank:null,stage:0,label:'幼年期人形'}),
  Object.freeze({rank:'S',stage:1,label:'成長期人形'}),
  Object.freeze({rank:'SS',stage:2,label:'成熟期人形'}),
  Object.freeze({rank:'SSS',stage:3,label:'高階人形'})
]);
const ORDER=['D','C','B','A','S','SS','SSS'];
const SLOTS=['head','body','shoes'];
export const humanoidStage=pet=>Math.max(0,Math.min(3,Math.floor(Number(pet?.humanoidStage)||0)));
export function humanoidEligible(pet){
  return Boolean(pet?.fusion&&pet.trueForm===true);
}
export function humanoidEquipmentRank(pet){
  if(!humanoidEligible(pet))return null;
  // All three equipped pet pieces must have a real upgrade rank.
  const pieces=SLOTS.map(slot=>pet.gear?.[slot]);
  if(pieces.some(piece=>!piece||!ORDER.includes(piece.enhancement)))return null;
  const min=Math.min(...pieces.map(piece=>ORDER.indexOf(piece.enhancement)));
  return ORDER[min];
}
export function nextHumanoidStage(pet){
  const current=humanoidStage(pet),rank=humanoidEquipmentRank(pet);
  if(!rank||current===3)return current;
  const max=rank==='SSS'?3:rank==='SS'?2:rank==='S'?1:0;
  return Math.min(max,current+1);
}
// Call only on a saved gameplay upgrade/equip event, never from save normalization.
// One stage per invocation; advancement cannot be undone by unequipping.
export function advanceHumanoidEvolution(pet){
  const before=humanoidStage(pet),after=nextHumanoidStage(pet);
  if(after===before)return {changed:false,stage:before};
  pet.humanoidStage=after;
  return {changed:true,stage:after,label:HUMANOID_STAGES[after].label};
}
export function humanoidFormName(pet,juvenileName){
  const stage=humanoidStage(pet);
  return stage&&humanoidEligible(pet)?`${juvenileName}・${HUMANOID_STAGES[stage].label}`:juvenileName;
}

/** Advance each intermediate stage in order to reconcile pre-upgraded equipment. */
export function reconcileHumanoidStages(pet){
 const previous=humanoidStage(pet),unlocked=[];
 for(let i=0;i<3;i++){const result=advanceHumanoidEvolution(pet);if(!result.changed)break;unlocked.push(result);}
 return {changed:unlocked.length>0,from:previous,stage:humanoidStage(pet),unlocked};
}
