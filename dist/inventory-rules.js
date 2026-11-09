// Filters inspect the actual item's base stats plus rolled affixes; class eligibility is independent of level.
export function gearHasStat(gear,base,stat){return stat==='all'||((base?.[stat]||0)+(gear?.affixes?.[stat]||0))>0;}
export function gearJobCompatible(base,job){return !base?.jobs||base.jobs.includes(job);}
export function matchesGearFilters(gear,base,filters,job,tier){
 const slot=base.slot||`pet-${base.petSlot}`;
 return (filters.rarity==='all'||gear.rarity===filters.rarity)&&(filters.tier==='all'||String(tier)===filters.tier)&&(filters.slot==='all'||slot===filters.slot)&&gearHasStat(gear,base,filters.stat)&&(base.petSlot||filters.job==='all'||(filters.job==='usable'?gearJobCompatible(base,job):!gearJobCompatible(base,job)));
}
