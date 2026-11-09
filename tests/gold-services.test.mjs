import test from 'node:test';
import assert from 'node:assert/strict';
import {GOLD_COLLECTIBLES,REFORGE_PRICES,reforgePrice,reforgeGear,buyGoldCollectible,earnGold,goldCollectionBonus} from '../dist/gold-services.js';
import {rollGear,rollPetGear,RARITIES,SPECIAL_AFFIXES} from '../dist/loot.js';

test('reforge price table and S/SS/SSS doubling',()=>{
 assert.deepEqual(REFORGE_PRICES,[2e6,3e6,5e6,10e6]);
 for(let n=0;n<4;n++){
  assert.equal(reforgePrice(n,'A'),REFORGE_PRICES[n]);
  for(const rank of ['S','SS','SSS'])assert.equal(reforgePrice(n,rank),REFORGE_PRICES[n]*2);
 }
 assert.equal(reforgePrice(4,'SSS'),null);
});

test('gold collection unlocks sequentially and applies only highest nonstacking bonus',()=>{
 const p={gold:1_000_000_000};
 assert.deepEqual(GOLD_COLLECTIBLES.map(x=>x.cost),[1e7,5e7,1e8,5e8]);
 const rates=[2,5,10,20];
 for(let i=0;i<4;i++){
  const old=p.gold;
  const result=buyGoldCollectible(p);
  assert.equal(result.error,undefined);
  assert.equal(p.gold,old-GOLD_COLLECTIBLES[i].cost);
  assert.equal(goldCollectionBonus(p),rates[i]);
  assert.equal(earnGold(100,p),100+rates[i]);
 }
 assert.equal(buyGoldCollectible(p).error,'全部收藏品已解鎖');
 assert.equal(buyGoldCollectible({gold:0}).error,'金幣不足');
});

test('500m collection can use automatically converted gold bars with exact change',()=>{
 const p={gold:450_000_000,bag:[{id:'gold_bar',qty:3}],goldCollectionTier:3};
 const r=buyGoldCollectible(p);
 assert.equal(r.error,undefined);
 assert.equal(p.gold,50_000_000);
 assert.equal(p.bag[0].qty,2);
 assert.equal(p.goldCollectionTier,4);
});

test('reforge keeps locked values, count, and unique legal keys for all rarities and pet gear',()=>{
 for(const rarity of RARITIES){
  for(const pet of [false,true]){
   const old=(pet?rollPetGear('petArmor',190,rarity.id):rollGear('blade',190,rarity.id));
   const locks=Object.keys(old.affixes).slice(0,Math.min(3,Object.keys(old.affixes).length));
   for(let i=0;i<40;i++){
    const outcome=reforgeGear(old,locks);
    assert.equal(outcome.error,undefined,`${rarity.id} ${pet}: ${outcome.error}`);
    assert.equal(Object.keys(outcome.affixes).length,rarity.count);
    for(const key of locks)assert.equal(outcome.affixes[key],old.affixes[key]);
    assert.equal(new Set(Object.keys(outcome.affixes)).size,rarity.count);
    const special=Object.keys(outcome.affixes).filter(k=>SPECIAL_AFFIXES.has(k));
    assert.equal(special.length,rarity.id==='mythic'?1:0);
   }
  }
 }
 assert.ok(reforgeGear(rollGear('blade',190,'mythic'),['a','b','c','d']).error);
});
