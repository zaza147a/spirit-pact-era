// Visual-only SSS gallery. Unlocks are shared by all local character slots;
// each character stores its own equipped look and background.
export const COSMETIC_STORAGE_KEY='spirit-pact-cosmetic-collection-v1';
export const COSMETIC_PATH='assets/cosmetics/';
export const COSMETIC_JOBS={
 knight:['焰龍統御者','蒼穹龍騎士','黑曜龍皇'],
 crusader:['聖域帝王','煉獄霸主','永恆守護者'],
 wizard:['星界大賢者','虛空支配者','時空觀測者'],
 sage:['四象聖拳使','原初鍊金賢者','混沌元素王'],
 assassin:['幽冥處刑者','月影暗殺神','血月獵魂者'],
 rogue:['幻影怪盜','暗街支配者','星夜追獵王'],
 priest:['神聖教皇','星辰聖諭者','永恆救贖者'],
 monk:['金剛戰神','鬼神修羅','無我天尊'],
 hunter:['蒼穹獵神','森羅守望者','星隕狙擊王'],
 performer:['天界奏鳴者','星河交響師','永恆樂章王']
};
export const COSMETIC_OUTFIT_PRICES=[500_000_000,1_500_000_000,3_000_000_000];
export const COSMETIC_BACKGROUNDS=[
 {id:'gold',name:'黃金王座',price:250_000_000},
 {id:'star',name:'星界神殿',price:500_000_000},
 {id:'hell',name:'煉獄王城',price:1_000_000_000},
 {id:'tree',name:'世界樹聖域',price:1_500_000_000},
 {id:'ice',name:'永恆冰宮',price:2_500_000_000},
 {id:'divine',name:'至高神域',price:5_000_000_000},
 {id:'void',name:'虛空王庭',price:7_500_000_000},
 {id:'heaven',name:'永恆天國',price:10_000_000_000}
];
export const cosmeticOutfitId=(job,variant)=>`${job}-${variant}`;
export const cosmeticOutfitArt=(job,variant)=>COSMETIC_PATH+`fixed-${job}-${variant}.webp`;
export const cosmeticBackgroundArt=id=>COSMETIC_PATH+`bg-${id}.webp`;
export const isCosmeticOutfitId=id=>typeof id==='string'&&Object.prototype.hasOwnProperty.call(COSMETIC_JOBS,id.split('-')[0])&&/^[0-2]$/.test(id.split('-')[1]||'')&&id===id.split('-').slice(0,2).join('-');
export const isCosmeticBackgroundId=id=>COSMETIC_BACKGROUNDS.some(bg=>bg.id===id);
export function readCosmeticCollection(storage){
 let value;try{value=JSON.parse(storage.getItem(COSMETIC_STORAGE_KEY)||'null');}catch{}
 return {outfits:Array.isArray(value?.outfits)?[...new Set(value.outfits.filter(isCosmeticOutfitId))]:[],backgrounds:Array.isArray(value?.backgrounds)?[...new Set(value.backgrounds.filter(isCosmeticBackgroundId))]:[]};
}
export function normalizeCosmeticSelection(player,collection){
 if(!collection.outfits.includes(player.cosmeticOutfit)||!player.thirdJob||!player.outfitUnlocks?.includes('SSS')||!player.cosmeticOutfit?.startsWith(player.job+'-'))player.cosmeticOutfit=null;
 if(!collection.backgrounds.includes(player.cosmeticBackground))player.cosmeticBackground=null;
 player.cosmeticBrightness=Math.min(100,Math.max(30,Number(player.cosmeticBrightness)||75));
 player.cosmeticAura=player.cosmeticAura!==false;
}
export function cosmeticWealth(player){
 const bars=(player?.bag||[]).filter(item=>item.id==='gold_bar'&&!item.uid).reduce((total,item)=>total+Math.max(0,Math.floor(Number(item.qty)||0)),0);
 return Math.max(0,Math.floor(Number(player?.gold)||0))+bars*100_000_000;
}
// Buy only after all preconditions pass. Return the updated collection so the
// caller can persist it before saving the character slot.
export function buyCosmetic(player,collection,kind,id){
 const variant=Number(id?.split('-')[1]);
 const job=id?.split('-')[0];
 const outfit=kind==='outfit'&&isCosmeticOutfitId(id);
 const background=kind==='background'&&isCosmeticBackgroundId(id);
 if(!outfit&&!background)return {error:'不存在的收藏品'};
 if(outfit&&(job!==player.job||!player.thirdJob||!player.outfitUnlocks?.includes('SSS')))return {error:'需先完成對應職業三轉並解鎖 SSS 全身裝備外觀'};
 const key=outfit?'outfits':'backgrounds';
 if(collection[key].includes(id))return {error:'已收藏'};
 const price=outfit?COSMETIC_OUTFIT_PRICES[variant]:COSMETIC_BACKGROUNDS.find(bg=>bg.id===id).price;
 if(!Number.isSafeInteger(player.gold)||cosmeticWealth(player)<price)return {error:'金幣與金條不足'};
 const needed=Math.max(0,Math.ceil((price-player.gold)/100_000_000));
 let remaining=needed;
 for(const stack of player.bag){if(stack.id!=='gold_bar'||stack.uid)continue;const taken=Math.min(stack.qty,remaining);stack.qty-=taken;remaining-=taken;if(!remaining)break;}
 if(remaining)throw new Error('金條計算與背包狀態不一致');
 player.bag=player.bag.filter(item=>item.id!=='gold_bar'||item.qty>0);
 player.gold-=price-needed*100_000_000;
 return {price,collection:{...collection,[key]:[...collection[key],id]}};
}
