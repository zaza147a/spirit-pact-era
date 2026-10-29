// A diagnostic HP-equivalent score, not a universal class power ranking.
// Count event sources once: buff damage belongs to its caster, shields only when
// absorbed, healing only when missing HP is restored, tanking only actual HP lost.
// Raw received-damage duplicates, hypothetical interception, mana and interrupt
// counts are displayed separately and must not be added to this HP total.
export const CONTRIBUTION_RULES={damage:1,effectiveHealing:1,absorbedShield:1,tanking:1};
export function combatContribution(metrics={}){
 const m=metrics||{},value=key=>Number.isFinite(m[key])?Math.max(0,m[key]):0;
 const owner={damage:value('playerDamage')+value('playerBuffDamage'),healing:value('playerHeal'),shield:value('playerShieldPrevented'),tanking:value('playerTanked')+value('playerProtection')};
 const pet={damage:value('petDamage')+value('resonanceDamage')+value('buffDamage'),healing:value('effectiveHeal'),shield:value('shieldPrevented'),tanking:value('petTanked')+value('petProtection')};
 const total=side=>Object.values(side).reduce((sum,amount)=>sum+amount,0),ownerTotal=total(owner),petTotal=total(pet);
 return {owner,pet,ownerTotal,petTotal,total:ownerTotal+petTotal,ownerShare:ownerTotal/Math.max(1,ownerTotal+petTotal)};
}
