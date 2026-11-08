import test from 'node:test';
import assert from 'node:assert/strict';
import {characterSlotKey,writeCharacterSlot,readCharacterSlot} from '../dist/character-slots.js';
import {claimExtremeCharacterStage,extremeCharacterLedger,buyExtremeShopItem} from '../dist/extreme-trials-rewards.js';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {runtime} from './runtime31-helper.mjs';

function storage(){const entries=new Map();return {
 getItem:key=>entries.get(key)??null,
 setItem:(key,value)=>entries.set(key,String(value)),
 removeItem:key=>entries.delete(key)
};}

test('真正八格角色存取：極限徽記與收藏只會寫入挑戰角色的欄位',async()=>{
 const c=await runtime(),s=storage();
 const first=legacyOptimalPlayer('knight'),second=legacyOptimalPlayer('wizard');
 first.name='極限測試甲';second.name='極限測試乙';
 writeCharacterSlot(s,0,first);writeCharacterSlot(s,1,second);
 const untouchedSecond=s.getItem(characterSlotKey(1));
 const loaded=readCharacterSlot(s,0,c.api.normalize,c.api.valid);
 assert.ok(loaded.player,loaded.error);
 claimExtremeCharacterStage(loaded.player,'hp',30);
 assert.equal(buyExtremeShopItem(loaded.player,'hp_frame').error,undefined);
 writeCharacterSlot(s,0,loaded.player);
 assert.equal(s.getItem(characterSlotKey(1)),untouchedSecond);
 const a=readCharacterSlot(s,0,c.api.normalize,c.api.valid).player;
 const b=readCharacterSlot(s,1,c.api.normalize,c.api.valid).player;
 assert.equal(extremeCharacterLedger(a).progress.hp.highest,30);
 assert.equal(extremeCharacterLedger(a).coins,300);
 assert.deepEqual(extremeCharacterLedger(a).purchases,['hp_frame']);
 assert.equal(extremeCharacterLedger(b).progress.hp.highest,0);
 assert.equal(extremeCharacterLedger(b).coins,0);
 assert.deepEqual(extremeCharacterLedger(b).purchases,[]);
});
