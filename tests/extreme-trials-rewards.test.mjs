import test from 'node:test';
import assert from 'node:assert/strict';
import {extremeCharacterLedger,claimExtremeCharacterStage,buyExtremeShopItem,extremeMilestoneTitles,extremeMilestoneFrames,extremeUnlockedCosmetics,syncExtremeHonorOwnership} from '../dist/extreme-trials-rewards.js';

test('角色獨立：同帳號兩個角色可以分別突破及領取自己的首次獎勵',()=>{
 const a={},b={};
 assert.equal(claimExtremeCharacterStage(a,'atk',10).coins,100);
 assert.equal(claimExtremeCharacterStage(a,'atk',10).coins,0);
 assert.equal(claimExtremeCharacterStage(b,'atk',10).coins,100);
 assert.equal(extremeCharacterLedger(a).coins,100);
 assert.equal(extremeCharacterLedger(b).coins,100);
 assert.notEqual(a.extremeProgress,b.extremeProgress);
});
test('20／25／30 階取得全部外觀，50／100 階追加稱號且不跨角色',()=>{
 const a={},b={};
 claimExtremeCharacterStage(a,'clear',20);syncExtremeHonorOwnership(a);
 assert.ok(extremeMilestoneFrames(extremeCharacterLedger(a)).includes('萬軍名稱框'));
 assert.equal(extremeUnlockedCosmetics(a,'background').length,0);
 claimExtremeCharacterStage(a,'clear',30);syncExtremeHonorOwnership(a);
 assert.ok(a.extremeBackgrounds.includes('clear_milestone'));
 claimExtremeCharacterStage(a,'clear',25);
 assert.ok(extremeUnlockedCosmetics(a,'mantle').includes('clear'));
 claimExtremeCharacterStage(a,'clear',30);
 assert.ok(extremeUnlockedCosmetics(a,'aura').includes('clear'));
 claimExtremeCharacterStage(a,'clear',50);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('萬軍破限者'));
 claimExtremeCharacterStage(a,'clear',100);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('千軍殲滅者'));
 assert.deepEqual(extremeUnlockedCosmetics(b,'aura'),[]);
});

test('商店購買、收藏及稱號都只作用於當前角色',()=>{
 const a={},b={};
 assert.match(buyExtremeShopItem(a,'atk_frame').error,/先突破/);
 claimExtremeCharacterStage(a,'atk',30);
 const before=a.extremeCoins;
 assert.equal(buyExtremeShopItem(a,'atk_frame').ledger.coins,before-150);
 assert.match(buyExtremeShopItem(a,'atk_frame').error,/已永久收藏/);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('破軍挑戰者'));
 assert.equal(extremeCharacterLedger(b).purchases.length,0);
 assert.equal(extremeCharacterLedger(b).progress.atk.highest,0);
});

test('每一種王完成 30 階的徽記足夠購買該王全部商店收藏',()=>{
 const player={};
 for(const kind of ['atk','matk','hp','clear']){
  const reward=claimExtremeCharacterStage(player,kind,30);
  assert.equal(reward.coins,450);
  assert.equal(buyExtremeShopItem(player,kind+'_frame').error,undefined);
  assert.equal(buyExtremeShopItem(player,kind+'_background').error,undefined);
 }
 assert.equal(player.extremeCoins,200);
 assert.equal(claimExtremeCharacterStage(player,'clear',100).coins,0);
});

test('存檔 JSON 往返與不同角色欄位不會互相繼承極限記錄',()=>{
 const first={name:'角色甲'},second={name:'角色乙'};
 claimExtremeCharacterStage(first,'matk',30);
 buyExtremeShopItem(first,'matk_frame');
 syncExtremeHonorOwnership(first);
 const exported=JSON.stringify(first);
 const restored=JSON.parse(exported);
 const originalLedger=extremeCharacterLedger(first);
 assert.deepEqual(extremeCharacterLedger(restored),originalLedger);
 assert.equal(extremeCharacterLedger(second).progress.matk.highest,0);
 assert.equal(extremeCharacterLedger(second).coins,0);
 assert.deepEqual(extremeCharacterLedger(second).purchases,[]);
 claimExtremeCharacterStage(restored,'matk',31);
 assert.equal(extremeCharacterLedger(first).progress.matk.highest,30);
 assert.equal(extremeCharacterLedger(restored).progress.matk.highest,31);
});
