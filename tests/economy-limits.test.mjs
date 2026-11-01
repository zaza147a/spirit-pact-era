import test from 'node:test';
import assert from 'node:assert/strict';
import {exchangeOverflowGold,sellSurplusPotions} from '../dist/economy-limits.js';
import {LOOT_ITEMS} from '../dist/loot.js';
import {sellSelectedJunk} from '../dist/adventure-economy.js';

test('gold at 500 million remains cash; going over creates 100 million bar',()=>{
  const p={gold:500_000_000,bag:[]};
  assert.equal(exchangeOverflowGold(p),0);
  p.gold++;
  assert.equal(exchangeOverflowGold(p),1);
  assert.deepEqual(p.bag,[{id:'gold_bar',qty:1}]);
  assert.equal(p.gold,400_000_001);
  assert.equal(exchangeOverflowGold(p),0);
});

test('old near-billion gold is exchanged without losing value',()=>{
  const p={gold:983_916_336,bag:[{id:'gold_bar',qty:2}]};
  assert.equal(exchangeOverflowGold(p),5);
  assert.equal(p.gold,483_916_336);
  assert.equal(p.bag[0].qty,7);
  assert.equal(p.gold+p.bag[0].qty*100_000_000,1_183_916_336);
});

test('potion surplus is sold at manual sell price and 50,000 retained',()=>{
  const p={gold:0,bag:[{id:'blue_large',qty:91_464},{id:'red_large',qty:50_000},{id:'scrap',qty:100_001}]};
  assert.deepEqual(sellSurplusPotions(p,LOOT_ITEMS),{count:41_464,gold:41_464*95});
  assert.equal(p.bag[0].qty,50_000);
  assert.equal(p.bag[1].qty,50_000);
  assert.equal(p.bag[2].qty,100_001);
  assert.deepEqual(sellSurplusPotions(p,LOOT_ITEMS),{count:0,gold:0});
});

test('gold bars cannot be automatically sold even if selected',()=>{
  const p={gold:0,bag:[{id:'gold_bar',qty:3},{id:'scrap',qty:4}],autoSellJunk:['gold_bar','scrap'],quests:{}};
  assert.deepEqual(sellSelectedJunk(p,LOOT_ITEMS),{gold:20,count:4});
  assert.deepEqual(p.bag,[{id:'gold_bar',qty:3}]);
});
