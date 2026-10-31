import test from 'node:test';import assert from 'node:assert/strict';
import {THIRD_FUSION_RULES,ORIGINAL_EVENT_PACTS} from '../dist/fusion-resonance.js';
test('the first four source-defined resonance mechanics bind to actual events',()=>{
 const expected={'knight/attack-defense':'shieldBreak','knight/defense-support':'damageTaken','crusader/attack-defense':'damageTaken','rogue/defense-support':'dodge'};
 for(const [key,event] of Object.entries(expected)){const [job,pair]=key.split('/');const rule=THIRD_FUSION_RULES[job][pair];assert.deepEqual(rule.events,[event]);assert.equal(rule.originalEvent.label,ORIGINAL_EVENT_PACTS[key].label);}
 assert.equal(THIRD_FUSION_RULES.crusader['attack-defense'].originalEvent.threshold,2);
});
