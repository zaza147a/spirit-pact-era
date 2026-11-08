import {normalizeExtremeProgress,settleExtremeStage} from './extreme-trials.js';

// Every character owns their own extreme-trial records and purchases.
// No account-wide storage or cross-slot inheritance.
export const EXTREME_SHOP_ITEMS=Object.freeze([
 {id:'atk_frame',kind:'atk',type:'frame',name:'破軍典藏名稱框',cost:150,floor:20},
 {id:'matk_frame',kind:'matk',type:'frame',name:'冥界典藏名稱框',cost:150,floor:20},
 {id:'hp_frame',kind:'hp',type:'frame',name:'血淵典藏名稱框',cost:150,floor:20},
 {id:'clear_frame',kind:'clear',type:'frame',name:'萬軍典藏名稱框',cost:150,floor:20},
 {id:'atk_background',kind:'atk',type:'background',name:'破軍戰場背景',cost:250,floor:30},
 {id:'matk_background',kind:'matk',type:'background',name:'冥界法陣背景',cost:250,floor:30},
 {id:'hp_background',kind:'hp',type:'background',name:'血淵龍巢背景',cost:250,floor:30},
 {id:'clear_background',kind:'clear',type:'background',name:'萬軍戰場背景',cost:250,floor:30}
]);

export function extremeCharacterLedger(player){
 const allowed=new Set(EXTREME_SHOP_ITEMS.map(item=>item.id));
 return {progress:normalizeExtremeProgress(player?.extremeProgress),
   coins:Math.max(0,Math.floor(Number(player?.extremeCoins)||0)),
   purchases:[...new Set((Array.isArray(player?.extremePurchases)?player.extremePurchases:[]).filter(id=>allowed.has(id)))]};
}

export function claimExtremeCharacterStage(player,kind,floor){
 const previous=extremeCharacterLedger(player),result=settleExtremeStage(previous.progress,kind,floor);
 player.extremeProgress=result.progress;
 player.extremeCoins=previous.coins+result.coins;
 return {coins:result.coins,firstClears:result.firstClears,ledger:extremeCharacterLedger(player)};
}

export function buyExtremeShopItem(player,id){
 const item=EXTREME_SHOP_ITEMS.find(entry=>entry.id===id);
 if(!item)return {error:'無效的極限商店商品'};
 const ledger=extremeCharacterLedger(player);
 if(ledger.purchases.includes(id))return {error:'已永久收藏'};
 if(ledger.progress[item.kind].highest<item.floor)return {error:`需要先突破 ${item.name} 對應首領第 ${item.floor} 階`};
 if(ledger.coins<item.cost)return {error:'極限徽記不足'};
 player.extremeCoins=ledger.coins-item.cost;
 player.extremePurchases=[...ledger.purchases,id];
 return {item,ledger:extremeCharacterLedger(player)};
}

export function extremeMilestoneTitles(ledger){
 const names={atk:['破軍挑戰者','破軍破限者','物理不滅者'],matk:['冥界挑戰者','冥界破限者','魔法不滅者'],hp:['血戰挑戰者','血淵破限者','極限征服者'],clear:['萬軍挑戰者','萬軍破限者','千軍殲滅者']};
 return Object.entries(names).flatMap(([kind,[novice,advanced,master]])=>{
  const highest=ledger?.progress?.[kind]?.highest||0;
  return [...(highest>=10?[novice]:[]),...(highest>=50?[advanced]:[]),...(highest>=100?[master]:[])];
 });
}

export const EXTREME_MILESTONE_LABELS=Object.freeze({
 atk:{frame:'破軍名稱框',mantle:'破軍戰袍',aura:'破軍戰意'},
 matk:{frame:'冥界名稱框',mantle:'冥界法袍',aura:'冥界星環'},
 hp:{frame:'血淵名稱框',mantle:'血淵龍袍',aura:'血淵龍焰'},
 clear:{frame:'萬軍名稱框',mantle:'萬軍統帥袍',aura:'萬軍魂焰'}
});
export function extremeMilestoneFrames(ledger){
 return Object.entries(EXTREME_MILESTONE_LABELS).filter(([kind])=>(ledger.progress[kind]?.highest||0)>=20).map(([,labels])=>labels.frame);
}
export function extremeUnlockedCosmetics(player,type){
 const threshold=type==='mantle'?25:type==='aura'?30:type==='background'?30:Infinity;
 const ledger=extremeCharacterLedger(player);
 return Object.keys(EXTREME_MILESTONE_LABELS).filter(kind=>ledger.progress[kind].highest>=threshold);
}

export function syncExtremeHonorOwnership(player){
 const ledger=extremeCharacterLedger(player);
 player.extraHonorTitles=[...new Set([...(player.extraHonorTitles||[]),...extremeMilestoneTitles(ledger)])];
 player.extremeFrames=[...extremeMilestoneFrames(ledger),...EXTREME_SHOP_ITEMS.filter(item=>item.type==='frame'&&ledger.purchases.includes(item.id)).map(item=>item.name)];
 player.extremeBackgrounds=[...extremeUnlockedCosmetics(player,'background').map(kind=>kind+'_milestone'),...EXTREME_SHOP_ITEMS.filter(item=>item.type==='background'&&ledger.purchases.includes(item.id)).map(item=>item.id)];
 player.extremeCoins=ledger.coins;
 player.extremePurchases=ledger.purchases;
 return player;
}
