import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
async function scenario(){
 const c=await runtime({captureDamage:true}),a=c.api,p=a.normalize(a.fresh('star-volley','rogue'));
 Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
 const pet=c.makePet('wisp');Object.assign(pet,{id:'star-caster',rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:'magic',sub:'defense'}});
 p.pets=[pet];p.activePetId=pet.id;
 const target={id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:0,mdef:0,atk:0,hit:0,flee:0,instanceId:'volley-target'},other={...target,instanceId:'other'};
 a.setup(p,target);a.setEnemies([target,other]);p.hp=a.stat('hp');p.mp=a.stat('mp');pet.hp=c.petStats(pet).hp;a.beginReport();
 return {c,a,target,other};
}
test('rogue shadow hit fires exactly two real magic packets at the same target with conserved damage credit',async()=>{
 const {c,a,target,other}=await scenario();a.emitEvent('thirdHit_rogue');
 const hits=c.damageEvents.filter(e=>e.key==='resonanceDamage');assert.equal(hits.length,2);
 assert.ok(hits.every(e=>e.target===target.instanceId&&e.applied>0));assert.equal(other.hp,1e9,'volley is not unrelated-enemy splash');
 assert.equal(hits.reduce((n,e)=>n+e.applied,0),1e9-target.hp);assert.equal(a.state().report.metrics.resonanceDamage,1e9-target.hp);
 const hp=target.hp;a.emitEvent('thirdHit_rogue');assert.equal(target.hp,hp,'same-frame hit cannot fire again');
 c.setTime(1004000);a.emitEvent('thirdHit_rogue');assert.equal(c.damageEvents.filter(e=>e.key==='resonanceDamage').length,4);
});
test('star volley stops on lethal first packet without shifting a second packet or over-crediting damage',async()=>{
 const {c,a,target,other}=await scenario();target.hp=1;const report=a.state().report;a.emitEvent('thirdHit_rogue');
 const hits=c.damageEvents.filter(e=>e.key==='resonanceDamage');assert.equal(hits.length,1);assert.equal(hits[0].applied,1);
 assert.equal(report.metrics.resonanceDamage,1);assert.equal(other.hp,1e9);
});
