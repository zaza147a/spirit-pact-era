import {GEAR_BASE,PET_GEAR_BASE} from './loot.js?v=6.5.0';
import {isTown} from './adventure-progression.js?v=6.5.0';
import {ITEMS,CARDS} from './catalog.js?v=6.5.0';
export const WAREHOUSE_KEY='icarus-shared-equipment-warehouse-v1';
export const WAREHOUSE_ACK_PREFIX='icarus-warehouse-delivered-v1:';
export const WAREHOUSE_LOCK='icarus-shared-equipment-warehouse';
export const WAREHOUSE_CAPACITY=200;
export const WAREHOUSE_BATCH_LIMIT=50;
export const WAREHOUSE_KEEPER='星橋保管員・米菈';
const clone=value=>JSON.parse(JSON.stringify(value));
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const validUid=uid=>typeof uid==='string'&&uid.length>0&&uid.length<=128&&!/[\u0000-\u001f]/.test(uid)&&!['__proto__','constructor','prototype'].includes(uid);
export function warehouseEquipment(item){return !!item&&validUid(item.uid)&&typeof item.id==='string'&&(own(GEAR_BASE,item.id)||own(PET_GEAR_BASE,item.id))&&Number.isInteger(item.level)&&item.level>=1&&item.level<=210&&['common','uncommon','rare','legendary','mythic'].includes(item.rarity)&&item.affixes&&typeof item.affixes==='object'&&!Array.isArray(item.affixes)&&Object.values(item.affixes).every(v=>Number.isFinite(v)&&Math.abs(v)<1e9)&&(!item.enhancement||['D','C','B','A','S','SS','SSS'].includes(item.enhancement));}
const ackKey=(uid,revision)=>WAREHOUSE_ACK_PREFIX+encodeURIComponent(uid)+':'+revision;
function slotIndex(index){if(!Number.isInteger(index)||index<0||index>=8)throw Error('無效的存檔格');}
export function readWarehouse(storage){
 const raw=typeof storage?.getItem==='function'?storage.getItem(WAREHOUSE_KEY):null;
 if(!raw)return {version:1,records:{}};
 let state;try{state=JSON.parse(raw);}catch{throw Error('共用倉庫資料無法讀取，原資料已保留');}
 if(state?.version!==1||!state.records||typeof state.records!=='object'||Array.isArray(state.records)||Object.keys(state.records).length>10000)throw Error('共用倉庫格式不符，原資料已保留');
 for(const [uid,r] of Object.entries(state.records))if(!validUid(uid)||!r||!(r.owner===null||Number.isInteger(r.owner)&&r.owner>=0&&r.owner<8)||!Number.isSafeInteger(r.revision)||r.revision<1||(r.gear&&(!warehouseEquipment(r.gear)||r.gear.uid!==uid))||(r.owner===null&&!r.gear))throw Error('共用倉庫裝備紀錄不完整，原資料已保留');
 if(state.stacks!==undefined){if(!state.stacks||typeof state.stacks!=='object'||Array.isArray(state.stacks)||Object.keys(state.stacks).length>1000)throw Error('倉庫堆疊資料異常');for(const [key,r] of Object.entries(state.stacks)){const [kind,id]=key.split(':');if(!['item','card'].includes(kind)||!id||!warehouseStackAllowed(kind,id)||!r||!Number.isSafeInteger(r.qty)||r.qty<0||!r.flows||typeof r.flows!=='object'||Array.isArray(r.flows))throw Error('倉庫堆疊資料不完整');for(const [slot,flow] of Object.entries(r.flows)){if(!/^[0-7]$/.test(slot)||!flow||!Number.isSafeInteger(flow.deposit)||flow.deposit<0||!Number.isSafeInteger(flow.withdraw)||flow.withdraw<0)throw Error('倉庫存取流水帳不完整');}}}
 return state;
}
export function warehouseItems(storage){return Object.values(readWarehouse(storage).records).filter(r=>r.owner===null).map(r=>clone(r.gear));}
// The single warehouse record is the atomic custody authority. Character files
// are projections: an interrupted slot write cannot duplicate or lose custody.
export function applyWarehouseCustody(storage,index,player){
 slotIndex(index);if(!player||typeof storage?.getItem!=='function')return player;
 const state=readWarehouse(storage),{records}=state;if(!Object.keys(records).length&&!Object.keys(state.stacks||{}).length)return player;
 const receipts=player.warehouseReceipts&&typeof player.warehouseReceipts==='object'&&!Array.isArray(player.warehouseReceipts)?player.warehouseReceipts:{};
 const seen=new Set();
 const keep=gear=>{if(!gear?.uid||!own(records,gear.uid))return true;const r=records[gear.uid];if(r.owner!==index||!(Number.isSafeInteger(receipts[gear.uid])&&receipts[gear.uid]>=r.revision)||seen.has(gear.uid))return false;seen.add(gear.uid);return true;};
 for(const [slot,gear] of Object.entries(player.gear||{}))if(gear&&!keep(gear))player.gear[slot]=null;
 for(const pet of player.pets||[])for(const [slot,gear] of Object.entries(pet.gear||{}))if(gear&&!keep(gear))pet.gear[slot]=null;
 if(Array.isArray(player.bag))player.bag=player.bag.filter(item=>!item?.uid||keep(item));
 for(const [uid,r] of Object.entries(records)){
  if(r.owner!==index||receipts[uid]>=r.revision||storage.getItem(ackKey(uid,r.revision)))continue;
  if(!r.gear)throw Error('倉庫待送裝備資料不完整');
  if(!Array.isArray(player.bag)||player.bag.length>=2000)continue;
  player.bag.push(clone(r.gear));receipts[uid]=r.revision;
 }
 player.warehouseReceipts=receipts;
 const stackReceipts=player.warehouseStackReceipts&&typeof player.warehouseStackReceipts==='object'?player.warehouseStackReceipts:{};
 for(const [key,record] of Object.entries(state.stacks||{})){
  const flow=record.flows?.[index];if(!flow)continue;
  const receipt=stackReceipts[key]||{deposit:0,withdraw:0};const debit=Math.max(0,flow.deposit-(receipt.deposit||0)),credit=Math.max(0,flow.withdraw-(receipt.withdraw||0));
  const [kind,id]=key.split(':');if(kind==='card'&&!Array.isArray(player.cards))player.cards=[];const inventory=kind==='card'?player.cards:player.bag;
  if(!Array.isArray(inventory))continue;
  let entry=inventory.find(e=>e.id===id&&!e.uid);
  if(debit&&entry){entry.qty=Math.max(0,entry.qty-debit);if(entry.qty===0)inventory.splice(inventory.indexOf(entry),1);}
  if(credit){if(!entry||!inventory.includes(entry)){entry={id,qty:0};inventory.push(entry);}entry.qty+=credit;}
  stackReceipts[key]={deposit:flow.deposit,withdraw:flow.withdraw};
 }
 player.warehouseStackReceipts=stackReceipts;return player;
}
export function acknowledgeWarehouseDeliveries(storage,index,player){
 if(typeof storage?.getItem!=='function')return;
 const {records}=readWarehouse(storage);
 for(const [uid,r] of Object.entries(records))if(r.owner===index&&player.warehouseReceipts?.[uid]>=r.revision&&!storage.getItem(ackKey(uid,r.revision)))storage.setItem(ackKey(uid,r.revision),'1');
}
function prepareState(storage){const state=readWarehouse(storage);for(const [uid,r] of Object.entries(state.records))if(r.owner!==null&&storage.getItem(ackKey(uid,r.revision)))delete r.gear;return state;}
export async function withWarehouseLock(locks,action){if(typeof locks?.request!=='function')throw Error('此連線無法安全操作共用倉庫，請使用HTTPS或localhost');return locks.request(WAREHOUSE_LOCK,{mode:'exclusive'},action);}
export function transferWarehouseEquipment(storage,index,player,direction,uid,savePlayer){
 slotIndex(index);if(!player||!isTown(player.location)||!player.hp||player.trialRun)throw Error('請在村莊或主城與米菈辦理裝備存取');
 if(!validUid(uid)||!['deposit','withdraw'].includes(direction))throw Error('裝備操作不正確');
 const next=applyWarehouseCustody(storage,index,clone(player)),state=prepareState(storage);
 if(direction==='deposit'){
  const candidates=next.bag.filter(g=>g.uid===uid),gear=candidates[0];if(candidates.length!==1||!warehouseEquipment(gear))throw Error('這件裝備已移動，請重新整理倉庫');
  if(Object.values(next.gear||{}).some(g=>g?.uid===uid)||(next.pets||[]).some(p=>Object.values(p.gear||{}).some(g=>g?.uid===uid)))throw Error('請先卸下裝備再存入倉庫');
  if(Object.values(state.records).filter(r=>r.owner===null).length+Object.values(state.stacks||{}).filter(r=>r.qty>0).length>=WAREHOUSE_CAPACITY)throw Error('共用倉庫已滿');
  const previous=state.records[uid];if(previous&&previous.owner!==index)throw Error('裝備已在倉庫或其他角色持有');
  if(!previous&&Object.keys(state.records).length>=10000)throw Error('已達本機倉庫紀錄上限');
  state.records[uid]={owner:null,revision:(previous?.revision||0)+1,gear:clone(gear)};
 }else{
  const r=state.records[uid];if(!r||r.owner!==null||!r.gear)throw Error('裝備已被領取，請重新整理倉庫');
  if(next.bag.length>=2000)throw Error('角色背包已滿，請先整理背包');
  state.records[uid]={owner:index,revision:r.revision+1,gear:r.gear};
 }
 // This setItem either commits complete custody or leaves the original intact.
 storage.setItem(WAREHOUSE_KEY,JSON.stringify(state));
 applyWarehouseCustody(storage,index,next);
 let pendingSync=false;try{if(savePlayer)savePlayer(next);else{storage.setItem(`icarus-character-slot-${index+1}`,JSON.stringify({version:2,player:next}));acknowledgeWarehouseDeliveries(storage,index,next);}}catch{pendingSync=true;}
 return {player:next,pendingSync};
}

