import test from 'node:test';
import assert from 'node:assert/strict';
import {renderExtremePanel,extremeStartOptions} from '../dist/extreme-trials-ui.js';
import {readFileSync} from 'node:fs';
test('不限層數的入場選單仍保留早期節點且最多約二十餘項',()=>{
 const list=extremeStartOptions(1000000000);
 assert.deepEqual(list.slice(0,4),[1,10,20,30]);
 assert.equal(list.at(-1),1000000000);
 assert.ok(list.length<=25);
 const html=renderExtremePanel({level:210,extremeProgress:{atk:{highest:1000000000}}});
 assert.match(html,/第 1000000000 階/);
 assert.ok(html.length<30000);
});

test('四隻首領選擇與獨立最高階段',()=>{
  const html=renderExtremePanel({level:210,extremeProgress:{atk:{highest:20},matk:{highest:4},hp:{highest:10}}});
  assert.equal((html.match(/data-extreme-enter=/g)||[]).length,4);
  assert.match(html,/階段獎勵 · 自動永久解鎖/);
  assert.match(html,/破軍典藏名稱框/);
  assert.doesNotMatch(html,/極限商店|極限徽記|data-extreme-buy|永久購買/);
  assert.match(html,/第 20 階/);
  assert.match(html,/第 10 階/);
  assert.equal((html.match(/31 階後平滑加速/g)||[]).length,2);
  assert.doesNotMatch(html,/攻擊每階增加 15%/);
});

test('已移除商店購買按鈕，衣櫃在存檔失敗時仍回復原選擇',()=>{
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 const wardrobe=source.slice(source.indexOf("const cosmetic=event.target.closest('[data-extreme-cosmetic]')"),source.indexOf("document.addEventListener('click',event=>{\n  if(!event.target.closest('[data-extreme-exit]')"));
 assert.doesNotMatch(source,/data-extreme-buy|buyExtremeShopItem|極限徽記/);
 assert.doesNotMatch(source,/極限試煉商店解鎖/);
 assert.match(source,/四王各通過第 30 階後會自動永久解鎖兩款背景/);
 assert.match(wardrobe,/const before=structuredClone\(player\)/);
 assert.match(wardrobe,/if\(save\(\)===false\)\{player=before;/);
 assert.match(wardrobe,/已恢復原先選擇/);
});

test('挑戰中顯示階段目標與倒數',()=>{
  const html=renderExtremePanel({extremeRun:{kind:'hp',floor:2,stageStartedAt:1000,stageDamage:120}}, {now:11000});
  assert.match(html,/本階剩餘 20 秒/);
  assert.match(html,/data-extreme-exit/);
  assert.doesNotMatch(html,/data-extreme-enter/);
});
