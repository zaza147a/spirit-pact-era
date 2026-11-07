import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {runtime} from './runtime31-helper.mjs';
import {TOWER_FROST_JOBS} from '../dist/tower-costumes.js';

async function fixture(highest){
 const context=await runtime(),game=context.api;
 const character=game.normalize(game.fresh('永凍挑戰','priest'));
 Object.assign(character,{job:'priest',reborn:true,thirdJob:true,towerProgress:{highest},towerCostume:null});
 game.setup(character,null);
 return {context,game,character};
}

test('actual wardrobe hides frost illustration before floor 30',async()=>{
 const {context}=await fixture(29);
 const html=vm.runInContext('renderTowerCostumeGallery()',context);
 assert.match(html,/通關天穹終境第30層解鎖/);
 assert.match(html,/disabled/);
 assert.doesNotMatch(html,/<img/);
});

test('actual wardrobe reveals corresponding art after floor 30 and allows undo',async()=>{
 const {context,character}=await fixture(30);
 let html=vm.runInContext('renderTowerCostumeGallery()',context);
 assert.match(html,/assets\/tower\/outfit-priest-frost.webp/);
 assert.match(html,/穿戴永凍時裝/);
 assert.doesNotMatch(html,/disabled/);
 context.chooseTowerCostume(character,'frost');
 html=vm.runInContext('renderTowerCostumeGallery()',context);
 assert.match(html,/取消穿戴/);
 context.chooseTowerCostume(character,null);
 html=vm.runInContext('renderTowerCostumeGallery()',context);
 assert.match(html,/穿戴永凍時裝/);
});

test('actual home and character-select portrait use identical tower reward URL',async()=>{
 const {context,character}=await fixture(30);
 character.towerCostume='frost';
 const made=[];
 context.document.createElement=()=>{const el={className:'',src:'',alt:''};made.push(el);return el;};
 const homeArt={className:'art-sprite art-hero',replaceWith(el){this.replacement=el;}};
 const home={style:{},classList:{add(){}},querySelector:selector=>selector==='.art-sprite'?homeArt:null};
 const characterNode=context.document.getElementById('character');
 characterNode.querySelector=selector=>selector==='.hero'?home:null;
 characterNode.dataset={};
 vm.runInContext('applyCosmeticHero()',context);
 assert.match(homeArt.replacement.src,/outfit-priest-frost.webp/);
 const lobbyArt={replaceWith(el){this.replacement=el;}};
 const lobbyStage={querySelector:()=>lobbyArt};
 const name={classList:{add(){}},insertAdjacentElement(){}};
 const slot={querySelector:selector=>selector==='h2'?name:selector==='.slot-art-stage'?lobbyStage:null};
 context.document.getElementById('slotGrid').querySelector=()=>slot;
 vm.runInContext('decorateTowerHonorEntry([{index:0,player:globalThis.api.state().player}])',context);
 assert.equal(lobbyArt.replacement.src,homeArt.replacement.src);
});

test('all twelve profession wardrobes point to their own correct artwork',async()=>{
 const {context,character}=await fixture(30);
 for(const job of TOWER_FROST_JOBS){
  character.job=job;
  const html=vm.runInContext('renderTowerCostumeGallery()',context);
  assert.ok(html.includes(`outfit-${job}-frost.webp`),`${job} missing costume`);
  assert.doesNotMatch(html,/disabled/,`${job} should be available at 30`);
 }
});

test('frost selection survives a serialized save/load and remains cosmetic',async()=>{
 const {game,character}=await fixture(30);
 const originalStats={attributes:structuredClone(character.attributes),gear:structuredClone(character.gear),cards:structuredClone(character.cards),pets:structuredClone(character.pets)};
 assert.equal(game.normalize(character).towerCostume,null);
 assert.equal((await import('../dist/tower-costumes.js')).chooseTowerCostume(character,'frost'),true);
 const saved=JSON.parse(JSON.stringify({version:2,player:character}));
 const loaded=game.normalize(saved.player);
 assert.equal(loaded.towerCostume,'frost');
 for(const key of Object.keys(originalStats))assert.deepEqual(JSON.parse(JSON.stringify(loaded[key])),originalStats[key],key+' changed after choosing costume');
 loaded.towerProgress.highest=29;
 game.normalize(loaded);
 assert.equal(loaded.towerCostume,null,'cannot use a floor-30 reward after invalidating its unlock');
});

test('live character honor wardrobe recognizes gold collection and preserves a chosen title',async()=>{
 const {context,game,character}=await fixture(10);
 context.localStorage.getItem=()=>null;
 character.goldCollectionTier=1;
 character.towerProgress.claimed=[10];
 vm.runInContext('refreshCollectionHonorTitles(player)',context);
 let html=vm.runInContext("renderTowerHonors('title')",context);
 assert.match(html,/黃金冒險者/);
 assert.match(html,/破曉挑戰者/);
 assert.equal(context.selectTowerHonor(character,'title','黃金冒險者'),true);
 html=vm.runInContext("renderTowerHonors('title')",context);
 assert.match(html,/黃金冒險者 · 使用中/);
 const restored=game.normalize(JSON.parse(JSON.stringify(character)));
 assert.equal(context.normalizeTowerHonorSelection(restored).title,'黃金冒險者');
});
