// Experimental per-pet effects registry.
// Existing single-pet petEffects remains untouched until integration is safe.
export function blankPetEffects(){
 return {
  shield:0,shieldExpires:0,guardUntil:0,guardCounter:0,
  markHits:0,markPower:0,markTargetId:null,
  bleedTicks:0,bleedNext:0,bleedInterval:0,bleedPower:0,bleedTargetId:null,
  burnTicks:0,burnNext:0,burnInterval:0,burnPower:0,burnTargetId:null,
  regenTicks:0,regenNext:0,regenInterval:0,regenPower:0,
  blessingUntil:0,blessingPower:0
 };
}
export function ensurePetEffects(registry,petId){
 if(typeof petId!=='string'||!petId)return null;
 return registry[petId]??(registry[petId]=blankPetEffects());
}
export function clearPetEffectsFor(registry,petId){
 if(typeof petId==='string')delete registry[petId];
 return registry;
}
export function clearInactiveEffects(registry,activeIds=[]){
 const keep=new Set(activeIds);
 for(const id of Object.keys(registry))if(!keep.has(id))delete registry[id];
 return registry;
}
export function expirePetEffects(state,now){
 if(!state)return state;
 if(state.shieldExpires&&now>=state.shieldExpires){state.shield=0;state.shieldExpires=0;}
 if(state.guardUntil&&now>=state.guardUntil){state.guardUntil=0;state.guardCounter=0;}
 if(state.blessingUntil&&now>=state.blessingUntil){state.blessingUntil=0;state.blessingPower=0;}
 return state;
}
export function applyPetShield(state,amount,maxHp,now,durationMs=6500){
 const cap=Math.max(0,Math.round(maxHp*.25));
 const gained=Math.max(0,Math.min(cap-state.shield,Math.round(amount)));
 state.shield+=gained;
 if(gained)state.shieldExpires=Math.max(state.shieldExpires,now+durationMs);
 return gained;
}
export function consumePetShield(state,amount){
 const absorbed=Math.max(0,Math.min(state.shield,Math.round(amount)));
 state.shield-=absorbed;
 return absorbed;
}
export function markPetTarget(state,targetId,hits,power){
 state.markTargetId=targetId??null;
 state.markHits=Math.max(0,Math.floor(hits));
 state.markPower=Math.max(0,Number(power)||0);
}
export function consumePetMark(state,targetId){
 if(!state.markHits||!state.markTargetId||state.markTargetId!==targetId)return 0;
 state.markHits--;
 const damage=state.markPower;
 if(!state.markHits)state.markTargetId=null;
 return damage;
}
export function beginPetDot(state,kind,{targetId,power,ticks,interval,now}){
 if(!['bleed','burn'].includes(kind))return false;
 state[kind+'TargetId']=targetId;
 state[kind+'Power']=Math.max(0,Number(power)||0);
 state[kind+'Ticks']=Math.max(0,Math.floor(ticks));
 state[kind+'Interval']=Math.max(1,Math.floor(interval));
 state[kind+'Next']=now+state[kind+'Interval'];
 return true;
}
export function readyPetDot(state,kind,now,validTarget){
 if(!['bleed','burn'].includes(kind)||!state[kind+'Ticks'])return null;
 const targetId=state[kind+'TargetId'];
 if(!validTarget(targetId)){
  state[kind+'Ticks']=0;state[kind+'TargetId']=null;return null;
 }
 if(now<state[kind+'Next'])return null;
 state[kind+'Ticks']--;
 state[kind+'Next']=now+state[kind+'Interval'];
 return {targetId,power:state[kind+'Power'],kind};
}
