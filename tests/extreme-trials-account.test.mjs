import test from 'node:test';
import assert from 'node:assert/strict';
import {readExtremeAccount,claimExtremeAccountStage,buyExtremeShopItem,extremeMilestoneTitles} from '../dist/extreme-trials-account.js';

const storage=()=>{const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,val)=>map.set(key,val)};};

test('同一帳號跨角色只能領取一次相同首領階段的獎勵',()=>{
  const shared=storage();
  const first=claimExtremeAccountStage(shared,'atk',10);
  assert.equal(first.coins,100);
  const otherCharacter=claimExtremeAccountStage(shared,'atk',10);
  assert.equal(otherCharacter.coins,0);
  assert.equal(readExtremeAccount(shared).coins,100);
  assert.equal(claimExtremeAccountStage(shared,'matk',1).coins,10);
});
test('商店需先突破並支付帳號徽記，購買後不能重複扣款',()=>{
 const shared=storage();
 assert.match(buyExtremeShopItem(shared,'atk_frame').error,/先突破/);
 claimExtremeAccountStage(shared,'atk',30);
 const before=readExtremeAccount(shared).coins;
 const bought=buyExtremeShopItem(shared,'atk_frame');
 assert.equal(bought.account.coins,before-200);
 assert.match(buyExtremeShopItem(shared,'atk_frame').error,/已永久收藏/);
 assert.ok(extremeMilestoneTitles(bought.account).includes('破軍挑戰者'));
 assert.ok(!extremeMilestoneTitles(bought.account).includes('物理不滅者'));
});

test('損壞的共享紀錄採保守預設且拒絕不合法階段',()=>{
  const shared=storage();shared.setItem('icarus-extreme-trials-account-v1','corrupt');
  assert.equal(readExtremeAccount(shared).coins,0);
  assert.throws(()=>claimExtremeAccountStage(shared,'atk',0));
});
