import test from 'node:test';
import assert from 'node:assert/strict';
import {preferredBossCards,bossCardCandidates} from '../scripts/boss-card-selection.mjs';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';

test('首領卡頭上依職業主屬性選擇',()=>{
 assert.equal(preferredBossCards('knight').headUpper,'boss_starter');
 assert.equal(preferredBossCards('monk').headUpper,'boss_starter');
 assert.equal(preferredBossCards('hunter').headUpper,'boss_skyport');
 assert.equal(preferredBossCards('wizard').headUpper,'boss_skyport');
 assert.equal(preferredBossCards('wizard').headMiddle,'boss_forest');
});

test('所有優先王卡符合部位職業，且不包含普通卡',()=>{
 for(const job of ['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer']){
  for(const [slot,id]of Object.entries(preferredBossCards(job))){
   if(id){assert.ok(id.startsWith('boss_'));assert.ok(cardAllowedInSlot(CARDS[id],slot,job));}
   assert.ok(bossCardCandidates(job,slot).every(([name])=>name.startsWith('boss_')));
  }
 }
});
