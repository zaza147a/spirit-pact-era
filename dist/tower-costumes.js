// Purely cosmetic floor-30 rewards. Never included in combat/equipment stats.
export const TOWER_FROST_JOBS=Object.freeze(['crusader','knight','wizard','sage','assassin','rogue','priest','monk','hunter','performer','pactWarrior','spiritCommander']);

export function towerFrostUnlocked(character){
 return !!character?.thirdJob&&TOWER_FROST_JOBS.includes(character.job)
  &&Number(character.towerProgress?.highest)>=30;
}

export function normalizeTowerCostume(character){
 const selection=character?.towerCostume==='frost'&&towerFrostUnlocked(character)
  &&!character.selectedOutfit&&!character.cosmeticOutfit?'frost':null;
 if(character)character.towerCostume=selection;
 return selection;
}

export function towerFrostArt(job){
 return TOWER_FROST_JOBS.includes(job)?`assets/tower/outfit-${job}-frost.webp?v=tower-costume-1`:null;
}

export function chooseTowerCostume(character,selection){
 if(!character)return false;
 if(selection!=='frost'&&selection!==null)return false;
 if(selection==='frost'&&!towerFrostUnlocked(character))return false;
 character.towerCostume=selection;
 if(selection==='frost'){
  character.selectedOutfit=null;
  character.cosmeticOutfit=null;
 }
 return true;
}
