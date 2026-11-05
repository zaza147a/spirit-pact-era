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
 // A character's offensive card and equipped affix effects strengthen pet training.
 // The one companion receives earned offense with a 36% growth cap.
 const training=Math.min(.28,(nonnegative(owner.cardPower)+nonnegative(owner.gearPower))/100);
 const physical=Math.min(.36,commanderOwnerGrowth(atk,owner.rawAtk)+training);
 const magical=Math.min(.36,commanderOwnerGrowth(matk,owner.rawMatk)+training);
 // Shift strength out of the free baseline and into earned owner growth.
 // At full training (.36), 1.3528 is almost the old 1.36; at zero, it is .82.
 const trainedMultiplier=growth=>.82+growth*1.48;
 const cultivation=Number.isFinite(owner.cultivation)?Math.min(1,Math.max(0,owner.cultivation)):1;
 return {...base,
  atk:Math.round((base.atk+atk*.30)*trainedMultiplier(physical)*cultivation),
  matk:Math.round((base.matk+matk*.30)*trainedMultiplier(magical)*cultivation),
  def:base.def+nonnegative(owner.def)*.35,
  mdef:base.mdef+nonnegative(owner.mdef)*.35,
  hp:Math.round(nonnegative(base.hp)+nonnegative(owner.hp)*.25),
  damageReduction:Math.min(40,nonnegative(base.damageReduction)+nonnegative(owner.damageReduction)*.35)};
}
