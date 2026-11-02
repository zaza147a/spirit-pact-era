import test from 'node:test';
import assert from 'node:assert/strict';
import {CARD_DRAW_COST,CARD_BOSS_RATE,cardRecyclePoints,recycleCards,drawRecycledCards} from '../dist/card-recycling.js';
const pool={a:{name:'一般A',boss:false},b:{name:'一般B',boss:false},king:{name:'首領',boss:true}};
test('recycle values and equipped-card isolation',()=>{
 const p={cardRecyclePoints:0,cards:[{id:'a',qty:10},{id:'king',qty:1}],sockets:{headUpper:'king'}};
 const r=recycleCards(p,pool,[{id:'a',qty:10},{id:'king',qty:1}]);
 assert.equal(r.gain,200);assert.equal(cardRecyclePoints(p),200);
 assert.equal(p.cards.length,0);assert.equal(p.sockets.headUpper,'king');
});
test('reject invalid requests without mutating player',()=>{
 const p={cardRecyclePoints:0,cards:[{id:'a',qty:1}]};
 const before=structuredClone(p);
 assert.ok(recycleCards(p,pool,[{id:'a',qty:2}]).error);
 assert.ok(recycleCards(p,pool,[{id:'a',qty:1},{id:'a',qty:1}]).error);
 assert.deepEqual(p,before);
});
test('draw consumes exactly 100 points each and respects deterministic 1% boss threshold',()=>{
 assert.equal(CARD_DRAW_COST,100);assert.equal(CARD_BOSS_RATE,.01);
 const p={cardRecyclePoints:300,cards:[]};
 let seq=[.009,0,.01,0,.9,.9],i=0;
 const r=drawRecycledCards(p,pool,1,()=>seq[i++]);
 assert.deepEqual(r.drawn,['king']);assert.equal(p.cardRecyclePoints,200);
 const r2=drawRecycledCards(p,pool,1,()=>seq[i++]);
 assert.deepEqual(r2.drawn,['a']);assert.equal(p.cardRecyclePoints,100);
 assert.ok(drawRecycledCards(p,pool,10).error);
 assert.equal(p.cardRecyclePoints,100);
});
test('100 batch draw produces only catalog cards with safe balances',()=>{
 const p={cardRecyclePoints:10000,cards:[]};
 const r=drawRecycledCards(p,pool,100,()=>.5);
 assert.equal(r.drawn.length,100);assert.equal(r.bossCount,0);
 assert.equal(p.cardRecyclePoints,0);
 assert.equal(p.cards.reduce((n,x)=>n+x.qty,0),100);
});
