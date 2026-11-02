import test from 'node:test';
import assert from 'node:assert/strict';
import {CARD_COLLECTION_KEY,collectMissingCards,collectableFromPlayer,collectionProgress,readCardCollection} from '../dist/card-collection.js';
const cards={a:{name:'一般',map:'forest',boss:false},b:{name:'首領',map:'forest',boss:true},legacy:{name:'紀念',map:'legacy',boss:true}};
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};};
test('one of each missing card is collected without touching equipped cards',()=>{
 const p={cards:[{id:'a',qty:3},{id:'b',qty:1},{id:'legacy',qty:1}],sockets:{head:'a'}};
 const result=collectMissingCards(p,cards,{version:1,ids:[]});
 assert.deepEqual(result.ids,['a','b']);assert.deepEqual(p.cards,[{id:'a',qty:2},{id:'legacy',qty:1}]);
 assert.equal(p.sockets.head,'a');assert.deepEqual(collectionProgress(cards,result.collection),{owned:2,total:2});
 assert.deepEqual(collectableFromPlayer(p,cards,result.collection),[]);
});
test('eight character slots read same independent collection record',()=>{
 const s=storage();const p1={cards:[{id:'a',qty:1}]},p2={cards:[{id:'a',qty:1},{id:'b',qty:1}]};
 const first=collectMissingCards(p1,cards,readCardCollection(s,cards));s.setItem(CARD_COLLECTION_KEY,JSON.stringify(first.collection));
 const second=collectMissingCards(p2,cards,readCardCollection(s,cards));
 assert.deepEqual(second.ids,['b']);assert.deepEqual(p2.cards,[{id:'a',qty:1}]);
 assert.equal(collectionProgress(cards,second.collection).owned,2);
});
test('invalid storage fails closed without deleting original',()=>{
 const s=storage();s.setItem(CARD_COLLECTION_KEY,'{invalid');
 assert.throws(()=>readCardCollection(s,cards));assert.equal(s.getItem(CARD_COLLECTION_KEY),'{invalid');
});
