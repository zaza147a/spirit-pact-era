// Only checks the current branch's actual extreme-trial run reports.
// Historical five-boss/DPS/field tests are deliberately excluded.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {WEAPON_VARIANTS,currentEndgamePlayer} from './fixtures/current-210-endgame-player.mjs';
import {CARDS} from '../dist/catalog.js';
import {cardAllowedInSlot} from '../dist/card-effects.js';

const jobs=['knight','crusader','wizard','sage','assassin','rogue','priest','monk','hunter','performer','pactWarrior','spiritCommander'];
const modes=['atk','matk','hp','clear'];
const data=path=>JSON.parse(readFileSync(path,'utf8'));

test('all twelve first-pass searches ran 24 legal candidates through every real extreme mode',()=>{
 for(const job of jobs){
  const r=data(`docs/current-extreme-${job}-search-20261110.json`);
  assert.equal(r.completed,24,job);
  assert.equal(r.results.length,96,job);
  assert.equal(r.status,'BOUNDED SEARCH COMPLETE, not global optimum');
  for(const kind of modes){
   const rows=r.results.filter(x=>x.kind===kind);
   assert.equal(rows.length,24,`${job}/${kind}`);
   assert.ok(rows.every(x=>x.stopped==='first-failure'&&x.nextFloor===x.highest+1),`${job}/${kind}`);
   assert.equal(r.best[kind].highest,Math.max(...rows.map(x=>x.highest)),`${job}/${kind}`);
  }
 }
});

test('second-pass reports contain five additional legal attribute profiles per mode',()=>{
 for(const job of jobs)for(const kind of modes){
  const first=data(`docs/current-extreme-${job}-search-20261110.json`);
  const r=data(`docs/current-extreme-refine-${job}-${kind}-20261111.json`);
  assert.equal(r.completed,5,`${job}/${kind}`);
  assert.equal(r.results.length,5,`${job}/${kind}`);
  assert.equal(r.status,'BOUNDED SEARCH COMPLETE, not global optimum');
  assert.ok(r.results.every(x=>x.stopped==='first-failure'&&x.nextFloor===x.highest+1),`${job}/${kind}`);
  assert.ok(r.results.every(x=>x.fusion===first.best[kind].fusion&&x.weaponChoice===first.best[kind].weaponChoice),`${job}/${kind}`);
  assert.deepEqual(new Set(r.results.map(x=>x.attributeProfile)),new Set(['agi-vit','luk-vit','dex-vit','vit-luk','dex-luk']),`${job}/${kind}`);
 }
});

test('weapon comparisons only use legal equipped forms and stop at first failure',()=>{
 for(const [job,variants] of Object.entries(WEAPON_VARIANTS)){
  if(variants.length===1)continue;
  const defaultId=currentEndgamePlayer(job).gear.rightHand.id;
  for(const weaponId of variants.filter(id=>id!==defaultId))for(const kind of modes){
   const file=`docs/current-extreme-weapon-${job}-${weaponId.replaceAll('+','-')}-${kind}-20261111.json`;
   const r=data(file);
   assert.equal(r.completed,2,file);
   assert.equal(r.results.length,2,file);
   assert.ok(r.results.every(x=>x.weaponId===weaponId&&x.stopped==='first-failure'&&x.nextFloor===x.highest+1),file);
   assert.deepEqual(new Set(r.results.map(x=>x.weaponChoice)),new Set(['critDmg','aspdPct']),file);
  }
 }
});

test('wizard card-swap sensitivity samples use only legal boss cards and first failures',()=>{
 const files=readdirSync('docs').filter(name=>name.startsWith('current-extreme-card-wizard-')&&name.endsWith('-20261111.json'));
 assert.equal(files.length,45);
 for(const file of files){
  const r=data(`docs/${file}`);
  assert.equal(r.completed,1,file);
  const x=r.results[0];
  assert.ok(CARDS[x.cardId]?.boss&&cardAllowedInSlot(CARDS[x.cardId],x.cardSlot,'wizard'),file);
  assert.equal(x.stopped,'first-failure',file);
  assert.equal(x.nextFloor,x.highest+1,file);
 }
});
