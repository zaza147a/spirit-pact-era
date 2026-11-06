import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
const page=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');

test('warehouse marks boss cards in both inventory and shared storage columns',()=>{
 assert.match(game,/const boss=item\.kind==='card'&&CARDS\[item\.id\]\?\.boss===true/);
 assert.match(game,/warehouse-row \$\{boss\?'warehouse-boss-card':''\}/);
 assert.match(game,/♛ 首領卡片/);
 assert.match(game,/if\(warehouseCategory==='cards'\)\{bagStacks\.sort\(bossFirst\);storedStacks\.sort\(bossFirst\);\}/);
 assert.match(game,/stackList\.map\(i=>stackCard\(i,direction\)\)/);
 assert.match(game,/column\('此角色背包',activeGear,bagStacks,'deposit'\)/);
 assert.match(game,/column\('共用倉庫',storedGear,storedStacks,'withdraw'\)/);
 assert.match(page,/\.warehouse-row\.warehouse-boss-card\{border:2px solid #d9ae52/);
 assert.match(page,/\.warehouse-boss-badge\{/);
});
