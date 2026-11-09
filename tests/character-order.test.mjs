import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultCharacterOrder,normalizeCharacterOrder,moveCharacterOrder,saveCharacterOrder,readCharacterOrder,CHARACTER_ORDER_KEY} from '../dist/character-order.js';

test('角色順序初始為八個獨立存檔格',()=>assert.deepEqual(defaultCharacterOrder(),[0,1,2,3,4,5,6,7]));
test('移動只調整畫面索引，不改動角色存檔',()=>{
 const order=moveCharacterOrder(defaultCharacterOrder(),3,-1);
 assert.deepEqual(order,[0,1,3,2,4,5,6,7]);
 assert.deepEqual(moveCharacterOrder(order,3,-1),[0,3,1,2,4,5,6,7]);
 assert.deepEqual(moveCharacterOrder(order,0,-1),order);
});
test('損壞或重複的排序資料自動補齊',()=>{
 assert.deepEqual(normalizeCharacterOrder([3,3,99,-1,0]),[3,0,1,2,4,5,6,7]);
 assert.deepEqual(normalizeCharacterOrder(null),defaultCharacterOrder());
});
test('排序可儲存並在重新載入後讀回',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
 const expected=moveCharacterOrder(defaultCharacterOrder(),6,-1);
 saveCharacterOrder(storage,expected);
 assert.equal(values.has(CHARACTER_ORDER_KEY),true);
 assert.deepEqual(readCharacterOrder(storage),expected);
 values.set(CHARACTER_ORDER_KEY,'broken');
 assert.deepEqual(readCharacterOrder(storage),defaultCharacterOrder());
});
