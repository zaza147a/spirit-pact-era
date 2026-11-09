import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('lobby honors owned, equipped gold collectible background',()=>{
 const lobby=game.slice(game.indexOf('function decorateTowerHonorEntry('),game.indexOf('function renderEntry('));
 assert.match(lobby,/readCosmeticCollection\(localStorage\)/);
 assert.match(lobby,/goldCollection\.backgrounds\.includes\(character\.cosmeticBackground\)/);
 assert.match(lobby,/cosmeticBackgroundArt\(character\.cosmeticBackground\)/);
 assert.match(lobby,/character\.cosmeticBrightness/);
 assert.match(lobby,/stage\.classList\.add\('extreme-entry-scene'\)/);
});

test('lobby game module cache is bumped',()=>{
 assert.match(index,/game\.js\?v=7\.1\.9-gold-entry-background-20261110/);
});
