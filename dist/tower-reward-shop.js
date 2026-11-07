// 天穹終境：純收藏、背景、名稱框。任何商品均不得附帶戰力欄位。
export const TOWER_SHOP_ITEMS=Object.freeze([
 {id:'frame_dawn',name:'破曉典藏名稱框',type:'frame',cost:300,requiredFloor:10},
 {id:'background_dawn',name:'破曉聖域背景',type:'background',cost:500,requiredFloor:10},
 {id:'frame_flame',name:'炎龍典藏名稱框',type:'frame',cost:500,requiredFloor:20},
 {id:'background_flame',name:'熾焰迴廊背景',type:'background',cost:700,requiredFloor:20},
 {id:'frame_frost',name:'永凍典藏名稱框',type:'frame',cost:700,requiredFloor:30},
 {id:'background_frost',name:'永凍王庭背景',type:'background',cost:900,requiredFloor:30},
 {id:'collection_three',name:'三域首領收藏展示框',type:'collection',cost:1200,requiredFloor:30}
]);
export const TOWER_DAILY_REPLAY_CAP=150;
export function awardTowerCoins(player,coins,{firstClear=false,day=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'})}={}){
 const amount=Math.max(0,Math.floor(Number(coins)||0));
 const ledger=player.towerReplayLedger?.day===day?player.towerReplayLedger:{day,earned:0};
 ledger.earned=Math.max(0,Math.min(TOWER_DAILY_REPLAY_CAP,Math.floor(Number(ledger.earned)||0)));
 const paid=firstClear?amount:Math.min(amount,TOWER_DAILY_REPLAY_CAP-ledger.earned);
 if(!firstClear)ledger.earned+=paid;
 player.towerReplayLedger=ledger;
 player.towerCoins=Math.max(0,Math.floor(Number(player.towerCoins)||0))+paid;
 return paid;
}
export function normalizeTowerCollection(value){
 const ids=new Set(TOWER_SHOP_ITEMS.map(item=>item.id));
 return {purchases:Array.isArray(value?.purchases)?[...new Set(value.purchases.filter(id=>ids.has(id)))]:[],
   selectedBackground:typeof value?.selectedBackground==='string'&&ids.has(value.selectedBackground)?value.selectedBackground:null,
   selectedShowcase:value?.selectedShowcase===true&&Array.isArray(value?.purchases)&&value.purchases.includes('collection_three')};
}
export function towerShowcaseOwned(player){return normalizeTowerCollection(player?.towerCollection).purchases.includes('collection_three');}
export function selectTowerShowcase(player,enabled){
 const collection=normalizeTowerCollection(player?.towerCollection);
 if(enabled&&!collection.purchases.includes('collection_three'))return false;
 collection.selectedShowcase=enabled===true;
 player.towerCollection=collection;
 return true;
}
export function towerShopItem(id){return TOWER_SHOP_ITEMS.find(item=>item.id===id)||null;}
export function buyTowerShopItem(player,id){
 const item=towerShopItem(id),collection=normalizeTowerCollection(player.towerCollection);
 if(!item)return {error:'沒有這項商品'};
 if((player.towerProgress?.highest||0)<item.requiredFloor)return {error:`需要先通關第 ${item.requiredFloor} 層`};
 if(collection.purchases.includes(id))return {error:'商品已永久收藏'};
 if(!Number.isSafeInteger(player.towerCoins)||player.towerCoins<item.cost)return {error:'塔幣不足'};
 player.towerCoins-=item.cost;
 collection.purchases.push(id);
 player.towerCollection=collection;
 return {item,collection};
}
export function towerCollectedBackgrounds(player){
 const owned=new Set(normalizeTowerCollection(player?.towerCollection).purchases);
 return TOWER_SHOP_ITEMS.filter(item=>item.type==='background'&&owned.has(item.id));
}
export function selectTowerBackground(player,id){
 const collection=normalizeTowerCollection(player.towerCollection);
 if(id!==''&&!towerCollectedBackgrounds(player).some(item=>item.id===id))return false;
 collection.selectedBackground=id||null;
 player.towerCollection=collection;
 return true;
}
