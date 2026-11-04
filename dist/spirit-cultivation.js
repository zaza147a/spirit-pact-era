// Third-job spirit cultivation gate: low investment starts behind legacy jobs,
// while level-200 mythic SSS owner/pet equipment and sigil 8 retain full potential.
const RARITY={common:.25,rare:.4,uncommon:.55,legendary:.75,mythic:1};
const RANK={D:.15,C:.25,B:.35,A:.48,S:.64,SS:.82,SSS:1};
const clamp01=n=>Math.min(1,Math.max(0,Number(n)||0));
export function spiritItemInvestment(item){
 if(!item)return 0;
 const level=clamp01((Number(item.level)||1)/200);
 const rarity=RARITY[item.rarity]??RARITY.common;
 const enhancement=RANK[item.enhancement]||0;
 return level*(rarity*.5+enhancement*.5);
}
export function spiritCultivationProgress(player,pets=[]){
 const gear=Object.values(player?.gear||{});
 const owner=gear.reduce((n,g)=>n+spiritItemInvestment(g),0)/10;
 // Each deployed companion must be developed; missing slots remain zero.
 const roster=pets.slice(0,2);
 const petGear=roster.reduce((n,p)=>n+Object.values(p?.gear||{}).reduce((s,g)=>s+spiritItemInvestment(g),0),0)/6;
 const sigil=clamp01((Number(player?.dawnSigil)||0)/8);
 return Math.min(1,.4*owner+.3*petGear+.3*sigil);
}
export function spiritCultivationMultiplier(player,pets=[]){
 return .35+.65*spiritCultivationProgress(player,pets);
}
