import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXTREME_MANTLE_CATALOG,extremeMantleArt} from '../dist/extreme-mantle-catalog.js';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const entryCss=readFileSync(new URL('../dist/entry-portrait-clarity.css',import.meta.url),'utf8');
const heroCss=readFileSync(new URL('../dist/cosmetic-gallery.css',import.meta.url),'utf8');
const extremeCss=readFileSync(new URL('../dist/extreme-trials.css',import.meta.url),'utf8');

test('首頁與角色欄的48件極限戰袍使用同一套圖片解析，沒有退回普通立繪',()=>{
 const lobby=game.slice(game.indexOf('function decorateTowerHonorEntry('),game.indexOf('function',game.indexOf('function decorateTowerHonorEntry(')+9));
 const hero=game.slice(game.indexOf('function applyCosmeticHero('),game.indexOf('function',game.indexOf('function applyCosmeticHero(')+9));
 for(const source of [lobby,hero]){
  assert.match(source,/extremeUnlockedCosmetics\([^,]+,'mantle'\)/);
  assert.match(source,/extremeMantleArt\([^,]+,mantle\)/);
  assert.match(source,/extreme-outfit-equipped/);
 }
 assert.equal(EXTREME_MANTLE_CATALOG.length,48);
 for(const {kind,job} of EXTREME_MANTLE_CATALOG)
  assert.equal(extremeMantleArt(job,kind),`assets/extreme/mantles-v2/${kind}-${job}.webp`);
});

test('首頁與角色欄保留等比例縮放、正確的高度及極限戰袍透明邊緣',()=>{
 assert.match(entryCss,/\.slot-select img\.art-entry\s*\{[^}]*object-fit:contain/s);
 assert.match(entryCss,/\.slot-select \.slot-art-stage\s*\{[^}]*height:260px/s);
 assert.match(heroCss,/#gameShell \.character \.hero img\.art-hero\.cosmetic-equipped\s*\{[^}]*object-fit:contain/s);
 assert.match(extremeCss,/\.extreme-outfit-equipped\{object-fit:contain!important/);
 assert.doesNotMatch(extremeCss,/\.extreme-outfit-equipped\{[^}]*image-rendering:pixelated/);
});
