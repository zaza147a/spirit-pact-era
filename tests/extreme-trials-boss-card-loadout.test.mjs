import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {bossCardEquipAllowed,bossCardHitBonus} from '../dist/boss-card-runtime.js';
import {equipExtremeBossCards} from './fixtures/extreme-boss-card-loadout.mjs';

test('十二職四王的測試裝備各自鑲十張合法且不重複的王卡',()=>{
 for(const job of ['knight','crusader','assassin','rogue','hunter','performer','wizard','sage','priest','monk','pactWarrior','spiritCommander']){
  const p={job},sockets=equipExtremeBossCards(p);
  assert.equal(Object.keys(sockets).length,Object.keys(SLOTS).length);
  assert.equal(new Set(Object.values(sockets)).size,10);
  for(const [slot,id] of Object.entries(sockets)){
   assert.ok(CARDS[id].boss,id);
   assert.equal(bossCardEquipAllowed(CARDS[id],slot,job),true,`${job}/${slot}/${id}`);
  }
  assert.equal(sockets.rightHand,['pactWarrior','spiritCommander'].includes(job)?'dawn-archon':sockets.rightHand);
 }
});

test('萬靈210王卡每第三次夥伴有效命中追加310%且不重複觸發',()=>{
 const p={job:'spiritCommander',sockets:{rightHand:'dawn-archon'}};
 const hit=()=>bossCardHitBonus(p,CARDS,{now:10000,source:'pet',petId:'single',damage:100,magical:true});
 assert.equal(hit(),0);assert.equal(hit(),0);assert.equal(hit(),310);
 assert.equal(hit(),0);assert.equal(hit(),0);assert.equal(hit(),310);
});
