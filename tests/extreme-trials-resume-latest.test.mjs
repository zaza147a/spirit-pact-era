import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderExtremePanel,extremeStartOptions} from '../dist/extreme-trials-ui.js';
import {beginExtremeRun} from '../dist/extreme-trials.js';

test('四王各自從已通關最高階的下一階繼續，保留原十階選層',()=>{
 const highs={atk:37,matk:50,hp:1,clear:105};
 const player={level:210,location:'dawncity',extremeProgress:Object.fromEntries(
  Object.entries(highs).map(([kind,highest])=>[kind,{highest}]))};
 const html=renderExtremePanel(player);
 for(const [kind,highest] of Object.entries(highs)){
  assert.match(html,new RegExp(`data-extreme-enter="${kind}" data-extreme-floor="${highest+1}"`));
  assert.match(html,new RegExp(`從最高進度繼續 · 第 ${highest+1} 階`));
  assert.ok(beginExtremeRun(player,kind,highest+1,1000).run,`${kind} resume floor`);
  assert.equal(extremeStartOptions(highest).every(f=>f===1||f%10===0),true);
 }
 assert.ok(html.includes('data-extreme-select="atk"'));
 assert.ok(!html.includes('data-extreme-floor="106" data-extreme-floor'));
});

test('尚未通關時只有第一階入口，等級與進場限制仍生效',()=>{
 const player={level:210,location:'dawncity',extremeProgress:{}};
 const html=renderExtremePanel(player);
 assert.doesNotMatch(html,/data-extreme-floor=/);
 assert.ok(beginExtremeRun(player,'hp',1,1000).run);
 assert.ok(beginExtremeRun(player,'hp',2,1000).error);
 const low=renderExtremePanel({...player,level:199,extremeProgress:{hp:{highest:5}}});
 assert.match(low,/data-extreme-floor="6" disabled title="需要 200 等"/);
 assert.ok(beginExtremeRun({...player,location:'petland',extremeProgress:{hp:{highest:5}}},'hp',6,1000).error);
});

test('開始按鈕可傳入最新階數，原下拉選層入口不變',()=>{
 const game=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.match(game,/enter\.dataset\.extremeFloor\|\|selector\?\.value\|\|1/);
});