export function warehouseStackAllowed(kind,id){
 if(typeof id!=='string'||!id||!/^[-_a-zA-Z0-9]+$/.test(id))return false;
 if(kind==='card')return Object.hasOwn(CARDS,id);
 if(kind!=='item'||!Object.hasOwn(ITEMS,id))return false;
 const item=ITEMS[id];return !item.ticket&&!item.quest&&!item.uid&&!item.slot&&!item.petSlot;
}
export function warehouseStackItems(storage){return Object.entries(readWarehouse(storage).stacks||{}).filter(([,r])=>r.qty>0).map(([key,r])=>({kind:key.startsWith('card:')?'card':'item',id:key.slice(key.indexOf(':')+1),qty:r.qty}));}
export function transferWarehouseStack(storage,index,player,direction,kind,id,amount,savePlayer){
 slotIndex(index);
 if(!player||!isTown(player.location)||!player.hp||player.trialRun)throw Error('請在村莊或主城與米菈辦理存取');
 if(!warehouseStackAllowed(kind,id)||!['deposit','withdraw'].includes(direction)||!Number.isInteger(amount)||amount<1||amount>WAREHOUSE_BATCH_LIMIT)throw Error('存取數量須為 1～50 件，且不可存放任務道具及入場券');
 const next=applyWarehouseCustody(storage,index,clone(player)),state=prepareState(storage);state.stacks??={};
 const key=kind+':'+id,record=state.stacks[key]||{qty:0,flows:{}};
 if(kind==='card'&&!Array.isArray(next.cards))next.cards=[];
 const inventory=kind==='card'?next.cards:next.bag;
 if(direction==='deposit'){
  const item=inventory?.find(e=>e.id===id&&!e.uid);
  if(!item||!Number.isInteger(item.qty)||item.qty<amount)throw Error('背包數量不足，請重新整理');
  if(!record.qty&&Object.values(state.records).filter(r=>r.owner===null).length+Object.values(state.stacks).filter(r=>r.qty>0).length>=WAREHOUSE_CAPACITY)throw Error('共用倉庫已滿');
  record.qty+=amount;
 }else{
  if(record.qty<amount)throw Error('倉庫數量不足，請重新整理');
  if(!inventory.some(e=>e.id===id&&!e.uid)&&inventory.length>=2000)throw Error('背包已滿');
  record.qty-=amount;
 }
 const flow=record.flows[index]||{deposit:0,withdraw:0};
 flow[direction==='deposit'?'deposit':'withdraw']+=amount;
 record.flows[index]=flow;state.stacks[key]=record;
 storage.setItem(WAREHOUSE_KEY,JSON.stringify(state));
 applyWarehouseCustody(storage,index,next);
 let pendingSync=false;
 try{if(savePlayer)savePlayer(next);else storage.setItem(`icarus-character-slot-${index+1}`,JSON.stringify({version:2,player:next}));}
 catch{pendingSync=true;}
 return {player:next,pendingSync};
}
export function exportWarehouse(storage){return {type:'spirit-pact-shared-warehouse',version:1,items:warehouseItems(storage),stacks:warehouseStackItems(storage)};}
export function importWarehouse(storage,data){
 if(data?.type!=='spirit-pact-shared-warehouse'||data.version!==1||!Array.isArray(data.items)||data.items.length>WAREHOUSE_CAPACITY||!data.items.every(warehouseEquipment)||new Set(data.items.map(g=>g.uid)).size!==data.items.length)throw Error('倉庫備份格式不正確');
 const state=prepareState(storage);let imported=0,skipped=0;
 if(data.stacks!==undefined){if(!Array.isArray(data.stacks)||data.stacks.length>WAREHOUSE_CAPACITY||!data.stacks.every(r=>r&&warehouseStackAllowed(r.kind,r.id)&&Number.isSafeInteger(r.qty)&&r.qty>0))throw Error('倉庫堆疊備份格式不正確');state.stacks??={};for(const r of data.stacks){const key=r.kind+':'+r.id;if(state.stacks[key]?.qty){skipped++;continue;}state.stacks[key]={qty:r.qty,flows:{}};imported++;}}
 for(const gear of data.items){if(own(state.records,gear.uid)){skipped++;continue;}if(Object.values(state.records).filter(r=>r.owner===null).length>=WAREHOUSE_CAPACITY)throw Error('共用倉庫空間不足，沒有匯入任何裝備');if(Object.keys(state.records).length>=10000)throw Error('已達本機倉庫紀錄上限');state.records[gear.uid]={owner:null,revision:1,gear:clone(gear)};imported++;}
 storage.setItem(WAREHOUSE_KEY,JSON.stringify(state));return {imported,skipped};
}
