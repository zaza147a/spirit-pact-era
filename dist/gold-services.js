import {rollGear,rollPetGear,RARITIES,primaryAffix,SPECIAL_AFFIXES,GEAR_BASE,PET_GEAR_BASE,affixRange} from './loot.js';

export const GOLD_COLLECTIBLES=[
 {cost:10_000_000,bonus:2,title:'黃金冒險者',reward:'專屬稱號'},
 {cost:50_000_000,bonus:5,title:'星耀之名',reward:'角色名稱特殊顏色'},
 {cost:100_000_000,bonus:10,title:'王者光環',reward:'角色立繪光環'},
 {cost:500_000_000,bonus:20,title:'傳說收藏家',reward:'夥伴外觀特效'}
];
export const REFORGE_PRICES=[1_000_000,1_500_000,2_500_000,5_000_000];
export const goldCollectionTier=p=>Math.max(0,Math.min(4,Math.floor(Number(p?.goldCollectionTier)||0)));
export const goldCollectionBonus=p=>GOLD_COLLECTIBLES[goldCollectionTier(p)-1]?.bonus||0;
export function earnGold(base,p,extraPercentage=0){return Math.max(0,Math.round(Math.max(0,Number(base)||0)*(1+(Number(extraPercentage)||0)/100+goldCollectionBonus(p)/100)));}
export function goldWealth(p){const bars=Array.isArray(p?.bag)?p.bag.filter(x=>x.id==='gold_bar'&&!x.uid).reduce((n,x)=>n+Math.max(0,Math.floor(Number(x.qty)||0)),0):0;return Math.max(0,Math.floor(Number(p?.gold)||0))+bars*100_000_000;}
export function buyGoldCollectible(p){const tier=goldCollectionTier(p),next=GOLD_COLLECTIBLES[tier];if(!next)return {error:'全部收藏品已解鎖'};if(!Number.isSafeInteger(p.gold)||goldWealth(p)<next.cost)return {error:'金幣不足'};
 // The game automatically turns gold beyond 500m into 100m gold bars.
 // Gold bars are therefore accepted at face value, with exact gold change.
 const barsNeeded=Math.max(0,Math.ceil((next.cost-p.gold)/100_000_000));
 if(barsNeeded){let remaining=barsNeeded;for(const stack of p.bag){if(stack.id!=='gold_bar'||stack.uid)continue;const used=Math.min(stack.qty,remaining);stack.qty-=used;remaining-=used;if(!remaining)break;}p.bag=p.bag.filter(x=>x.id!=='gold_bar'||x.qty>0);}
 p.gold-=next.cost-barsNeeded*100_000_000;p.goldCollectionTier=tier+1;return {reward:next};}
export const reforgePrice=(lockCount,rank)=>Number.isInteger(lockCount)&&lockCount>=0&&lockCount<=3?REFORGE_PRICES[lockCount]*(['S','SS','SSS'].includes(rank)?2:1):null;

// Keep the fixed primary, weapon HIT, and sixth mythic special in their native slots.
// Roll a complete valid item, then fill only unlocked slots with distinct legal affixes.
export function reforgeGear(item,lockedKeys=[],rng=Math.random){
 const pet=!!PET_GEAR_BASE[item?.id],base=pet?PET_GEAR_BASE[item?.id]:GEAR_BASE[item?.id];
 if(!base||!RARITIES.some(r=>r.id===item.rarity)||!item.affixes)return {error:'裝備資料無效'};
 const keys=Object.keys(item.affixes),locked=new Set(lockedKeys);
 if(locked.size!==lockedKeys.length||locked.size>3||[...locked].some(k=>!keys.includes(k)))return {error:'最多只能鎖定三條現有詞條'};
 const primary=primaryAffix(item.id),weapon=!!base.weaponType||(pet&&base.petSlot==='head');
 const fixed=new Set([primary,...(weapon?['hit']:[])]);
 // Current loot model fixes primary and HIT; rerolling their values is permitted, but their type is not.
 const special=keys.find(k=>SPECIAL_AFFIXES.has(k));
 const generated=(pet?rollPetGear:rollGear)(item.id,item.level,item.rarity,rng);
 if(!generated)return {error:'裝備無法重鑄'};
 const result={},used=new Set();
 for(const key of keys)if(locked.has(key)){result[key]=item.affixes[key];used.add(key);}
 for(const key of keys){
  if(locked.has(key))continue;
  let next=key;
  if(!fixed.has(key)&&!(item.rarity==='mythic'&&key===special)){
   const candidates=Object.keys(generated.affixes).filter(k=>!used.has(k)&&!fixed.has(k)&&!SPECIAL_AFFIXES.has(k));
   next=candidates[0]||key;
  }else if(item.rarity==='mythic'&&key===special){
   const candidate=Object.keys(generated.affixes).find(k=>SPECIAL_AFFIXES.has(k)&&!used.has(k));
   next=candidate||key;
  }
  if(used.has(next)){
   const candidates=Object.keys(generated.affixes).filter(k=>!used.has(k)&&!fixed.has(k)&&!SPECIAL_AFFIXES.has(k));
   next=candidates[0]||key;
  }
  if(used.has(next))return {error:'無法產生不重複的合法詞條'};
  let value=generated.affixes[next];
  if(!Number.isFinite(value)){
   const [min,max]=affixRange(next,item.tier,item.rarity);
   value=Math.floor(min+Math.max(0,Math.min(.999999,rng()))*(max-min+1));
   if(pet&&!SPECIAL_AFFIXES.has(next)&&!['atk','matk'].includes(next))value=Math.round(value*10/3);
  }
  result[next]=value;used.add(next);
 }
 return {affixes:result};
}
