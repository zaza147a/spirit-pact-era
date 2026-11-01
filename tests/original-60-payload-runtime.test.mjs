import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {SECOND_JOBS} from '../dist/jobs.js';
import {ORIGINAL_60_MECHANICS,ORIGINAL_SIX_KEYS} from '../dist/original-60-mechanics.js';
import {THIRD_FUSION_RULES} from '../dist/fusion-resonance.js';

const damageEffects=new Set(['starVolley','sanctuarySplit','arcaneStrike','counterStrike','stackStrike','comboLeech','vowShieldFollowup','hunterSummon','falconVolley','starRainChain','guardianAutoChase','lowHpRiposte','siegeCounter','dragonCounter','sanctuaryChase']);
const foe=(id)=>({id:'world_151',map:'starshore',level:151,hp:1e9,maxHp:1e9,def:100,atk:0,hit:0,flee:0,instanceId:id});

test('all 60 original pacts manifest their configured live combat payload, not only a generic buff',async()=>{
 let verified=0;
 for(const job of Object.keys(SECOND_JOBS)){
  const c=await runtime(),a=c.api;
  for(const pair of ORIGINAL_SIX_KEYS){
   const spec=ORIGINAL_60_MECHANICS[job+'/'+pair],contract=THIRD_FUSION_RULES[job][pair];
   const parts=[].concat(contract.originalEvent.payload);
   const p=a.normalize(a.fresh('live-payload',job));
   Object.assign(p,{level:150,reborn:true,thirdJob:true,jobLevel:70,location:'starshore'});
   const pet=c.makePet('fang');
   Object.assign(pet,{id:job+'-'+pair,rarity:'mythic',ascended:true,level:150,evolution:4,fusion:{main:pair.split('-')[0],sub:pair.split('-')[1]}});
   p.pets=[pet];p.activePetId=pet.id;
   const main=foe(job+'-'+pair),secondary=foe(job+'-'+pair+'-second');
   a.setup(p,main);a.setEnemies([main,secondary]);
   p.hp=a.stat('hp');p.mp=Math.floor(a.stat('mp')*.5);pet.hp=c.petStats(pet).hp;pet.sp=c.petStats(pet).sp;
   if(job==='assassin'&&pair==='defense-support')p.hp=Math.floor(a.stat('hp')*.3);
   if(job==='sage'&&pair==='defense-support')p.shield=100;
   if(job==='hunter'&&pair==='attack-support')a.state().petEffects.blessingUntil=2e6;
   if(job==='knight'&&pair==='attack-defense')a.emitEvent('shieldBreak');
   const before=main.hp;
   a.beginReport();
   for(let i=0;i<(contract.originalEvent.threshold||1);i++)a.emitEvent(contract.originalEvent.event);
   const s=a.state(),context=job+'/'+pair;
   assert.ok(s.classBuffs.pact,context+' missing actual pact activation');
   if(parts.some(effect=>damageEffects.has(effect))&&!(job==='priest'&&pair==='magic-support')){
    assert.ok(main.hp<before,context+' has a damage payload but dealt no direct resonance damage');
    assert.ok(s.report.metrics.resonanceDamage>0,context+' did not attribute its damage to resonance');
   }
   if(parts.includes('storedQi'))assert.ok(s.petEffects.monkQi?.charges>0,context);
   if(parts.includes('elementBurn')){
    assert.ok(s.petEffects.burnPower>0,context);
    assert.ok(s.petEffects.burnTicks>0,context);
   }
   if(parts.includes('armorBreak')||parts.includes('armorExecution'))assert.ok(main.exposedUntil>1e6,context+' failed to expose armor');
   if(parts.includes('armorExecution'))assert.equal(main.hp,before,context+' executed immediately without a second strike');
   if(parts.includes('mark'))assert.ok(s.petEffects.markHits>0,context+' did not apply a hit mark');
   if(parts.includes('haste'))assert.ok(s.classBuffs.resonanceHaste?.until>1e6,context+' missing haste');
   if(parts.includes('manaRefund'))assert.ok(p.mp>Math.floor(a.stat('mp')*.5),context+' did not refund mana');
   if(parts.includes('ward')||parts.includes('wardCharge'))assert.ok(s.petEffects.shield>0,context+' missing protective ward');
   if(parts.includes('splash'))assert.ok(secondary.hp<1e9,context+' missing additional enemy splash');
   if(parts.includes('soundShield'))assert.ok(p.shield>0,context+' missing player shield');
   verified++;
  }
 }
 assert.equal(verified,60);
});
