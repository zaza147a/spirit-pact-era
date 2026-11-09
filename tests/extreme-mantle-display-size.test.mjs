import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../dist/extreme-trials.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('V2 戰袍角色欄獨立放大，維持原畫比例與定位',()=>{
 assert.match(css,/#gameShell \.character \.hero:has\(img\.art-hero\.extreme-outfit-equipped\)\{[^}]*padding:188px 10px 12px!important;[^}]*text-align:center/);
 assert.match(css,/#gameShell \.character \.hero img\.art-hero\.extreme-outfit-equipped\{[^}]*position:absolute!important;[^}]*left:50%!important;[^}]*width:124px!important;[^}]*height:174px!important;[^}]*object-fit:contain!important/);
 assert.match(css,/@media\(max-width:600px\)\{[^\n]*extreme-outfit-equipped[^\n]*height:150px!important/);
 assert.doesNotMatch(css,/#gameShell \.character \.hero img\.art-hero\.extreme-outfit-equipped\{[^}]*object-fit:cover/);
});

test('衣櫃預覽同步放大且新樣式具備快取版本',()=>{
 assert.match(css,/\.extreme-wardrobe-button img\{height:150px;width:126px;object-fit:contain/);
 assert.match(html,/extreme-trials\.css\?v=2-mantle-layout-and-roster/);
 assert.match(html,/game\.js\?v=7\.1\.9-extreme-roster/);
});

test('萬軍魔主的專用首領圖限制在同一戰鬥肖像框，不會擠走清怪目標',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/class="art-sprite extreme-boss-art" src="assets\/extreme\/boss-clear\.webp"/);
 assert.match(game,/class="extreme-minion-grid"/);
 assert.match(game,/<div class="extreme-minion-roster"><b>場上軍勢 · 點擊指定目標<\/b>/);
 assert.match(game,/\$\{minions\}<\/div><\/div>`;/,'軍勢網格必須嵌在首領卡片內，不能被外層隱藏');
 assert.match(css,/#encounter \.tower-monster-portrait img\.extreme-boss-art\{[^}]*max-width:160px!important;[^}]*height:150px!important;[^}]*object-fit:contain!important/);
 assert.match(css,/\.extreme-minion-grid\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\);[^}]*width:100%;min-width:0/);
});
