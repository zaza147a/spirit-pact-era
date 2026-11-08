import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {EXTREME_MANTLE_CATALOG,EXTREME_MANTLE_JOBS,EXTREME_MANTLE_KINDS,EXTREME_MANTLE_READY,extremeMantleVariant,extremeMantleArt} from '../dist/extreme-mantle-catalog.js';

test('四王乘十二職共有48個不重複戰袍資產規格',()=>{
 assert.equal(EXTREME_MANTLE_JOBS.length,12);
 assert.equal(EXTREME_MANTLE_KINDS.length,4);
 assert.equal(EXTREME_MANTLE_CATALOG.length,48);
 assert.equal(new Set(EXTREME_MANTLE_CATALOG.map(v=>v.id)).size,48);
 assert.equal(new Set(EXTREME_MANTLE_CATALOG.map(v=>v.art)).size,48);
 for(const {job,kind,art} of EXTREME_MANTLE_CATALOG){
  assert.equal(extremeMantleVariant(job,kind)?.art,art);
  assert.equal(extremeMantleArt(job,kind,{classArtReady:true}),art);
  assert.ok(existsSync(new URL(`../dist/${extremeMantleArt(job,kind)}`,import.meta.url)));
 }
 assert.equal(extremeMantleArt('unknown','atk'),null);
 assert.deepEqual(EXTREME_MANTLE_READY,['atk_knight','atk_crusader']);
 for(const variant of EXTREME_MANTLE_CATALOG){
  const resolved=extremeMantleArt(variant.job,variant.kind);
  assert.ok(existsSync(new URL(`../dist/${resolved}`,import.meta.url)),resolved);
  assert.equal(resolved===variant.art,EXTREME_MANTLE_READY.includes(variant.id));
 }
});

test('人物與選角的極限戰袍使用同一職業資產函式',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/extremeMantleArt\(character\.job,mantle\)/);
 assert.match(game,/extremeMantleArt\(player\.job,mantle\)/);
 assert.match(game,/extremeMantleArt\(player\.job,kind\)/);
});
