// Class identity multipliers, after equipment cultivation and before HP clamping.
// Pact Sovereign's main/secondary target ratios are explicit skill attributes;
// never stack another hidden damage ratio on top of the displayed 100%/75%.
// Spirit Commander: no enemy-type bonus; its role comes from dual-pet multi-target attacks.
export function spiritTargetDamageFactor(job,key,{boss=false,secondary=false,level=1}={}){
 return 1;
}

