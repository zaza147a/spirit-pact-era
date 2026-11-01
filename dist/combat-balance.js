// Incoming monster damage deliberately uses partial defense mitigation.
// At equal early levels, monster damage must remain visible even on a swordman.
export function incomingMonsterDamage(attack,defense,roll=1){
 const attackValue=Math.max(0,Number(attack)||0),armor=Math.max(0,Number(defense)||0);
 const damage=attackValue*500/(500+armor)*Math.max(.75,Math.min(1.25,roll));
 return Math.max(1,Math.round(damage));
}
export const aspdAttackIntervalMs=aspd=>Math.max(140,Math.round((200-Math.min(193,Math.max(100,aspd)))*20));
export const roStyleCritRate=(luk,gearCrit=0)=>Math.min(100,Math.round((1+Math.max(0,luk)*.3+gearCrit)*10)/10);
// Scale rating differences with their magnitude so late-game FLEE cannot trivialize combat.
export const hitChance=(hit,flee)=>{const h=Math.max(0,Number(hit)||0),f=Math.max(0,Number(flee)||0);return Math.max(.05,Math.min(.95,.8+(h-f)/(100+Math.max(h,f)*2)));};
// Conventional FLEE primarily evades physical swings. Magic retains a small
// evasion contribution, so magical monsters cannot be nullified by AGI alone.
export const monsterHitChance=(hit,flee,magical=false)=>hitChance(hit,magical?flee*.25:flee);
export const monsterCombatStats=monster=>{const level=monster.level||1,boss=!!monster.boss;const values=level<=50?{hit:65+level*1.8,flee:45+level*1.6,aspd:132+level*.35}:{hit:level>=151?16000*2**Math.floor((level-151)/20)+(level-151)%20*150:level>=131?2000+(level-131)*20:level>=111?1000+(level-111)*20:75+level*2,flee:60+level*2,aspd:Math.min(165,150+Math.max(0,level-51)*.2)};return boss?{hit:values.hit+20,flee:values.flee+35,aspd:values.aspd-5}:values;};
// Keep archived hit/flee/ASPD baselines stable; the active encounter adds magic stats.
export const monsterRuntimeStats=monster=>{const level=monster.level||1;return {...monsterCombatStats(monster),matk:monster.matk??Math.round((monster.atk||0)*(level>=151?1.12:1.06)),mdef:monster.mdef??Math.round((monster.def||0)*(level>=151?1.15:.9)),attackType:monster.attackType||((level%3===0)?'magic':'physical')};};
export const monsterAttackPower=monster=>monster?.attackType==='magic'?(monster.matk??monster.atk??0):(monster?.atk??0);
export const monsterDefenseAgainst= (monster,magical=false)=>magical?(monster?.mdef??Math.round((monster?.def||0)*.9)):(monster?.def??0);
export const LEVEL_CAPS=Object.freeze({base:200,job:70,secondJobUnlock:40,rebirthUnlock:99,skill:10});
// Stage-specific team output coefficients fitted from actual 10-job × companion
// clear tests. These scale the whole job+pet team uniformly for a fair
// same-role job comparison; they do not impose a fixed P/C/B split on fusions.
const BALANCE_JOB_ORDER=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
const BALANCE_ANCHORS=[
 [50,[1,1,1,1,1,1,1,1,1,1]],
 [99,[.94,.87,.95,1,1.21,1,.95,1.11,1.26,1.02]],
 [110,[1.04,.92,.74,1.01,.95,.91,1.49,.90,1.32,.99]],
 [130,[1.03,.76,.76,1.06,.95,1.02,1.26,.94,1.39,1.33]],
 [150,[1.12,.87,.78,1.03,1.02,1.03,1.05,1.03,1.85,1.60]],
 [160,[1,1,1,1,1,1,1,1,1,1]],
 // Mild late-game smoothing of same-role clear-speed outliers; keep every
 // 201+ SSS coefficient unchanged and retain role-specific utility tradeoffs.
 [200,[1.025,1.02,1,1,1.01,1.03,1,1.01,1,.98]],
 [201,[1.06,1.10,1.05,1.05,1.25,1.14,.78,1.12,1,.96]]
];
export function jobZoneOutputFactor(job,level=1){
 const index=BALANCE_JOB_ORDER.indexOf(job);
 if(index<0||level<=50)return 1;
 const upper=BALANCE_ANCHORS.findIndex(([lv])=>lv>=level);
 if(upper<0)return BALANCE_ANCHORS.at(-1)[1][index];
 if(upper===0)return 1;
 const [to,tValues]=BALANCE_ANCHORS[upper],[from,fValues]=BALANCE_ANCHORS[upper-1];
 return fValues[index]+(tValues[index]-fValues[index])*Math.max(0,Math.min(1,(level-from)/(to-from)));
}
// Roll after mitigation: defense must not amplify a small random range into tenfold hits.
// Critical damage multiplies the mitigated hit, matching the displayed critical multiplier.
export function outgoingHitDamage(power,defense,roll=1,criticalMultiplier=1){const base=Math.max(1,Math.max(0,Number(power)||0)-Math.max(0,Number(defense)||0));return Math.max(1,Math.round(base*Math.max(.9,Math.min(1.1,Number(roll)||1))*Math.max(1,Number(criticalMultiplier)||1)));}
