import {fusionForm,fusionArt} from './pet-fusion.js';
import {ASCENDED_FORMS} from './pet-ascension.js';
import {evolveQuality} from './pet-acquisition.js?v=6.3.2';
// Base species is a save identity; rarity mutations select independent named species routes.
export const PET_ROUTES = {"attack": ["火狼幼獸", "炎牙狼", "烈焰戰狼", "煉獄狼王", "太陽神狼"], "magic": ["星光幼靈", "星霧精靈", "星月術靈", "星界賢靈", "星辰主宰"], "defense": ["岩甲幼龜", "岩甲龜", "巨岩戰龜", "山岳守護龜", "聖域玄龜"], "support": ["生命芽靈", "森林花靈", "翠林精靈", "古木守護者", "世界樹靈"]};
export const PET_MUTATIONS = {"legendary": {"attack": ["曦羽幼獅鷲", "金翼獅鷲", "曜羽戰獅鷲", "聖翼獅鷲王", "日冕獅鷲皇"], "magic": ["月尾幼狐", "月華靈狐", "銀月三尾狐", "幻月六尾狐", "九尾月神狐"], "defense": ["晶角幼犀", "琥珀岩犀", "晶鎧戰犀", "山晶巨犀", "聖晶堡壘犀"], "support": ["皓光幼駒", "銀鬃獨角獸", "曦光靈角獸", "聖域獨角獸", "天穹聖角皇"]}, "mythic": {"attack": ["赤鱗幼龍", "燼翼飛龍", "劫焰戰龍", "滅世龍王", "終焉龍神"], "magic": ["星火雛鳳", "紫焰靈鳳", "星灼天鳳", "虛空鳳凰", "星界不滅凰"], "defense": ["符石幼像", "玄岩石衛", "黑曜戰魔像", "天隕泰坦", "創世巨神像"], "support": ["玉麟幼獸", "雲鬃麒麟", "瑞光靈麟", "聖霄麒麟王", "太初祥瑞神麟"]}};
export const PET_PALETTES={rare:{attack:'銀霜暖焰',magic:'玫瑰星光',defense:'霧藍岩甲',support:'秋杏花葉'},uncommon:{attack:'夜藍銀焰',magic:'紫晶星輝',defense:'墨岩青玉',support:'櫻霞翠葉'}};
export const PET_FAMILIES={fang:'attack',wisp:'magic',shell:'defense',sprout:'support'};
export const evolutionStage=pet=>Math.min(4,Math.max(0,Math.floor(Number(pet.evolution)||0)));
export function petRoute(pet,rarity=pet.rarity){const role=PET_FAMILIES[pet.species];return role?(PET_MUTATIONS[rarity]?.[role]||PET_ROUTES[role]):null;}
export function petForm(pet,stage=evolutionStage(pet),rarity=pet.rarity){if(fusionForm(pet))return fusionForm(pet);if(pet.ascended&&stage===evolutionStage(pet)&&ASCENDED_FORMS[rarity]?.[PET_FAMILIES[pet.species]])return ASCENDED_FORMS[rarity][PET_FAMILIES[pet.species]];return petRoute(pet,rarity)?.[Math.min(4,Math.max(0,stage))]||null;}
export function petIcon(pet){const role=PET_FAMILIES[pet.species];return ({legendary:{attack:'🦅',magic:'🦊',defense:'🦏',support:'🦄'},mythic:{attack:'🐉',magic:'🐦‍🔥',defense:'🗿',support:'🦌'}})[pet.rarity]?.[role]||({attack:'🐺',magic:'✨',defense:'🐢',support:'🌱'})[role]||'✦';}

export function petArt(pet,stage=evolutionStage(pet),rarity=pet.rarity){if(fusionArt(pet))return fusionArt(pet);const role=PET_FAMILIES[pet.species];if(!role)return null;if(pet.ascended&&stage===evolutionStage(pet)&&['legendary','mythic'].includes(rarity))return `assets/ascended/${role}-${rarity}.webp`;const variant=['rare','uncommon','legendary','mythic'].includes(rarity)?rarity:'normal';const prefix=['rare','uncommon'].includes(variant)?'palette-v19-':variant==='normal'?'':variant==='mythic'&&role==='support'?'qilin-v18-':'mutation-v18-';return `assets/pets/${prefix}${variant}-${role}-${Math.min(4,Math.max(0,stage))}.png`;}

export function evolveCompanion(pet,bag,location,steps,rarities,rng=Math.random){
 const stage=evolutionStage(pet),step=steps[stage];
 if(!['town','skycity','dawncity'].includes(location))return {error:'只能回村莊進化夥伴'};
 if(!step)return {error:'夥伴已達最高進化階段'};
 if(pet.level<step.level)return {error:`需夥伴 Lv.${step.level}`};
 const material=bag.find(e=>e.id===step.id);
 if(!material||material.qty<step.count)return {error:'進化素材不足'};
 const index=Math.max(0,rarities.findIndex(r=>r.id===pet.rarity)),before=rarities[index].id,beforeForm=petForm(pet);
 material.qty-=step.count;if(!material.qty)bag.splice(bag.indexOf(material),1);
 pet.evolution=stage+1;
 pet.rarity=evolveQuality(before,rng);
 return {before,beforeForm,after:pet.rarity,form:petForm(pet)};
}
export function synthesizeEssence(bag,tier,location){
 if(!['town','skycity','dawncity'].includes(location))return {error:'只能在城鎮合成進化素材'};
 if(!Number.isInteger(tier)||tier<1||tier>3)return {error:'無效素材階級'};
 const from=bag.find(e=>e.id===`essence_${tier}`);if(!from||from.qty<3)return {error:'需要 3 個低階靈核'};
 from.qty-=3;if(!from.qty)bag.splice(bag.indexOf(from),1);
 const id=`essence_${tier+1}`,to=bag.find(e=>e.id===id);if(to)to.qty++;else bag.push({id,qty:1});
 return {id};
}
