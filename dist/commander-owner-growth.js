// Spirit Commander owner-led growth. Keep pet IV/evolution/equipment in base stats;
// the extra resonance growth follows the owner's *current* combat strength.
const nonnegative = n => Number.isFinite(n) ? Math.max(0,n) : 0;
export function commanderOwnerGrowth(current,raw){
 const reference=Math.max(1,nonnegative(raw));
 // Soft capped: card, equipment synergy, skill buffs and sigils can strengthen the
 // owner-to-pet link without an unlimited second damage multiplier.
 return Math.min(.18,Math.max(0,nonnegative(current)/reference-1)*.10);
}
export function commanderInheritedPetStats(base,owner){
 const atk=nonnegative(owner.atk),matk=nonnegative(owner.matk);
 const physical=commanderOwnerGrowth(atk,owner.rawAtk);
 const magical=commanderOwnerGrowth(matk,owner.rawMatk);
 return {...base,
  atk:Math.round((base.atk+atk*.30)*(1+physical)),
  matk:Math.round((base.matk+matk*.30)*(1+magical)),
  def:base.def+nonnegative(owner.def)*.35,
  mdef:base.mdef+nonnegative(owner.mdef)*.35};
}
