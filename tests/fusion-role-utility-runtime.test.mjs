import test from 'node:test';
import assert from 'node:assert/strict';
import {runBuild} from '../scripts/balance-v24.mjs';

const options={level:201,encounterLevel:201,gearLevel:200,seconds:120,seed:42,
 scenario:'regional',reborn:true,thirdJob:true,referenceBuild:true,
 referenceQuality:'mythic',rarity:'mythic',enhancement:'SSS',petEnhancement:'SSS',dawnSigil:0};

test('SSS defensive and support fusions trade direct damage for real mitigation and recovery',()=>{
 const play=pair=>runBuild('knight',pair.split('-')[0],{...options,fusionPair:pair});
 const offense=play('attack-magic'),guardian=play('defense-support'),support=play('support-defense');
 for(const result of [offense,guardian,support])assert.equal(result.alive,true);
 assert.ok(offense.metrics.petDamage>guardian.metrics.petDamage);
 assert.ok(guardian.metrics.shieldPrevented>offense.metrics.shieldPrevented);
 assert.ok(guardian.metrics.petProtection>offense.metrics.petProtection);
 assert.ok(support.metrics.effectiveHeal>offense.metrics.effectiveHeal);
 assert.ok(support.metrics.buffDamage>offense.metrics.buffDamage);
 assert.ok(support.kills<offense.kills,'support must pay an output opportunity cost');
});
