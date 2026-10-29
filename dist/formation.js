export const RANGED_JOBS=new Set(['archer','mage','acolyte','wizard','priest','hunter','performer']);
export const playerRange=job=>RANGED_JOBS.has(job)?'ranged':'melee';
export const companionRange=role=>['magic','support'].includes(role)?'ranged':'melee';
export const rangeLabel=range=>range==='ranged'?'遠距離':'近距離';
export function monsterTargetWeights(player,pet,role,guarding=false){
 const targets=[];
 if(player?.hp>0)targets.push({kind:'player',range:playerRange(player.job),weight:playerRange(player.job)==='melee'?4:1});
 if(pet?.hp>0){const range=companionRange(role);targets.push({kind:'pet',range,weight:role==='defense'?(guarding?12:6):range==='melee'?4:1});}
 return targets;
}
export function chooseMonsterTarget(player,pet,role,guarding=false,rng=Math.random){
 const targets=monsterTargetWeights(player,pet,role,guarding),total=targets.reduce((n,t)=>n+t.weight,0);if(!total)return null;
 let roll=Math.min(.999999999,Math.max(0,Number(rng())||0))*total;
 for(const target of targets){roll-=target.weight;if(roll<0)return target.kind;}return targets.at(-1).kind;
}
