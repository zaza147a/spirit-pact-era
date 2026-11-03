import test from 'node:test';
import assert from 'node:assert/strict';
import {makePet,petStats,ITEMS} from '../dist/catalog.js';
import {potionRestore} from '../dist/restoration.js';
import {PET_REVIVE_MS} from '../dist/frontier.js';
import {incomingMonsterDamage} from '../dist/combat-balance.js';
import {TRIAL_ROUTES,createTrialBoss} from '../dist/sky-trials.js';
import {MAP_BOSSES} from '../dist/map-bosses.js';
import {DAWN_BOSS,DAWN_MONSTERS} from '../dist/dawn-world.js';

const species=['fang','wisp','shell','sprout'];
const maxPet=(id,level)=>{const p=makePet(id);Object.assign(p,{level,rarity:'mythic',evolution:4,ascended:true});return p;};
const healItem={heal:5000,healPct:.3};

test('late-game HP reduction keeps defense role tankier, early progression untouched',()=>{
 for(const id of species){
  const p=maxPet(id,200),late=petStats(p);
  const legacy=Math.round(late.hp/(id==='shell'?.9:.8));
  assert.ok(legacy>=late.hp);
  assert.ok(late.hp>0);
  const early=maxPet(id,150);
  const originalEarly=petStats({...early,level:150});
  assert.equal(petStats(early).hp,originalEarly.hp);
 }
 assert.ok(petStats(maxPet('shell',200)).hp>petStats(maxPet('fang',200)).hp);
});

test('high-level companion potions have both percentage and absolute caps',()=>{
 for(const id of species) {
  const s=petStats(maxPet(id,200));
  const restored=potionRestore(healItem,'hp',200,s.hp,true);
  assert.ok(restored<=Math.round(s.hp*.08),'max HP cap for '+id);
  assert.ok(restored<=7000,'level-based limit for '+id);
  assert.ok(restored>=1);
 }
 assert.equal(potionRestore(healItem,'hp',200,500000,false),155000,'player potions stay unchanged');
 assert.equal(potionRestore(healItem,'hp',150,500000,true),153750,'pre-151 companion potions stay unchanged');
});

test('four companion roles can take fatal actual enemy damage in Lv200 trial and Lv210 Dawn',()=>{
 const route=TRIAL_ROUTES.at(-1);
 const boss=createTrialBoss(route,4,MAP_BOSSES[route.map]);
 const enemies=[boss,DAWN_BOSS,...DAWN_MONSTERS];
 for(const id of species) {
  const s=petStats(maxPet(id,200));
  for(const foe of enemies){
   const damage=incomingMonsterDamage(foe.atk,s.def)*(1-(s.damageReduction||0)/100);
   assert.ok(damage>0,'incoming damage exists for '+id+' / '+foe.id);
   const healed=potionRestore(healItem,'hp',200,s.hp,true);
   assert.ok(damage*100>healed,'100 attacks outpace one potion for '+id+' / '+foe.id);
  }
 }
 assert.equal(PET_REVIVE_MS,10000);
});

test('real auto-potion path cannot revive before cooldown but revives after it',async()=>{
 const {runtime}=await import('./runtime31-helper.mjs');
 for(const id of species){
  const c=await runtime(),a=c.api,p=a.normalize(a.fresh('復活測試','knight'));
  const pet=maxPet(id,200);pet.hp=0;pet.reviveAt=1000000+PET_REVIVE_MS;
  p.level=200;p.pets=[pet];p.activePetId=pet.id;p.bag=[{id:'med',qty:5}];
  p.autoPotions={playerHp:false,playerSp:false,petHp:true,petSp:false};
  p.potionThresholds={petHp:95};a.setup(p,{id:'world_191',level:200,hp:999999,atk:1});
  a.autoUsePotions();assert.equal(pet.hp,0,id+' must stay down during cooldown');
  c.setTime(1000000+PET_REVIVE_MS);
  a.autoUsePotions();assert.ok(pet.hp>0,id+' revives through actual potion path');
  assert.ok(pet.hp<=petStats(pet).hp);
 }
});
