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
  assert.equal((page.match(/V6\.5\.61/g)||[]).length, 3);
  assert.match(page, /game\.js\?v=6\.5\.61/);
});
