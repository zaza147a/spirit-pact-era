// Local, cross-slot replay guard for the one-time pre-v51 fusion compensation.
// An imported older backup may never increase an already spent allowance on
// this browser. This is device-local, not an account/server anti-tamper system.
export const RESELECT_LEDGER_KEY='icarus-legacy-fusion-reselect-ledger-v1';
const identity=(player,pet)=>JSON.stringify([player.name,pet.id,pet.species]);
const count=pet=>Math.max(0,Math.min(10,Math.floor(Number(pet.fusionReselectRemaining)||0)));
function ledger(storage){
 try{
  const raw=JSON.parse(storage.getItem(RESELECT_LEDGER_KEY)||'{}');
  return raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 }catch{return {};}
}
export function applyReselectLedger(storage,player){
 if(typeof storage?.getItem!=='function'||!player?.pets)return player;
 const saved=ledger(storage);
 for(const pet of player.pets){
  if(!pet.fusionReselectMigrated||!pet.fusion||pet.level<200)continue;
  const used=saved[identity(player,pet)];
  if(Number.isInteger(used)&&used>=0&&used<=10)pet.fusionReselectRemaining=Math.min(count(pet),used);
 }
 return player;
}
export function recordReselectLedger(storage,player){
 if(!player?.pets?.length)return;
 const saved=ledger(storage);
 let changed=false;
 for(const pet of player.pets){
  if(!pet.fusionReselectMigrated||!pet.fusion||pet.level<200)continue;
  const key=identity(player,pet),remaining=count(pet);
  if(!Number.isInteger(saved[key])||remaining<saved[key]){saved[key]=remaining;changed=true;}
 }
 if(changed)storage.setItem(RESELECT_LEDGER_KEY,JSON.stringify(saved));
}
