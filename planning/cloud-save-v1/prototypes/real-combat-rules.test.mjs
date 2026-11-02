// Directly import the unchanged production formulas; no combat formula mocks.
// Run: node --test planning/cloud-save-v1/prototypes/real-combat-rules.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {incomingMonsterDamage,aspdAttackIntervalMs,roStyleCritRate,hitChance,monsterHitChance,monsterCombatStats,monsterRuntimeStats,monsterAttackPower,monsterDefenseAgainst,jobZoneOutputFactor,outgoingHitDamage} from '../../../dist/combat-balance.js';

const JOBS=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer'];
test('armor mitigates monster damage but maintains minimum 1',()=>{assert.equal(incomingMonsterDamage(1000,0),1000);assert.equal(incomingMonsterDamage(1000,500),500);assert.equal(incomingMonsterDamage(1,1000000),1)});
test('monster damage roll bounded 75%-125%',()=>{assert.equal(incomingMonsterDamage(1000,0,0),750);assert.equal(incomingMonsterDamage(1000,0,2),1250)});
test('ASPD 193 maps to 140ms, upper and lower clamped',()=>{assert.equal(aspdAttackIntervalMs(193),140);assert.equal(aspdAttackIntervalMs(220),140);assert.equal(aspdAttackIntervalMs(100),2000)});
test('critical from LUK caps at 100',()=>{assert.equal(roStyleCritRate(0,0),1);assert.equal(roStyleCritRate(1000,0),100)});
test('hit rate bounded 5%-95%',()=>{assert.ok(hitChance(1e8,0)<=.95);assert.ok(hitChance(0,1e8)>=.05)});
test('magic attacks reduce flee avoidance',()=>assert.ok(monsterHitChance(100,1000,true)>monsterHitChance(100,1000,false)));
test('boss combat profile increases hit/flee and slows ASPD',()=>{const normal=monsterCombatStats({level:200}),boss=monsterCombatStats({level:200,boss:true});assert.equal(boss.hit-normal.hit,20);assert.equal(boss.flee-normal.flee,35);assert.equal(boss.aspd-normal.aspd,-5)});
test('runtime monster has magic attack and defense fallback',()=>{const m=monsterRuntimeStats({level:201,atk:100,def:100});assert.equal(m.matk,112);assert.equal(m.mdef,115)});
test('monster magic uses matk and magical defense',()=>{assert.equal(monsterAttackPower({attackType:'magic',matk:900,atk:700}),900);assert.equal(monsterDefenseAgainst({mdef:100,def:200},true),100)});
test('output damage subtracts defense before crit',()=>{assert.equal(outgoingHitDamage(1000,400,1,2),1200);assert.equal(outgoingHitDamage(100,1000),1)});
test('output roll bounded 90%-110%',()=>{assert.equal(outgoingHitDamage(1000,0,0.1),900);assert.equal(outgoingHitDamage(1000,0,2),1100)});
test('ten jobs all have finite positive multipliers at 50/200/201',()=>{for(const job of JOBS)for(const level of [50,200,201])assert.ok(Number.isFinite(jobZoneOutputFactor(job,level))&&jobZoneOutputFactor(job,level)>0)});
test('200 to 201 damage scaling has no discontinuity for ten jobs',()=>{for(const job of JOBS)assert.equal(jobZoneOutputFactor(job,200),jobZoneOutputFactor(job,201))});
test('crusader at level 200 has 1.35, rogue 1.07',()=>{assert.equal(jobZoneOutputFactor('crusader',200),1.35);assert.equal(jobZoneOutputFactor('rogue',200),1.07)});
test('unknown job stays multiplier 1',()=>assert.equal(jobZoneOutputFactor('not-a-job',200),1));
