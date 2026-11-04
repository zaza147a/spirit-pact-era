// Bulk selling is deliberately limited to the currently selected bag category.
// Never include protected, quest, ticket, gold-bar or enhanced equipment.
export const BULK_SALE_EXCLUDED_CATEGORIES=Object.freeze(['cards','quests','tickets']);
export function bulkSaleQuote(player,items,groupOf,category,unitPrice,rankOf=()=>null){
 if(!player||!Array.isArray(player.bag)||BULK_SALE_EXCLUDED_CATEGORIES.includes(category))return {entries:[],count:0,gold:0};
 const entries=[];
 for(let index=0;index<player.bag.length;index++){
  const entry=player.bag[index],item=items?.[entry?.id];
  if(!item||groupOf(entry)!==category||item.quest||item.ticket||item.goldBar||item.thirdSeal||entry.fusionMatch||entry.swapProtected||rankOf(entry))continue;
  const qty=entry.uid?1:Math.floor(Number(entry.qty)||0);
  const price=unitPrice(entry,item);
  if(qty<=0||!Number.isFinite(price)||price<=0)continue;
  entries.push({index,id:entry.id,qty,gold:price*qty});
 }
 const gold=entries.reduce((sum,e)=>sum+e.gold,0);
 if(!Number.isSafeInteger(gold)||!Number.isSafeInteger((player.gold||0)+gold))return {entries:[],count:0,gold:0,error:'金幣結算超出安全上限'};
 return {entries,count:entries.reduce((sum,e)=>sum+e.qty,0),gold};
}
export function sellBulkCategory(player,items,groupOf,category,unitPrice,rankOf=()=>null){
 const quote=bulkSaleQuote(player,items,groupOf,category,unitPrice,rankOf);
 if(quote.error||!quote.entries.length)return quote;
 for(const entry of [...quote.entries].reverse())player.bag.splice(entry.index,1);
 player.gold+=quote.gold;
 return quote;
}
