import {GEAR_BASE,PET_GEAR_BASE,rollGear,rollPetGear,primaryAffix,affixRange,SPECIAL_AFFIXES,RARITIES,gearTier} from '../dist/loot.js';

export const ATTRIBUTE_AFFIXES=Object.freeze(['STR','AGI','VIT','INT','DEX','LUK']);
export const OUTPUT_PAIRS=Object.freeze(ATTRIBUTE_AFFIXES.flatMap((a,i)=>ATTRIBUTE_AFFIXES.slice(i+1).map(b=>[a,b])));
export function outputPairsForJob(job){
 const magic=['wizard','sage','priest','spiritCommander'].includes(job);
 const ranged=['hunter','performer'].includes(job);
 const primary=magic?'INT':ranged?'DEX':'STR';
 const secondary=magic?['AGI','LUK','DEX']:['AGI','LUK'];
 return secondary.filter(key=>key!==primary).map(key=>[primary,key]);
}
const ARMOR_SPECIALS=['fleePct','damageReduction','hpPct'];
const WEAPON_SPECIALS=['aspdPct','crit','critDmg','damageReduction'];
export function legalNormalPool(id){
 const base=GEAR_BASE[id]||PET_GEAR_BASE[id];
 if(!base)throw Error('Unknown gear '+id);
 const primary=primaryAffix(id),weapon=!!base.weaponType||base.petSlot==='head';
 const core=base.petSlot?(base.petSlot==='head'?[primary,'hit','DEX']:base.petSlot==='body'?['hp','def','mdef']:['flee','hit','def']):weapon?[primary,'hit','DEX']:['def','mdef','flee'];
 return [...new Set([...core,...ATTRIBUTE_AFFIXES])];
}
export function assertLegalItem(item,{pet=false}={}){
 const base=(pet?PET_GEAR_BASE:GEAR_BASE)[item?.id];
 if(!base)throw Error('Unknown item '+item?.id);
 const rank=RARITIES.find(r=>r.id===item.rarity);
 if(!rank)throw Error('Invalid rarity');
 const keys=Object.keys(item.affixes||{}),normal=keys.filter(k=>!SPECIAL_AFFIXES.has(k)),special=keys.filter(k=>SPECIAL_AFFIXES.has(k));
 const weapon=!!base.weaponType||pet&&base.petSlot==='head';
 const allowed=weapon?WEAPON_SPECIALS:ARMOR_SPECIALS;
 if(normal.length!==Math.min(5,rank.count)||special.length!==(item.rarity==='mythic'?1:0))throw Error('Illegal number of affixes '+item.id);
 if(!normal.includes(primaryAffix(item.id))||weapon&&!normal.includes('hit'))throw Error('Missing fixed affix '+item.id);
 const pool=legalNormalPool(item.id);
 for(const key of normal)if(!pool.includes(key))throw Error('Illegal '+item.id+' normal affix '+key);
 for(const key of special)if(!allowed.includes(key))throw Error('Illegal '+item.id+' special '+key);
 for(const [key,value]of Object.entries(item.affixes)){
  const [min,max]=affixRange(key,gearTier(item.level),item.rarity,item.id);
  const scale=pet&&!SPECIAL_AFFIXES.has(key)&&!['atk','matk'].includes(key)?10/3:1;
  if(value<Math.round(min*scale)-1||value>Math.round(max*scale)+1)throw Error(`Out-of-range ${item.id} ${key}: ${value}`);
 }
 if(item.level!==200||item.enhancement!=='SSS')throw Error('Not Lv200 SSS');
 return true;
}
export function legalEquipment(id,{normal,special,pet=false,seed=0}={}){
 const random=()=>((seed=(Math.imul(seed+1,1664525)+1013904223)>>>0)/4294967296);
 const item=(pet?rollPetGear:rollGear)(id,200,'mythic',random);
 if(normal){
  item.affixes=Object.fromEntries([...normal,special].map(key=>{
   const value=affixRange(key,item.tier,item.rarity,id)[1];
   const scale=pet&&!SPECIAL_AFFIXES.has(key)&&!['atk','matk'].includes(key)?10/3:1;
   return[key,Math.round(value*scale)];
  }));
 }
 item.enhancement='SSS';
 assertLegalItem(item,{pet});
 return item;
}
export const canonicalArmor=(id,outputPair,seed=0)=>legalEquipment(id,{normal:['def','mdef','flee',...outputPair],special:'hpPct',seed});
