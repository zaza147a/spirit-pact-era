import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {ORIGINAL_60_MECHANICS} from '../dist/original-60-mechanics.js';

test('all 60 original resonances accept their authored live event without duplicated same-tick damage',async()=>{
 const contracts=Object.entries(ORIGINAL_60_MECHANICS);
 assert.equal(contracts.length,60);
 for(const [identity,design] of contracts){
  const [job,main,sub]=identity.split(/[/-]/);
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('60格運作驗證',job));
  Object.assign(p,{level:200,reborn:true,thirdJob:true,jobLevel:70,location:'worldroot'});
  const pet=c.makePet('fang');
  Object.assign(pet,{id:'p-'+identity,level:200,rarity:'mythic',ascended:true,evolution:4,fusion:{main,sub}});
  p.pets=[pet];p.activePetId=pet.id;
  const foe={id:'world_200',level:200,hp:1e12,maxHp:1e12,def:400,mdef:400,
   atk:0,matk:0,hit:0,flee:0,instanceId:'target-'+identity};
  a.setup(p,foe);p.hp=a.stat('hp');p.mp=a.stat('mp');pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;
  a.beginReport();
  for(let i=0;i<4;i++)a.emitEvent(design.event);
  const afterFirstWave=foe.hp;
  for(let i=0;i<4;i++)a.emitEvent(design.event);
  assert.ok(foe.hp>0&&Number.isFinite(foe.hp),identity+': enemy HP became invalid');
  assert.equal(foe.hp,afterFirstWave,identity+': same-tick event repeated direct damage');
  assert.ok(p.hp>0&&Number.isFinite(p.hp),identity+': owner HP became invalid');
 }
});
