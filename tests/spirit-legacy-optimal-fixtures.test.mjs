// Canonical legacy comparisons come from the user's saved optimum builds.
// Intentionally do not regenerate their gear from an approximation algorithm.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';
import {rankOf} from '../dist/sky-trials.js';
import {GEAR_BASE} from '../dist/loot.js';

const root=fileURLToPath(new URL('./fixtures/legacy-best-v6559/',import.meta.url));
const manifest=JSON.parse(readFileSync(resolve(root,'manifest.json'),'utf8'));
export const LEGACY_OPTIMAL_BUILD_NAMES=Object.freeze(manifest.rows.map(row=>row.job));
export function legacyOptimalPlayer(job){
 const row=manifest.rows.find(entry=>entry.job===job);
 if(!row)throw Error('No user-provided optimum save for '+job);
 const save=JSON.parse(readFileSync(resolve(root,row.file),'utf8'));
 return structuredClone(save.player);
}

test('all ten original jobs have one user-supplied optimum fixture',()=>{
 assert.equal(manifest.rows.length,10);
 assert.equal(new Set(LEGACY_OPTIMAL_BUILD_NAMES).size,10);
 for(const row of manifest.rows){
  const p=legacyOptimalPlayer(row.job);
  assert.equal(p.job,row.job);
  assert.equal(p.level,210);
  assert.equal(p.dawnSigil,8);
  assert.equal(p.pets.length,1);
  assert.equal(Object.values(p.attributes).reduce((n,v)=>n+v-1,0),438);
  assert.ok(Object.values(p.attributes).every(n=>Number.isInteger(n)&&n>=1&&n<=150));
  assert.equal(p.gear.rightHand?.id,row.weapon);
  assert.equal(p.gear.leftHand?.id||null,row.offhand);
  assert.equal(row.aspd,193);
  assert.equal(row.verified,true);
  for(const [slot,gear] of Object.entries(p.gear)){
   if(!gear){assert.equal(p.sockets?.[slot]||null,null);continue;}
   assert.equal(gear.level,200,`${row.job}/${slot}`);
   assert.equal(gear.rarity,'mythic',`${row.job}/${slot}`);
   assert.equal(rankOf(gear),'SSS',`${row.job}/${slot}`);
   if(!GEAR_BASE[gear.id]?.weaponType){
    assert.equal(Object.keys(gear.affixes).filter(key=>!['def','mdef','flee','hpPct'].includes(key)).length,2);
    for(const key of ['def','mdef','flee','hpPct'])assert.ok(gear.affixes[key]>0,`${row.job}/${slot}/${key}`);
   }
   const cardId=p.sockets?.[slot];
   if(cardId){
    const card=CARDS[cardId];
    assert.ok(card?.boss,`${row.job}/${slot} not a boss card`);
    assert.notEqual(card.map,'dawnrift',`${row.job}/${slot} is Lv210 boss`);
    assert.ok(cardAllowedInSlot(card,slot,p.job),`${row.job}/${slot} card placement`);
   }
  }
 }
});
