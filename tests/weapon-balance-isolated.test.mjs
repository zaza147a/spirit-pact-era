import test from 'node:test';
import assert from 'node:assert/strict';
import {GEAR_BASE,affixRange,gearStatValue,rollGear} from '../dist/loot.js';
import {JOB_SKILLS,weaponSkillAllowed} from '../dist/job-skills.js';
import {aspdAttackIntervalMs,outgoingHitDamage} from '../dist/combat-balance.js';

const midpoint=(k,tier,rarity)=>{const [a,b]=affixRange(k,tier,rarity);return (a+b)/2};
const attacksPerSecond=aspd=>1000/aspdAttackIntervalMs(aspd);
const scenarios=[
 {label:'as-is',secondary:1,katarBonus:0,dualAspd:193,katarAspd:190},
 {label:'candidate-A',secondary:.35,katarBonus:.4,dualAspd:193,katarAspd:190},
 {label:'candidate-B',secondary:.45,katarBonus:.5,dualAspd:193,katarAspd:193},
 {label:'candidate-C',secondary:.5,katarBonus:.55,dualAspd:193,katarAspd:190},
];
// Reproducible analytical proxy; this is NOT a full battle-engine replay.
function weaponProxy({tier,base,armor,ratio=1.86*1.4*1.72,scenario}){
 const main=midpoint('atk',tier,'mythic');
 const dual=base+main*(1+scenario.secondary);
 const katar=base+main*(1+scenario.katarBonus);
 const dps=(atk,aspd)=>outgoingHitDamage(atk*ratio,armor)*attacksPerSecond(aspd);
 return {dualATK:dual,katarATK:katar,dualProxy:dps(dual,scenario.dualAspd),katarProxy:dps(katar,scenario.katarAspd)};
}
test('weapon main affix range is currently equal between one and two hand',()=>{
 for(const tier of [1,3,6,8,9,10,11])for(const rarity of ['common','uncommon','mythic']){
  const pair=['blade','twoSword','katar','offDagger'];
  for(const id of pair)assert.equal(GEAR_BASE[id].weaponType!==undefined,true);
  const r=affixRange('atk',tier,rarity);
  assert.deepEqual(r,affixRange('atk',tier,rarity));
 }
});
test('modern primary affix excludes obsolete fixed base value',()=>{
 for(const id of ['blade','twoSword','rifle','offDagger','katar']){
  const item=rollGear(id,200,'mythic',()=>.5);
  assert.equal(item.powerVersion,50);
  assert.equal(gearStatValue(item,'atk'),item.affixes.atk);
 }
});
test('assassin skill compatibility is currently asymmetric',()=>{
 const find=id=>JOB_SKILLS.assassin.find(x=>x.id===id);
 for(const id of ['dualStrike','sonicBlow']){
  assert.ok(weaponSkillAllowed(find(id),'dagger','dagger'));
  assert.ok(weaponSkillAllowed(find(id),'katar',null));
 }
 assert.equal(weaponSkillAllowed(find('katarSlash'),'dagger','dagger'),false);
 assert.equal(weaponSkillAllowed(find('katarSlash'),'katar',null),true);
});
test('candidate-B balances simplified attack events at Lv200 assumptions',()=>{
 const result=weaponProxy({tier:11,base:2650,armor:6500,scenario:scenarios[2]});
 const ratio=result.katarProxy/result.dualProxy;
 assert.ok(ratio>.95&&ratio<1.06);
});
for(const tier of [3,6,8,9,10,11])test('all isolated proxies remain positive at tier '+tier,()=>{
 for(const scenario of scenarios){
  const result=weaponProxy({tier,base:260*tier,armor:Math.round(2**(tier-1)*6),scenario});
  assert.ok(result.dualProxy>0&&result.katarProxy>0);
 }
});
