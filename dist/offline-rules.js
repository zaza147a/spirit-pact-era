export const OFFLINE_CAP_MS=24*60*60*1000;
export const OFFLINE_STEP_MS=100;
export function offlineWindow(state,now=Date.now()){
 const at=state?.offline?.at;
 if(!Number.isFinite(at)||at<=0||at>now)return {elapsed:0,duration:0,capped:false,eligible:false};
 const elapsed=Math.max(0,now-at),duration=Math.min(OFFLINE_CAP_MS,elapsed);
 return {elapsed,duration,capped:elapsed>OFFLINE_CAP_MS,eligible:duration>=10000&&state.offline.enabled===true&&(state.hp>0||state.autoRevive===true)&&state.location!=='town'};
}
export function inventoryDelta(before,after){
 const stacks=bag=>Object.fromEntries(bag.filter(e=>!e.uid).map(e=>[e.id,e.qty]));
 const a=stacks(before.bag),b=stacks(after.bag),owned=new Set(before.bag.filter(e=>e.uid).map(e=>e.uid));
 return {stacks:[...new Set([...Object.keys(a),...Object.keys(b)])].map(id=>({id,qty:(b[id]||0)-(a[id]||0)})).filter(e=>e.qty),equipment:after.bag.filter(e=>e.uid&&!owned.has(e.uid)).map(e=>({id:e.id,name:e.name,rarity:e.rarity})),cards:after.cards.map(e=>({id:e.id,qty:e.qty-(before.cards.find(x=>x.id===e.id)?.qty||0)})).filter(e=>e.qty>0)};
}
export const offlineDuration=ms=>{const seconds=Math.floor(Math.max(0,ms)/1000);return `${Math.floor(seconds/3600)} 小時 ${Math.floor(seconds%3600/60)} 分 ${seconds%60} 秒`;};
