// Class identity multipliers, after equipment cultivation and before HP clamping.
// Pact Sovereign: focus one target regardless of boss status, reduced splash.
// Spirit Commander: no enemy-type bonus; its role comes from dual-pet multi-target attacks.
export function spiritTargetDamageFactor(job,key,{boss=false,secondary=false,level=1}={}){
 if(job==='pactWarrior'&&key==='playerDamage')return secondary?.70:1.12;
 return 1;
}

// Multi-target identity: slightly weaker when there is only one live target.
// Does not discriminate between normal monsters and bosses.
export function spiritPetTargetFactor(job,availableTargets=1){
 return job==='spiritCommander'&&availableTargets<=1?.95:1;
}
