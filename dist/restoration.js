// Higher-level HP grows with equipment; advanced supplies must remain useful.
// Keep the complete level 1–50 tutorial recovery unchanged.
export function potionRestore(item,resource,level,max,pet=false){
 const flat=resource==='hp'?item.heal||0:item.energy||0;
 if(!flat)return 0;
 const fraction=level>=51?(resource==='hp'?item.healPct||0:item.energyPct||0):0;
 return Math.round(flat*(pet?.75:1)+Math.max(0,max)*fraction);
}
