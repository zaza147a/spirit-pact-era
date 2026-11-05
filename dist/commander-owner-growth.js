// Spirit Commander owner-led growth. Keep pet IV/evolution/equipment in base stats;
// the extra resonance growth follows the owner's *current* combat strength.
const nonnegative = n => Number.isFinite(n) ? Math.max(0,n) : 0;
export function commanderOwnerGrowth(current,raw){
 const reference=Math.max(1,nonnegative(raw));
 // Soft capped: card, equipment synergy, skill buffs and sigils can strengthen the
 // owner-to-pet link without an unlimited second damage multiplier.
 return Math.min(.24,Math.max(0,nonnegative(current)/reference-1)*.13);
}
export function commanderMainSkillMultiplier(owner,pet,fusion){
 // The owner contributes 120% of the relevant attribute to the first equipped
 // pet skill's damage ratio, not to the companion's permanent ATK/MATK panel.
 const sources={
  'attack-magic':['atk','matk'],
  'attack-defense':['atk','def'],
  'attack-support':['atk','matk'],
  'magic-defense':['matk','mdef'],
  'magic-support':['matk'],
  'defense-support':['def','mdef']
 }[fusion]||['atk','matk'];
 const contribution=sources.reduce((sum,key)=>sum+nonnegative(owner[key])/Math.max(1,nonnegative(pet[key])),0)/sources.length;
 return 1+Math.min(1.20,contribution*1.20);
}
export function commanderInheritedPetStats(base,owner){
 const atk=nonnegative(owner.atk),matk=nonnegative(owner.matk);
 // A character's offensive card and equipped affix effects strengthen pet training.
 // The one companion receives earned offense with a 36% growth cap.
 const training=Math.min(.28,(nonnegative(owner.cardPower)+nonnegative(owner.gearPower))/100);
 const physical=Math.min(.36,commanderOwnerGrowth(atk,owner.rawAtk)+training);
 const magical=Math.min(.36,commanderOwnerGrowth(matk,owner.rawMatk)+training);
 // Single-companion baseline is stronger, while fully trained multiplier stays
 // at 1.3528; card and gear investment retain their original soft cap.
 const trainedMultiplier=growth=>.91+growth*1.23;
 const cultivation=Number.isFinite(owner.cultivation)?Math.min(1,Math.max(0,owner.cultivation)):1;
 return {...base,
  atk:Math.round(nonnegative(base.atk)*trainedMultiplier(physical)*cultivation),
  matk:Math.round(nonnegative(base.matk)*trainedMultiplier(magical)*cultivation),
  def:base.def*.35+nonnegative(owner.def)*.02,
  mdef:base.mdef*.54+nonnegative(owner.mdef)*.02,
  hp:Math.round(nonnegative(base.hp)+nonnegative(owner.hp)*.01),
  damageReduction:Math.min(40,nonnegative(base.damageReduction)*.25+nonnegative(owner.damageReduction)*.03)};
}
