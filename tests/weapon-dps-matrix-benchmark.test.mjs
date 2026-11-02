import test from 'node:test';
import assert from 'node:assert/strict';
import {GEAR_BASE,affixRange,primaryAffix} from '../dist/loot.js';
import {THIRD_MAIN_CURVES} from '../dist/third-jobs.js';
import {aspdAttackIntervalMs,outgoingHitDamage,incomingMonsterDamage} from '../dist/combat-balance.js';
import {SECOND_JOBS,parentJob} from '../dist/jobs.js';
import {ENHANCEMENT_POWER} from '../dist/sky-trials.js';

// A controlled *weapon-only attack-cycle proxy*, not a complete game DPS run.
// It intentionally omits skill scheduling, hit, crit, attributes, buffs, cards,
// companion, AOE, cooldown, resonance, enemy reactions and survival interruptions.
// All comparisons within a single job share one assumed non-weapon ATK/MATK.
const LOADOUTS={
 knight:['blade+shield','oneSpear+shield','twoSword','twoSpear'],
 crusader:['blade+shield','oneSpear+shield'],
 wizard:['oneStaff+shield','twoStaff'],
 sage:['oneStaff+shield','twoStaff','spellFist'],
 assassin:['rifle+shield','rifle+offDagger','katar'],
 rogue:['rifle+shield'],
 priest:['mace+shield'],
 monk:['knuckles'],
 hunter:['shortBow','longBow','crossbow'],
 performer:['instrument','shortBow','longBow']
};
const TIERS=[{level:50,tier:3},{level:100,tier:6},{level:150,tier:8},{level:170,tier:9},{level:190,tier:10},{level:200,tier:11},{level:210,tier:11}];
const SOURCE_CURVES=THIRD_MAIN_CURVES;
const mainAffix=(id,tier,quality)=>{
 const key=primaryAffix(id),[min,max]=affixRange(key,tier,quality);
 return (min+max)/2;
};
const candidates=[
 {id:'current',twoHand:1,secondary:1,aspdPenalty:3},
 {id:'global-35-percent',twoHand:1.35,secondary:1,aspdPenalty:3},
 {id:'weapon-tradeoff-prototype',twoHand:1.4,secondary:.45,aspdPenalty:3},
 {id:'weapon-tradeoff-no-speed-penalty',twoHand:1.4,secondary:.45,aspdPenalty:0}
];
function evaluate(job,combo,level,tier,bossDef,scenario,enhancement=null){
 const [id,off]=combo.split('+'),weapon=GEAR_BASE[id],dual=!!off&&off==='offDagger';
 assert.ok(weapon&&(weapon.hands===2||off),job+' '+combo);
 assert.ok(!weapon.jobs||weapon.jobs.includes(job)||weapon.jobs.includes(parentJob(job)));
 const source=primaryAffix(id),main=mainAffix(id,tier,'mythic');
 const enhanced=ENHANCEMENT_POWER[enhancement]||1;
 const weaponAttack=main*enhanced*(weapon.hands===2?scenario.twoHand:1)+(dual?main*enhanced*scenario.secondary:0);
 // Assumed equal non-weapon stat, only meaningful as matched within-job sensitivity.
 const base=level*15;
 const aspd=Math.min(193,193-(weapon.hands===2?scenario.aspdPenalty:0));
 const perSecond=1000/aspdAttackIntervalMs(aspd);
 const curve=SOURCE_CURVES[job][SOURCE_CURVES[job].length-1];
 // Rank 10 main, 1.4 third-job multiplier, 8% per additional rank.
 const skillMultiplier=curve*1.4*(1+.08*9);
 const rawPower=(base+weaponAttack)*skillMultiplier;
 const oneHit=outgoingHitDamage(rawPower,bossDef);
 const shieldDefense=off==='shield'?mainAffix('shield',tier,'mythic')*enhanced:0;
 const victimDamage=incomingMonsterDamage(15000,1000+shieldDefense);
 return {job,combo,level,tier,source,enhancement:enhancement||'none',bossDef,scenario:scenario.id,weaponAttack:Math.round(weaponAttack),attackSpeed:aspd,oneHit,eventsPerSecond:+perSecond.toFixed(3),attackCycleProxy:Math.round(oneHit*perSecond),incomingHit:victimDamage};
}
test('all ten jobs and 23 filled weapon slots can be analyzed',()=>{
 assert.equal(Object.keys(LOADOUTS).length,10);
 assert.equal(Object.values(LOADOUTS).flat().length,23);
 for(const [job,combos] of Object.entries(LOADOUTS))for(const combo of combos){
  const x=evaluate(job,combo,200,11,6500,candidates[0]);
  assert.ok(x.oneHit>0&&x.attackCycleProxy>0);
  assert.ok(x.incomingHit>0);
 }
});
test('different weapon classes must not be mistaken for unique attack rolls today',()=>{
 const tier=11;
 for(const [a,b] of [['shortBow','longBow'],['longBow','crossbow'],['twoSword','twoSpear'],['blade','oneSpear'],['rifle','katar']]){
  assert.equal(primaryAffix(a),primaryAffix(b));
  assert.equal(mainAffix(a,tier,'mythic'),mainAffix(b,tier,'mythic'));
 }
});
test('shield has a major defensive advantage under fixed incoming attack',()=>{
 const shield=evaluate('assassin','rifle+shield',200,11,6500,candidates[0]);
 const noShield=evaluate('assassin','katar',200,11,6500,candidates[0]);
 assert.ok(shield.incomingHit < noShield.incomingHit*.2);
});
test('replay controlled weapon-only sensitivity across levels bosses and ranks',()=>{
 let cases=0,comparisons=0;
 const table=[];
 for(const {level,tier} of TIERS)for(const defense of [250,6500,30000])for(const enhancement of [null,'SSS'])for(const [job,combos] of Object.entries(LOADOUTS)){
  const values=combos.map(combo=>evaluate(job,combo,level,tier,defense,candidates[0],enhancement));
  const best=Math.max(...values.map(v=>v.attackCycleProxy));
  for(const x of values){assert.ok(x.attackCycleProxy>0);cases++;if(level===200&&defense===6500&&enhancement==='SSS')table.push({...x,relativePercent:+(100*x.attackCycleProxy/best).toFixed(1)});}
  comparisons++;
 }
 console.log('CONTROLLED_WEAPON_PROXY_SUMMARY',JSON.stringify({loadouts:23,jobs:10,cases,comparisons,exampleLv200SSS:table}));
 assert.equal(cases,23*TIERS.length*3*2);
});
test('candidate factors are sensitivities only, not universal fixes',()=>{
 for(const job of ['knight','wizard','sage','assassin'])for(const combo of LOADOUTS[job]){
  const values=candidates.map(s=>evaluate(job,combo,200,11,6500,s,'SSS'));
  assert.equal(values.length,4);
  for(const v of values)assert.ok(Number.isFinite(v.attackCycleProxy));
 }
});
