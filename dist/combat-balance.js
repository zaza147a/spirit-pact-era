// Incoming monster damage deliberately uses partial defense mitigation.
// At equal early levels, monster damage must remain visible even on a swordman.
export function incomingMonsterDamage(attack,defense,roll=1){
 const attackValue=Math.max(0,Number(attack)||0),armor=Math.max(0,Number(defense)||0);
 const damage=Math.round(attackValue*Math.max(.75,Math.min(1.25,roll))-armor*.35);
 return Math.max(3,Math.round(attackValue*.35),damage);
}
export const aspdAttackIntervalMs=aspd=>Math.max(140,Math.round((200-Math.min(193,Math.max(100,aspd)))*20));
export const roStyleCritRate=(luk,gearCrit=0)=>Math.min(100,Math.round((1+Math.max(0,luk)*.3+gearCrit)*10)/10);
// Scale rating differences with their magnitude so late-game FLEE cannot trivialize combat.
export const hitChance=(hit,flee)=>{const h=Math.max(0,Number(hit)||0),f=Math.max(0,Number(flee)||0);return Math.max(.05,Math.min(.95,.8+(h-f)/(100+Math.max(h,f)*2)));};
export const monsterCombatStats=monster=>{const level=monster.level||1,boss=!!monster.boss;const values=level<=50?{hit:65+level*1.8,flee:45+level*1.6,aspd:132+level*.35}:{hit:75+level*2,flee:60+level*2,aspd:Math.min(165,150+Math.max(0,level-51)*.2)};return boss?{hit:values.hit+20,flee:values.flee+35,aspd:values.aspd-5}:values;};
export const LEVEL_CAPS=Object.freeze({base:99,job:50,secondJobUnlock:40,rebirthUnlock:99,skill:10});
