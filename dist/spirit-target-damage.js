// Class identity multipliers, after equipment cultivation and before HP clamping.
// Pact Sovereign: focus one target regardless of boss status, reduced splash.
// Spirit Commander: stronger versus ordinary enemies; boss damage stays neutral.
export function spiritTargetDamageFactor(job,key,{boss=false,secondary=false,level=1}={}){
 if(job==='pactWarrior'&&key==='playerDamage')return secondary?.70:1.12;
 return 1;
}
