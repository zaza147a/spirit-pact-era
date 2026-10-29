import {GEAR_BASE,PET_GEAR_BASE,RARITIES,shardId,rollGear,rollPetGear} from './loot.js?v=3.0';
import {gearTierRange} from './progression.js?v=3.0';
export const FUSION_STATS=['any','atk','matk','STR','AGI','VIT','INT','DEX','LUK','hp','def','mdef','hit','flee','crit','aspdPct','critDmg','ignoreDef','hpPct','damageReduction','fleePct'];
export function fusionStatsFor(baseId){const base=GEAR_BASE[baseId]||PET_GEAR_BASE[baseId];if(!base)return ['any','atk'];const attrs=['STR','AGI','VIT','INT','DEX','LUK'],weapon=!!base.weaponType||base.petSlot==='head';const primary=base.petSlot?(base.petSlot==='head'?(baseId==='petCirclet'?'matk':'atk'):base.petSlot==='body'?'hp':'flee'):base.weaponType?(base.weaponType==='mace'||!!base.matk&&(!base.atk||base.matk>base.atk)?'matk':'atk'):'def';return [...new Set(['any',primary,...(weapon?['hit']:base.petSlot==='body'?['def','mdef']:['def','mdef','hit','flee']),...attrs,...(weapon?['aspdPct','crit','critDmg','ignoreDef']:['fleePct','damageReduction','hpPct'])])];}

export function normalizeFusionSettings(raw={}){raw=raw&&typeof raw==='object'?raw:{};const base=GEAR_BASE[raw.base]||PET_GEAR_BASE[raw.base]?raw.base:'blade',possible=fusionStatsFor(base);return {tier:Math.min(6,Math.max(1,Math.floor(Number(raw.tier)||1))),base,stat:possible.includes(raw.stat)?raw.stat:possible[1],minimum:Math.min(9999,Math.max(1,Math.floor(Number(raw.minimum)||5))),rarity:RARITIES.some(r=>r.id===raw.rarity)?raw.rarity:'any',limit:Math.min(500,Math.max(1,Math.floor(Number(raw.limit)||100)))};}

export function fusionTargetMatches(gear,settings){const c=normalizeFusionSettings(settings),rank=RARITIES.findIndex(r=>r.id===gear.rarity),min=RARITIES.findIndex(r=>r.id===c.rarity);return (c.rarity==='any'||rank>=min)&&(c.stat==='any'||(Number(gear.affixes?.[c.stat])||0)>=c.minimum);}
export function fuseOne(player,settings,{rng=Math.random,roller=null}={}){
 const c=normalizeFusionSettings(settings),pet=!!PET_GEAR_BASE[c.base],group=GEAR_BASE[c.base]?.weaponType?'weapon':'armor',material=shardId(group,c.tier),entry=player.bag.find(e=>e.id===material&&!e.uid);
 if(!entry||entry.qty<8)return {error:'素材不足',material};
 if(player.bag.length>=1900)return {error:'背包已滿，請先整理'};
 const range=gearTierRange(c.tier),level=range.min+Math.floor(Math.min(.999999,Math.max(0,Number(rng())||0))*(range.max-range.min+1));
 const gear=roller?roller(c.base,level):pet?rollPetGear(c.base,level):rollGear(c.base,level);
 if(!gear?.uid)return {error:'融合失敗，未消耗素材'};
 entry.qty-=8;if(!entry.qty)player.bag.splice(player.bag.indexOf(entry),1);player.bag.push(gear);
 return {gear,matched:fusionTargetMatches(gear,c),material,cost:8};
}
