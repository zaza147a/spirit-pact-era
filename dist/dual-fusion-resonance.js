import {canonicalDualFusionKey,DUAL_FUSION_TYPES} from './spirit-job-rules.js';
const TRAITS=[
 ['破星雙牙','pierce'],['鐵誓破陣','guard'],['雙星援斬','heal'],['雷火追魂','burst'],['靈脈互鎖','focus'],['琉璃雙環','cleave'],
 ['鋼鐵雙契','guard'],['護誓協奏','heal'],['鎧靈穿界','pierce'],['星盾脈衝','guard'],['守護共振','focus'],
 ['晨星續航','heal'],['星霧追擊','cleave'],['生靈旋舞','heal'],['虛實相生','burst'],
 ['靈鋼重轟','pierce'],['霜盾迴旋','guard'],['靈壁永續','heal'],
 ['雙生祝禱','focus'],['交響之心','heal'],['雙界庇護','guard']
];
if(TRAITS.length!==DUAL_FUSION_TYPES.length)throw Error('雙靈組合表不完整');
export const DUAL_SPIRIT_RULES=Object.fromEntries(DUAL_FUSION_TYPES.map((key,index)=>{
 const [name,trait]=TRAITS[index],cooldownMs=9000+(index%4)*1000;
 return [key,Object.freeze({key,warriorName:'靈契・'+name,commanderName:'萬靈・'+name,trait,cooldownMs,warriorCoefficient:.10+(index%3)*.015,commanderCoefficient:.08+(index%3)*.012})];
}));
export function dualSpiritResonance(player,roster){
 if(!player?.thirdJob||!['pactWarrior','spiritCommander'].includes(player.job)||roster?.length!==2||roster.some(p=>p.hp<=0))return null;
 const key=canonicalDualFusionKey(roster[0],roster[1]);
 const rule=DUAL_SPIRIT_RULES[key];
 if(!rule)return null;
 return {...rule,name:player.job==='pactWarrior'?rule.warriorName:rule.commanderName,coefficient:player.job==='pactWarrior'?rule.warriorCoefficient:rule.commanderCoefficient,ownerJob:player.job};
}
export function canTriggerDualSpirit(rule,event,now,lastAt=0,targetId=null,previousTargetId=null){
 if(!rule||!['thirdHit_pactWarrior','thirdHit_spiritCommander'].includes(event)||event!=='thirdHit_'+rule.ownerJob)return false;
 if(lastAt>0&&now-lastAt<rule.cooldownMs)return false;
 if(!targetId)return false;
 return true;
}
