import assert from 'node:assert/strict';
import {CARDS,SLOTS} from '../dist/catalog.js';
import {cardAllowedInSlot,migrateCardBindings} from '../dist/card-effects.js';

const bosses=Object.entries(CARDS).filter(([,card])=>card.boss);
assert.equal(bosses.length,22,'應包含20張原地圖首領卡、初期夥伴之王與210首領卡');

// Every historic boss card could be equipped in accessory 1/2. Test both
// former slots independently, including newly legal assignments.
for(const [id,card] of bosses){
 if(card.map==='dawnrift')continue; // introduced only after the new layout
 for(const oldSlot of ['accessory1','accessory2']){
  const player={job:'knight',cards:[{id,qty:2}],sockets:Object.fromEntries(Object.keys(SLOTS).map(s=>[s,null]))};
  player.sockets[oldSlot]=id;
  const legal=cardAllowedInSlot(card,oldSlot,player.job);
  const result=migrateCardBindings(player,CARDS,SLOTS);
  assert.equal(result.length,legal?0:1,`${id} ${oldSlot} 退還數量`);
  assert.equal(player.sockets[oldSlot],legal?id:null,`${id} ${oldSlot} 鑲嵌狀態`);
  assert.equal(player.cards[0].qty,legal?2:3,`${id} ${oldSlot} 背包數量`);
  const snapshot=JSON.stringify(player);
  assert.equal(migrateCardBindings(player,CARDS,SLOTS).length,0,'再次讀取不可重複退卡');
  assert.equal(JSON.stringify(player),snapshot,'再次正規化必須完全冪等');
 }
}

// Several copies distributed across invalid slots are returned one for each
// equipment socket; a legal card stays in place, regardless of the card ID.
const [id]=bosses.find(([,c])=>c.map==='astral');
const player={job:'wizard',cards:[{id,qty:1}],sockets:Object.fromEntries(Object.keys(SLOTS).map(s=>[s,null]))};
for(const slot of ['headUpper','accessory1','accessory2','rightHand'])player.sockets[slot]=id;
const invalid=['headUpper','accessory1','accessory2','rightHand'].filter(slot=>!cardAllowedInSlot(CARDS[id],slot,'wizard'));
assert.equal(migrateCardBindings(player,CARDS,SLOTS).length,invalid.length);
assert.equal(player.cards[0].qty,1+invalid.length);
for(const slot of ['headUpper','accessory1','accessory2','rightHand'])
 assert.equal(player.sockets[slot],invalid.includes(slot)?null:id);

// The new Lv210 card is never left illegally attached to an old-class save.
const special={job:'knight',cards:[],sockets:Object.fromEntries(Object.keys(SLOTS).map(s=>[s,null]))};
special.sockets.rightHand='dawn-archon';
assert.equal(migrateCardBindings(special,CARDS,SLOTS).length,1);
assert.equal(special.sockets.rightHand,null);
assert.equal(special.cards[0].id,'dawn-archon');

console.log('21 legacy boss cards x 2 old accessory slots, multiple copies, legal slots, Lv210 job gating and repeated-load conservation passed');
