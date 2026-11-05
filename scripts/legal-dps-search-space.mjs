import {OUTPUT_PAIRS} from './legal-dps-equipment.mjs';

// Exhaustive enumeration of armor output-affix multisets. With equal quality,
// tier and enhancement on every defensive slot, reordering identical stat
// contributions cannot affect the character stat total; enumerate each such
// equivalence class once, and preserve the expanded multiplicity separately.
export function* armorMultisets(slots=8,variants=OUTPUT_PAIRS.length){
 function* visit(prefix,min){
  if(prefix.length===slots){yield prefix;return;}
  for(let index=min;index<variants;index++)yield* visit([...prefix,index],index);
 }
 yield* visit([],0);
}
export function choose(n,k){let result=1n;for(let i=1;i<=k;i++)result=result*BigInt(n-i+1)/BigInt(i);return result;}
export const rawArmorConfigurations=(slots=8)=>BigInt(OUTPUT_PAIRS.length)**BigInt(slots);
export const equivalentArmorConfigurations=(slots=8)=>choose(OUTPUT_PAIRS.length+slots-1,slots);
