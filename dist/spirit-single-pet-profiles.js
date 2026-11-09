// Single-companion spirit attack identities. Values describe mechanics only;
// numerical damage multipliers are assigned after live battle verification.
import {canonicalFusionKey} from './spirit-job-rules.js';

export const SPIRIT_BASE_PROFILES=Object.freeze({
 attack:{pact:{name:'裂魂斬',kind:'physical',trigger:'ownerHit',effect:'armorBreak'},commander:{name:'獵魂突襲',kind:'physical',trigger:'petHit',effect:'markedChase'}},
 magic:{pact:{name:'星紋刃',kind:'magic',trigger:'ownerSkill',effect:'elementMark'},commander:{name:'祕能脈衝',kind:'magic',trigger:'petSkill',effect:'arcaneCharge'}},
 defense:{pact:{name:'鎧魂擊',kind:'physical',trigger:'ownerDamaged',effect:'retaliation'},commander:{name:'盾靈反擊',kind:'physical',trigger:'petDamaged',effect:'guardCounter'}},
 support:{pact:{name:'誓約刃',kind:'physical',trigger:'ownerCombo',effect:'selfSustain'},commander:{name:'祈令追擊',kind:'magic',trigger:'petSkill',effect:'supportCycle'}}
});
export const SPIRIT_FUSION_PROFILES=Object.freeze({
 'attack-magic':{pact:{name:'雙極王刃',kind:'hybrid',trigger:'ownerAlternatingHit',effect:'dualPolarity'},commander:{name:'雙相靈擊',kind:'hybrid',trigger:'petAlternatingHit',effect:'dualElement'}},
 'attack-defense':{pact:{name:'霸鎧斷魂',kind:'physical',trigger:'ownerDamaged',effect:'armorBurst'},commander:{name:'鋼牙突圍',kind:'physical',trigger:'petGuard',effect:'armorPierce'}},
 'attack-support':{pact:{name:'戰誓連斬',kind:'physical',trigger:'ownerKill',effect:'chainSlash'},commander:{name:'靈獵連攜',kind:'physical',trigger:'ownerMark',effect:'petChase'}},
 'magic-defense':{pact:{name:'玄盾咒刃',kind:'magic',trigger:'ownerShieldLost',effect:'arcaneCounter'},commander:{name:'法盾震盪',kind:'magic',trigger:'petShieldLost',effect:'arcaneRetaliation'}},
 'magic-support':{pact:{name:'星環裁決',kind:'magic',trigger:'ownerCastCycle',effect:'castHaste'},commander:{name:'星術奔流',kind:'magic',trigger:'petCastCycle',effect:'petCooldown'}},
 'defense-support':{pact:{name:'永誓聖裁',kind:'hybrid',trigger:'ownerLowHp',effect:'oathBurst'},commander:{name:'生命聖裁',kind:'hybrid',trigger:'petHit',effect:'guardianVerdict'}}
});

export function spiritSinglePetProfile(player,pet){
 const role=player?.job==='pactWarrior'?'pact':player?.job==='spiritCommander'?'commander':null;
 if(!role||!pet)return null;
 const fused=canonicalFusionKey(pet);
 if(player.thirdJob){
  if(!fused)return null; // No non-fusion third-job resonance path.
  return {...SPIRIT_FUSION_PROFILES[fused]?.[role],fusion:fused,source:role==='pact'?'owner':'pet',stage:'third'};
 }
 if(fused) {
  // Before third job, a fused pet still uses the leading base role's resonance.
  const first=fused.split('-')[0];
  return {...SPIRIT_BASE_PROFILES[first][role],baseRole:first,source:role==='pact'?'owner':'pet',stage:'second'};
 }
 const base=pet.role||({fang:'attack',wisp:'magic',shell:'defense',sprout:'support'})[pet.species];
 const profile=SPIRIT_BASE_PROFILES[base]?.[role];
 return profile?{...profile,baseRole:base,source:role==='pact'?'owner':'pet',stage:'second'}:null;
}
