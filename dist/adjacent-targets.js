// A multi-hit may not leap over an empty encounter slot. The map boss occupies
// the rightmost extra slot immediately after the regular encounter slots.
// Keep the selected target first for damage multipliers.
export function adjacentTargets(foes, primary, limit=3, bossSlot){
 // The primary may already be defeated by the first hit in this same action;
 // its slot must still anchor the subsequent area hits.
 if(!primary)return [];
 const count=Math.max(1,Math.floor(Number(limit)||1));
 if(count===1)return [primary];
 const regular=foes.filter(f=>f&&f.hp>0&&!f.boss&&Number.isInteger(f.slotIndex));
 const rightmost=Number.isInteger(bossSlot)?bossSlot:Math.max(-1,...regular.map(f=>f.slotIndex))+1;
 const slotOf=f=>f?.boss?rightmost:f?.slotIndex;
 const primarySlot=slotOf(primary);
 if(!Number.isInteger(primarySlot))return [primary];
 const slots=new Map(regular.map(f=>[f.slotIndex,f]));
 const boss=foes.find(f=>f?.boss&&f.hp>0);
 if(boss)slots.set(rightmost,boss);
 const result=[primary];
 for(let distance=1;result.length<count;distance++){
  const left=slots.get(primarySlot-distance);
  const right=slots.get(primarySlot+distance);
  const leftConnected=distance===1?!!left:!!left&&result.some(f=>slotOf(f)===primarySlot-distance+1);
  const rightConnected=distance===1?!!right:!!right&&result.some(f=>slotOf(f)===primarySlot+distance-1);
  if(!leftConnected&&!rightConnected)break;
  if(leftConnected&&result.length<count)result.push(left);
  if(rightConnected&&result.length<count)result.push(right);
 }
 return result;
}
