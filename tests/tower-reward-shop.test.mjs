import test from 'node:test';
import assert from 'node:assert/strict';
import {finishTowerFloor} from '../dist/endless-tower.js';
import {buyTowerShopItem,selectTowerBackground,towerShowcaseOwned,selectTowerShowcase,normalizeTowerCollection,awardTowerCoins} from '../dist/tower-reward-shop.js';
import {selectTowerHonor,towerHonorOptions} from '../dist/tower-honors.js';
import {renderTowerRewards} from '../dist/endless-tower-ui.js';

test('first thirty floors award 2130 first-clear coins and lower replay rewards',()=>{
 let progress={highest:0},coins=0;
 for(let floor=1;floor<=30;floor++){
  const result=finishTowerFloor(progress,floor,1,true);
  assert.equal(result.success,true);
  coins+=result.towerCoins;progress=result.progress;
 }
 assert.equal(coins,2130);
 assert.equal(finishTowerFloor(progress,3,1,true).towerCoins,10);
 assert.equal(finishTowerFloor(progress,5,1,true).towerCoins,15);
 assert.equal(finishTowerFloor(progress,10,1,true).towerCoins,30);
 assert.equal(finishTowerFloor(progress,1,1,true).towerCoins,5);
});

test('existing completed saves do not retroactively collect duplicate first-clear coins',()=>{
 const previous={highest:30,claimed:[10,20,30]};
 assert.equal(finishTowerFloor(previous,1,1,true).towerCoins,5);
 assert.equal(finishTowerFloor(previous,10,1,true).towerCoins,30);
});

test('shop enforces progress, ownership, coins and one-time purchases',()=>{
 const p={towerProgress:{highest:10,claimed:[10]},towerCoins:800};
 assert.match(buyTowerShopItem(p,'background_frost').error,/第 30 層/);
 assert.equal(buyTowerShopItem(p,'frame_dawn').item.id,'frame_dawn');
 assert.equal(p.towerCoins,500);
 assert.equal(buyTowerShopItem(p,'background_dawn').item.id,'background_dawn');
 assert.equal(p.towerCoins,0);
 assert.match(buyTowerShopItem(p,'frame_dawn').error,/永久收藏/);
 assert.equal(selectTowerBackground(p,'background_frost'),false);
 assert.equal(selectTowerBackground(p,'background_dawn'),true);
 assert.equal(normalizeTowerCollection(p.towerCollection).selectedBackground,'background_dawn');
 assert.ok(towerHonorOptions(p,'frame').includes('破曉典藏名稱框'));
 assert.equal(selectTowerHonor(p,'frame','破曉典藏名稱框'),true);
});

test('daily replay cap leaves first-clears untouched and resets next day',()=>{
 const player={towerCoins:0};
 assert.equal(awardTowerCoins(player,100,{day:'2026-11-07'}),100);
 assert.equal(awardTowerCoins(player,100,{day:'2026-11-07'}),50);
 assert.equal(awardTowerCoins(player,50,{day:'2026-11-07'}),0);
 assert.equal(awardTowerCoins(player,300,{firstClear:true,day:'2026-11-07'}),300);
 assert.equal(awardTowerCoins(player,20,{day:'2026-11-08'}),20);
 assert.equal(player.towerCoins,470);
});
test('three-region boss showcase is opt-in, cosmetic and persistent after purchase',()=>{
 const player={towerProgress:{highest:30,claimed:[10,20,30]},towerCoins:1300};
 assert.equal(towerShowcaseOwned(player),false);
 assert.equal(selectTowerShowcase(player,true),false);
 assert.equal(normalizeTowerCollection(player.towerCollection).selectedShowcase,false);
 assert.equal(buyTowerShopItem(player,'collection_three').item.cost,1200);
 assert.equal(player.towerCoins,100);
 assert.equal(towerShowcaseOwned(player),true);
 assert.equal(selectTowerShowcase(player,true),true);
 assert.equal(normalizeTowerCollection(player.towerCollection).selectedShowcase,true);
 const restored=structuredClone(player);
 assert.equal(normalizeTowerCollection(restored.towerCollection).selectedShowcase,true);
 assert.equal(selectTowerShowcase(restored,false),true);
 assert.equal(normalizeTowerCollection(restored.towerCollection).selectedShowcase,false);
 assert.equal(restored.towerCoins,100);
});

test('tower album and shop render without combat rewards or unowned unlock buttons',()=>{
 const player={towerProgress:{highest:10,claimed:[10]},towerCoins:400};
 const html=renderTowerRewards(player);
 assert.match(html,/已收錄首領/);
 assert.match(html,/破曉典藏名稱框/);
 assert.match(html,/data-tower-buy="frame_dawn"/);
 assert.match(html,/第 30 層解鎖/);
 assert.doesNotMatch(html,/攻擊力 \+|MATK \+|HP \+/);
});
