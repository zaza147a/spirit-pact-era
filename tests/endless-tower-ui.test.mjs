import test from 'node:test';
import assert from 'node:assert/strict';
import {renderTowerPanel,towerRewardNotice} from '../dist/endless-tower-ui.js';
const eligible=()=>({thirdJob:true,level:210,hp:300,dawnUnlocked:true,towerProgress:{highest:9},towerCoins:350});
test('panel exposes first three regions only, and correct next floor',()=>{
  const html=renderTowerPanel(eligible());
  assert.match(html,/第 10 層/);
  assert.match(html,/破曉守門者/);
  assert.match(html,/焚天炎龍/);
  assert.match(html,/永凍女皇/);
  assert.doesNotMatch(html,/鋼鐵巨神/);
  assert.match(html,/data-tower-enter="10"/);
});
test('locked status and active timer are displayed',()=>{
  const html=renderTowerPanel({...eligible(),level:199});
  assert.match(html,/需要三轉 Base 210/);
  const active=renderTowerPanel({...eligible(),towerRun:{version:1,status:'active',floor:10,startedAt:1000,stageStartedAt:1000,completedEnemyIds:[]}}, {now:5000});
  assert.match(active,/剩餘 176 秒/);
  assert.match(active,/data-tower-exit/);
});
test('reward HTML escapes values and never invents bonus stats',()=>{
  const html=towerRewardNotice({floor:10,coins:300,firstReward:'<script>alert(1)</script>',clearSeconds:15});
  assert.doesNotMatch(html,/<script>/);
  assert.match(html,/&lt;script&gt;/);
  assert.doesNotMatch(html,/ATK|MATK/);
});
