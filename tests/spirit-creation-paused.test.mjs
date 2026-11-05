import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const game = readFileSync(new URL('../dist/game.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');

test('御靈使創角鎖定，不因其他角色 210 等解鎖', () => {
  assert.match(game, /button\.disabled=true;button\.classList\.add\('spirit-locked'\)/);
  assert.match(game, /職業重製中 · 暫停創立/);
  assert.doesNotMatch(game, /function spiritUnlocked\(/);
});

test('創角入口拒絕所有御靈使職系', () => {
  assert.match(game, /\['spiritist','pactWarrior','spiritCommander'\]\.includes\(job\)\)return toast/);
  assert.doesNotMatch(game, /function freshSpiritThird\(/);
  assert.doesNotMatch(game, /function finishSpiritCreation\(/);
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
