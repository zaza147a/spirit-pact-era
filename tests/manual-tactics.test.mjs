import test from 'node:test';
import assert from 'node:assert/strict';
import {TACTIC_COOLDOWN_MS,SECOND_TACTICS,FIRST_TACTICS,manualTactic,tacticRemaining,tacticSPCost,tacticActive,tacticDamageFactor,tacticIncomingFactor} from '../dist/manual-tactics.js';
test('all ten second jobs have separate manual tactics and fixed 60 second cooldown',()=>{
 assert.equal(TACTIC_COOLDOWN_MS,60000);
 assert.equal(Object.keys(SECOND_TACTICS).length,10);
 assert.equal(new Set(Object.values(SECOND_TACTICS).map(x=>x.name)).size,10);
 for(const [job,rule] of Object.entries(SECOND_TACTICS)){assert.equal(manualTactic(job),rule);assert.ok(rule.duration>=3000&&rule.duration<=7000);assert.ok(rule.spPct>=10);}
 for(const job of ['swordsman','mage','thief','archer','acolyte'])assert.ok(FIRST_TACTICS[job]);
});
test('cooldown persists by timestamp, regardless of session timers',()=>{
 assert.equal(tacticRemaining({tacticReadyAt:65000},5000),60);
 assert.equal(tacticRemaining({tacticReadyAt:65000},64001),1);
 assert.equal(tacticRemaining({tacticReadyAt:65000},65000),0);
 assert.equal(tacticSPCost(1000,SECOND_TACTICS.monk),300);
});
test('damage increases only for the intended job and target',()=>{
 const mark={kind:'execute',target:'boss'};
 const boss={instanceId:'boss',hp:20,maxHp:100},other={instanceId:'other',hp:20,maxHp:100};
 assert.equal(tacticDamageFactor(mark,'assassin',boss,false),1.35);
 assert.equal(tacticDamageFactor(mark,'assassin',other,false),1);
 assert.equal(tacticDamageFactor({kind:'burst'},'knight',boss,false),1.25);
 assert.equal(tacticDamageFactor({kind:'burst'},'knight',boss,true),1);
});
test('defensive effects are distinct for owner and companion',()=>{
 assert.equal(tacticIncomingFactor({kind:'guard'},false),.6);
 assert.equal(tacticIncomingFactor({kind:'guard'},true),.75);
 assert.equal(tacticIncomingFactor({kind:'frenzy'},false),1.25);
 assert.equal(tacticIncomingFactor({kind:'frenzy'},true),1);
 assert.equal(tacticActive({tacticEffect:{kind:'decoy',until:100}},100),null);
});
