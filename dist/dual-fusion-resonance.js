import {canonicalDualFusionKey,DUAL_FUSION_TYPES,FUSION_TYPES} from './spirit-job-rules.js';
const TRAITS=[
 ['破星雙牙','pierce'],['鐵誓破陣','guard'],['雙星援斬','heal'],['雷火追魂','burst'],['靈脈互鎖','focus'],['琉璃雙環','cleave'],
 ['鋼鐵雙契','guard'],['護誓協奏','heal'],['鎧靈穿界','pierce'],['星盾脈衝','guard'],['守護共振','focus'],
 ['晨星續航','heal'],['星霧追擊','cleave'],['生靈旋舞','heal'],['虛實相生','burst'],
 ['靈鋼重轟','pierce'],['霜盾迴旋','guard'],['靈壁永續','heal'],
 ['雙生祝禱','focus'],['交響之心','heal'],['雙界庇護','guard']
];
// Stage-one conditional signatures: situational utility within the existing
// resonance activation. They never create a separate event or free attack.
const SIGNATURES=Object.freeze([
 'armorEcho','rescueGuard','recoveryChain','bossTrace','finisherFocus','crowdWard',
 'fortressCounter','sacredRelay','wardPierce','shieldCascade','lastStand','mutualRenewal',
 'crossRelay','echoBalance','rescueBurst','arcaneBulwark','frostWard','guardianPrayer','twinFocus','sanctuaryPulse','lastBastion'
]);
// Branch-specific stage-one follow-ups. The shared fusion signature remains
// active, while each third-job route gains a different situational behavior.
const WARRIOR_ROUTES=Object.freeze([
 'rendingEdge','guardBreak','duelRecovery','spellExecution','focusChase','sweepingExpose',
 'fortressCrack','vowReprisal','piercingContract','guardedStrike','unyieldingFocus','doubleTempo',
 'relayCut','balancedEdge','rescueGambit','arcaneSunder','frostRend','guardianEdge',
 'doubleSentence','sanctuaryRupture','bastionBreaker'
]);
const COMMANDER_ROUTES=Object.freeze([
 'arcaneGuard','sharedBulwark','supportTempo','mageWard','dualReplenish','frontlineReinforce',
 'twinFortification','choralRecovery','wardHandoff','sentryPulse','spiritShelter','mutualChorus',
 'relayShelter','balanceChant','massRescue','arcaneReinforce','frostRecovery','prayerRelay',
 'choralFocus','sanctuaryRelay','fortressRevival'
]);
// Retain the original unique-pair signatures and coefficients; the six
// mirrored same-type pairs are no longer legal dual-companion formations.
const OLD_KEYS=FUSION_TYPES.flatMap((a,i)=>FUSION_TYPES.slice(i).map(b=>[a,b].sort().join('+')));
const uniqueIndexes=DUAL_FUSION_TYPES.map(key=>OLD_KEYS.indexOf(key));
if(uniqueIndexes.some(i=>i<0)||TRAITS.length!==OLD_KEYS.length||SIGNATURES.length!==OLD_KEYS.length||WARRIOR_ROUTES.length!==OLD_KEYS.length||COMMANDER_ROUTES.length!==OLD_KEYS.length)throw Error('雙靈組合／特色表不完整');
if(new Set(SIGNATURES).size!==SIGNATURES.length||new Set(WARRIOR_ROUTES).size!==WARRIOR_ROUTES.length||new Set(COMMANDER_ROUTES).size!==COMMANDER_ROUTES.length)throw Error('雙靈組合／特色表不完整或重複');
export const DUAL_SPIRIT_RULES=Object.fromEntries(DUAL_FUSION_TYPES.map((key,index)=>{
 const sourceIndex=uniqueIndexes[index];
 const [name,trait]=TRAITS[sourceIndex],cooldownMs=9000+(sourceIndex%4)*1000;
 return [key,Object.freeze({key,warriorName:'靈契・'+name,commanderName:'萬靈・'+name,trait,signature:SIGNATURES[sourceIndex]||null,warriorRoute:WARRIOR_ROUTES[sourceIndex]||null,commanderRoute:COMMANDER_ROUTES[sourceIndex]||null,cooldownMs,warriorCoefficient:.10+(sourceIndex%3)*.015,commanderCoefficient:.08+(sourceIndex%3)*.012})];
}));
export function dualSpiritResonance(player,roster){
 if(!player?.thirdJob||!['pactWarrior','spiritCommander'].includes(player.job)||roster?.length!==2||roster.some(p=>p.hp<=0))return null;
 const key=canonicalDualFusionKey(roster[0],roster[1]);
 const rule=DUAL_SPIRIT_RULES[key];
 if(!rule)return null;
 return {...rule,name:player.job==='pactWarrior'?rule.warriorName:rule.commanderName,coefficient:player.job==='pactWarrior'?rule.warriorCoefficient:rule.commanderCoefficient,ownerJob:player.job,routeEffect:player.job==='pactWarrior'?rule.warriorRoute:rule.commanderRoute};
}
export function canTriggerDualSpirit(rule,event,now,lastAt=0,targetId=null,previousTargetId=null){
 if(!rule||!['thirdHit_pactWarrior','thirdHit_spiritCommander'].includes(event)||event!=='thirdHit_'+rule.ownerJob)return false;
 if(lastAt>0&&now-lastAt<rule.cooldownMs)return false;
 if(!targetId)return false;
 return true;
}
