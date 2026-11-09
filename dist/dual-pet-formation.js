// Single-companion roster adapter. Legacy dual-pet save fields are migrated
// without deleting the benched pet or any of its equipment.
import {isSpiritJob} from './spirit-job-rules.js';

export const DUAL_PET_MODES = Object.freeze(['focus','split','guard']);
export const PACT_STANCES = Object.freeze(['assist','assimilate']);

export function activePetRoster(player) {
  if (!player || !Array.isArray(player.pets)) return [];
  const first = player.pets.find(p=>p.id===player.activePetId);
  if (!first) return [];
  return [first];
}
export function normalizeDualPetState(player) {
  if (!player || !Array.isArray(player.pets)) return player;
  const validIds=new Set(player.pets.map(p=>p.id));
  if (!validIds.has(player.activePetId)) player.activePetId=null;
  // A former second companion remains in player.pets, but is no longer active.
  player.secondaryPetId=null;
  if (!DUAL_PET_MODES.includes(player.dualPetMode)) player.dualPetMode='focus';
  const stance=player.petStances&&typeof player.petStances==='object'?player.petStances:{};
  player.petStances=Object.fromEntries(player.pets.map(p=>[
    p.id,player.job==='pactWarrior'?'assimilate':'assist'
  ]));
  return player;
}
export function canSetSecondaryPet(player,petId) {
  return '所有職業只能攜帶一隻出戰夥伴';
}
export function secondPetDamageFactor(player,petId,{overload=false}={}) {
  const roster=activePetRoster(player);
  if(!roster.some(p=>p.id===petId)) return 0;
  // Fixed pact assimilation suppresses *all* companion attack damage.
  return player?.job==='pactWarrior'?0:1;
}

// The equipment UI may target the second active companion only for spirit jobs.
// Other ten jobs must always compare and equip against their single active pet.
export function equipmentTargetPet(player,targetId=null) {
 const roster=activePetRoster(player);
 return roster.find(p=>p.id===targetId)||roster[0]||null;
}
