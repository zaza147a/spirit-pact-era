import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../dist/game.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('御靈使與其他一轉職業同樣開放創立，無 210 等門檻', () => {
  assert.match(game, /button\.disabled=false;button\.classList\.remove\('spirit-locked'\)/);
  assert.match(game, /從 1 等開始正常養成/);
  assert.doesNotMatch(game, /function spiritUnlocked\(/);
  assert.doesNotMatch(game, /職業重製中，暫停建立新角色/);
});

test('只能新建一轉角色；御靈使可透過正常升級二轉分支', () => {
  assert.match(game, /if\(!CLASSES\[job\]\|\|SECOND_JOBS\[job\]\)return toast/);
  assert.match(game, /spiritist:'staffSword'/);
  assert.doesNotMatch(game, /\['spiritist','pactWarrior','spiritCommander'\]\.includes\(job\)\)return toast/);
  assert.doesNotMatch(game, /function freshSpiritThird\(/);
  assert.doesNotMatch(page, /id="spiritCreateModal"/);
});

test('遊戲版本顯示與腳本快取號同步', () => {
  const version=page.match(/<title>[^<]*V(\d+\.\d+\.\d+)<\/title>/)?.[1];
  assert.ok(version, '首頁標題必須有版本號');
  const displayed=[...page.matchAll(/V(\d+\.\d+\.\d+)/g)].map(match=>match[1]);
  assert.ok(displayed.length>=3,'首頁應顯示版本號');
  assert.ok(displayed.every(value=>value===version),'所有顯示版本應一致');
  assert.ok(page.includes(`game.js?v=${version}`),'遊戲主程式快取號應與顯示版本一致');
});
