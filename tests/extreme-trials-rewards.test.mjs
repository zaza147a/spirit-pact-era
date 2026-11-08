import test from 'node:test';
import assert from 'node:assert/strict';
import {extremeCharacterLedger,claimExtremeCharacterStage,buyExtremeShopItem,extremeMilestoneTitles} from '../dist/extreme-trials-rewards.js';

test('角色獨立：同帳號兩個角色可以分別突破及領取自己的首次獎勵',()=>{
 const a={},b={};
 assert.equal(claimExtremeCharacterStage(a,'atk',10).coins,100);
 assert.equal(claimExtremeCharacterStage(a,'atk',10).coins,0);
 assert.equal(claimExtremeCharacterStage(b,'atk',10).coins,100);
 assert.equal(extremeCharacterLedger(a).coins,100);
 assert.equal(extremeCharacterLedger(b).coins,100);
 assert.notEqual(a.extremeProgress,b.extremeProgress);
});

test('商店購買、收藏及稱號都只作用於當前角色',()=>{
 const a={},b={};
 assert.match(buyExtremeShopItem(a,'atk_frame').error,/先突破/);
 claimExtremeCharacterStage(a,'atk',30);
 const before=a.extremeCoins;
 assert.equal(buyExtremeShopItem(a,'atk_frame').ledger.coins,before-200);
 assert.match(buyExtremeShopItem(a,'atk_frame').error,/已永久收藏/);
 assert.ok(extremeMilestoneTitles(extremeCharacterLedger(a)).includes('破軍挑戰者'));
 assert.equal(extremeCharacterLedger(b).purchases.length,0);
 assert.equal(extremeCharacterLedger(b).progress.atk.highest,0);
});
