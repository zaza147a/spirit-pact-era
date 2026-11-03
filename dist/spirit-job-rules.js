// Experimental class rules. Not imported by production entry points.
// Keep every ordinary progression, equipment, combat and save rule in the
// existing game systems. Only dual-pet formation, fusion trial gating and
// conditional equipment-type weighting are unique to this class.
export const SPIRIT_JOB_IDS = Object.freeze({
  first: 'spiritist',
  warrior: 'pactWarrior',
  commander: 'spiritCommander'
});
export const SPIRIT_JOB_NAMES = Object.freeze({
  spiritist: '御靈使',
  pactWarrior: '靈契戰使',
  spiritCommander: '雙靈指揮官'
});
export const SPIRIT_ADVANCED_NAMES = Object.freeze({
  pactWarrior: '靈契戰將',
  spiritCommander: '雙靈統御者'
});
export const SPIRIT_THIRD_NAMES = Object.freeze({
  pactWarrior: '靈契君王',
  spiritCommander: '萬靈宗師'
});
export const SPIRIT_FIRST = SPIRIT_JOB_IDS.first;
export const SPIRIT_SECOND = Object.freeze([
  SPIRIT_JOB_IDS.warrior,
  SPIRIT_JOB_IDS.commander
]);
export const isSpiritJob = job => job === SPIRIT_FIRST || SPIRIT_SECOND.includes(job);

export const SPIRIT_TRIAL_ID = 'dual_spirit_pact';
export const PET_ROLES = Object.freeze(['attack','magic','defense','support']);
const roleIndex = role => PET_ROLES.indexOf(role);
export function canonicalFusionKey(pet) {
  // Accept current fusion key, role pair or explicit order array.
  const raw = pet?.fusionKey ?? pet?.fusionPair ?? pet?.fusionType
    ?? (Array.isArray(pet?.fusionRoles) ? pet.fusionRoles : null);
  const parts = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split('-') : [];
  if (parts.length !== 2 || parts[0] === parts[1] || parts.some(role => roleIndex(role) < 0)) return null;
  return [...parts].sort((a,b) => roleIndex(a) - roleIndex(b)).join('-');
}
export function canonicalDualFusionKey(first,second) {
  const a = canonicalFusionKey(first), b = canonicalFusionKey(second);
  if (!a || !b) return null;
  return [a,b].sort().join('+');
}
export const FUSION_TYPES = Object.freeze(
  PET_ROLES.flatMap((a,i) => PET_ROLES.slice(i+1).map(b => `${a}-${b}`))
);
export const DUAL_FUSION_TYPES = Object.freeze(
  FUSION_TYPES.flatMap((a,i) => FUSION_TYPES.slice(i).map(b => [a,b].sort().join('+')))
);

// This predicate is an *additional* class condition only. Always run the
// existing thirdJobError() first, retaining town, level, job, rebirth and seal.
export function spiritThirdJobExtraError(player,firstPet,secondPet) {
  if (!SPIRIT_SECOND.includes(player?.job)) return null;
  if (!canonicalDualFusionKey(firstPet,secondPet)) return '三轉需要同時攜帶兩隻融合夥伴';
  if (player?.quests?.[SPIRIT_TRIAL_ID]?.done !== true) return '尚未通過雙生靈契試煉';
  return null;
}

// Only choose the equipment *kind* AFTER the existing equipment-drop
// eligibility event has succeeded. Never modify rarity, quantity or boss loot.
export function spiritEquipmentSplit(job,advancedSecond=false) {
  if (!isSpiritJob(job)) return Object.freeze({character:0.9,pet:0.1});
  const advanced = SPIRIT_SECOND.includes(job) && advancedSecond === true;
  return Object.freeze(advanced ? {character:0.7,pet:0.3} : {character:0.8,pet:0.2});
}
export function chooseEquipmentKind(job,advancedSecond=false,rng=Math.random) {
  const split = spiritEquipmentSplit(job,advancedSecond);
  return Number(rng()) < split.character ? 'character' : 'pet';
}
// Standalone normal-enemy compatibility calculator. This reproduces the
// current 20%-base total equipment gate while changing its conditional kind.
// The production adapter must use the SAME RNG order and same bonus cap.
export function spiritNormalEquipmentDrop(job,advancedSecond=false,lootBonus=0,rng=Math.random) {
  const boost = Math.max(0,Math.min(4,1+(Number(lootBonus)||0)/100));
  const roll = Number(rng());
  const split = spiritEquipmentSplit(job,advancedSecond);
  const total = 0.2*boost;
  return roll < total*split.character ? 'character' : roll < total ? 'pet' : null;
}
export const SPIRIT_DAMAGE_BASELINES = Object.freeze({
  firstSecondary:0.50,
  commanderSecondary:0.70,
  commanderOverloadSecondary:1.00,
  commanderOverloadDurationMs:10000,
  commanderOverloadCooldownMs:60000,
  warriorCooperativePrimary:0.50,
  warriorCooperativeSecondary:0.35
});
// The above numbers are initial simulation inputs, NOT verified final balance.
