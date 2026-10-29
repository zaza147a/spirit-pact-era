import {RARITIES,gearTier} from './loot.js';
export const SALVAGE_STATS=['STR','AGI','VIT','INT','DEX','LUK','atk','matk','def','hit','flee','crit'];
export function shouldAutoSalvage(gear,settings){
 if(!gear||gear.fusionMatch||!settings?.autoSalvage)return false;
 const conditions=[];
 if(settings.keepRarity){
  const rank=RARITIES.findIndex(r=>r.id===gear.rarity);
  const minimum=RARITIES.findIndex(r=>r.id===settings.salvageMaxRarity);
  if(rank<0||minimum<0)return false;
  conditions.push(rank>=minimum);
 }
 if(settings.keepTier)conditions.push(gearTier(gear.level)>=Math.max(1,Math.min(6,settings.salvageMaxTier||1)));
 if(settings.keepStat&&SALVAGE_STATS.includes(settings.salvageStat)){
  const minimum=Math.max(0,Math.min(999,Number(settings.salvageStatBelow)||0));
  conditions.push((gear.affixes?.[settings.salvageStat]||0)>=minimum);
 }
 // No active retention rule: keep everything; never surprise-delete all loot.
 if(!conditions.length)return false;
 const required=settings.salvageMatchMode==='all'?conditions.length:settings.salvageMatchMode==='two'?Math.min(2,conditions.length):1;
 const keep=conditions.filter(Boolean).length>=required;
 return !keep;
}
