import test from 'node:test';
import assert from 'node:assert/strict';
import {renderExtremePanel,extremeStartOptions} from '../dist/extreme-trials-ui.js';
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
  const html=renderExtremePanel({level:210,extremeProgress:{atk:{highest:20},matk:{highest:4},hp:{highest:10}},extremeCoins:99});
  assert.equal((html.match(/data-extreme-enter=/g)||[]).length,4);
  assert.match(html,/極限徽記：99/);
  assert.match(html,/第 20 階/);
  assert.match(html,/第 10 階/);
});

test('挑戰中顯示階段目標與倒數',()=>{
  const html=renderExtremePanel({extremeRun:{kind:'hp',floor:2,stageStartedAt:1000,stageDamage:120}}, {now:11000});
  assert.match(html,/本階剩餘 20 秒/);
  assert.match(html,/data-extreme-exit/);
  assert.doesNotMatch(html,/data-extreme-enter/);
});
