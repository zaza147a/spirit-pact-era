// Experimental deterministic scheduler for two pet actors.
// Actual damage and skills remain owned by the existing combat engine.
// This returns due actions; callers commit a timestamp only after acting.
import {activePetRoster} from './dual-pet-formation.js';
export function nextDualPetActions(player,now,attackIntervalMs,clock={}) {
  const actions=[];
  for(const pet of activePetRoster(player)){
    if((pet.hp||0)<=0)continue;
    const interval=Math.max(80,Math.ceil(Number(attackIntervalMs(pet))||140));
    const last=Number(clock[pet.id]?.attackAt)||0;
    if(now-last>=interval)actions.push({petId:pet.id,kind:'attack',at:now,interval});
  }
  return actions;
}
export function recordDualPetAction(clock,petId,kind,now) {
  if(typeof petId!=='string'||!Number.isFinite(now))return clock;
  const entry=clock[petId]||{};
  clock[petId]={...entry,[kind==='attack'?'attackAt':'abilityAt']:now};
  return clock;
}
export function clearInactivePetTimers(clock,player) {
  const active=new Set(activePetRoster(player).map(p=>p.id));
  for(const key of Object.keys(clock))if(!active.has(key))delete clock[key];
  return clock;
}
export function dualPetRegen(player,regenByPet) {
  for(const pet of activePetRoster(player)){
    if(pet.hp<=0)continue;
    const regen=Math.max(0,Math.floor(Number(regenByPet(pet))||0));
    const cap=Math.max(0,Number(pet.maxSp)||Number(pet.sp)||0);
    pet.sp=Math.min(cap,(Number(pet.sp)||0)+regen);
  }
  return player;
}
