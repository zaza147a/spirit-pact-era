import assert from 'node:assert/strict';
import {bulkSaleQuote,sellBulkCategory} from '../dist/bulk-sale.js';
const items={
 junk:{junk:true,cost:10},
 gold:{junk:true,goldBar:true,cost:100000000},
 quest:{quest:true,cost:30},
 ticket:{ticket:true,cost:30},
 shard:{craft:true,cost:20},
 gear:{slot:'rightHand',cost:100},
 potion:{heal:10,cost:60}
};
const group=e=>items[e.id].goldBar||items[e.id].junk?'junk':items[e.id].quest?'quests':items[e.id].ticket?'tickets':items[e.id].craft?'shards':items[e.id].slot?'equipment':'consumables';
const price=(e,it)=>it.cost;
const rankOf=g=>g.enhancement||null;
const p={gold:100,bag:[
 {id:'junk',qty:10},{id:'gold',qty:2},{id:'quest',qty:5},
 {id:'ticket',qty:4},{id:'shard',qty:8},{id:'potion',qty:3},
 {id:'gear',uid:'1',enhancement:'S'},{id:'gear',uid:'2',swapProtected:true},
 {id:'gear',uid:'3',fusionMatch:true},{id:'gear',uid:'4'}
]};
assert.deepEqual([bulkSaleQuote(p,items,group,'junk',price,rankOf).count,bulkSaleQuote(p,items,group,'junk',price,rankOf).gold],[10,100]);
assert.equal(bulkSaleQuote(p,items,group,'quests',price,rankOf).count,0);
assert.equal(bulkSaleQuote(p,items,group,'tickets',price,rankOf).count,0);
assert.equal(bulkSaleQuote(p,items,group,'equipment',price,rankOf).count,1,'只允許未保護且未強化裝備');
const result=sellBulkCategory(p,items,group,'junk',price,rankOf);
assert.equal(result.count,10);
assert.equal(p.gold,200);
assert.equal(p.bag.find(x=>x.id==='gold').qty,2,'金條必須保留');
assert.equal(p.bag.find(x=>x.id==='quest').qty,5,'任務道具必須保留');
assert.equal(p.bag.find(x=>x.id==='ticket').qty,4,'入場券必須保留');
assert.equal(p.bag.find(x=>x.id==='potion').qty,3,'其他分類不受影響');
const savedGold=p.gold;
assert.equal(sellBulkCategory(p,items,group,'junk',price,rankOf).count,0,'重複點擊不得重複結算');
assert.equal(p.gold,savedGold);
console.log('bulk sale protections and category isolation passed');
