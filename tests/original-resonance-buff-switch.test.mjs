import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';

test('switching companion removes original pact haste and restores actual attack interval',async()=>{
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('haste-switch','knight'));
 Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
 const pets=['old','new'].map(id=>{const pet=c.makePet('fang');Object.assign(pet,{id,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:'attack',sub:'support'}});pet.hp=c.petStats(pet).hp;return pet;});
 p.pets=pets;p.activePetId='old';
 const foe={id:'world_151',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:'haste-target'};
 a.setup(p,foe);p.hp=a.stat('hp');const baseSpeed=a.stat('speed');
 a.emitEvent('thirdHit_knight');
 assert.ok(a.stat('speed')<baseSpeed,'haste must actually improve the attack interval');
 a.setPet('new');
 assert.equal(a.state().classBuffs.resonanceHaste,undefined,'new companion must not inherit old haste');
 assert.equal(a.stat('speed'),baseSpeed,'attack interval must return to baseline');
 a.emitEvent('thirdHit_knight');
 assert.equal(a.stat('speed'),baseSpeed,'switching must not bypass shared pact cooldown');
 c.setTime(1004001);a.emitEvent('thirdHit_knight');
 assert.ok(a.stat('speed')<baseSpeed,'new companion can generate its own haste after cooldown');
});
