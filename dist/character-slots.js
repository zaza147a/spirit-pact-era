export const CHARACTER_SLOT_COUNT=4;
export const SLOT_MIGRATION_KEY='icarus-character-slots-migrated-v1';
export function characterSlotKey(index){if(!Number.isInteger(index)||index<0||index>=CHARACTER_SLOT_COUNT)throw Error('無效的存檔格');return `icarus-character-slot-${index+1}`;}
export function writeCharacterSlot(storage,index,player){const data={version:2,player};storage.setItem(characterSlotKey(index),JSON.stringify(data));return data;}
export function readCharacterSlot(storage,index,normalize,valid){
 const raw=storage.getItem(characterSlotKey(index));if(!raw)return {index,player:null,error:null};
 try{const data=JSON.parse(raw);if(data?.version!==2||!data.player)throw Error('格式不符');const player=normalize(data.player);if(!valid(player))throw Error('角色資料不完整');return {index,player,error:null};}catch(error){return {index,player:null,error:'存檔讀取失敗，請導入備份或新建覆蓋。'};}
}
export const readCharacterSlots=(storage,normalize,valid)=>Array.from({length:CHARACTER_SLOT_COUNT},(_,i)=>readCharacterSlot(storage,i,normalize,valid));
export function migrateLegacyCharacter(storage,legacy){
 if(storage.getItem(SLOT_MIGRATION_KEY))return false;
 const any=Array.from({length:CHARACTER_SLOT_COUNT},(_,i)=>storage.getItem(characterSlotKey(i))).some(Boolean);
 if(!any&&legacy)writeCharacterSlot(storage,0,legacy);
 storage.setItem(SLOT_MIGRATION_KEY,'1');return !any&&!!legacy;
}
