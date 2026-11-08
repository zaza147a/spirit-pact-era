import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const game=await readFile(new URL('../dist/game.js',import.meta.url),'utf8');
const entry=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');

test('四王試煉已接進正式遊戲模組與曙光 NPC',()=>{
  for(const token of ['startExtreme(kind,floor)','spawnExtremeBoss()','tickExtreme(now)','renderExtremeEncounter()','與亞爾德對話','renderExtremePanel(player'])
    assert.ok(game.includes(token),token);
  assert.match(entry,/extreme-trials\.css/);
});

test('隔離野外生成、獎勵、離線與死亡復活',()=>{
  for(const token of ['if(player.extremeRun)return;if(player.towerRun)','if(enemy?.extremeKind)return','if(player?.extremeRun||player?.towerRun)return false','if(p.extremeRun){delete p.extremeRun','if(player?.extremeRun)exitExtreme'])
    assert.ok(game.includes(token),token);
});

test('HP 王以實際結算傷害紀錄，MATK 王具有獨立魔法攻擊值',()=>{
  assert.match(game,/recordExtremeDamage\(player\.extremeRun,actual\)/);
  assert.match(game,/matk:run\.kind==='matk'\?/);
  assert.match(game,/attackType:run\.kind==='matk'\?'magic':'physical'/);
});
test('清怪王以實際死亡計數，立即補怪且沒有一般掉落',()=>{
  assert.match(game,/function awardExtremeEnemy\(\)/);
  assert.match(game,/run\.stageKills=\(run\.stageKills\|\|0\)\+1/);
  assert.match(game,/spawnExtremeMinion\(\);enemy=/);
  assert.match(game,/xp:0,gold:0,drops:\[\]/);
});
