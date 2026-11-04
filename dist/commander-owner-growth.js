// Spirit Commander owner-led growth. Keep pet IV/evolution/equipment in base stats;
// the extra resonance growth follows the owner's *current* combat strength.
const nonnegative = n => Number.isFinite(n) ? Math.max(0,n) : 0;
export function commanderOwnerGrowth(current,raw){
 const reference=Math.max(1,nonnegative(raw));
 // Soft capped: card, equipment synergy, skill buffs and sigils can strengthen the
 // owner-to-pet link without an unlimited second damage multiplier.
 return Math.min(.24,Math.max(0,nonnegative(current)/reference-1)*.13);
}
export function commanderInheritedPetStats(base,owner){
 const atk=nonnegative(owner.atk),matk=nonnegative(owner.matk);
 // A character's offensive cards represent learned combat power as well as flat stats.
 // Share it with both pets, with a 36% shared offense cap to avoid runaway two-pet DPS.
 const training=Math.min(.28,nonnegative(owner.cardPower)/100);
 const physical=Math.min(.36,commanderOwnerGrowth(atk,owner.rawAtk)+training);
 const magical=Math.min(.36,commanderOwnerGrowth(matk,owner.rawMatk)+training);
 return {...base,
  atk:Math.round((base.atk+atk*.30)*(1+physical)),
  matk:Math.round((base.matk+matk*.30)*(1+magical)),
  def:base.def+nonnegative(owner.def)*.35,
  mdef:base.mdef+nonnegative(owner.mdef)*.35};
}
