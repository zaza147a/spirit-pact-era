import test from 'node:test';
import assert from 'node:assert/strict';
import {runtime} from './runtime31-helper.mjs';
import {legacyOptimalPlayer} from './fixtures/legacy-optimal-player.mjs';
import {beginExtremeRun} from '../dist/extreme-trials.js';
import {offlineWindow} from '../dist/offline-rules.js';
import {readFileSync} from 'node:fs';

const epoch=1000000;
test('極限試煉允許不足十秒的離線結算，但停用掛機時不可偷偷前進',()=>{
 const state={location:'dawnrift',hp:100,extremeRun:{kind:'atk',floor:1},offline:{at:epoch,enabled:true}};
 assert.equal(offlineWindow(state,epoch+3000).eligible,true);
 assert.equal(offlineWindow({...state,offline:{at:epoch,enabled:false}},epoch+3000).eligible,false);
 const source=readFileSync(new URL('../dist/game.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/if\(player\?\.extremeRun\)exitExtreme\('離開遊戲畫面'\)/);
 assert.doesNotMatch(source,/if\(player\?\.extremeRun\)exitExtreme\('返回選角'\)/);
});
function ready(c,kind,floor){
 const p=legacyOptimalPlayer('knight');
 p.location='dawncity';
 if(floor>1)p.extremeProgress={[kind]:{highest:floor}};
 p.extremeRun=beginExtremeRun(p,kind,floor,epoch).run;
 assert.ok(p.extremeRun);
 p.location='dawnrift';p.offline={at:epoch,enabled:true};
 c.api.setup(p);c.api.spawnExtremeBoss();c.api.checkpointExtreme();
 return p;
}

test('離線極限試煉延續原敵人與計時，勝利後自動進下一階並只領首次徽記',async()=>{
 const c=await runtime(),p=ready(c,'atk',1),gold=p.gold,xp=p.xp;
 const {player,summary}=await c.api.simulateOffline(p,epoch+20500);
 assert.ok(summary);
 assert.equal(summary.extremeFloors,1);
 assert.equal(summary.extremeCoins,10);
 assert.equal(player.extremeProgress.atk.highest,1);
 assert.equal(player.extremeRun?.floor,2);
 assert.equal(player.location,'dawnrift');
 assert.ok(player.extremeRun?.checkpoint);
 assert.equal(player.gold,gold);
 assert.equal(player.xp,xp);
 assert.equal(c.api.valid(player),true);
});

test('離線極限試煉首次失敗就停止、回城、保留已獲進度',async()=>{
 const c=await runtime(),p=ready(c,'hp',50);
 p.extremeProgress={hp:{highest:49}};
 const {player,summary}=await c.api.simulateOffline(p,epoch+31000);
 assert.match(summary.reason,/階段傷害不足/);
 assert.ok(summary.simulated<31000);
 assert.equal(player.extremeRun,undefined);
 assert.equal(player.extremeProgress.hp.highest,49);
 assert.equal(player.location,'dawncity');
 assert.equal(c.api.valid(player),true);
});

test('跨兩次登入與 JSON 存檔，戰鬥繼續推進且每階徽記只領一次',async()=>{
 const firstRuntime=await runtime(),initial=ready(firstRuntime,'atk',1);
 const first=(await firstRuntime.api.simulateOffline(initial,epoch+20500)).player;
 assert.equal(first.extremeRun.floor,2);
 assert.equal(first.extremeCoins,10);
 const serialized=JSON.stringify(first);
 const secondRuntime=await runtime(),restored=JSON.parse(serialized);
 restored.offline={at:epoch+20500,enabled:true};
 const result=await secondRuntime.api.simulateOffline(restored,epoch+41000);
 assert.equal(result.summary.extremeFloors,1);
 assert.equal(result.summary.extremeCoins,10);
 assert.equal(result.player.extremeRun.floor,3);
 assert.equal(result.player.extremeProgress.atk.highest,2);
 assert.equal(result.player.extremeCoins,20);
 assert.equal(first.extremeCoins,10);
 assert.ok(result.player.extremeRun.checkpoint.at>=epoch+41000);
});

test('損壞的極限 checkpoint 只中止此角色試煉、不動已通關紀錄',async()=>{
 const c=await runtime(),p=ready(c,'atk',10);
 p.extremeProgress.atk.highest=9;
 p.extremeRun.checkpoint.enemies=[];
 const normalized=c.api.normalize(p);
 assert.equal(normalized.extremeRun,undefined);
 assert.equal(normalized.location,'dawncity');
 assert.equal(normalized.extremeProgress.atk.highest,9);
 assert.equal(normalized.offline.enabled,false);
});

test('清怪王離線時恢復五個獨立目標，擊殺即補位並連續進階',async()=>{
 const c=await runtime(),p=ready(c,'clear',1),beforeGold=p.gold;
 assert.equal(p.extremeRun.checkpoint.enemies.length,5);
 const {player,summary}=await c.api.simulateOffline(p,epoch+31500);
 assert.equal(summary.extremeFloors,1);
 assert.equal(player.extremeRun.floor,2);
 assert.equal(player.extremeRun.checkpoint.enemies.length,5);
 assert.ok(player.extremeRun.checkpoint.enemies.every(e=>e.hp>0&&e.extremeKind==='clear'));
 assert.equal(player.gold,beforeGold);
});
