// Permanent, shared card collection across all eight local character slots.
// A collected card is consumed once; the record is account-wide in this browser.
export const CARD_COLLECTION_KEY='icarus-shared-card-collection-v1';
export const CARD_COLLECTION_NPC='星頁典藏師・露娜';
export const CARD_COLLECTION_LOCK='icarus-shared-card-collection';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function collectibleCardIds(catalog){
 return Object.keys(catalog||{}).filter(id=>catalog[id]&&catalog[id].map&&catalog[id].map!=='legacy').sort();
}
export function readCardCollection(storage,catalog){
 const raw=storage?.getItem?.(CARD_COLLECTION_KEY);
 if(!raw)return {version:1,ids:[]};
 let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('卡片收藏資料無法讀取，原資料已保留');}
 if(parsed?.version!==1||!Array.isArray(parsed.ids)||parsed.ids.length>10000||parsed.ids.some(id=>typeof id!=='string'||id.length>120)||new Set(parsed.ids).size!==parsed.ids.length)throw Error('卡片收藏資料格式不正確，原資料已保留');
 // Keep old catalog IDs safe for future game versions, but never interpret
 // them as cards that can be consumed or forged.
 return parsed;
}
export function collectableFromPlayer(player,catalog,collection){
 const saved=new Set(collection?.ids||[]);
 return (player?.cards||[]).filter(row=>Number.isInteger(row.qty)&&row.qty>0&&own(catalog,row.id)&&catalog[row.id]?.map&&catalog[row.id].map!=='legacy'&&!saved.has(row.id)).map(row=>row.id);
}
export function collectMissingCards(player,catalog,collection){
 if(!player||!Array.isArray(player.cards)||!collection||!Array.isArray(collection.ids))return {error:'收藏資料無效'};
 const ids=collectableFromPlayer(player,catalog,collection);
 if(!ids.length)return {error:'目前沒有尚未收藏的卡片'};
 const next={version:1,ids:[...collection.ids,...ids]};
 for(const id of ids){const row=player.cards.find(c=>c.id===id);row.qty--;}
 player.cards=player.cards.filter(c=>c.qty>0);
 return {ids,collection:next};
}
export function collectionProgress(catalog,collection){
 const eligible=collectibleCardIds(catalog),owned=new Set(collection?.ids||[]);
 return {owned:eligible.filter(id=>owned.has(id)).length,total:eligible.length};
}
