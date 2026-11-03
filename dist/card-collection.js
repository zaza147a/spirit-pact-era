// Eight-slot shared card album, backwards compatible with v1 {version,ids}.
export const CARD_COLLECTION_KEY='icarus-shared-card-collection-v1';
export const CARD_COLLECTION_NPC='星頁典藏師・露娜';
export const CARD_COLLECTION_LOCK='icarus-shared-card-collection';
export const CARD_COLLECTION_MILESTONES=[
 {pct:10,title:'初階卡片收藏家',bonus:0},
 {pct:25,title:'探索收藏家',bonus:1},
 {pct:50,title:'資深收藏家',bonus:2},
 {pct:75,title:'大陸典藏家',bonus:3},
 {pct:90,title:'傳說卡片收藏家',bonus:3},
 {pct:100,title:'全域卡片宗師',bonus:5}
];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function collectibleCardIds(catalog){return Object.keys(catalog||{}).filter(id=>catalog[id]&&catalog[id].map&&catalog[id].map!=='legacy').sort();}
export function collectionProgress(catalog,collection){
 const eligible=collectibleCardIds(catalog),owned=new Set(collection?.ids||[]);
 return {owned:eligible.filter(id=>owned.has(id)).length,total:eligible.length};
}
export function collectionMilestones(catalog,collection){
 const {owned,total}=collectionProgress(catalog,collection),percent=total?owned/total*100:0;
 const recorded=Array.isArray(collection?.milestones)?collection.milestones:[];
 return CARD_COLLECTION_MILESTONES.filter(m=>recorded.includes(m.pct)||total>0&&percent+1e-9>=m.pct).map(m=>m.pct);
}
export function collectionGoldBonus(catalog,collection){
 const unlocked=new Set(collectionMilestones(catalog,collection));
 return Math.max(0,...CARD_COLLECTION_MILESTONES.filter(m=>unlocked.has(m.pct)).map(m=>m.bonus));
}
export function collectionTitle(catalog,collection){
 const unlocked=new Set(collectionMilestones(catalog,collection));
 return [...CARD_COLLECTION_MILESTONES].reverse().find(m=>unlocked.has(m.pct))?.title||'';
}
export function normalizedCollection(collection,catalog){
 const options=collection?.options||{};
 const keep=[1,3,5].includes(options.keepCopies)?options.keepCopies:1;
 const obj={version:1,ids:[...(collection?.ids||[])],withdrawn:Array.isArray(collection?.withdrawn)?[...new Set(collection.withdrawn.filter(id=>typeof id==='string'&&id.length<=120))]:[],options:{autoCollect:options.autoCollect===true,autoRecycle:options.autoRecycle===true,keepCopies:keep},milestones:Array.isArray(collection?.milestones)?collection.milestones.filter(x=>CARD_COLLECTION_MILESTONES.some(m=>m.pct===x)) :[]};
 obj.milestones=collectionMilestones(catalog,obj);
 return obj;
}
export function readCardCollection(storage,catalog){
 const raw=storage?.getItem?.(CARD_COLLECTION_KEY);
 if(!raw)return normalizedCollection({version:1,ids:[]},catalog);
 let parsed;try{parsed=JSON.parse(raw);}catch{throw Error('卡片收藏資料無法讀取，原資料已保留');}
 if(parsed?.version!==1||!Array.isArray(parsed.ids)||parsed.ids.length>10000||parsed.ids.some(id=>typeof id!=='string'||id.length>120)||new Set(parsed.ids).size!==parsed.ids.length)throw Error('卡片收藏資料格式不正確，原資料已保留');
 if(parsed.options!==undefined&&(typeof parsed.options!=='object'||parsed.options===null||Array.isArray(parsed.options)))throw Error('卡片收藏設定不正確，原資料已保留');
 return normalizedCollection(parsed,catalog);
}
export function collectableFromPlayer(player,catalog,collection,includeBoss=true){
 const saved=new Set(collection?.ids||[]);
 return (player?.cards||[]).filter(row=>Number.isInteger(row.qty)&&row.qty>0&&own(catalog,row.id)&&catalog[row.id]?.map&&catalog[row.id].map!=='legacy'&&!saved.has(row.id)&&(includeBoss||!catalog[row.id].boss)).map(row=>row.id);
}
export function collectMissingCards(player,catalog,collection){
 if(!player||!Array.isArray(player.cards)||!collection||!Array.isArray(collection.ids))return {error:'收藏資料無效'};
 const ids=collectableFromPlayer(player,catalog,collection);
 if(!ids.length)return {error:'目前沒有尚未收藏的卡片'};
 const next=normalizedCollection({...collection,ids:[...collection.ids,...ids],withdrawn:(collection.withdrawn||[]).filter(id=>!ids.includes(id))},catalog);
 for(const id of ids){const row=player.cards.find(c=>c.id===id);row.qty--;}
 player.cards=player.cards.filter(c=>c.qty>0);
 return {ids,collection:next};
}
export function organizeCards(player,catalog,collection){
 const options=collection?.options||{},before=normalizedCollection(collection,catalog);
 if(!options.autoCollect&&!options.autoRecycle)return {collection:before,added:[],recycled:0,points:0,changed:false};
 if(!player||!Array.isArray(player.cards))return {error:'卡片背包資料無效'};
 let next=before,added=[],recycled=0,points=0;
 if(options.autoCollect){
  const ids=collectableFromPlayer(player,catalog,next,false).filter(id=>!next.withdrawn.includes(id));
  if(ids.length){for(const id of ids){player.cards.find(c=>c.id===id).qty--;added.push(id);}
   next=normalizedCollection({...next,ids:[...next.ids,...ids]},catalog);
  }
 }
 if(options.autoRecycle){
  const limit=options.keepCopies||1;
  for(const row of player.cards){
   if(!catalog[row.id]||catalog[row.id].boss||!Number.isInteger(row.qty)||row.qty<=limit)continue;
   const surplus=row.qty-limit,value=catalog[row.id].boss?100:10;
   if(!Number.isSafeInteger((player.cardRecyclePoints||0)+points+surplus*value)||(player.cardRecyclePoints||0)+points+surplus*value>=1e9)continue;
   row.qty-=surplus;points+=surplus*value;recycled+=surplus;
  }
  player.cardRecyclePoints=(player.cardRecyclePoints||0)+points;
 }
 player.cards=player.cards.filter(c=>c.qty>0);
 return {collection:next,added,recycled,points,changed:added.length>0||recycled>0};
}

// Returning a collectible consumes its stored copy and suspends automatic re-collection.
// Manual collection clears the suspension when the player chooses to deposit it again.
export function withdrawCollectedCard(player,catalog,collection,id){
 if(!player||!Array.isArray(player.cards)||!collection||!Array.isArray(collection.ids))return {error:'收藏或背包資料無效'};
 if(typeof id!=='string'||!collection.ids.includes(id)||!catalog[id])return {error:'收藏冊內沒有這張卡片'};
 const row=player.cards.find(c=>c.id===id);
 if(row&&(!Number.isSafeInteger(row.qty)||row.qty<0||row.qty>=999999))return {error:'卡片背包數量異常或已滿'};
 const next=normalizedCollection({...collection,ids:collection.ids.filter(x=>x!==id),withdrawn:[...(collection.withdrawn||[]),id]},catalog);
 if(row)row.qty++;else player.cards.push({id,qty:1});
 return {id,collection:next};
}
