import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';

async function directStrike(pair){
 const c=await runtime(),a=c.api,p=a.normalize(a.fresh('融合定位傷害','knight'));
 Object.assign(p,{level:200,reborn:true,thirdJob:true,jobLevel:70});
 const pet=c.makePet('fang');
 Object.assign(pet,{id:'role-'+pair,rarity:'mythic',level:200,ascended:true,evolution:4,
  fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
 p.pets=[pet];p.activePetId=pet.id;
 const foe={id:'world_200',level:200,hp:1e9,maxHp:1e9,atk:0,def:0,mdef:0,
  flee:0,hit:0,instanceId:'role-target'};
 a.setup(p,foe);p.hp=a.stat('hp');p.mp=a.stat('mp');pet.hp=c.petStats(pet).hp;
 pet.sp=c.petStats(pet).sp;c.Math.random=()=>0;
 a.beginReport();a.petAttack();
 return {damage:1e9-foe.hp,metrics:a.state().report.metrics};
}

test('actual pet hits reward attack-magic offense over guarded role variants',async()=>{
 const attackMagic=await directStrike('attack-magic');
 const attackDefense=await directStrike('attack-defense');
 const magicDefense=await directStrike('magic-defense');
 assert.ok(attackMagic.damage>attackDefense.damage*1.4);
 assert.ok(attackMagic.damage>magicDefense.damage*1.3);
 for(const result of [attackMagic,attackDefense,magicDefense]){
  assert.equal(result.metrics.petDamage,result.damage);
  assert.equal(result.metrics.resonanceDamage,0,'direct damage must not inflate the buff ledger');
 }
});
