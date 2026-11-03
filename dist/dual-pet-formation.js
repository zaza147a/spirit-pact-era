// Dual companion roster adapter. This module is isolated until game.js gains
// a second independent combat lane. Existing jobs remain single-pet.
import {isSpiritJob} from './spirit-job-rules.js';

export const DUAL_PET_MODES = Object.freeze(['focus','split','guard']);
export const PACT_STANCES = Object.freeze(['assist','assimilate']);

export function activePetRoster(player) {
  if (!player || !Array.isArray(player.pets)) return [];
  const first = player.pets.find(p=>p.id===player.activePetId);
  if (!first) return [];
  const roster=[first];
  if (isSpiritJob(player.job)) {
    const second=player.pets.find(p=>p.id===player.secondaryPetId);
    if(second && second.id!==first.id) roster.push(second);
  }
  return roster;
}
export function normalizeDualPetState(player) {
  if (!player || !Array.isArray(player.pets)) return player;
  const validIds=new Set(player.pets.map(p=>p.id));
  if (!isSpiritJob(player.job)) {
    // Preserve unknown fields on non-spirit jobs, but never activate a second pet.
    return player;
  }
  if (!validIds.has(player.activePetId)) player.activePetId=null;
  if (!validIds.has(player.secondaryPetId) || player.secondaryPetId===player.activePetId)
    player.secondaryPetId=null;
  if (!DUAL_PET_MODES.includes(player.dualPetMode)) player.dualPetMode='focus';
  const stance=player.petStances&&typeof player.petStances==='object'?player.petStances:{};
  player.petStances=Object.fromEntries(activePetRoster(player).map(p=>[
    p.id, PACT_STANCES.includes(stance[p.id])?stance[p.id]:'assist'
  ]));
  return player;
}
export function canSetSecondaryPet(player,petId) {
  if(!isSpiritJob(player?.job)) return '只有御靈使職系能同時攜帶兩隻夥伴';
  if(petId===player.activePetId) return '同一隻夥伴不能同時佔兩個欄位';
  if(petId!==null && !player.pets?.some(p=>p.id===petId)) return '夥伴不存在';
  if(player.trialRun) return '試煉中無法更換夥伴';
  return null;
}
export function secondPetDamageFactor(player,petId,{overload=false}={}) {
  const roster=activePetRoster(player);
  if(!roster.some(p=>p.id===petId)) return 0;
  if(!isSpiritJob(player?.job)) return roster[0]?.id===petId?1:0;
  const isSecondary=roster[1]?.id===petId;
  if(player.job==='pactWarrior') {
    if(player.petStances?.[petId]==='assimilate') return 0;
    return isSecondary?.35:.50;
  }
  if(!isSecondary) return 1;
  if(player.job==='spiritCommander') return overload?1:.7;
  return .5;
}
