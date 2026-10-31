// Eligibility is migrated once from a pre-release save. The cutoff is determined
// by save schema version, not by a client-side clock.
export const FUSION_RESELECT_COMPENSATION_VERSION=51;
export const FUSION_RESELECT_MAX=10;
export const RESELECT_ORDERED_TYPES=['attack-magic','attack-defense','attack-support','magic-attack','magic-defense','magic-support','defense-attack','defense-magic','defense-support','support-attack','support-magic','support-defense'];
export function migrateLegacyReselect(player){
 const legacy=Number(player?.version||0)<FUSION_RESELECT_COMPENSATION_VERSION;
 for(const pet of player?.pets||[]){
  if(pet.fusionReselectMigrated)continue;
  pet.fusionReselectRemaining=legacy&&pet.fusion&&pet.level>=200?FUSION_RESELECT_MAX:0;
  pet.fusionReselectMigrated=true;
 }
 return player;
}
export function reselectionError(player,pet,key){
 if(!pet||!player?.pets?.includes(pet))return '找不到夥伴';
 if(!['town','skycity','dawncity'].includes(player.location))return '請回村莊重選融合類型';
 if(!pet.fusion||pet.level<200)return '只有舊版200等融合夥伴可重選';
 if((pet.fusionReselectRemaining||0)<=0)return '重選次數已用完';
 if(!RESELECT_ORDERED_TYPES.includes(key))return '無效融合型態';
 if(key===pet.fusion.main+'-'+pet.fusion.sub)return '已是目前融合類型';
 return null;
}
export function reselectionPet(player,pet,key,defaultSkills){
 const error=reselectionError(player,pet,key);if(error)return {error};
 const [main,sub]=key.split('-');const old=pet.fusion;
 pet.fusion={...old,main,sub};
 pet.equippedSkills=defaultSkills?.(pet)||[];
 pet.fusionReselectRemaining--;
 return {remaining:pet.fusionReselectRemaining,from:old.main+'-'+old.sub,to:key};
}
