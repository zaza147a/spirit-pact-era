// Before the Pact branch specializes through a third-job fusion, both
// offensive stats contribute. This is one power source, not two damage hits.
export const SPIRIT_PRE_FUSION_MINOR_ATTACK_RATIO=0.25;

export function spiritPreFusionAttack(job,thirdJob,atk,matk){
 if(thirdJob||!['spiritist','pactWarrior'].includes(job))return null;
 const physical=Math.max(0,Number(atk)||0),magical=Math.max(0,Number(matk)||0);
 return Math.max(physical,magical)+Math.min(physical,magical)*SPIRIT_PRE_FUSION_MINOR_ATTACK_RATIO;
}
