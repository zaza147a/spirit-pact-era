import test from 'node:test';
import assert from 'node:assert/strict';
import {renderExtremePanel} from '../dist/extreme-trials-ui.js';

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
