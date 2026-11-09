import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../dist/extreme-trials.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('V2 戰袍角色欄獨立放大，維持原畫比例與定位',()=>{
 assert.match(css,/#gameShell \.character \.hero:has\(img\.art-hero\.extreme-outfit-equipped\)\{[^}]*padding:12px 10px!important;[^}]*text-align:center/);
 assert.match(css,/#gameShell \.character \.hero img\.art-hero\.extreme-outfit-equipped\{[^}]*position:relative!important;[^}]*left:auto!important;[^}]*width:138px!important;[^}]*height:190px!important;[^}]*margin:0 auto 12px!important;[^}]*object-fit:contain!important/);
 assert.match(css,/@media\(max-width:600px\)\{[^\n]*extreme-outfit-equipped[^\n]*height:160px!important/);
 assert.doesNotMatch(css,/#gameShell \.character \.hero img\.art-hero\.extreme-outfit-equipped\{[^}]*object-fit:cover/);
});

test('衣櫃預覽同步放大且新樣式具備快取版本',()=>{
 assert.match(css,/\.extreme-wardrobe-button img\{height:150px;width:126px;object-fit:contain/);
 assert.match(html,/extreme-trials\.css\?v=2-mantle-aura-lobby-scale/);
 assert.match(html,/game\.js\?v=7\.1\.9-extreme-roster/);
});

test('首頁V2戰袍放大，但原本角色立繪與背景不受影響',()=>{
 assert.match(css,/\.slot-select img\.art-entry\.extreme-outfit-equipped\{transform:scale\(1\.18\)!important;transform-origin:center center!important\}/);
 assert.doesNotMatch(css,/\.slot-select img\.art-entry\{transform:scale\(1\.18\)/);
});

test('穿戴V2戰袍時光環定位以人物肖像區為準，非整張角色卡高度',()=>{
 assert.match(css,/#gameShell #character \.hero\[class\*="extreme-aura-"\]:has\(img\.extreme-outfit-equipped\)::before\{[^}]*top:106px!important;[^}]*width:154px!important;[^}]*height:154px!important/);
 assert.match(css,/#gameShell #character \.hero\[class\*="extreme-aura-"\]:has\(img\.extreme-outfit-equipped\)::after\{[^}]*top:10px!important;[^}]*height:176px!important/);
 assert.match(css,/@media\(max-width:600px\)\{#gameShell #character \.hero\[class\*="extreme-aura-"\]/);
});

test('萬軍魔主的專用首領圖限制在同一戰鬥肖像框，不會擠走清怪目標',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/class="art-sprite extreme-boss-art" src="assets\/extreme\/boss-clear\.webp"/);
 assert.match(game,/class="extreme-minion-grid"/);
 assert.match(game,/<div class="extreme-minion-roster"><b>場上軍勢 · 點擊指定目標<\/b>/);
 assert.match(game,/\$\{minions\}<\/div><\/div>`;/,'軍勢網格必須嵌在首領卡片內，不能被外層隱藏');
 assert.match(css,/#encounter \.tower-monster-portrait img\.extreme-boss-art\{[^}]*max-width:160px!important;[^}]*height:150px!important;[^}]*object-fit:contain!important/);
 assert.match(css,/\.extreme-minion-grid\{[^}]*grid-template-columns:repeat\(5,minmax\(0,1fr\)\);[^}]*width:100%;min-width:0/);
 assert.match(css,/#encounter:has\(\.extreme-minion-roster\)\{[^}]*height:auto!important;[^}]*max-height:none!important;[^}]*overflow:visible!important/);
 assert.match(css,/#encounter:has\(\.extreme-minion-roster\) \.enemy-lineup\{[^}]*height:auto!important;[^}]*overflow:visible!important/);
 assert.match(css,/#encounter \.tower-encounter:has\(\.extreme-minion-roster\)\{[^}]*height:auto!important;[^}]*overflow:visible!important/);
 assert.match(css,/\.extreme-minion-grid \.enemy-target\{[^}]*height:114px!important;[^}]*min-height:114px!important/);
});
