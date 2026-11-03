import test from 'node:test';
import assert from 'node:assert/strict';
import {DUAL_SPIRIT_RULES,dualSpiritResonance,canTriggerDualSpirit} from '../dist/dual-fusion-resonance.js';
const fused=(a,b)=>({hp:100,fusion:{main:a,sub:b}});
test('six unordered fusion forms yield 21 unique names per branch',()=>{
 const rules=Object.values(DUAL_SPIRIT_RULES);
 assert.equal(rules.length,21);
 assert.equal(new Set(rules.map(x=>x.warriorName)).size,21);
 assert.equal(new Set(rules.map(x=>x.commanderName)).size,21);
});
test('both fusion pets must be living and owner must be third job',()=>{
 const pets=[fused('attack','magic'),fused('defense','support')];
 assert.equal(dualSpiritResonance({job:'pactWarrior',thirdJob:false},pets),null);
 assert.ok(dualSpiritResonance({job:'pactWarrior',thirdJob:true},pets));
 pets[1].hp=0;
 assert.equal(dualSpiritResonance({job:'spiritCommander',thirdJob:true},pets),null);
});
test('third hit resonance uses cooldown and only owner third hit',()=>{
 const pets=[fused('magic','attack'),fused('support','defense')];
 for(const job of ['pactWarrior','spiritCommander']){
  const rule=dualSpiritResonance({job,thirdJob:true},pets);
  assert.ok(canTriggerDualSpirit(rule,'thirdHit_'+job,15000,0,'enemy'));
  assert.equal(canTriggerDualSpirit(rule,'pet',16000,15000,'enemy'),false);
  assert.equal(canTriggerDualSpirit(rule,'thirdHit_'+(job==='pactWarrior'?'spiritCommander':'pactWarrior'),16000,0,'enemy'),false);
  assert.equal(canTriggerDualSpirit(rule,'thirdHit_'+job,16000,15000,'enemy'),false);
 }
});
