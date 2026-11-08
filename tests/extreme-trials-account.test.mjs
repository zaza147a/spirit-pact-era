import test from 'node:test';
import assert from 'node:assert/strict';
import {readExtremeAccount,claimExtremeAccountStage} from '../dist/extreme-trials-account.js';

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

test('損壞的共享紀錄採保守預設且拒絕不合法階段',()=>{
  const shared=storage();shared.setItem('icarus-extreme-trials-account-v1','corrupt');
  assert.equal(readExtremeAccount(shared).coins,0);
  assert.throws(()=>claimExtremeAccountStage(shared,'atk',0));
});
