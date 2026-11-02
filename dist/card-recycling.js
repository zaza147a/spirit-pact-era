// Card recycling and unified card lottery. All card IDs come from the live catalog.
export const CARD_DRAW_COST=100;
export const CARD_BOSS_RATE=.01;
export const CARD_RECYCLE_VALUES=Object.freeze({normal:10,boss:100});
export const CARD_DRAW_BATCHES=Object.freeze([1,10,100]);
export function cardRecyclePoints(player){
 const n=Number(player?.cardRecyclePoints);
 return Number.isSafeInteger(n)&&n>=0?n:0;
}
export function cardRecycleValue(card){return card?.boss?CARD_RECYCLE_VALUES.boss:CARD_RECYCLE_VALUES.normal;}
export function recycleCards(player,catalog,choices){
 if(!player||!Array.isArray(player.cards)||!Array.isArray(choices)||!choices.length)return {error:'沒有選擇回收卡片'};
 const seen=new Set();let gain=0;
 for(const row of choices){
  if(!row||typeof row.id!=='string'||seen.has(row.id)||!catalog[row.id]||!Number.isSafeInteger(row.qty)||row.qty<1)return {error:'回收資料無效'};
  seen.add(row.id);
  const held=player.cards.find(x=>x.id===row.id);
  if(!held||held.qty<row.qty)return {error:'可回收卡片數量不足'};
  gain+=row.qty*cardRecycleValue(catalog[row.id]);
 }
 const balance=cardRecyclePoints(player);
 if(!Number.isSafeInteger(gain)||!Number.isSafeInteger(balance+gain)||balance+gain>=1e9)return {error:'回收點數已達上限'};
 for(const row of choices){const held=player.cards.find(x=>x.id===row.id);held.qty-=row.qty;}
 player.cards=player.cards.filter(x=>x.qty>0);
 player.cardRecyclePoints=balance+gain;
 return {gain,balance:player.cardRecyclePoints};
}
export function drawRecycledCards(player,catalog,count=1,rng=Math.random){
 if(!player||!Array.isArray(player.cards)||!CARD_DRAW_BATCHES.includes(count))return {error:'抽卡次數不正確'};
 const cost=count*CARD_DRAW_COST,balance=cardRecyclePoints(player);
 if(balance<cost)return {error:'回收點數不足'};
 const entries=Object.entries(catalog||{}).filter(([id,c])=>id&&c&&c.map&&c.map!=='legacy'&&typeof c.name==='string');
 const regular=entries.filter(([,c])=>!c.boss),boss=entries.filter(([,c])=>!!c.boss);
 if(!regular.length||!boss.length)return {error:'卡片池尚未準備完成'};
 const drawn=[];
 for(let i=0;i<count;i++){
  const roll=()=>{const v=Number(rng());return Number.isFinite(v)?Math.min(.999999999999,Math.max(0,v)):0;};
  const pool=roll()<CARD_BOSS_RATE?boss:regular;
  const [id]=pool[Math.floor(roll()*pool.length)];
  drawn.push(id);
 }
 player.cardRecyclePoints=balance-cost;
 for(const id of drawn){const held=player.cards.find(x=>x.id===id);if(held)held.qty++;else player.cards.push({id,qty:1});}
 return {drawn,cost,bossCount:drawn.filter(id=>catalog[id].boss).length,balance:player.cardRecyclePoints};
}
