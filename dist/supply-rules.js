export const POTION_KEYS=['playerHp','playerSp','petHp','petSp'];
export function normalizePotionThresholds(value){return Object.fromEntries(POTION_KEYS.map(key=>[key,Number.isFinite(Number(value?.[key]))?Math.min(100,Math.max(1,Math.round(Number(value[key])))):45]));}
export function purchaseQuote(item,quantity,gold){const qty=Number(quantity);if(!Number.isInteger(qty)||qty<1||qty>999)return {error:'購買數量請輸入 1～999 的整數'};const total=item.cost*qty;if(gold<total)return {error:`金幣不足，需要 ${total} 金`};return {qty,total};}
