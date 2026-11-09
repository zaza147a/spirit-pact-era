import test from 'node:test';
import assert from 'node:assert/strict';
import {SPIRIT_BASE_PROFILES,SPIRIT_FUSION_PROFILES} from '../dist/spirit-single-pet-profiles.js';
import {SPIRIT_PROC_RULES,createSpiritProcState,advanceSpiritProc} from '../dist/spirit-single-pet-procs.js';

test('all twenty unique skill identities have deterministic, bounded effects',()=>{
 const profiles=[...Object.values(SPIRIT_BASE_PROFILES),...Object.values(SPIRIT_FUSION_PROFILES)].flatMap(pair=>[pair.pact,pair.commander]);
 assert.equal(profiles.length,20);
 assert.equal(new Set(profiles.map(p=>p.effect)).size,20);
 for(const profile of profiles){
  const rule=SPIRIT_PROC_RULES[profile.effect];
  assert.ok(rule&&rule.charges>=1&&rule.charges<=4);
  assert.ok(rule.cooldownMs>=4500&&rule.bonusPct<=20);
  const state=createSpiritProcState();
  assert.equal(advanceSpiritProc(state,profile,'wrong',{now:10000}),null);
  for(let n=1;n<rule.charges;n++)assert.equal(advanceSpiritProc(state,profile,profile.trigger,{now:10000+n*100,channel:n%2?'magic':'physical',hpPercent:20}),null);
  const fired=advanceSpiritProc(state,profile,profile.trigger,{now:11000,channel:rule.alternating?'physical':'magic',hpPercent:20});
  assert.ok(fired,profile.effect+' needs to trigger');
  assert.equal(fired.effect,profile.effect);
  for(let n=0;n<rule.charges;n++)assert.equal(advanceSpiritProc(state,profile,profile.trigger,{now:11001+n,channel:n%2?'magic':'physical',hpPercent:20}),null);
 }
});
test('changing profiles resets charges, low-HP and alternating guards are enforced',()=>{
 const p={...SPIRIT_FUSION_PROFILES['attack-magic'].pact,stage:'third',source:'owner',fusion:'attack-magic'};
 const q={...SPIRIT_FUSION_PROFILES['defense-support'].pact,stage:'third',source:'owner',fusion:'defense-support'};
 const state=createSpiritProcState();
 assert.equal(advanceSpiritProc(state,p,p.trigger,{now:10000,channel:'magic'}),null);
 assert.equal(advanceSpiritProc(state,p,p.trigger,{now:10001,channel:'magic'}),null);
 assert.ok(advanceSpiritProc(state,p,p.trigger,{now:10002,channel:'physical'}));
 assert.equal(advanceSpiritProc(state,q,q.trigger,{now:11000,hpPercent:95}),null);
 assert.ok(advanceSpiritProc(state,q,q.trigger,{now:11001,hpPercent:35}));
 assert.equal(state.charges,0);
});

test('commander life verdict is triggered by outgoing hits, never by received damage',()=>{
 const profile={...SPIRIT_FUSION_PROFILES['defense-support'].commander,stage:'third',source:'pet',fusion:'defense-support'};
 const state=createSpiritProcState(),rule=SPIRIT_PROC_RULES.guardianVerdict;
 assert.equal(profile.trigger,'petHit');
 assert.equal(rule.charges,3);
 assert.equal(rule.hpBelow,undefined);
 assert.equal(advanceSpiritProc(state,profile,'petDamaged',{now:10000,hpPercent:99}),null);
 assert.equal(advanceSpiritProc(state,profile,'petHit',{now:10000,hpPercent:99}),null);
 assert.equal(advanceSpiritProc(state,profile,'petHit',{now:10100,hpPercent:99}),null);
 const first=advanceSpiritProc(state,profile,'petHit',{now:10200,hpPercent:99});
 assert.ok(first&&first.healPct>0);
 for(let i=0;i<3;i++)assert.equal(advanceSpiritProc(state,profile,'petHit',{now:10300+i*100,hpPercent:99}),null);
 assert.ok(advanceSpiritProc(state,profile,'petHit',{now:17000,hpPercent:99}));
});

test('attack-support resonance does not add secondary targets',()=>{
 for(const name of ['chainSlash','petChase'])assert.equal(SPIRIT_PROC_RULES[name].cleaveTargets,undefined);
});
