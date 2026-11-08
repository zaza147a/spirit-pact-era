import {normalizeExtremeProgress,settleExtremeStage} from './extreme-trials.js';

export const EXTREME_ACCOUNT_KEY='icarus-extreme-trials-account-v1';
export const EXTREME_SHOP_ITEMS=Object.freeze([
 {id:'atk_frame',kind:'atk',type:'frame',name:'破軍典藏名稱框',cost:200,floor:20},
 {id:'matk_frame',kind:'matk',type:'frame',name:'冥界典藏名稱框',cost:200,floor:20},
 {id:'hp_frame',kind:'hp',type:'frame',name:'血淵典藏名稱框',cost:200,floor:20},
 {id:'clear_frame',kind:'clear',type:'frame',name:'萬軍典藏名稱框',cost:200,floor:20},
 {id:'atk_background',kind:'atk',type:'background',name:'破軍戰場背景',cost:300,floor:30},
 {id:'matk_background',kind:'matk',type:'background',name:'冥界法陣背景',cost:300,floor:30},
 {id:'hp_background',kind:'hp',type:'background',name:'血淵龍巢背景',cost:300,floor:30},
 {id:'clear_background',kind:'clear',type:'background',name:'萬軍戰場背景',cost:300,floor:30}
]);

export function readExtremeAccount(storage){
  let saved=null;
  try{saved=JSON.parse(storage?.getItem(EXTREME_ACCOUNT_KEY)||'null');}catch{}
  return {version:1,progress:normalizeExtremeProgress(saved?.progress),coins:Math.max(0,Math.floor(Number(saved?.coins)||0)),
    purchases:Array.isArray(saved?.purchases)?[...new Set(saved.purchases.filter(x=>EXTREME_SHOP_ITEMS.some(item=>item.id===x)))]:[]};
}

// A single account ledger backs all eight character slots. Only increases to
// the highest stage of a boss grant a currency reward.
export function claimExtremeAccountStage(storage,kind,floor){
  if(typeof storage?.setItem!=='function')throw Error('無法儲存帳號極限試煉獎勵');
  const previous=readExtremeAccount(storage),result=settleExtremeStage(previous.progress,kind,floor);
  if(!result.coins)return {account:previous,coins:0,firstClears:[]};
  const account={...previous,progress:result.progress,coins:previous.coins+result.coins};
  storage.setItem(EXTREME_ACCOUNT_KEY,JSON.stringify(account));
  return {account,coins:result.coins,firstClears:result.firstClears};
}

export function buyExtremeShopItem(storage,id){
 const item=EXTREME_SHOP_ITEMS.find(entry=>entry.id===id);
 if(!item)return {error:'無效的極限商店商品'};
 const account=readExtremeAccount(storage);
 if(account.purchases.includes(id))return {error:'已永久收藏'};
 if(account.progress[item.kind].highest<item.floor)return {error:`需要先突破 ${item.name} 對應首領第 ${item.floor} 階`};
 if(account.coins<item.cost)return {error:'極限徽記不足'};
 const next={...account,coins:account.coins-item.cost,purchases:[...account.purchases,id]};
 storage.setItem(EXTREME_ACCOUNT_KEY,JSON.stringify(next));
 return {account:next,item};
}

export function extremeMilestoneTitles(account){
 const names={atk:['破軍挑戰者','物理不滅者'],matk:['冥界挑戰者','魔法不滅者'],hp:['血戰挑戰者','極限征服者'],clear:['萬軍挑戰者','千軍殲滅者']};
 return Object.entries(names).flatMap(([kind,[novice,master]])=>{
  const highest=account?.progress?.[kind]?.highest||0;
  return [...(highest>=10?[novice]:[]),...(highest>=100?[master]:[])];
 });
}

export function syncExtremeHonorOwnership(player,account){
 const titles=extremeMilestoneTitles(account);
 player.extraHonorTitles=[...new Set([...(player.extraHonorTitles||[]),...titles])];
 player.extremeFrames=EXTREME_SHOP_ITEMS.filter(item=>item.type==='frame'&&account.purchases.includes(item.id)).map(item=>item.name);
 player.extremeBackgrounds=EXTREME_SHOP_ITEMS.filter(item=>item.type==='background'&&account.purchases.includes(item.id)).map(item=>item.id);
 player.extremeCoins=account.coins;
 return player;
}
