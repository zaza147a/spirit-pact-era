import test from 'node:test';
import assert from 'node:assert/strict';
import {unlockedTowerHonors,normalizeTowerHonorSelection,selectTowerHonor,towerHonorFrameClass} from '../dist/tower-honors.js';
import {renderTowerPanel} from '../dist/endless-tower-ui.js';

test('honors require the corresponding boss first-clear claim',()=>{
 const p={towerProgress:{highest:30,claimed:[10,20]}};
 assert.deepEqual(unlockedTowerHonors(p).map(h=>h.floor),[10,20]);
 assert.equal(selectTowerHonor(p,'title','永凍守護者'),false);
 assert.equal(selectTowerHonor(p,'frame','永凍名稱框'),false);
});

test('title and name frame select independently and never stack',()=>{
 const p={towerProgress:{highest:30,claimed:[10,20,30]}};
 assert.equal(selectTowerHonor(p,'title','破曉挑戰者'),true);
 assert.equal(selectTowerHonor(p,'frame','永凍名稱框'),true);
 assert.equal(selectTowerHonor(p,'title','炎龍征服者'),true);
 assert.deepEqual(normalizeTowerHonorSelection(p),{title:'炎龍征服者',frame:'永凍名稱框'});
 assert.equal(towerHonorFrameClass(p),'tower-frame-frost');
 assert.equal(selectTowerHonor(p,'title',''),true);
 assert.deepEqual(normalizeTowerHonorSelection(p),{title:null,frame:'永凍名稱框'});
});

test('invalid saved selections are hidden and title selectors are not in tower challenge panel',()=>{
 const p={thirdJob:true,level:210,hp:100,dawnUnlocked:true,location:'dawncity',towerProgress:{highest:10,claimed:[10]},towerHonorSelection:{title:'永凍守護者',frame:'永凍名稱框'}};
 assert.deepEqual(normalizeTowerHonorSelection(p),{title:null,frame:null});
 assert.doesNotMatch(renderTowerPanel(p),/data-tower-honor/);
});

test('gold and continent collection titles use the single-select title wardrobe',()=>{
 const p={towerProgress:{highest:0,claimed:[]},extraHonorTitles:['黃金冒險者','大陸典藏家']};
 assert.equal(selectTowerHonor(p,'title','黃金冒險者'),true);
 assert.equal(selectTowerHonor(p,'title','大陸典藏家'),true);
 assert.deepEqual(normalizeTowerHonorSelection(p),{title:'大陸典藏家',frame:null});
 assert.equal(selectTowerHonor(p,'title','未取得稱號'),false);
});
