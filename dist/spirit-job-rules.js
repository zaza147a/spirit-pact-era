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

// Keep the legacy quest key so existing quest progress survives migration.
export const SPIRIT_TRIAL_ID = 'dual_spirit_pact';
export const PET_ROLES = Object.freeze(['attack','magic','defense','support']);
const roleIndex = role => PET_ROLES.indexOf(role);
export function canonicalFusionKey(pet) {
  // Accept current fusion key, role pair or explicit order array.
  const raw = pet?.fusion?.main && pet?.fusion?.sub
    ? [pet.fusion.main,pet.fusion.sub]
    : pet?.fusionKey ?? pet?.fusionPair ?? pet?.fusionType
      ?? (Array.isArray(pet?.fusionRoles) ? pet.fusionRoles : null);
  const parts = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split('-') : [];
  if (parts.length !== 2 || parts[0] === parts[1] || parts.some(role => roleIndex(role) < 0)) return null;
  return [...parts].sort((a,b) => roleIndex(a) - roleIndex(b)).join('-');
}
export function canonicalDualFusionKey(first,second) {
  const a = canonicalFusionKey(first), b = canonicalFusionKey(second);
  if (!a || !b || a === b) return null;
  return [a,b].sort().join('+');
}
export const FUSION_TYPES = Object.freeze(
  PET_ROLES.flatMap((a,i) => PET_ROLES.slice(i+1).map(b => `${a}-${b}`))
);
export const DUAL_FUSION_TYPES = Object.freeze(
  FUSION_TYPES.flatMap((a,i) => FUSION_TYPES.slice(i+1).map(b => [a,b].sort().join('+')))
);

// This predicate is an *additional* class condition only. Always run the
// existing thirdJobError() first, retaining town, level, job, rebirth and seal.
export function spiritThirdJobExtraError(player,firstPet,secondPet) {
  if (!SPIRIT_SECOND.includes(player?.job)) return null;
  if (!canonicalFusionKey(firstPet)) return '三轉需要一隻出戰融合夥伴';
  if (player?.quests?.[SPIRIT_TRIAL_ID]?.done !== true) return '尚未通過單靈誓約試煉';
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

export const SPIRIT_TRIAL_KILLS = 24;
export function spiritQuestState(player) {
 return player?.quests?.[SPIRIT_TRIAL_ID]||null;
}
export function startSpiritQuest(player,roster) {
 if(!SPIRIT_SECOND.includes(player?.job))return '僅御靈使二轉職業可接受單靈誓約';
 if(!player.reborn||player.level<140)return '需轉生後達到 Base Lv.140';
 if(player.location!=='skycity')return '請前往蒼穹樞城';
 if(!canonicalFusionKey(roster?.[0]))return '需要一隻出戰融合夥伴';
 player.quests??={};
 if(!player.quests[SPIRIT_TRIAL_ID])player.quests[SPIRIT_TRIAL_ID]={started:true,kills:0,done:false};
 return null;
}
export function recordSpiritQuestVictory(player,roster,defeated) {
 const q=spiritQuestState(player);
 if(!SPIRIT_SECOND.includes(player?.job)||!q?.started||q.done)return false;
 if(!defeated||!Number.isFinite(defeated.level)||defeated.level<101||defeated.level>150)return false;
 if(!canonicalFusionKey(roster?.[0])||roster[0].hp<=0)return false;
 q.kills=Math.min(SPIRIT_TRIAL_KILLS,Math.max(0,Math.floor(q.kills||0))+1);
 return true;
}
export function completeSpiritQuest(player,roster) {
 const q=spiritQuestState(player);
 if(!q?.started||q.done)return q?.done?null:'尚未接受單靈誓約試煉';
 if(player.location!=='skycity')return '必須回蒼穹樞城立下單靈誓約';
 if(!canonicalFusionKey(roster?.[0]))return '完成誓約仍需一隻出戰融合夥伴';
 if((q.kills||0)<SPIRIT_TRIAL_KILLS)return `與融合夥伴戰勝101–150級敵人 ${q.kills||0}／${SPIRIT_TRIAL_KILLS}`;
 q.done=true;q.completedAt=Date.now();
 return null;
}

export function spiritGrowthGuide(player,roster=[]) {
 if(!isSpiritJob(player?.job))return null;
 const fused=roster.filter(p=>canonicalFusionKey(p)).length;
 const q=spiritQuestState(player);
 if(player.thirdJob)return {stage:'完成三轉',message:'單靈誓約已覺醒；可繼續培養出戰融合夥伴的專屬共鳴。',fused};
 if(q?.done)return {stage:'三轉準備完成',message:'已完成單靈誓約；保持一隻融合夥伴出戰，準備 Base150／轉生二轉Job70 和天極覺醒聖印。',fused};
 if(q?.started)return {stage:'單靈試煉進行中',message:`與一隻存活的融合夥伴擊敗101–150級敵人：${q.kills||0}／${SPIRIT_TRIAL_KILLS}。完成後回蒼穹樞城立誓。`,fused};
 if(player.level>=140&&player.reborn&&SPIRIT_SECOND.includes(player.job))return {stage:'單靈誓約即將開啟',message:`已可在蒼穹樞城接受專屬三轉支線。當前出戰融合夥伴 ${fused}／1；三轉需要一隻出戰融合夥伴。`,fused};
 if(player.reborn||player.level>=99)return {stage:'長期養成：單融合準備',message:`請提前培養一隻融合夥伴。當前出戰融合夥伴 ${fused}／1；Base140起可準備單靈誓約支線。`,fused};
 return {stage:'御靈使職業預告',message:'御靈使與其他職業相同，只攜帶一隻出戰夥伴；三轉前須取得融合夥伴並完成單靈誓約試煉。',fused};
}
