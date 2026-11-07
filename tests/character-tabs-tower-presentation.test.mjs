import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';

test('character handbook tabs use a four-column layout with a narrow screen fallback',async()=>{
 const css=await readFile('dist/endless-tower.css','utf8');
 assert.match(css,/#side \.section-tabs\{display:grid!important;grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:420px\)\{#side \.section-tabs\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('dawn city gatekeeper and home name-frame use the same character honor selection',async()=>{
 const game=await readFile('dist/game.js','utf8');
 assert.match(game,/終境守望者・賽菈/);
 assert.match(game,/tower-gatekeeper/);
 assert.match(game,/nameButton\.classList\.add\('tower-honor-name',chosenFrame\)/);
 assert.match(game,/refreshCollectionHonorTitles\(player\)/);
 assert.doesNotMatch(game,/insertAdjacentHTML\('beforeend','<span class="gold-collector-title">/);
});

test('first thirty floors use three transparent independent regional monster images',async()=>{
 const game=await readFile('dist/game.js','utf8');
 assert.match(game,/assets\/tower\/monster-\$\{/);
 for(const name of ['dawn','flame','frost']){
  const file=`dist/assets/tower/monster-${name}.webp`;
  assert.ok((await stat(file)).size>15_000,file);
 }
});
