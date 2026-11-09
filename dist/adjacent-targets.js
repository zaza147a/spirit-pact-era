// Legacy multi-target selection: the selected enemy is hit first, followed by
// other living encounter enemies in encounter order, regardless of slot gaps.
// No combat parameters, hit formulas or target caps are changed here.
export function multiTargets(foes,primary,limit=3){
 if(!primary)return [];
 const count=Math.max(1,Math.floor(Number(limit)||1));
 if(count===1)return [primary];
 return [primary,...foes.filter(foe=>foe&&foe!==primary&&foe.hp>0)].slice(0,count);
}
