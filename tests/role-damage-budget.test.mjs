import test from 'node:test';
import assert from 'node:assert/strict';
import {petDirectRoleMultiplier,fusionDirectOutputFactor,petSkillPreview,blessingStrength} from '../dist/pet-effects.js';
import {rebalanceOwnerFusionDamage,OWNER_FUSION_DAMAGE_SHARE_SCALE} from '../dist/fusion-resonance.js';

test('novice pet direct damage stays unchanged and advanced offense trades durability for damage',()=>{
 for(const role of ['attack','magic','defense','support'])assert.equal(petDirectRoleMultiplier(role,50),1);
 for(const level of [99,110,160,200,201]){
  const a=petDirectRoleMultiplier('attack',level),m=petDirectRoleMultiplier('magic',level),d=petDirectRoleMultiplier('defense',level),s=petDirectRoleMultiplier('support',level);
  assert.ok(m>a&&a>d&&d>s,`level ${level} role budget`);
 }
 assert.ok(petDirectRoleMultiplier('magic',201)<=petDirectRoleMultiplier('magic',200)*1.2,
  'SSS pet gear must not also receive an unchecked 201 direct-damage multiplier');
});

test('ordered fusion roles have distinct direct-offense budgets without fixed 50/40/10 shares',()=>{
 const f=(main,sub)=>fusionDirectOutputFactor({fusion:{main,sub}});
 assert.ok(f('attack','magic')>f('attack','defense'));
 assert.ok(f('magic','attack')>f('magic','defense'));
 assert.equal(f('defense','support'),1.35,'limited guardian-healer direct offense prevents no-damage trial stalls');
 assert.ok(f('defense','support')<f('attack','magic'),'guardian-healer remains below pure offense');
 assert.equal(f('support','defense'),1);
 assert.equal(fusionDirectOutputFactor({}),1);
});

test('owner amplification reduction preserves fusion utility, cooldown and trigger identity',()=>{
 const t={bonus:.8,petAttack:2,magic:2,petArmor:3,armor:1,haste:.08,cooldown:.1,leech:.12,refund:6,targets:2};
 const x=rebalanceOwnerFusionDamage(t);
 for(const k of ['bonus','petAttack','magic','petArmor','armor','haste','cooldown'])assert.equal(x[k],t[k]*OWNER_FUSION_DAMAGE_SHARE_SCALE);
 for(const k of ['leech','refund','targets'])assert.equal(x[k],t[k]);
 assert.deepEqual(rebalanceOwnerFusionDamage(t,false),t);
});

test('fusion blessing has a bounded owner-amplification share',()=>{
 const s={quality:1.4,level:200,atk:100000,matk:100000,def:100000,hp:100000,healPower:100000};
 const strength=blessingStrength({family:'fusion',power:2},s,'magic');
 assert.ok(strength<=.12*s.quality+1e-8);
});
test('skill descriptions disclose role-based direct damage coefficients',()=>{
 const stats={level:200,atk:100,matk:100,def:100,mdef:100,hp:1000,quality:1,healPower:100};
 assert.match(petSkillPreview({kind:'magic',power:1},stats,'magic'),/直傷係數×7\.5/);
 assert.match(petSkillPreview({kind:'strike',power:1},stats,'attack',{fusion:{main:'attack',sub:'magic'}}),/直傷係數×9\.6/);
 assert.match(petSkillPreview({kind:'magic',power:1},stats,'magic',{fusion:{main:'magic',sub:'defense'}}),/直傷係數×6\.75/);
 assert.doesNotMatch(petSkillPreview({kind:'heal',power:1},stats,'support'),/直傷係數/);
});
